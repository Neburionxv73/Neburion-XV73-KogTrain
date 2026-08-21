import { randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type FocusArea = "math" | "words" | "translation" | "attention" | "reaction" | "memory";
export type FocusTask = {
  id: string;
  area: FocusArea;
  label: string;
  prompt: string;
  detail: string;
  options: string[];
  answer: number;
  explanation: string;
  preview?: string[];
  previewMs?: number;
};

export const FOCUS_STORAGE_KEY = "neburion-v65-focus-preferences";
export const FOCUS_AREAS: Array<{ id: FocusArea; title: string; subtitle: string; description: string; icon: string }> = [
  { id: "math", title: "Mathematik", subtitle: "Grundrechnungsarten", description: "Plus, Minus, Mal, Division und Kopfrechnen in wechselnden Schwierigkeitsstufen.", icon: "+−" },
  { id: "words", title: "Wort & Sprache", subtitle: "Wortsuche und Verständnis", description: "Wörter finden, Buchstaben ordnen, Bedeutungen erkennen und Wortschatz erweitern.", icon: "ABC" },
  { id: "translation", title: "Deutsch ↔ Englisch", subtitle: "Übersetzen", description: "Alltagswortschatz in beide Richtungen trainieren und sicherer abrufen.", icon: "DE/EN" },
  { id: "attention", title: "Selektive Aufmerksamkeit", subtitle: "Fokus & Reizfilter", description: "Zielreize zwischen Ablenkungen finden, zählen und unterscheiden.", icon: "◎" },
  { id: "reaction", title: "Reaktion", subtitle: "Schnell & korrekt", description: "Unter Zeitdruck die passende Regel erkennen und möglichst schnell reagieren.", icon: "⚡" },
  { id: "memory", title: "Merkfähigkeit", subtitle: "Kurzzeitgedächtnis", description: "Wörter, Symbole und kurze Reihen einprägen und gezielt wiedergeben.", icon: "◫" },
];

const VOCAB = [
  ["Haus","house"],["Baum","tree"],["Wasser","water"],["Fenster","window"],["Straße","street"],["Freund","friend"],["Arbeit","work"],["Schule","school"],
  ["Buch","book"],["Zeit","time"],["Morgen","morning"],["Abend","evening"],["lernen","learn"],["denken","think"],["schnell","fast"],["langsam","slow"],
  ["stark","strong"],["ruhig","calm"],["Frage","question"],["Antwort","answer"],["Weg","way"],["Licht","light"],["Wald","forest"],["Berg","mountain"]
] as const;
const WORDS = ["GARTEN","SCHULE","FENSTER","WASSER","BRÜCKE","FREUND","MORGEN","SPRACHE","LERNEN","DENKEN","WORT","BILDER"];
const SYMBOLS = ["●","▲","■","◆","★","✦","⬟","◇"];

function optionTask(id:string, area:FocusArea, label:string, prompt:string, detail:string, correct:string, distractors:string[], explanation:string):FocusTask {
  const options = shuffled([correct,...distractors.filter((item)=>item!==correct)]).slice(0,4);
  return { id, area, label, prompt, detail, options, answer:options.indexOf(correct), explanation };
}

function mathTask(seed:number,difficulty:Difficulty):FocusTask {
  const operations = difficulty === 1 ? ["+","-"] : difficulty === 2 ? ["+","-","×"] : ["+","-","×","÷"];
  const op = operations[randomInt(0,operations.length-1)];
  let a = randomInt(2,difficulty===1?20:difficulty===2?60:120);
  let b = randomInt(2,difficulty===1?20:difficulty===2?20:30);
  let result:number;
  if(op==="+") result=a+b;
  else if(op==="-"){ if(b>a)[a,b]=[b,a]; result=a-b; }
  else if(op==="×") result=a*b;
  else { result=randomInt(2,difficulty===3?18:12); b=randomInt(2,12); a=result*b; }
  const correct=String(result);
  const distractors=[result+1,result-1,result+(difficulty===1?2:5),Math.max(0,result-(difficulty===1?2:5))].map(String);
  return optionTask(`math-${seed}`,"math","Kopfrechnen",`${a} ${op} ${b} = ?`,"Rechne ohne Taschenrechner.",correct,distractors,"Zerlege die Rechnung in kleine, sichere Schritte und prüfe das Ergebnis kurz gegen.");
}

function wordTask(seed:number,difficulty:Difficulty):FocusTask {
  const word=WORDS[randomInt(0,WORDS.length-1)];
  if(seed%2===0){
    const scrambled=shuffled(word.split("")).join(" ");
    return optionTask(`word-${seed}`,"words","Wortsuche","Welches Wort steckt in diesen Buchstaben?",scrambled,word,shuffled(WORDS.filter((item)=>item!==word)).slice(0,3),"Ordne die Buchstaben zu einem sinnvollen deutschen Wort.");
  }
  const target=word.slice(0,difficulty===1?2:3);
  const candidates=shuffled([word,...WORDS.filter((item)=>item!==word)]).slice(0,4);
  if(!candidates.includes(word)) candidates[0]=word;
  const options=shuffled(candidates);
  return {id:`word-${seed}`,area:"words",label:"Wortsuche",prompt:`Welches Wort enthält „${target}“?`,detail:"Suche genau nach der Buchstabenfolge.",options,answer:options.indexOf(word),explanation:`${word} enthält die gesuchte Buchstabenfolge ${target}.`};
}

function translationTask(seed:number):FocusTask {
  const pair=VOCAB[randomInt(0,VOCAB.length-1)];
  const germanToEnglish=seed%2===0;
  const source=germanToEnglish?pair[0]:pair[1];
  const correct=germanToEnglish?pair[1]:pair[0];
  const distractors=shuffled(VOCAB.filter((item)=>item!==pair).map((item)=>germanToEnglish?item[1]:item[0])).slice(0,3);
  return optionTask(`translation-${seed}`,"translation",germanToEnglish?"Deutsch → Englisch":"Englisch → Deutsch",`Wie übersetzt du „${source}“?`,"Wähle die passendste Übersetzung.",correct,distractors,`„${pair[0]}“ bedeutet auf Englisch „${pair[1]}“.`);
}

function attentionTask(seed:number,difficulty:Difficulty):FocusTask {
  const base=SYMBOLS[randomInt(0,SYMBOLS.length-1)];
  const target=SYMBOLS.filter((item)=>item!==base)[randomInt(0,SYMBOLS.length-2)];
  const length=difficulty===1?8:difficulty===2?12:16;
  const targetCount=randomInt(1,difficulty===1?2:4);
  const positions=new Set<number>();
  while(positions.size<targetCount) positions.add(randomInt(0,length-1));
  const field=Array.from({length},(_,index)=>positions.has(index)?target:base).join("  ");
  return optionTask(`attention-${seed}`,"attention","Selektive Aufmerksamkeit",`Wie oft erscheint ${target}?`,field,String(targetCount),[1,2,3,4].filter((n)=>n!==targetCount).map(String),"Zähle nur den Zielreiz und blende die gleichförmigen Distraktoren aus.");
}

function reactionTask(seed:number,difficulty:Difficulty):FocusTask {
  const rule=seed%2===0?"FARBE":"FORM";
  const shapes=["Kreis","Dreieck","Quadrat","Stern"];
  const colors=["Blau","Grün","Rot","Gelb"];
  const shape=shapes[randomInt(0,shapes.length-1)];
  const color=colors[randomInt(0,colors.length-1)];
  const correct=rule==="FARBE"?color:shape;
  const pool=rule==="FARBE"?colors:shapes;
  return optionTask(`reaction-${seed}`,"reaction","Reaktion",`Regel: ${rule}. Was zählt?`,`${color} · ${shape}`,correct,shuffled(pool.filter((item)=>item!==correct)).slice(0,3),`Die aktive Regel lautet ${rule}. Reagiere nur auf dieses Merkmal und ignoriere das andere.`);
}

function memoryTask(seed:number,difficulty:Difficulty):FocusTask {
  const length=difficulty===1?4:difficulty===2?5:6;
  const preview=shuffled(SYMBOLS).slice(0,length);
  const position=randomInt(0,length-1);
  const correct=preview[position];
  const options=shuffled([correct,...shuffled(SYMBOLS.filter((item)=>item!==correct)).slice(0,3)]);
  return {id:`memory-${seed}`,area:"memory",label:"Merkfähigkeit",prompt:`Welches Symbol stand an Position ${position+1}?`,detail:"Merke dir die Folge. Danach wird sie ausgeblendet.",options,answer:options.indexOf(correct),explanation:`An Position ${position+1} stand ${correct}.`,preview,previewMs:difficulty===1?3200:difficulty===2?2600:2100};
}

export function createFocusSession(areas:FocusArea[],difficulty:Difficulty,length=10):FocusTask[] {
  const selected: FocusArea[] = areas.length ? areas : ["math","words","translation","attention","reaction","memory"];
  const factories:Record<FocusArea,(seed:number,d:Difficulty)=>FocusTask>={
    math:mathTask,words:wordTask,translation:(seed)=>translationTask(seed),attention:attentionTask,reaction:reactionTask,memory:memoryTask,
  };
  const seed=Date.now()%100000;
  return Array.from({length},(_,index)=>{
    const area: FocusArea = selected[index%selected.length];
    return factories[area](seed+index,difficulty);
  }).sort(()=>Math.random()-.5);
}
