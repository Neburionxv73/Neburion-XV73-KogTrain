import { createFocusSession, type FocusArea, type FocusTask } from "@/lib/learningExpansion";
import type { Difficulty } from "@/lib/dynamicTraining";

export type SessionMode = "short" | "standard" | "challenge";
export type FocusTopic =
  | "plus" | "minus" | "mal" | "division" | "zahlenfolge" | "prozent" | "bruch" | "dreisatz"
  | "wortsuche" | "buchstabensalat" | "synonym" | "antonym" | "rechtschreibung" | "wortbildung"
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
    { id: "prozent", label: "Prozent" }, { id: "bruch", label: "Brüche" }, { id: "dreisatz", label: "Dreisatz" },
  ],
  words: [
    { id: "wortsuche", label: "Wortsuche" }, { id: "buchstabensalat", label: "Buchstabensalat" },
    { id: "synonym", label: "Synonyme" }, { id: "antonym", label: "Antonyme" }, { id: "rechtschreibung", label: "Rechtschreibung" },
    { id: "wortbildung", label: "Wortbildung" },
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

const WORDS = [
  "GARTEN","SCHULE","FENSTER","WASSER","BRÜCKE","FREUND","MORGEN","SPRACHE","LERNEN","DENKEN","WOLKE","BILDER",
  "BERG","FLUSS","SONNE","MOND","STERNE","KÜCHE","REISE","BAHNHOF","MUSIK","BUCH","LAMPE","WIESE","APFEL","KLETTERER",
  "AUFMERKSAM","ERINNERUNG","GEDANKE","ABENTEUER","WISSEN","FANTASIE","RHYTHMUS","BALANCE","ENERGIE","KONZENTRATION",
];
const SYNONYMS = [
  ["präzise","genau"],["schnell","rasch"],["ruhig","gelassen"],["beginnen","starten"],["fröhlich","heiter"],["klug","clever"],
  ["mutig","tapfer"],["groß","riesig"],["klein","winzig"],["deutlich","klar"],["schwierig","kompliziert"],["helfen","unterstützen"],
] as const;
const ANTONYMS = [
  ["hell","dunkel"],["laut","leise"],["warm","kalt"],["früh","spät"],["schnell","langsam"],["stark","schwach"],
  ["hoch","tief"],["nah","fern"],["trocken","nass"],["offen","geschlossen"],["leicht","schwer"],["breit","schmal"],
] as const;
const SPELLING = [
  ["Rhythmus","Rythmus","Rhytmus","Rytmus"],["Adresse","Addresse","Adrese","Adressse"],["nämlich","nemlich","nähmlich","nehmlich"],
  ["separat","seperat","sepparat","separrad"],["interessant","intressant","interresant","interessannt"],["Aggression","Agresion","Agression","Aggresion"],
  ["Quarantäne","Karantäne","Quarentäne","Quarantene"],["Portemonnaie","Portmonee","Portemonaie","Portemonnee"],
] as const;
const WORD_BUILDING = [
  ["Lern","plattform","Lernplattform"],["Wort","schatz","Wortschatz"],["Denk","aufgabe","Denkaufgabe"],["Tages","ziel","Tagesziel"],
  ["Reaktions","zeit","Reaktionszeit"],["Gedächtnis","training","Gedächtnistraining"],["Aufmerksamkeits","test","Aufmerksamkeitstest"],
] as const;
const VOCAB: Record<string, ReadonlyArray<readonly [string,string]>> = {
  alltag: [
    ["Haus","house"],["Fenster","window"],["Freund","friend"],["Zeit","time"],["Frage","question"],["Antwort","answer"],
    ["Straße","street"],["Tür","door"],["Schlüssel","key"],["Familie","family"],["Nachbar","neighbor"],["Morgen","morning"],
    ["Abend","evening"],["Woche","week"],["Stadt","city"],["Zimmer","room"],
  ],
  arbeit: [
    ["Arbeit","work"],["Büro","office"],["Kunde","customer"],["Rechnung","invoice"],["Termin","appointment"],["Besprechung","meeting"],
    ["Angebot","offer"],["Bestellung","order"],["Lieferung","delivery"],["Kollege","colleague"],["Aufgabe","task"],["Projekt","project"],
    ["Vertrag","contract"],["Verkauf","sale"],["Einkauf","purchase"],["Abteilung","department"],
  ],
  natur: [
    ["Baum","tree"],["Wald","forest"],["Berg","mountain"],["Fluss","river"],["Wolke","cloud"],["Regen","rain"],
    ["See","lake"],["Stein","stone"],["Blume","flower"],["Tier","animal"],["Vogel","bird"],["Schnee","snow"],
    ["Wind","wind"],["Tal","valley"],["Wiese","meadow"],["Sonne","sun"],
  ],
  essen: [
    ["Brot","bread"],["Apfel","apple"],["Wasser","water"],["Käse","cheese"],["Salz","salt"],["Frühstück","breakfast"],
    ["Gemüse","vegetables"],["Kartoffel","potato"],["Suppe","soup"],["Fisch","fish"],["Reis","rice"],["Milch","milk"],
    ["Ei","egg"],["Abendessen","dinner"],["Messer","knife"],["Gabel","fork"],
  ],
  reisen: [
    ["Reise","trip"],["Bahnhof","station"],["Flughafen","airport"],["Ticket","ticket"],["Koffer","suitcase"],["Ziel","destination"],
    ["Hotel","hotel"],["Abfahrt","departure"],["Ankunft","arrival"],["Bahnsteig","platform"],["Fahrkarte","ticket"],["Pass","passport"],
    ["Grenze","border"],["Flug","flight"],["Zug","train"],["Fahrplan","timetable"],
  ],
};
const SYMBOLS = ["●","▲","■","◆","★","✦","⬟","◇","○","△","□","✚","✖","⬢"];
const MEMORY_WORDS = ["Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Wald","Stern","Berg","Fluss","Lampe","Schlüssel","Buch","Vogel","Blume","Zug"];

function pick<T>(items: readonly T[]): T { return items[Math.floor(Math.random() * items.length)]; }
function shuffle<T>(items: readonly T[]): T[] { return [...items].sort(() => Math.random() - 0.5); }
function makeOptions(correct:string, distractors:string[]) {
  const unique=[...new Set(distractors.filter(x=>x!==correct))];
  const out=shuffle([correct,...unique]).slice(0,4);
  if(!out.includes(correct))out[0]=correct;
  return shuffle(out);
}
function task(area:FocusArea,label:string,prompt:string,detail:string,correct:string,distractors:string[],explanation:string,topicLabel:string):PersonalTask {
  const out=makeOptions(correct,distractors);
  return { id:`v35-${area}-${Date.now()}-${Math.random()}`, area, label, prompt, detail, options:out, answer:out.indexOf(correct), explanation, topicLabel };
}
function nearNumber(result:number,spread:number){
  return [result+1,result-1,result+spread,result-spread,result+2*spread,result-2*spread].filter(value=>value>=0).map(String);
}

function math(topic:FocusTopic,d:Difficulty):PersonalTask {
  let a=Math.floor(Math.random()*(d===1?25:d===2?90:180))+2;
  let b=Math.floor(Math.random()*(d===1?20:d===2?45:80))+2;
  let result=0; let prompt=""; let detail="Rechne möglichst ohne Hilfsmittel.";
  if(topic==="plus"){result=a+b;prompt=`${a} + ${b} = ?`;}
  else if(topic==="minus"){if(b>a)[a,b]=[b,a];result=a-b;prompt=`${a} − ${b} = ?`;}
  else if(topic==="mal"){
    a=Math.floor(Math.random()*(d===1?9:d===2?14:19))+2;b=Math.floor(Math.random()*(d===1?9:d===2?14:19))+2;result=a*b;prompt=`${a} × ${b} = ?`;
  }
  else if(topic==="division"){
    const div=Math.floor(Math.random()*(d===1?8:12))+2;result=Math.floor(Math.random()*(d===3?20:12))+2;a=result*div;prompt=`${a} ÷ ${div} = ?`;
  }
  else if(topic==="zahlenfolge"){
    const start=Math.floor(Math.random()*20)+1;const step=Math.floor(Math.random()*(d===1?5:d===2?10:15))+2;result=start+step*5;prompt=`${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ${start+step*4}, ?`;detail="Erkenne die Regel und setze sie fort.";
  }
  else if(topic==="prozent"){
    const perc=pick(d===1?[10,20,25,50]:d===2?[5,10,15,20,25,30,40,50]:[5,12,15,18,20,25,30,35,40,60]);
    const base=pick(d===1?[40,60,80,100,120,200]:d===2?[80,120,160,200,240,300,400]:[120,180,240,320,450,600,800]);
    result=Math.round(base*perc/100);prompt=`${perc} % von ${base} = ?`;detail="Berechne den Prozentwert.";
  }
  else if(topic==="bruch"){
    const denominator=pick(d===1?[2,4,5]:d===2?[3,4,5,8,10]:[3,4,5,6,8,10,12]);
    const numerator=Math.floor(Math.random()*(denominator-1))+1;const multiplier=pick(d===1?[4,6,8,10]:d===2?[6,8,10,12,16]:[8,12,16,20,24]);
    const whole=denominator*multiplier;result=numerator*multiplier;prompt=`${numerator}/${denominator} von ${whole} = ?`;detail="Bestimme zuerst einen Anteil, dann den Zähler.";
  }
  else if(topic==="dreisatz"){
    const units=pick(d===1?[2,3,4]:d===2?[3,4,5,6]:[4,5,6,8]);const unitPrice=pick(d===1?[2,3,4,5]:d===2?[3,4,6,8,10]:[5,7,9,12,15]);const target=pick([5,6,8,10]);
    const price=units*unitPrice;result=target*unitPrice;prompt=`${units} Stück kosten ${price} €. Was kosten ${target} Stück?`;detail="Rechne über den Preis für 1 Stück.";
  }
  else {result=a+b;prompt=`${a} + ${b} = ?`;}
  return task("math","Mathematik",prompt,detail,String(result),nearNumber(result,Math.max(2,Math.round(result*.1))),"Prüfe Rechenweg und Größenordnung kurz gegeneinander.",TOPICS.math.find(x=>x.id===topic)?.label??"Mathematik");
}

function word(topic:FocusTopic):PersonalTask {
  if(topic==="synonym"){
    const p=pick(SYNONYMS);return task("words","Synonym",`Welches Wort bedeutet ungefähr dasselbe wie „${p[0]}“?`,"Wähle die passendste Bedeutung.",p[1],shuffle(SYNONYMS.filter(x=>x!==p).map(x=>x[1])).slice(0,6),`${p[0]} und ${p[1]} haben eine ähnliche Bedeutung.`,"Synonyme");
  }
  if(topic==="antonym"){
    const p=pick(ANTONYMS);return task("words","Antonym",`Was ist das Gegenteil von „${p[0]}“?`,"Suche den Bedeutungsgegensatz.",p[1],shuffle(ANTONYMS.filter(x=>x!==p).map(x=>x[1])).slice(0,6),`${p[1]} ist der passende Gegensatz.`,"Antonyme");
  }
  if(topic==="rechtschreibung"){
    const p=pick(SPELLING);return task("words","Rechtschreibung","Welche Schreibweise ist richtig?","Achte auf jeden Buchstaben.",p[0],[p[1],p[2],p[3]],`Richtig ist „${p[0]}“.`,"Rechtschreibung");
  }
  if(topic==="wortbildung"){
    const p=pick(WORD_BUILDING);const distractors=shuffle(WORD_BUILDING.filter(x=>x!==p).map(x=>x[2])).slice(0,5);return task("words","Wortbildung",`Welches zusammengesetzte Wort entsteht aus „${p[0]}“ + „${p[1]}“?`,"Verbinde beide Wortteile sinnvoll.",p[2],distractors,`Zusammen ergibt sich „${p[2]}“.`,"Wortbildung");
  }
  const w=pick(WORDS);
  if(topic==="buchstabensalat")return task("words","Buchstabensalat","Welches Wort steckt in diesen Buchstaben?",shuffle(w.split("")).join(" "),w,shuffle(WORDS.filter(x=>x!==w)).slice(0,6),"Ordne die Buchstaben zu einem sinnvollen Wort.","Buchstabensalat");
  const start=Math.max(0,Math.min(w.length-3,Math.floor(Math.random()*Math.max(1,w.length-2))));const part=w.slice(start,start+2);
  return task("words","Wortsuche",`Welches Wort enthält „${part}“?`,"Suche genau nach der Buchstabenfolge.",w,shuffle(WORDS.filter(x=>x!==w&&!x.includes(part))).slice(0,6),`${w} enthält ${part}.`,"Wortsuche");
}

function translate(topic:FocusTopic):PersonalTask {
  const pool=VOCAB[topic]??VOCAB.alltag;const pair=pick(pool);const deToEn=Math.random()>.5;
  const source=deToEn?pair[0]:pair[1];const correct=deToEn?pair[1]:pair[0];
  const distractors=shuffle(pool.filter(x=>x!==pair).map(x=>deToEn?x[1]:x[0])).slice(0,7);
  return task("translation",deToEn?"Deutsch → Englisch":"Englisch → Deutsch",`Wie übersetzt du „${source}“?`,String(topic).toUpperCase(),correct,distractors,`„${pair[0]}“ bedeutet „${pair[1]}“.`,TOPICS.translation.find(x=>x.id===topic)?.label??"Übersetzung");
}

function attention(topic:FocusTopic,d:Difficulty):PersonalTask {
  if(topic==="abweichung"){
    const base=pick(SYMBOLS);const odd=pick(SYMBOLS.filter(x=>x!==base));const len=d===1?10:d===2?16:22;const pos=Math.floor(Math.random()*len);const field=Array.from({length:len},(_,i)=>i===pos?odd:base).join("  ");
    return task("attention","Selektive Aufmerksamkeit","Welches Symbol weicht ab?",field,odd,shuffle(SYMBOLS.filter(x=>x!==odd)).slice(0,6),"Ein einzelner Reiz unterscheidet sich vom Rest.","Abweichung finden");
  }
  if(topic==="buchstabenfilter"){
    const letters=["A","E","R","S","K","P","B","D"];const target=pick(letters);const count=Math.floor(Math.random()*(d===3?5:4))+2;const others=letters.filter(x=>x!==target);const field=shuffle([...Array(count).fill(target),...Array((d===1?12:d===2?18:24)-count).fill(0).map(()=>pick(others))]).join("  ");
    return task("attention","Buchstabenfilter",`Wie oft erscheint ${target}?`,field,String(count),[1,2,3,4,5,6,7].filter(n=>n!==count).map(String),"Zähle nur den Zielbuchstaben.","Buchstabenfilter");
  }
  const base=pick(SYMBOLS);const target=pick(SYMBOLS.filter(x=>x!==base));const count=Math.floor(Math.random()*(d===3?5:4))+1;const len=d===1?10:d===2?16:22;const field=shuffle([...Array(count).fill(target),...Array(len-count).fill(base)]).join("  ");
  return task("attention","Zielreiz zählen",`Wie oft erscheint ${target}?`,field,String(count),[1,2,3,4,5,6].filter(n=>n!==count).map(String),"Blende Distraktoren aus und zähle nur den Zielreiz.","Zielreiz zählen");
}

function reaction(topic:FocusTopic):PersonalTask {
  const shapes=["Kreis","Dreieck","Quadrat","Stern","Raute","Sechseck"];const colors=["Blau","Grün","Rot","Gelb","Orange","Violett"];const shape=pick(shapes);const color=pick(colors);
  const rule=topic==="farbe"?"FARBE":topic==="form"?"FORM":Math.random()>.5?"FARBE":"FORM";
  const correct=rule==="FARBE"?color:shape;const pool=rule==="FARBE"?colors:shapes;
  return task("reaction","Reaktion",`Regel: ${rule}. Was zählt?`,`${color} · ${shape}`,correct,shuffle(pool.filter(x=>x!==correct)).slice(0,6),`Die aktive Regel lautet ${rule}.`,TOPICS.reaction.find(x=>x.id===topic)?.label??"Reaktion");
}

function memory(topic:FocusTopic,d:Difficulty):PersonalTask {
  const len=d===1?4:d===2?6:8;let preview:string[]=[];
  if(topic==="woerter")preview=shuffle(MEMORY_WORDS).slice(0,len);
  else if(topic==="zahlen")preview=Array.from({length:len},()=>String(Math.floor(Math.random()*10)));
  else preview=shuffle(SYMBOLS).slice(0,len);
  const pos=Math.floor(Math.random()*len);const correct=preview[pos];
  const pool=topic==="woerter"?MEMORY_WORDS:topic==="zahlen"?["0","1","2","3","4","5","6","7","8","9"]:SYMBOLS;
  const out=makeOptions(correct,shuffle(pool.filter(x=>x!==correct)).slice(0,7));
  return {id:`v35-memory-${Date.now()}-${Math.random()}`,area:"memory",label:"Merkfähigkeit",prompt:`Was stand an Position ${pos+1}?`,detail:"Präge dir die Folge ein.",options:out,answer:out.indexOf(correct),explanation:`An Position ${pos+1} stand ${correct}.`,preview,previewMs:d===1?3600:d===2?2800:2200,topicLabel:TOPICS.memory.find(x=>x.id===topic)?.label};
}

function generateTask(area:FocusArea,topic:FocusTopic,difficulty:Difficulty):PersonalTask{
  if(area==="math")return math(topic,difficulty);
  if(area==="words")return word(topic);
  if(area==="translation")return translate(topic);
  if(area==="attention")return attention(topic,difficulty);
  if(area==="reaction")return reaction(topic);
  return memory(topic,difficulty);
}

export function createPersonalSession(areas:FocusArea[],topics:FocusTopic[],difficulty:Difficulty,length:number):PersonalTask[]{
  const selected:FocusArea[]=areas.length?areas:["math","words","translation","attention","reaction","memory"];
  const tasks:PersonalTask[]=[];
  const recentSignatures=new Set<string>();
  for(let i=0;i<length;i++){
    const area=selected[i%selected.length];
    const allowed=TOPICS[area];
    const filtered=topics.filter(t=>allowed.some(a=>a.id===t));
    const topicPool:FocusTopic[]=filtered.length?filtered:allowed.map(x=>x.id);
    let generated=generateTask(area,pick(topicPool),difficulty);
    for(let retry=0;retry<5;retry++){
      const signature=`${generated.area}|${generated.topicLabel}|${generated.prompt}|${generated.detail}`;
      if(!recentSignatures.has(signature)){recentSignatures.add(signature);break;}
      generated=generateTask(area,pick(topicPool),difficulty);
    }
    tasks.push(generated);
  }
  return shuffle(tasks);
}

export function createDailyChallenge():PersonalTask[]{
  const date=new Date();const seed=Number(`${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`);const before=Math.random;let state=seed;
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
