export type BrainFitMode = "relaxed" | "normal" | "challenge";
export type BrainFitArea = "sudoku" | "words" | "crossword" | "memory" | "categories" | "sequence" | "everydayMath" | "timeOrder";

export type AreaStat = { sessions:number; totalScore:number; bestScore:number };
export type BrainFitStats = { sessions:number; totalScore:number; areaStats:Record<BrainFitArea,AreaStat>; updatedAt:number };
export type BrainFitChoiceTask = { prompt:string; options:string[]; answer:string };

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
  return [...BRAIN_FIT_AREAS].sort((a,b)=>areaAverage(stats.areaStats[a.id])-areaAverage(stats.areaStats[b.id]) || stats.areaStats[a.id].sessions-stats.areaStats[b.id].sessions)[0].id;
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
  ["GARTEN","BANK","WEG","TEICH","BIENE","BLATT"],
  ["ZUG","REISE","KOFFER","HOTEL","KARTE","BAHNHOF"],
  ["KIRCHE","MARKT","PARK","BRUECKE","PLATZ","STRASSE"],
  ["SUPPE","NUDEL","SALAT","KAFFEE","KUCHEN","KAESE"],
  ["WINTER","SCHNEE","SOMMER","REGEN","WIND","WOLKE"],
];

export const CROSSWORD_POOL = [
  {clue:"Rundes Obst, oft rot oder grün.",answer:"APFEL"}, {clue:"Große Ansammlung vieler Bäume.",answer:"WALD"},
  {clue:"Leuchtet nachts am Himmel.",answer:"MOND"}, {clue:"Blume mit Dornen.",answer:"ROSE"},
  {clue:"Tier mit Federn und Flügeln.",answer:"VOGEL"}, {clue:"Hohe natürliche Erhebung.",answer:"BERG"},
  {clue:"Getränk aus weißen Tropfen von Kühen.",answer:"MILCH"}, {clue:"Darauf sitzt man am Tisch.",answer:"STUHL"},
  {clue:"Zeigt Stunden und Minuten.",answer:"UHR"}, {clue:"Darüber kommt man trockenen Fußes über einen Fluss.",answer:"BRUECKE"},
  {clue:"Darin liest man Geschichten oder Wissen.",answer:"BUCH"}, {clue:"Gelbes Licht am Taghimmel.",answer:"SONNE"},
  {clue:"Damit öffnet man eine verschlossene Tür.",answer:"SCHLUESSEL"}, {clue:"Darin bewahrt man Kleidung auf.",answer:"SCHRANK"},
  {clue:"Fährt auf Schienen von Ort zu Ort.",answer:"ZUG"}, {clue:"Dort kauft man Brot und Lebensmittel.",answer:"GESCHAEFT"},
  {clue:"Warme Mahlzeit, oft mit Brühe.",answer:"SUPPE"}, {clue:"Dort wachsen Blumen, Gemüse oder Kräuter.",answer:"GARTEN"},
  {clue:"Fällt im Winter weiß vom Himmel.",answer:"SCHNEE"}, {clue:"Damit telefoniert man unterwegs.",answer:"HANDY"},
  {clue:"Dort wartet man auf einen Zug.",answer:"BAHNHOF"}, {clue:"Ein Fahrzeug mit zwei Rädern und Pedalen.",answer:"FAHRRAD"},
  {clue:"Darauf schläft man nachts.",answer:"BETT"}, {clue:"Daraus trinkt man Kaffee oder Tee.",answer:"TASSE"},
];

export const CATEGORY_TASKS: BrainFitChoiceTask[] = [
  {prompt:"Was passt nicht zu Obst?",options:["Apfel","Birne","Karotte","Pflaume"],answer:"Karotte"},
  {prompt:"Was passt nicht zu Werkzeug?",options:["Hammer","Zange","Säge","Kissen"],answer:"Kissen"},
  {prompt:"Was passt nicht zu Tieren?",options:["Hund","Katze","Schrank","Vogel"],answer:"Schrank"},
  {prompt:"Was passt nicht zum Frühstück?",options:["Brot","Marmelade","Kaffee","Schraube"],answer:"Schraube"},
  {prompt:"Was passt nicht zu Kleidung?",options:["Jacke","Hose","Mütze","Teller"],answer:"Teller"},
  {prompt:"Was passt nicht in den Garten?",options:["Blume","Baum","Rasen","Fernseher"],answer:"Fernseher"},
  {prompt:"Was passt nicht zu Getränken?",options:["Wasser","Tee","Saft","Hammer"],answer:"Hammer"},
  {prompt:"Was passt nicht ins Badezimmer?",options:["Handtuch","Seife","Zahnbürste","Kochtopf"],answer:"Kochtopf"},
  {prompt:"Was passt nicht zu Verkehrsmitteln?",options:["Bus","Zug","Fahrrad","Sofa"],answer:"Sofa"},
  {prompt:"Was passt nicht zum Winter?",options:["Schnee","Mütze","Handschuhe","Badehose"],answer:"Badehose"},
  {prompt:"Was passt nicht in eine Küche?",options:["Topf","Teller","Pfanne","Regenschirm"],answer:"Regenschirm"},
  {prompt:"Was passt nicht zu Blumen?",options:["Rose","Tulpe","Nelke","Kartoffel"],answer:"Kartoffel"},
];

