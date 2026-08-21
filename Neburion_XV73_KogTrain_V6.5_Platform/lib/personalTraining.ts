import { createFocusSession, type FocusArea, type FocusTask } from "@/lib/learningExpansion";
import type { Difficulty } from "@/lib/dynamicTraining";

export type SessionMode = "short" | "standard" | "challenge";
export type FocusTopic =
  | "plus" | "minus" | "mal" | "division" | "zahlenfolge"
  | "wortsuche" | "buchstabensalat" | "synonym" | "antonym" | "rechtschreibung"
  | "alltag" | "arbeit" | "natur" | "essen" | "reisen"
  | "zielreiz" | "abweichung" | "buchstabenfilter"
  | "farbe" | "form" | "regelwechsel"
  | "symbole" | "woerter" | "zahlen";

export type PersonalTask = FocusTask & { topicLabel?: string };
export const PERSONAL_PREF_KEY = "neburion-v65-personal-plan-v31";
export const PERSONAL_STATS_KEY = "neburion-v65-personal-stats-v31";

export const SESSION_MODES = [
  { id: "short" as const, label: "Kurz", length: 6, note: "4–6 Min." },
  { id: "standard" as const, label: "Standard", length: 10, note: "8–12 Min." },
  { id: "challenge" as const, label: "Challenge", length: 14, note: "12–16 Min." },
];

export const TOPICS: Record<FocusArea, Array<{ id: FocusTopic; label: string }>> = {
  math: [
    { id: "plus", label: "Plus" }, { id: "minus", label: "Minus" }, { id: "mal", label: "Mal" },
    { id: "division", label: "Division" }, { id: "zahlenfolge", label: "Zahlenfolgen" },
  ],
  words: [
    { id: "wortsuche", label: "Wortsuche" }, { id: "buchstabensalat", label: "Buchstabensalat" },
    { id: "synonym", label: "Synonyme" }, { id: "antonym", label: "Antonyme" }, { id: "rechtschreibung", label: "Rechtschreibung" },
  ],
  translation: [
    { id: "alltag", label: "Alltag" }, { id: "arbeit", label: "Arbeit" }, { id: "natur", label: "Natur" },
    { id: "essen", label: "Essen" }, { id: "reisen", label: "Reisen" },
  ],
  attention: [
    { id: "zielreiz", label: "Zielreiz zählen" }, { id: "abweichung", label: "Abweichung finden" }, { id: "buchstabenfilter", label: "Buchstabenfilter" },
  ],
  reaction: [
    { id: "farbe", label: "Farbe" }, { id: "form", label: "Form" }, { id: "regelwechsel", label: "Regelwechsel" },
  ],
  memory: [
    { id: "symbole", label: "Symbole" }, { id: "woerter", label: "Wörter" }, { id: "zahlen", label: "Zahlen" },
  ],
};

const WORDS = ["GARTEN","SCHULE","FENSTER","WASSER","BRÜCKE","FREUND","MORGEN","SPRACHE","LERNEN","DENKEN","WOLKE","BILDER"];
const SYNONYMS = [["präzise","genau"],["schnell","rasch"],["ruhig","gelassen"],["beginnen","starten"]] as const;
const ANTONYMS = [["hell","dunkel"],["laut","leise"],["warm","kalt"],["früh","spät"]] as const;
const SPELLING = [["Rhythmus","Rythmus","Rhytmus","Rytmus"],["Adresse","Addresse","Adrese","Adressse"],["nämlich","nemlich","nähmlich","nehmlich"]] as const;
const VOCAB: Record<string, ReadonlyArray<readonly [string,string]>> = {
  alltag: [["Haus","house"],["Fenster","window"],["Freund","friend"],["Zeit","time"],["Frage","question"],["Antwort","answer"]],
  arbeit: [["Arbeit","work"],["Büro","office"],["Kunde","customer"],["Rechnung","invoice"],["Termin","appointment"],["Besprechung","meeting"]],
  natur: [["Baum","tree"],["Wald","forest"],["Berg","mountain"],["Fluss","river"],["Wolke","cloud"],["Regen","rain"]],
  essen: [["Brot","bread"],["Apfel","apple"],["Wasser","water"],["Käse","cheese"],["Salz","salt"],["Frühstück","breakfast"]],
  reisen: [["Reise","trip"],["Bahnhof","station"],["Flughafen","airport"],["Ticket","ticket"],["Koffer","suitcase"],["Ziel","destination"]],
};
const SYMBOLS = ["●","▲","■","◆","★","✦","⬟","◇"];

function pick<T>(items: readonly T[]): T { return items[Math.floor(Math.random() * items.length)]; }
function shuffle<T>(items: readonly T[]): T[] { return [...items].sort(() => Math.random() - 0.5); }
function makeOptions(correct:string, distractors:string[]) { const out=shuffle([correct,...distractors.filter(x=>x!==correct)]).slice(0,4); if(!out.includes(correct)) out[0]=correct; return out; }
function task(area:FocusArea,label:string,prompt:string,detail:string,correct:string,distractors:string[],explanation:string,topicLabel:string):PersonalTask {
  const out=makeOptions(correct,distractors);
  return { id:`v31-${area}-${Date.now()}-${Math.random()}`, area, label, prompt, detail, options:out, answer:out.indexOf(correct), explanation, topicLabel };
}

