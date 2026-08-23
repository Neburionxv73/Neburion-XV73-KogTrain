export type BrainFitMode = "relaxed" | "normal" | "challenge";
export type BrainFitArea = "sudoku" | "words" | "crossword" | "memory" | "categories" | "sequence" | "everydayMath" | "timeOrder";

export type AreaStat = { sessions:number; totalScore:number; bestScore:number };
export type BrainFitStats = { sessions:number; totalScore:number; areaStats:Record<BrainFitArea,AreaStat>; updatedAt:number };

export const BRAIN_FIT_STORAGE_KEY = "neburion-v65-brain-fit-v372";

export const BRAIN_FIT_AREAS: Array<{id:BrainFitArea; icon:string; title:string; subtitle:string}> = [
  {id:"sudoku",icon:"🐾",title:"Tier-Sudoku",subtitle:"Logik & Muster"},
  {id:"words",icon:"🔎",title:"Wortsuchraster",subtitle:"Wörter & Aufmerksamkeit"},
  {id:"crossword",icon:"✍️",title:"Kreuzworträtsel",subtitle:"Sprache & Wissen"},
  {id:"memory",icon:"🧠",title:"Memory",subtitle:"Merken & Wiedererkennen"},
  {id:"categories",icon:"🧺",title:"Kategorien",subtitle:"Ordnen & Zuordnen"},
  {id:"sequence",icon:"🔢",title:"Reihen & Folgen",subtitle:"Logik & Fortsetzen"},
  {id:"everydayMath",icon:"🛒",title:"Alltagsrechnen",subtitle:"Einkauf & Mengen"},
  {id:"timeOrder",icon:"🕒",title:"Zeit & Reihenfolge",subtitle:"Alltag & Orientierung"},
];

const emptyAreaStat = ():AreaStat => ({sessions:0,totalScore:0,bestScore:0});
export function emptyBrainFitStats():BrainFitStats {
  return {
    sessions:0,totalScore:0,updatedAt:0,
    areaStats:{
      sudoku:emptyAreaStat(),words:emptyAreaStat(),crossword:emptyAreaStat(),memory:emptyAreaStat(),
      categories:emptyAreaStat(),sequence:emptyAreaStat(),everydayMath:emptyAreaStat(),timeOrder:emptyAreaStat(),
    },
  };
}

export function mergeBrainFitStats(value:unknown):BrainFitStats {
  const base=emptyBrainFitStats();
  if(!value||typeof value!=="object") return base;
  const raw=value as Partial<BrainFitStats>;
  const incoming=raw.areaStats ?? ({} as Record<BrainFitArea,AreaStat>);
  const areaStats={...base.areaStats};
  BRAIN_FIT_AREAS.forEach(({id})=>{
    const item=incoming[id];
    if(item) areaStats[id]={sessions:item.sessions??0,totalScore:item.totalScore??0,bestScore:item.bestScore??0};
  });
  return {sessions:raw.sessions??0,totalScore:raw.totalScore??0,updatedAt:raw.updatedAt??0,areaStats};
}

export function recordBrainFitResult(stats:BrainFitStats,area:BrainFitArea,score:number):BrainFitStats {
  const safe=Math.max(0,Math.min(100,Math.round(score)));
  const current=stats.areaStats[area];
  return {
    sessions:stats.sessions+1,
    totalScore:stats.totalScore+safe,
    updatedAt:Date.now(),
    areaStats:{...stats.areaStats,[area]:{sessions:current.sessions+1,totalScore:current.totalScore+safe,bestScore:Math.max(current.bestScore,safe)}},
  };
}

export function areaAverage(stat:AreaStat){return stat.sessions?Math.round(stat.totalScore/stat.sessions):0;}
export function overallAverage(stats:BrainFitStats){return stats.sessions?Math.round(stats.totalScore/stats.sessions):0;}

export function recommendedArea(stats:BrainFitStats):BrainFitArea {
  const untrained=BRAIN_FIT_AREAS.find(({id})=>stats.areaStats[id].sessions===0);
  if(untrained) return untrained.id;
  return [...BRAIN_FIT_AREAS].sort((a,b)=>areaAverage(stats.areaStats[a.id])-areaAverage(stats.areaStats[b.id]))[0].id;
}

export function adaptiveMode(stats:BrainFitStats,area:BrainFitArea):BrainFitMode {
  const stat=stats.areaStats[area];
  if(stat.sessions<2) return "relaxed";
  const avg=areaAverage(stat);
  if(avg>=86) return "challenge";
  if(avg>=65) return "normal";
  return "relaxed";
}

export const WORD_SETS = [
  ["APFEL","WALD","MOND","ROSE","VOGEL","BERG"],
  ["KATZE","BAUM","WIESE","SONNE","BLUME","FLUSS"],
  ["BROT","MILCH","TASSE","TISCH","LAMPE","BUCH"],
];

