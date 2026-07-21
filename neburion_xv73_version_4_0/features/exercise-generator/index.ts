import type { Exercise } from "@/features/exercise-runner/types";
import type { Difficulty } from "@/features/cognitive-engine/types";

function mulberry32(seed:number){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function pick<T>(rng:()=>number,items:T[]){return items[Math.floor(rng()*items.length)]}
function shuffle<T>(rng:()=>number,items:T[]){return [...items].sort(()=>rng()-.5)}
const difficulties:Difficulty[]=["einstieg","leicht","mittel","schwer","profi"];

function logic(seed:number,index:number):Exercise{
 const rng=mulberry32(seed+index*11);const start=2+Math.floor(rng()*8);const step=2+Math.floor(rng()*7);const seq=[start,start+step,start+2*step,start+3*step];const answer=start+4*step;
 return {id:`gen-logic-${seed}-${index}`,type:"single-choice",domain:"logik",difficulty:pick(rng,difficulties),category:"Generator · Zahlenmuster",title:"Dynamische Zahlenbahn",prompt:`Welche Zahl setzt die Reihe fort? ${seq.join(" · ")} · ?`,options:shuffle(rng,[String(answer),String(answer-step),String(answer+step),String(answer+2)]),answer:String(answer),explanation:`Die Reihe wächst gleichmäßig um ${step}.`,strategy:"Vergleiche jeweils zwei Nachbarzahlen und prüfe den Abstand.",estimatedSeconds:35};
}
function math(seed:number,index:number):Exercise{
 const rng=mulberry32(seed+index*17);const price=(2+Math.floor(rng()*18))*5;const percent=pick(rng,[10,20,25,50]);const discount=price*percent/100;const answer=price-discount;
 return {id:`gen-math-${seed}-${index}`,type:"single-choice",domain:"mathematik",difficulty:pick(rng,["leicht","mittel","schwer"]),category:"Generator · Alltag",title:"Preisimpuls",prompt:`Ein Artikel kostet ${price} €. Er wird um ${percent} % reduziert. Wie hoch ist der neue Preis?`,options:shuffle(rng,[`${answer} €`,`${price-discount/2} €`,`${discount} €`,`${price-percent} €`]),answer:`${answer} €`,explanation:`${percent} % von ${price} € sind ${discount} €. Der neue Preis beträgt ${answer} €.`,strategy:"Berechne zuerst den Rabattbetrag und ziehe ihn dann ab.",estimatedSeconds:45};
}
function language(seed:number,index:number):Exercise{
 const rng=mulberry32(seed+index*23);const sets=[{word:"mutig",answer:"tapfer",wrong:["ängstlich","leise","langsam"]},{word:"präzise",answer:"genau",wrong:["ungefähr","laut","weich"]},{word:"fröhlich",answer:"heiter",wrong:["düster","streng","schwer"]},{word:"rasch",answer:"schnell",wrong:["ruhig","träge","spät"]}];const set=pick(rng,sets);
 return {id:`gen-language-${seed}-${index}`,type:"single-choice",domain:"sprache",difficulty:pick(rng,["einstieg","leicht","mittel"]),category:"Generator · Wortbeziehungen",title:"Wortresonanz",prompt:`Welches Wort bedeutet fast dasselbe wie „${set.word}“?`,options:shuffle(rng,[set.answer,...set.wrong]),answer:set.answer,explanation:`„${set.answer}“ ist ein passendes Synonym für „${set.word}“.`,strategy:"Setze beide Wörter gedanklich in denselben Satz.",estimatedSeconds:30};
}
function visual(seed:number,index:number):Exercise{
 const rng=mulberry32(seed+index*29);const directions=["oben","rechts","unten","links"];const start=Math.floor(rng()*4);const turns=pick(rng,[1,2,3]);const answer=directions[(start+turns)%4];
 return {id:`gen-visual-${seed}-${index}`,type:"single-choice",domain:"visuell",difficulty:pick(rng,["einstieg","leicht","mittel"]),category:"Generator · Rotation",title:"Orbitale Drehung",prompt:`Ein Pfeil zeigt nach ${directions[start]}. Wohin zeigt er nach ${turns*90}° im Uhrzeigersinn?`,options:shuffle(rng,directions),answer,explanation:`${turns} Vierteldrehung${turns===1?"":"en"} im Uhrzeigersinn führen nach ${answer}.`,strategy:"Drehe den Pfeil schrittweise um jeweils 90°.",estimatedSeconds:35};
}
function attention(seed:number,index:number):Exercise{
 const rng=mulberry32(seed+index*31);const nums=shuffle(rng,[8,11,12,15,18,22,27,30]);const threshold=pick(rng,[10,15,20]);const answers=nums.filter(n=>n%2===0&&n>threshold).map(String);
 return {id:`gen-attention-${seed}-${index}`,type:"multi-choice",domain:"aufmerksamkeit",difficulty:pick(rng,["leicht","mittel","schwer"]),category:"Generator · Doppelregel",title:"Fokusfilter",prompt:`Markiere alle geraden Zahlen, die größer als ${threshold} sind.`,options:nums.map(String),answers,explanation:`Gesucht sind gerade Zahlen oberhalb von ${threshold}: ${answers.join(", ")}.`,strategy:"Filtere zuerst nach gerade, danach nach der Größenbedingung.",estimatedSeconds:40};
}

export function generateExerciseSet(seed:number,count=25):Exercise[]{
 const makers=[logic,math,language,visual,attention];
 return Array.from({length:count},(_,i)=>makers[i%makers.length](seed,i));
}

export function getDailyGeneratedExercises(count=20){
 const now=new Date();const seed=Number(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`);
 return generateExerciseSet(seed,count);
}