function math(topic:FocusTopic,d:Difficulty):PersonalTask {
  let a=Math.floor(Math.random()*(d===1?20:d===2?60:120))+2;
  let b=Math.floor(Math.random()*(d===1?20:d===2?25:40))+2;
  let result=0; let prompt="";
  if(topic==="plus"){result=a+b;prompt=`${a} + ${b} = ?`;}
  else if(topic==="minus"){if(b>a)[a,b]=[b,a];result=a-b;prompt=`${a} − ${b} = ?`;}
  else if(topic==="mal"){a=Math.floor(Math.random()*(d===1?9:14))+2;b=Math.floor(Math.random()*(d===1?9:14))+2;result=a*b;prompt=`${a} × ${b} = ?`;}
  else if(topic==="division"){const div=Math.floor(Math.random()*10)+2;result=Math.floor(Math.random()*(d===3?16:10))+2;a=result*div;prompt=`${a} ÷ ${div} = ?`;}
  else {const start=Math.floor(Math.random()*15)+1;const step=Math.floor(Math.random()*(d===1?4:8))+2;result=start+step*4;prompt=`${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ?`;}
  return task("math","Mathematik",prompt,"Rechne möglichst ohne Hilfsmittel.",String(result),[result+1,result-1,result+3,result-3].map(String),"Rechne schrittweise und prüfe kurz die Größenordnung.",TOPICS.math.find(x=>x.id===topic)?.label??"Mathematik");
}

function word(topic:FocusTopic):PersonalTask {
  if(topic==="synonym"){const p=pick(SYNONYMS);return task("words","Synonym",`Welches Wort bedeutet ungefähr dasselbe wie „${p[0]}“?`,"Wähle die passendste Bedeutung.",p[1],shuffle(SYNONYMS.filter(x=>x!==p).map(x=>x[1])).slice(0,3),`${p[0]} und ${p[1]} haben eine ähnliche Bedeutung.`,"Synonyme");}
  if(topic==="antonym"){const p=pick(ANTONYMS);return task("words","Antonym",`Was ist das Gegenteil von „${p[0]}“?`,"Suche den Bedeutungsgegensatz.",p[1],shuffle(ANTONYMS.filter(x=>x!==p).map(x=>x[1])).slice(0,3),`${p[1]} ist der passende Gegensatz.`,"Antonyme");}
  if(topic==="rechtschreibung"){const p=pick(SPELLING);return task("words","Rechtschreibung","Welche Schreibweise ist richtig?","Achte auf jeden Buchstaben.",p[0],[p[1],p[2],p[3]],`Richtig ist „${p[0]}“.`,"Rechtschreibung");}
  const w=pick(WORDS);
  if(topic==="buchstabensalat") return task("words","Buchstabensalat","Welches Wort steckt in diesen Buchstaben?",shuffle(w.split("")).join(" "),w,shuffle(WORDS.filter(x=>x!==w)).slice(0,3),"Ordne die Buchstaben zu einem sinnvollen Wort.","Buchstabensalat");
  const part=w.slice(0,2);
  return task("words","Wortsuche",`Welches Wort enthält „${part}“?`,"Suche genau nach der Buchstabenfolge.",w,shuffle(WORDS.filter(x=>x!==w)).slice(0,3),`${w} enthält ${part}.`,"Wortsuche");
}

function translate(topic:FocusTopic):PersonalTask {
  const pool=VOCAB[topic]??VOCAB.alltag; const pair=pick(pool); const deToEn=Math.random()>.5;
  const source=deToEn?pair[0]:pair[1]; const correct=deToEn?pair[1]:pair[0];
  const distractors=shuffle(pool.filter(x=>x!==pair).map(x=>deToEn?x[1]:x[0])).slice(0,3);
  return task("translation",deToEn?"Deutsch → Englisch":"Englisch → Deutsch",`Wie übersetzt du „${source}“?`,String(topic).toUpperCase(),correct,distractors,`„${pair[0]}“ bedeutet „${pair[1]}“.`,TOPICS.translation.find(x=>x.id===topic)?.label??"Übersetzung");
}