export const CROSSWORD_POOL = [
  {clue:"Rundes Obst, oft rot oder grün.",answer:"APFEL"}, {clue:"Große Ansammlung vieler Bäume.",answer:"WALD"},
  {clue:"Leuchtet nachts am Himmel.",answer:"MOND"}, {clue:"Blume mit Dornen.",answer:"ROSE"},
  {clue:"Tier mit Federn und Flügeln.",answer:"VOGEL"}, {clue:"Hohe natürliche Erhebung.",answer:"BERG"},
  {clue:"Getränk aus weißen Tropfen von Kühen.",answer:"MILCH"}, {clue:"Darauf sitzt man am Tisch.",answer:"STUHL"},
  {clue:"Zeigt Stunden und Minuten.",answer:"UHR"}, {clue:"Darüber kommt man trockenen Fußes über einen Fluss.",answer:"BRUECKE"},
  {clue:"Darin liest man Geschichten oder Wissen.",answer:"BUCH"}, {clue:"Gelbes Licht am Taghimmel.",answer:"SONNE"},
];

export const CATEGORY_TASKS = [
  {prompt:"Was passt nicht zu Obst?",options:["Apfel","Birne","Karotte","Pflaume"],answer:"Karotte"},
  {prompt:"Was passt nicht zu Werkzeug?",options:["Hammer","Zange","Säge","Kissen"],answer:"Kissen"},
  {prompt:"Was passt nicht zu Tieren?",options:["Hund","Katze","Schrank","Vogel"],answer:"Schrank"},
  {prompt:"Was passt nicht zum Frühstück?",options:["Brot","Marmelade","Kaffee","Schraube"],answer:"Schraube"},
  {prompt:"Was passt nicht zu Kleidung?",options:["Jacke","Hose","Mütze","Teller"],answer:"Teller"},
  {prompt:"Was passt nicht in den Garten?",options:["Blume","Baum","Rasen","Fernseher"],answer:"Fernseher"},
];

export const SEQUENCE_TASKS = [
  {prompt:"2 · 4 · 6 · 8 · ?",options:["9","10","11","12"],answer:"10"},
  {prompt:"5 · 10 · 15 · 20 · ?",options:["22","25","30","35"],answer:"25"},
  {prompt:"1 · 2 · 4 · 8 · ?",options:["10","12","16","18"],answer:"16"},
  {prompt:"Montag · Dienstag · Mittwoch · ?",options:["Freitag","Donnerstag","Sonntag","Samstag"],answer:"Donnerstag"},
  {prompt:"Frühling · Sommer · Herbst · ?",options:["Winter","Morgen","Januar","Regen"],answer:"Winter"},
  {prompt:"10 · 9 · 8 · 7 · ?",options:["5","6","8","9"],answer:"6"},
];

export const EVERYDAY_MATH_TASKS = [
  {prompt:"Ein Brot kostet 3 €. Zwei Brote kosten?",options:["5 €","6 €","7 €","8 €"],answer:"6 €"},
  {prompt:"Du hast 20 € und zahlst 14 €. Wie viel bleibt?",options:["4 €","5 €","6 €","7 €"],answer:"6 €"},
  {prompt:"4 Äpfel kosten zusammen 8 €. Was kostet 1 Apfel?",options:["1 €","2 €","3 €","4 €"],answer:"2 €"},
  {prompt:"Eine Packung enthält 6 Eier. Zwei Packungen enthalten?",options:["8","10","12","14"],answer:"12"},
  {prompt:"Von 30 € werden 5 € abgezogen. Ergebnis?",options:["20 €","25 €","30 €","35 €"],answer:"25 €"},
  {prompt:"3 Flaschen mit je 2 Litern ergeben?",options:["4 l","5 l","6 l","8 l"],answer:"6 l"},
];

export const TIME_ORDER_TASKS = [
  {prompt:"Was kommt im Tagesablauf normalerweise zuerst?",options:["Frühstück","Abendessen","Schlafengehen","Mittagessen"],answer:"Frühstück"},
  {prompt:"Welche Uhrzeit ist später?",options:["08:00","11:30","07:45","06:15"],answer:"11:30"},
  {prompt:"Was kommt nach Dienstag?",options:["Montag","Mittwoch","Freitag","Sonntag"],answer:"Mittwoch"},
  {prompt:"Welche Jahreszeit folgt auf den Sommer?",options:["Frühling","Herbst","Winter","Sommer"],answer:"Herbst"},
  {prompt:"Ein Termin beginnt um 14:00 und dauert 1 Stunde. Ende?",options:["14:30","15:00","15:30","16:00"],answer:"15:00"},
  {prompt:"Was kommt normalerweise nach dem Mittagessen?",options:["Morgen","Nachmittag","Mitternacht","Frühstück"],answer:"Nachmittag"},
];

export function shuffled<T>(items:T[]):T[]{return [...items].sort(()=>Math.random()-.5);}