export const SEQUENCE_TASKS: BrainFitChoiceTask[] = [
  {prompt:"2 · 4 · 6 · 8 · ?",options:["9","10","11","12"],answer:"10"},
  {prompt:"5 · 10 · 15 · 20 · ?",options:["22","25","30","35"],answer:"25"},
  {prompt:"1 · 2 · 4 · 8 · ?",options:["10","12","16","18"],answer:"16"},
  {prompt:"Montag · Dienstag · Mittwoch · ?",options:["Freitag","Donnerstag","Sonntag","Samstag"],answer:"Donnerstag"},
  {prompt:"Frühling · Sommer · Herbst · ?",options:["Winter","Morgen","Januar","Regen"],answer:"Winter"},
  {prompt:"10 · 9 · 8 · 7 · ?",options:["5","6","8","9"],answer:"6"},
  {prompt:"3 · 6 · 9 · 12 · ?",options:["13","14","15","16"],answer:"15"},
  {prompt:"20 · 18 · 16 · 14 · ?",options:["10","11","12","13"],answer:"12"},
  {prompt:"A · C · E · G · ?",options:["H","I","J","K"],answer:"I"},
  {prompt:"Januar · Februar · März · ?",options:["April","Mai","Juni","Juli"],answer:"April"},
  {prompt:"100 · 90 · 80 · 70 · ?",options:["50","55","60","65"],answer:"60"},
  {prompt:"1 · 3 · 5 · 7 · ?",options:["8","9","10","11"],answer:"9"},
];

export const EVERYDAY_MATH_TASKS: BrainFitChoiceTask[] = [
  {prompt:"Ein Brot kostet 3 €. Zwei Brote kosten?",options:["5 €","6 €","7 €","8 €"],answer:"6 €"},
  {prompt:"Du hast 20 € und zahlst 14 €. Wie viel bleibt?",options:["4 €","5 €","6 €","7 €"],answer:"6 €"},
  {prompt:"4 Äpfel kosten zusammen 8 €. Was kostet 1 Apfel?",options:["1 €","2 €","3 €","4 €"],answer:"2 €"},
  {prompt:"Eine Packung enthält 6 Eier. Zwei Packungen enthalten?",options:["8","10","12","14"],answer:"12"},
  {prompt:"Von 30 € werden 5 € abgezogen. Ergebnis?",options:["20 €","25 €","30 €","35 €"],answer:"25 €"},
  {prompt:"3 Flaschen mit je 2 Litern ergeben?",options:["4 l","5 l","6 l","8 l"],answer:"6 l"},
  {prompt:"Ein Kaffee kostet 4 €. Du bezahlst mit 10 €. Rückgeld?",options:["4 €","5 €","6 €","7 €"],answer:"6 €"},
  {prompt:"5 Semmeln kosten je 1 €. Gesamtpreis?",options:["3 €","4 €","5 €","6 €"],answer:"5 €"},
  {prompt:"Du kaufst für 12 € und 7 €. Zusammen?",options:["17 €","18 €","19 €","20 €"],answer:"19 €"},
  {prompt:"Eine Fahrt dauert 30 Minuten. Zwei Fahrten dauern?",options:["45 min","50 min","60 min","90 min"],answer:"60 min"},
  {prompt:"In einer Kiste sind 24 Flaschen. 6 werden entnommen. Übrig?",options:["16","18","20","22"],answer:"18"},
  {prompt:"Ein Rezept braucht 2 Eier. Für drei gleiche Rezepte brauchst du?",options:["4","5","6","8"],answer:"6"},
];

export const TIME_ORDER_TASKS: BrainFitChoiceTask[] = [
  {prompt:"Was kommt im Tagesablauf normalerweise zuerst?",options:["Frühstück","Abendessen","Schlafengehen","Mittagessen"],answer:"Frühstück"},
  {prompt:"Welche Uhrzeit ist später?",options:["08:00","11:30","07:45","06:15"],answer:"11:30"},
  {prompt:"Was kommt nach Dienstag?",options:["Montag","Mittwoch","Freitag","Sonntag"],answer:"Mittwoch"},
  {prompt:"Welche Jahreszeit folgt auf den Sommer?",options:["Frühling","Herbst","Winter","Sommer"],answer:"Herbst"},
  {prompt:"Ein Termin beginnt um 14:00 und dauert 1 Stunde. Ende?",options:["14:30","15:00","15:30","16:00"],answer:"15:00"},
  {prompt:"Was kommt normalerweise nach dem Mittagessen?",options:["Morgen","Nachmittag","Mitternacht","Frühstück"],answer:"Nachmittag"},
  {prompt:"Ein Film beginnt um 19:00 und dauert 2 Stunden. Ende?",options:["20:00","20:30","21:00","22:00"],answer:"21:00"},
  {prompt:"Was kommt vor Freitag?",options:["Mittwoch","Donnerstag","Samstag","Sonntag"],answer:"Donnerstag"},
  {prompt:"Welche Uhrzeit liegt zwischen 09:00 und 11:00?",options:["08:30","10:00","11:30","12:00"],answer:"10:00"},
  {prompt:"Welcher Monat folgt auf April?",options:["März","Mai","Juni","Juli"],answer:"Mai"},
  {prompt:"Ein Termin ist um 16:30. Eine halbe Stunde vorher ist?",options:["15:30","16:00","16:15","17:00"],answer:"16:00"},
  {prompt:"Welche Tageszeit folgt normalerweise auf den Vormittag?",options:["Nacht","Mittag","Morgen","Abend"],answer:"Mittag"},
];

export function shuffled<T>(items:T[]):T[]{return [...items].sort(()=>Math.random()-.5);}

export function variedQuizTasks(area:BrainFitArea,mode:BrainFitMode):BrainFitChoiceTask[]{
  const source = area==="categories"?CATEGORY_TASKS:area==="sequence"?SEQUENCE_TASKS:area==="everydayMath"?EVERYDAY_MATH_TASKS:area==="timeOrder"?TIME_ORDER_TASKS:[];
  const count=mode==="relaxed"?6:mode==="normal"?8:10;
  return shuffled(source).slice(0,Math.min(count,source.length)).map(task=>({...task,options:shuffled(task.options)}));
}
