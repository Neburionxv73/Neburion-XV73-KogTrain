import { createSessionSeed, difficultyFromPercent, finalizeBalancedSessionTasks, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type MemoryMode = "digits" | "reverse" | "words" | "symbols" | "positions" | "recognition" | "nback1" | "nback2";
export type MemoryTask = {
  id:string; mode:MemoryMode; label:string; prompt:string; instruction:string; display:string[];
  answerType:"text"|"choice"; expected:string; options?:string[]; explanation:string; grid?:boolean;
};
export type MemorySession = { difficulty:Difficulty; showMs:number; tasks:MemoryTask[] };
export const MEMORY_STORAGE_KEY = "neburion-v65-memory-progress";
export const MEMORY_SESSION_LENGTH = 8;

const WORDS=[
 "Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Schlüssel","Wald","Fenster","Fluss","Stern","Berg","Feder","Tasse","Blatt","Turm","Regen","Klang","Stein","Pfad","Lampe","Kreis","Nebel","Garten",
 "Anker","Brot","Insel","Jacke","Karte","Leiter","Mühle","Orange","Pinsel","Quelle","Ring","Schale","Trommel","Ufer","Vogel","Wiese","Zweig","Messer","Kissen","Schnee","Hafen","Seil","Birne","Komet",
 "Kompass","Laterne","Muschel","Rucksack","Zeder","Felsen","Segel","Tunnel","Kranich","Würfel","Atlas","Brunnen","Kiesel","Wimpel","Schmiede","Kuppel","Balkon","Glocke","Kanu","Marmor","Palme","Rakete","Sattel","Teich","Uhr","Vase","Werkbank","Zelt","Linse","Mosaik","Besen","Korken","Schirm","Truhe","Pyramide","Karton","Aster","Kessel","Fackel","Höhle",
 "Akzent","Bühne","Drachen","Eiche","Fjord","Globus","Harfe","Igel","Juwel","Kaktus","Laterne","Münze","Nuss","Orgel","Pergament","Quarz","Reif","Säule","Tinte","Umhang","Vulkan","Wecker","Yacht","Zirkel"
];
const SYMBOLS=["◆","●","▲","■","✦","⬟","★","◇","⬢","✚","⬣","◈","○","□","△","⬡","✖","✿","✧","⬥","◐","◒","◉","⬤"];
const normalizeWords=(values:string[])=>values.map(v=>v.toLocaleLowerCase("de-AT")).join("|");
const digits=(length:number)=>Array.from({length},()=>String(randomInt(0,9)));
const stableId=(mode:MemoryMode,content:string)=>`${mode}:${content}`;
function uniqueOptions(correct:string,factory:()=>string):string[]{const values=new Set<string>([correct]);let guard=0;while(values.size<4&&guard<80){values.add(factory());guard++}return shuffled([...values]);}
function span(d:Difficulty,base:[number,number,number],seed:number){return base[d-1]+(seed%2);}

function sequenceTask(mode:"digits"|"reverse",d:Difficulty,seed:number):MemoryTask{
 const base=mode==="reverse"?[4,5,6] as [number,number,number]:[4,6,8] as [number,number,number];
 const length=span(d,base,seed),sequence=digits(length),raw=sequence.join(""),expected=(mode==="reverse"?[...sequence].reverse():sequence).join("");
 const prompt=mode==="reverse"?(seed%2?"Welche Zahlenfolge entsteht von hinten nach vorne?":"Gib die Folge rückwärts ein."):(seed%2?"Rekonstruiere die Zahlenfolge exakt.":"Gib die Folge in gleicher Reihenfolge ein.");
 return {id:stableId(mode,raw),mode,label:mode==="reverse"?"Rückwärtsfolge":"Zahlenfolge",prompt,instruction:`Präge dir ${length} Ziffern und ihre Reihenfolge ein.`,display:sequence,answerType:"text",expected,explanation:mode==="reverse"?"Die ursprüngliche Folge wird vollständig umgekehrt abgerufen.":"Alle Ziffern müssen in der gezeigten Reihenfolge erinnert werden."};
}
function wordTask(d:Difficulty,seed:number):MemoryTask{
 const count=d===1?4:d===2?6:7,list=shuffled(WORDS).slice(0,count),signature=list.map(w=>w.toLowerCase()).join("-");
 return {id:stableId("words",signature),mode:"words",label:"Wortgedächtnis",prompt:seed%2?"Gib die Wörter in derselben Reihenfolge ein.":"Welche Wortfolge wurde gezeigt?",instruction:`Merke dir ${count} Wörter und ihre genaue Reihenfolge.`,display:list,answerType:"text",expected:normalizeWords(list),explanation:"Freier Abruf: Wortlaut und Reihenfolge müssen zusammen stimmen."};
}
function symbolTask(d:Difficulty,seed:number):MemoryTask{
 const count=d===1?4:d===2?6:8,list=Array.from({length:count},()=>SYMBOLS[randomInt(0,SYMBOLS.length-1)]),correct=list.join(" ");
 const options=uniqueOptions(correct,()=>{const copy=[...list];const swaps=d===3?2:1;for(let i=0;i<swaps;i++){const at=randomInt(0,count-1);copy[at]=SYMBOLS[randomInt(0,SYMBOLS.length-1)]}return copy.join(" ")});
 return {id:stableId("symbols",correct),mode:"symbols",label:"Symbolgedächtnis",prompt:seed%2?"Welche Symbolfolge hast du gesehen?":"Wähle die exakt gezeigte Symbolreihe.",instruction:`Merke dir ${count} Symbole. Ähnliche Formen können später als Ablenkung erscheinen.`,display:list,answerType:"choice",expected:correct,options,explanation:"Entscheidend sind Symbolidentität und Position in der Reihe."};
}
function positionTask(d:Difficulty,seed:number):MemoryTask{
 const count=d===1?2:d===2?4:5,positions=shuffled([0,1,2,3,4,5,6,7,8]).slice(0,count).sort((a,b)=>a-b),correct=`pos:${positions.join(",")}`;
 const options=uniqueOptions(correct,()=>{const copy=[...positions];const replaceAt=randomInt(0,copy.length-1),available=[0,1,2,3,4,5,6,7,8].filter(p=>!copy.includes(p));copy[replaceAt]=available[randomInt(0,available.length-1)]??copy[replaceAt];return `pos:${copy.sort((a,b)=>a-b).join(",")}`});
 const display=Array.from({length:9},(_,i)=>positions.includes(i)?"●":"·");
 return {id:stableId("positions",positions.join("-")),mode:"positions",label:"Positionsgedächtnis",prompt:seed%2?"Welche Felder waren markiert?":"Welches räumliche Muster wurde gezeigt?",instruction:`Merke dir ${count} Positionen im 3×3-Raster.`,display,answerType:"choice",expected:correct,options,explanation:"Wiedererkannt werden muss die vollständige räumliche Anordnung.",grid:true};
}
function recognitionTask(d:Difficulty,seed:number):MemoryTask{
 const count=d===1?5:d===2?6:7,list=shuffled(WORDS).slice(0,count),correct=list.join(" · ");
 const options=uniqueOptions(correct,()=>{const copy=[...list],changes=d===1?2:1;for(let i=0;i<changes;i++){const at=randomInt(0,count-1),replacement=shuffled(WORDS.filter(w=>!copy.includes(w)))[0];copy[at]=replacement}if(d>=2&&Math.random()<0.5){const a=randomInt(0,count-2);[copy[a],copy[a+1]]=[copy[a+1],copy[a]]}return copy.join(" · ")});
 return {id:stableId("recognition",list.map(w=>w.toLowerCase()).join("-")),mode:"recognition",label:"Wiedererkennung",prompt:seed%2?"Welche Wortgruppe wurde gezeigt?":"Erkenne die ursprüngliche Wortgruppe wieder.",instruction:`Merke dir ${count} Wörter. Die Antwortmöglichkeiten unterscheiden sich nur in kleinen Details.`,display:list,answerType:"choice",expected:correct,options,explanation:"Bei höherer Schwierigkeit sind die falschen Gruppen gezielte Near-Misses statt völlig andere Listen."};
}
function nbackTask(n:1|2,d:Difficulty,seed:number):MemoryTask{
 const length=d===1?6:d===2?8:10,stream=Array.from({length},()=>SYMBOLS[randomInt(0,d===3?SYMBOLS.length-1:15)]),targetIndex=length-1,match=(seed+randomInt(0,9))%2===0;
 if(match)stream[targetIndex]=stream[targetIndex-n];else{const forbidden=stream[targetIndex-n];stream[targetIndex]=shuffled(SYMBOLS.filter(s=>s!==forbidden))[0]}
 const mode:MemoryMode=n===1?"nback1":"nback2";
 return {id:stableId(mode,stream.join("")),mode,label:`${n}-Back`,prompt:`War das letzte Symbol identisch mit dem Symbol ${n===1?"direkt davor":"zwei Positionen davor"}?`,instruction:`Beobachte ${length} Symbole und halte die letzten Positionen aktiv im Arbeitsgedächtnis.`,display:stream,answerType:"choice",expected:match?"Ja":"Nein",options:shuffled(["Ja","Nein"]),explanation:`Beim ${n}-Back wird das letzte Element exakt mit dem Element ${n} Position${n===1?"":"en"} zuvor verglichen.`};
}
export function createMemorySession(bestScore:number):MemorySession{
 const percent=Math.round(bestScore/MEMORY_SESSION_LENGTH*100),difficulty=difficultyFromPercent(percent),seed=createSessionSeed();
 const rounds=difficulty===3?5:4,candidates=Array.from({length:rounds},(_,round)=>{const o=seed+round*43;return [sequenceTask("digits",difficulty,o+1),sequenceTask("reverse",difficulty,o+2),wordTask(difficulty,o+3),symbolTask(difficulty,o+4),positionTask(difficulty,o+5),recognitionTask(difficulty,o+6),nbackTask(1,difficulty,o+7),nbackTask(2,difficulty,o+8)]}).flat();
 const tasks=finalizeBalancedSessionTasks("memory-v4",candidates,MEMORY_SESSION_LENGTH,144);
 return {difficulty,showMs:difficulty===3?3000:difficulty===2?3800:4600,tasks};
}
export function normalizeMemoryInput(task:MemoryTask,value:string):string{
 if(task.mode==="digits"||task.mode==="reverse")return value.replace(/\D/g,"");
 if(task.mode==="words")return value.toLocaleLowerCase("de-AT").trim().split(/[\s,;]+/).filter(Boolean).join("|");
 return value.trim();
}
