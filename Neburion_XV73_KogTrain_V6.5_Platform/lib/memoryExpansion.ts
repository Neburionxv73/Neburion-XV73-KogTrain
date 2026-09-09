import { randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";
import type { MemoryTask } from "@/lib/memory";

const SYMBOLS=["◆","●","▲","■","✦","⬟","★","◇","⬢","✚","⬣","◈","○","□","△","⬡","✖","✿","✧","⬥","◐","◒","◉","⬤"];
const stable=(mode:MemoryTask["mode"],value:string)=>`${mode}:v6-${value}`;
function choices(correct:string,pool:string[]):string[]{return shuffled([correct,...pool.filter(v=>v!==correct)]).slice(0,4);}

export function digitPairRecall(d:Difficulty,seed:number):MemoryTask{
  const length=d===1?5:d===2?7:9;
  const values=Array.from({length},()=>String(randomInt(0,9)));
  const first=seed%Math.max(1,length-2),second=Math.min(length-1,first+(d===1?1:2));
  const expected=`${values[first]}${values[second]}`;
  const pool=Array.from({length:10},(_,i)=>String(i));
  const options=choices(expected,Array.from({length:8},()=>`${shuffled(pool)[0]}${shuffled(pool)[0]}`));
  return {id:stable("digits",`pair-${values.join("")}-${first}-${second}`),mode:"digits",label:"Ziffernpaar",prompt:`Welche Ziffern standen an Position ${first+1} und ${second+1}?`,instruction:`Merke dir ${length} Ziffern. Danach werden zwei Positionen gleichzeitig abgefragt.`,display:values,answerType:"choice",expected,options,explanation:`Gesucht waren die Positionen ${first+1} und ${second+1}.`};
}

export function wordIntrusion(d:Difficulty,seed:number,words:string[]):MemoryTask{
  const count=d===1?5:d===2?7:8;
  const shown=shuffled(words).slice(0,count);
  const intruder=shuffled(words.filter(w=>!shown.includes(w)))[0];
  const options=shuffled([intruder,...shuffled(shown).slice(0,3)]);
  return {id:stable("recognition",`intruder-${shown.map(w=>w.toLowerCase()).join("-")}-${intruder.toLowerCase()}`),mode:"recognition",label:"Fremdwort erkennen",prompt:"Welches Wort war NICHT in der gezeigten Gruppe?",instruction:`Merke dir ${count} Wörter. Danach erscheint ein Wort, das vorher nicht dabei war.`,display:shown,answerType:"choice",expected:intruder,options,explanation:`${intruder} war das einzige Wort, das nicht in der ursprünglichen Gruppe vorkam.`};
}

export function symbolPairRecall(d:Difficulty,seed:number):MemoryTask{
  const count=d===1?5:d===2?7:9;
  const list=Array.from({length:count},()=>SYMBOLS[randomInt(0,SYMBOLS.length-1)]);
  const first=seed%Math.max(1,count-2),second=Math.min(count-1,first+(d===3?3:2));
  const expected=`${list[first]} ${list[second]}`;
  const options=choices(expected,Array.from({length:8},()=>`${SYMBOLS[randomInt(0,SYMBOLS.length-1)]} ${SYMBOLS[randomInt(0,SYMBOLS.length-1)]}`));
  return {id:stable("symbols",`pair-${list.join("")}-${first}-${second}`),mode:"symbols",label:"Symbolpaar",prompt:`Welche Symbole standen an Position ${first+1} und ${second+1}?`,instruction:`Merke dir ${count} Symbole. Zwei Positionen werden anschließend gemeinsam abgefragt.`,display:list,answerType:"choice",expected,options,explanation:`Die gesuchten Symbole waren ${expected}.`};
}

export function positionMissing(d:Difficulty,seed:number):MemoryTask{
  const marked=shuffled([0,1,2,3,4,5,6,7,8]).slice(0,d===1?3:d===2?4:5).sort((a,b)=>a-b);
  const removed=marked[seed%marked.length];
  const recall=marked.filter(p=>p!==removed);
  const labels=["oben links","oben Mitte","oben rechts","Mitte links","Mitte","Mitte rechts","unten links","unten Mitte","unten rechts"];
  const display=Array.from({length:9},(_,i)=>marked.includes(i)?"●":"·");
  const options=choices(labels[removed],shuffled(labels.filter((_,i)=>!recall.includes(i))));
  return {id:stable("positions",`missing-${marked.join("-")}-${removed}`),mode:"positions",label:"Fehlende Position",prompt:"Welche markierte Position fehlt im zweiten Muster?",instruction:"Merke dir alle markierten Felder. Danach fehlt genau eine Position.",display,answerType:"choice",expected:labels[removed],options,explanation:`Gefehlt hat ${labels[removed]}.`,grid:true};
}

export function delayedMatch(d:Difficulty,seed:number):MemoryTask{
  const length=d===1?6:d===2?8:10;
  const stream=Array.from({length},()=>SYMBOLS[randomInt(0,SYMBOLS.length-1)]);
  const distance=d===1?2:d===2?3:4;
  const match=seed%2===0;
  const compareIndex=length-1-distance;
  if(match) stream[length-1]=stream[compareIndex];
  else stream[length-1]=shuffled(SYMBOLS.filter(s=>s!==stream[compareIndex]))[0];
  return {id:stable("nback2",`delay-${distance}-${stream.join("")}`),mode:"nback2",label:"Verzögerter Vergleich",prompt:`Ist das letzte Symbol identisch mit dem Symbol ${distance} Positionen davor?`,instruction:`Beobachte ${length} Symbole und halte einen längeren Abstand aktiv im Arbeitsgedächtnis.`,display:stream,answerType:"choice",expected:match?"Ja":"Nein",options:shuffled(["Ja","Nein"]),explanation:`Verglichen wird das letzte Symbol mit dem Element ${distance} Positionen davor.`};
}