function attention(topic:FocusTopic,d:Difficulty):PersonalTask {
  if(topic==="abweichung"){const base=pick(SYMBOLS);const odd=pick(SYMBOLS.filter(x=>x!==base));const len=d===1?8:d===2?12:16;const pos=Math.floor(Math.random()*len);const field=Array.from({length:len},(_,i)=>i===pos?odd:base).join("  ");return task("attention","Selektive Aufmerksamkeit","Welches Symbol weicht ab?",field,odd,shuffle(SYMBOLS.filter(x=>x!==odd)).slice(0,3),"Ein einzelner Reiz unterscheidet sich vom Rest.","Abweichung finden");}
  if(topic==="buchstabenfilter"){const target=pick(["A","E","R","S"]);const count=Math.floor(Math.random()*3)+2;const others=["N","M","T","L"];const field=shuffle([...Array(count).fill(target),...Array((d===1?10:d===2?14:18)-count).fill(0).map(()=>pick(others))]).join("  ");return task("attention","Buchstabenfilter",`Wie oft erscheint ${target}?`,field,String(count),[1,2,3,4,5].filter(n=>n!==count).map(String),"Zähle nur den Zielbuchstaben.","Buchstabenfilter");}
  const base=pick(SYMBOLS);const target=pick(SYMBOLS.filter(x=>x!==base));const count=Math.floor(Math.random()*3)+1;const len=d===1?8:d===2?12:16;const field=shuffle([...Array(count).fill(target),...Array(len-count).fill(base)]).join("  ");
  return task("attention","Zielreiz zählen",`Wie oft erscheint ${target}?`,field,String(count),[1,2,3,4].filter(n=>n!==count).map(String),"Blende Distraktoren aus und zähle nur den Zielreiz.","Zielreiz zählen");
}

function reaction(topic:FocusTopic):PersonalTask {
  const shapes=["Kreis","Dreieck","Quadrat","Stern"]; const colors=["Blau","Grün","Rot","Gelb"]; const shape=pick(shapes); const color=pick(colors);
  const rule=topic==="farbe"?"FARBE":topic==="form"?"FORM":Math.random()>.5?"FARBE":"FORM";
  const correct=rule==="FARBE"?color:shape; const pool=rule==="FARBE"?colors:shapes;
  return task("reaction","Reaktion",`Regel: ${rule}. Was zählt?`,`${color} · ${shape}`,correct,shuffle(pool.filter(x=>x!==correct)).slice(0,3),`Die aktive Regel lautet ${rule}.`,TOPICS.reaction.find(x=>x.id===topic)?.label??"Reaktion");
}

function memory(topic:FocusTopic,d:Difficulty):PersonalTask {
  const len=d===1?4:d===2?5:6; let preview:string[]=[];
  if(topic==="woerter") preview=shuffle(["Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Wald","Stern"]).slice(0,len);
  else if(topic==="zahlen") preview=Array.from({length:len},()=>String(Math.floor(Math.random()*10)));
  else preview=shuffle(SYMBOLS).slice(0,len);
  const pos=Math.floor(Math.random()*len); const correct=preview[pos];
  const pool=topic==="woerter"?["Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Wald","Stern"]:topic==="zahlen"?["0","1","2","3","4","5","6","7","8","9"]:SYMBOLS;
  const out=makeOptions(correct,shuffle(pool.filter(x=>x!==correct)).slice(0,3));
  return {id:`v31-memory-${Date.now()}-${Math.random()}`,area:"memory",label:"Merkfähigkeit",prompt:`Was stand an Position ${pos+1}?`,detail:"Präge dir die Folge ein.",options:out,answer:out.indexOf(correct),explanation:`An Position ${pos+1} stand ${correct}.`,preview,previewMs:d===1?3400:d===2?2700:2200,topicLabel:TOPICS.memory.find(x=>x.id===topic)?.label};
}

export function createPersonalSession(areas:FocusArea[],topics:FocusTopic[],difficulty:Difficulty,length:number):PersonalTask[]{
  const selected: FocusArea[] = areas.length ? areas : ["math","words","translation","attention","reaction","memory"];
  return Array.from({length},(_,i)=>{
    const area: FocusArea = selected[i%selected.length];
    const allowed=TOPICS[area];
    const filtered=topics.filter(t=>allowed.some(a=>a.id===t));
    const chosen: FocusTopic = pick(filtered.length ? filtered : allowed.map(x=>x.id));
    if(area==="math")return math(chosen,difficulty);
    if(area==="words")return word(chosen);
    if(area==="translation")return translate(chosen);
    if(area==="attention")return attention(chosen,difficulty);
    if(area==="reaction")return reaction(chosen);
    return memory(chosen,difficulty);
  }).sort(()=>Math.random()-.5);
}

export function createDailyChallenge():PersonalTask[]{
  const date=new Date(); const seed=Number(`${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`); const before=Math.random; let state=seed;
  Math.random=()=>{state=(state*9301+49297)%233280;return state/233280;};
  try{return createPersonalSession(["math","words","translation","attention","reaction","memory"],[],2,8);}finally{Math.random=before;}
}

export function adaptiveDifficulty(lastAccuracy:number|undefined,base:Difficulty):Difficulty{
  if(lastAccuracy===undefined)return base;
  if(lastAccuracy>=85)return Math.min(3,base+1) as Difficulty;
  if(lastAccuracy<60)return Math.max(1,base-1) as Difficulty;
  return base;
}

export function fallbackSession(areas:FocusArea[],difficulty:Difficulty,length:number):FocusTask[]{return createFocusSession(areas,difficulty,length);}
