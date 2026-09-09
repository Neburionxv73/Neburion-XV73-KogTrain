import { randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";
import type { AttentionMode, AttentionTask } from "@/lib/attention";

const symbols=["◆","●","▲","■","✦","⬟","★","✚","◇","⬢","⬣","◈","○","□","△","⬡"];
const stableId=(mode:AttentionMode,content:string)=>`${mode}:x:${content}`;

function withAnswer(task:Omit<AttentionTask,"options"|"answer">,correct:string,distractors:string[]):AttentionTask{
  const options=shuffled([correct,...distractors.filter(item=>item!==correct)]).slice(0,4);
  return {...task,options,answer:options.indexOf(correct)};
}

function alternatingGoNoGo(seed:number,difficulty:Difficulty):AttentionTask{
  const pool=difficulty===1?symbols.slice(0,8):symbols;
  const [a,b,other]=shuffled(pool).slice(0,3);
  const expected=seed%2===0?a:b;
  const shown=seed%3===0?other:expected;
  const correct=shown===expected?"Reagieren":"Ignorieren";
  return withAnswer({id:stableId("go-no-go",`alt-${difficulty}-${a}-${b}-${shown}-${seed%5}`),mode:"go-no-go",label:"Alternierendes Go / No-Go",prompt:`Aktives Ziel: ${expected}`,instruction:"Die Zielregel wechselt zwischen zwei Reizen. Reagiere nur auf das aktuell aktive Ziel.",visual:[a,b,"→",shown],explanation:`Aktiv war ${expected}; gezeigt wurde ${shown}.`},correct,[correct==="Reagieren"?"Ignorieren":"Reagieren"]);
}

function visualPairSearch(seed:number,difficulty:Difficulty):AttentionTask{
  const [a,b]=shuffled(symbols).slice(0,2);
  const pair=`${a}${b}`;
  const distractors=[`${b}${a}`,`${a}${a}`,`${b}${b}`];
  const total=difficulty===3?20:difficulty===2?14:10;
  const count=randomInt(1,difficulty===3?5:3);
  const fillers=shuffled(distractors);
  const visual=shuffled([...Array.from({length:count},()=>pair),...Array.from({length:total-count},(_,i)=>fillers[(i+seed)%fillers.length])]);
  return withAnswer({id:stableId("visual-search",`pair-${difficulty}-${pair}-${count}-${seed%23}`),mode:"visual-search",label:"Paar-Suche",prompt:`Wie oft erscheint exakt ${pair}?`,instruction:"Achte auf beide Symbole und ihre Reihenfolge. Vertauschte Paare zählen nicht.",visual,explanation:`Das Zielpaar ${pair} erscheint ${count}-mal.`},String(count),["1","2","3","4","5","6"].filter(v=>v!==String(count)));
}

function paritySwitch(seed:number,difficulty:Difficulty):AttentionTask{
  const numbers=Array.from({length:difficulty===3?9:6},()=>randomInt(1,9));
  const rule=seed%2===0?"GERADE":"UNGERADE";
  const shown=numbers[numbers.length-1];
  const matches=rule==="GERADE"?shown%2===0:shown%2!==0;
  const correct=matches?"Reagieren":"Ignorieren";
  return withAnswer({id:stableId("rule-switch",`parity-${rule}-${shown}-${numbers.join("")}`),mode:"rule-switch",label:"Zahlen-Regelwechsel",prompt:`Aktive Regel: ${rule}`,instruction:"Bewerte nur die letzte Zahl nach der eingeblendeten Regel. Vorherige Zahlen dienen als Ablenkung.",visual:numbers.map(String),explanation:`Die letzte Zahl war ${shown}; für ${rule} ist die richtige Reaktion ${correct}.`},correct,[correct==="Reagieren"?"Ignorieren":"Reagieren"]);
}

function stopSignal(seed:number,difficulty:Difficulty):AttentionTask{
  const target=shuffled(symbols)[0];
  const stop=seed%(difficulty===3?3:4)===0;
  const visual=stop?[target,"✖"]:[target];
  return withAnswer({id:stableId("inhibition",`stop-${difficulty}-${target}-${stop}-${seed%19}`),mode:"inhibition",label:"Stoppsignal",prompt:"Reagiere auf den Zielreiz – außer ein Stoppsignal erscheint.",instruction:difficulty===3?"Das Stoppsignal kann direkt nach dem Zielreiz erscheinen. Hemme dann die vorbereitete Reaktion.":"Ein ✖ hebt die Reaktionsregel sofort auf.",visual,explanation:stop?"Das Stoppsignal war aktiv, daher musste die Reaktion gehemmt werden.":"Kein Stoppsignal war aktiv, daher sollte reagiert werden."},stop?"Ignorieren":"Reagieren",[stop?"Reagieren":"Ignorieren"]);
}

function dividedParityColor(seed:number,difficulty:Difficulty):AttentionTask{
  const colors=["🔴","🔵","🟢","🟡"];
  const color=colors[seed%colors.length];
  const value=randomInt(1,9);
  const targetColor=colors[(seed+1)%colors.length];
  const targetParity=seed%2===0?"GERADE":"UNGERADE";
  const colorOk=color===targetColor;
  const parityOk=targetParity==="GERADE"?value%2===0:value%2!==0;
  const correct=colorOk&&parityOk?"Ja":"Nein";
  return withAnswer({id:stableId("divided",`pc-${difficulty}-${color}-${value}-${targetColor}-${targetParity}`),mode:"divided",label:"Doppelbedingung",prompt:`Passt ${color}${value} zu ${targetColor} + ${targetParity}?`,instruction:"Prüfe Farbe und Zahleneigenschaft gleichzeitig. Beide Bedingungen müssen erfüllt sein.",visual:[`${color}${value}`],explanation:`Farbe ${colorOk?"passt":"passt nicht"}; die Zahl ${parityOk?"passt":"passt nicht"} zur Regel ${targetParity}.`},correct,[correct==="Ja"?"Nein":"Ja"]);
}

function speedCompare(seed:number,difficulty:Difficulty):AttentionTask{
  const a=randomInt(1,9),b=randomInt(1,9);
  const targetMs=difficulty===3?600:difficulty===2?750:950;
  const correct=a>b?"Links":a<b?"Rechts":"Gleich";
  return withAnswer({id:stableId("speed",`compare-${difficulty}-${a}-${b}-${seed%13}`),mode:"speed",label:"Schnellvergleich",prompt:"Welche Seite zeigt die größere Zahl?",instruction:`Vergleiche sofort, ohne nachzurechnen. Zielzeit: ${targetMs} ms.`,visual:[String(a),"vs",String(b)],explanation:a===b?"Beide Zahlen waren gleich groß.":`${Math.max(a,b)} war die größere Zahl.`},correct,["Links","Rechts","Gleich"].filter(v=>v!==correct));
}

function symbolWordInterference(seed:number,difficulty:Difficulty):AttentionTask{
  const arrows=["←","→","↑","↓"];
  const words=["LINKS","RECHTS","OBEN","UNTEN"];
  const arrowIndex=seed%4;
  const wordIndex=(seed+randomInt(1,3))%4;
  const visual=difficulty===3?[words[(wordIndex+2)%4],arrows[arrowIndex],words[wordIndex]]:[arrows[arrowIndex],words[wordIndex]];
  return withAnswer({id:stableId("interference",`symbolword-${difficulty}-${visual.join("-")}`),mode:"interference",label:"Symbol-Wort-Konflikt",prompt:"Welche Richtung zeigt das Symbol?",instruction:"Ignoriere die geschriebenen Richtungen und antworte ausschließlich nach dem Pfeilsymbol.",visual,explanation:`Entscheidend war ${arrows[arrowIndex]}, also ${words[arrowIndex]}.`},words[arrowIndex],shuffled(words.filter((_,i)=>i!==arrowIndex)).slice(0,3));
}

export function createAttentionExpansionCandidates(seed:number,difficulty:Difficulty):AttentionTask[]{
  return [
    alternatingGoNoGo(seed+101,difficulty),
    visualPairSearch(seed+103,difficulty),
    paritySwitch(seed+107,difficulty),
    stopSignal(seed+109,difficulty),
    dividedParityColor(seed+113,difficulty),
    speedCompare(seed+127,difficulty),
    symbolWordInterference(seed+131,difficulty),
  ];
}
