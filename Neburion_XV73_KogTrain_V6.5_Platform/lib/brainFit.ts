import { chooseFresh, readRecentTaskIds, rememberTaskIds } from "@/lib/dynamicTraining";

export type BrainFitMode = "relaxed" | "normal" | "challenge";
export type BrainFitArea = "sudoku" | "words" | "crossword" | "memory" | "categories" | "sequence" | "everydayMath" | "timeOrder";
export type AreaStat = { sessions:number; totalScore:number; bestScore:number };
export type BrainFitStats = { sessions:number; totalScore:number; areaStats:Record<BrainFitArea,AreaStat>; updatedAt:number };
export type BrainFitChoiceTask = { prompt:string; options:string[]; answer:string; level?:BrainFitMode };

export const BRAIN_FIT_STORAGE_KEY = "neburion-v65-brain-fit-v372";
export const BRAIN_FIT_V4_HISTORY_LIMIT = 144;

export const BRAIN_FIT_AREAS:Array<{id:BrainFitArea;icon:string;title:string;subtitle:string}> = [
 {id:"sudoku",icon:"🐾",title:"Tier-Sudoku",subtitle:"Logik & Muster"},
 {id:"words",icon:"🔎",title:"Wortsuchraster",subtitle:"Wörter & Aufmerksamkeit"},
 {id:"crossword",icon:"✍️",title:"Kreuzworträtsel",subtitle:"Sprache & Wissen"},
 {id:"memory",icon:"🧠",title:"Memory",subtitle:"Merken & Wiedererkennen"},
 {id:"categories",icon:"🧺",title:"Kategorien",subtitle:"Ordnen & Zuordnen"},
 {id:"sequence",icon:"🔢",title:"Reihen & Folgen",subtitle:"Logik & Fortsetzen"},
 {id:"everydayMath",icon:"🛒",title:"Alltagsrechnen",subtitle:"Einkauf & Mengen"},
 {id:"timeOrder",icon:"🕒",title:"Zeit & Reihenfolge",subtitle:"Alltag & Orientierung"},
];

const emptyAreaStat=():AreaStat=>({sessions:0,totalScore:0,bestScore:0});
export function emptyBrainFitStats():BrainFitStats{return{sessions:0,totalScore:0,updatedAt:0,areaStats:{sudoku:emptyAreaStat(),words:emptyAreaStat(),crossword:emptyAreaStat(),memory:emptyAreaStat(),categories:emptyAreaStat(),sequence:emptyAreaStat(),everydayMath:emptyAreaStat(),timeOrder:emptyAreaStat()}}}
export function mergeBrainFitStats(value:unknown):BrainFitStats{const base=emptyBrainFitStats();if(!value||typeof value!=="object")return base;const raw=value as Partial<BrainFitStats>,incoming=raw.areaStats??({} as Record<BrainFitArea,AreaStat>),areaStats={...base.areaStats};BRAIN_FIT_AREAS.forEach(({id})=>{const item=incoming[id];if(item)areaStats[id]={sessions:item.sessions??0,totalScore:item.totalScore??0,bestScore:item.bestScore??0}});return{sessions:raw.sessions??0,totalScore:raw.totalScore??0,updatedAt:raw.updatedAt??0,areaStats}}
export function recordBrainFitResult(stats:BrainFitStats,area:BrainFitArea,score:number):BrainFitStats{const safe=Math.max(0,Math.min(100,Math.round(score))),current=stats.areaStats[area];return{sessions:stats.sessions+1,totalScore:stats.totalScore+safe,updatedAt:Date.now(),areaStats:{...stats.areaStats,[area]:{sessions:current.sessions+1,totalScore:current.totalScore+safe,bestScore:Math.max(current.bestScore,safe)}}}}
export function areaAverage(stat:AreaStat){return stat.sessions?Math.round(stat.totalScore/stat.sessions):0}
export function overallAverage(stats:BrainFitStats){return stats.sessions?Math.round(stats.totalScore/stats.sessions):0}
export function recommendedArea(stats:BrainFitStats):BrainFitArea{const untrained=BRAIN_FIT_AREAS.find(({id})=>stats.areaStats[id].sessions===0);if(untrained)return untrained.id;return[...BRAIN_FIT_AREAS].sort((a,b)=>areaAverage(stats.areaStats[a.id])-areaAverage(stats.areaStats[b.id])||stats.areaStats[a.id].sessions-stats.areaStats[b.id].sessions)[0].id}
export function adaptiveMode(stats:BrainFitStats,area:BrainFitArea):BrainFitMode{const stat=stats.areaStats[area];if(stat.sessions<2)return"relaxed";const avg=areaAverage(stat),evidence=Math.max(avg,stat.bestScore*.35+avg*.65);if(stat.sessions>=4&&evidence>=87)return"challenge";if(evidence>=64)return"normal";return"relaxed"}

export const WORD_SETS=[
 ["APFEL","WALD","MOND","ROSE","VOGEL","BERG"],["KATZE","BAUM","WIESE","SONNE","BLUME","FLUSS"],["BROT","MILCH","TASSE","TISCH","LAMPE","BUCH"],["GARTEN","BANK","WEG","TEICH","BIENE","BLATT"],
 ["ZUG","REISE","KOFFER","HOTEL","KARTE","BAHNHOF"],["KIRCHE","MARKT","PARK","BRUECKE","PLATZ","STRASSE"],["SUPPE","NUDEL","SALAT","KAFFEE","KUCHEN","KAESE"],["WINTER","SCHNEE","SOMMER","REGEN","WIND","WOLKE"],
 ["FELS","PFAD","HUETTE","GIPFEL","SEIL","WANDERUNG"],["BIRNE","TRAUBE","BEERE","MELONE","PFLAUME","KIRSCHE"],["SCHULE","HEFT","STIFT","PAUSE","TAFEL","KLASSE"],["RADIO","MUSIK","TON","LIED","KLANG","STIMME"],
 ["KINO","FILM","KARTE","SITZ","LEINWAND","PAUSE"],["ARZT","PRAXIS","TERMIN","REZEPT","APOTHEKE","MEDIZIN"],["BUS","FAHRPLAN","TICKET","LINIE","FAHRT","GLEIS"],["KUECHE","TOPF","PFANNE","MESSER","TELLER","LOEFFEL"],
 ["KOMPASS","ROUTE","NORDEN","KARTE","WEG","ZIEL"],["BUEHNE","LICHT","MUSIK","TAKT","STIMME","APPLAUS"],["ORDNER","DRUCKER","DATEI","TABELLE","BILDSCHIRM","BÜRO"],["WOLKE","NEBEL","STURM","WIND","REGEN","HAGEL"],
 ["PLANET","KOMET","STERN","ORBIT","MOND","SONNE"],["HAFEN","SEGEL","ANKER","WELLE","BOOT","INSEL"],["MUSEUM","BILD","KUNST","RAHMEN","SAAL","SKULPTUR"],["WERKSTATT","HAMMER","ZANGE","SCHRAUBE","BOHRER","SÄGE"],
];

export const CROSSWORD_POOL=[
 {clue:"Rundes Obst, oft rot oder grün.",answer:"APFEL"},{clue:"Große Ansammlung vieler Bäume.",answer:"WALD"},{clue:"Leuchtet nachts am Himmel.",answer:"MOND"},{clue:"Blume mit Dornen.",answer:"ROSE"},{clue:"Tier mit Federn und Flügeln.",answer:"VOGEL"},{clue:"Hohe natürliche Erhebung.",answer:"BERG"},
 {clue:"Getränk von Kühen.",answer:"MILCH"},{clue:"Darauf sitzt man am Tisch.",answer:"STUHL"},{clue:"Zeigt Stunden und Minuten.",answer:"UHR"},{clue:"Führt über einen Fluss.",answer:"BRUECKE"},{clue:"Darin liest man Geschichten.",answer:"BUCH"},{clue:"Lichtquelle am Taghimmel.",answer:"SONNE"},
 {clue:"Öffnet eine verschlossene Tür.",answer:"SCHLUESSEL"},{clue:"Bewahrt Kleidung auf.",answer:"SCHRANK"},{clue:"Fährt auf Schienen.",answer:"ZUG"},{clue:"Warme Mahlzeit mit Brühe.",answer:"SUPPE"},{clue:"Dort wachsen Blumen und Kräuter.",answer:"GARTEN"},{clue:"Fällt im Winter weiß vom Himmel.",answer:"SCHNEE"},
 {clue:"Dort wartet man auf einen Zug.",answer:"BAHNHOF"},{clue:"Fahrzeug mit Pedalen.",answer:"FAHRRAD"},{clue:"Darauf schläft man nachts.",answer:"BETT"},{clue:"Daraus trinkt man Kaffee.",answer:"TASSE"},{clue:"Damit schreibt man auf Papier.",answer:"STIFT"},{clue:"Zeigt Wege und Orte.",answer:"KARTE"},
 {clue:"Dort werden Medikamente verkauft.",answer:"APOTHEKE"},{clue:"Schützt vor Regen.",answer:"SCHIRM"},{clue:"Raum zum Kochen.",answer:"KUECHE"},{clue:"Dort sieht man Filme.",answer:"KINO"},{clue:"Damit schneidet man Gemüse.",answer:"MESSER"},{clue:"Getränk aus Früchten.",answer:"SAFT"},
 {clue:"Wintersportgerät für den Hang.",answer:"SKI"},{clue:"Dort lernt eine Klasse.",answer:"SCHULE"},{clue:"Kleiner Weg durch Wald oder Berge.",answer:"PFAD"},{clue:"Dort behandelt ein Arzt Patienten.",answer:"PRAXIS"},{clue:"Bezahlt eine Bus- oder Zugfahrt.",answer:"TICKET"},{clue:"Gelbe längliche Frucht.",answer:"BANANE"},
 {clue:"Darin kocht man Suppe.",answer:"TOPF"},{clue:"Zeigt die Himmelsrichtung.",answer:"KOMPASS"},{clue:"Hält ein Schiff am Platz.",answer:"ANKER"},{clue:"Wasserfahrzeug mit Segel.",answer:"SEGELBOOT"},{clue:"Großer Raum für Ausstellungen.",answer:"MUSEUM"},{clue:"Werkzeug zum Greifen.",answer:"ZANGE"},
 {clue:"Werkzeug zum Einschlagen von Nägeln.",answer:"HAMMER"},{clue:"Leuchtkörper am Himmel mit Schweif.",answer:"KOMET"},{clue:"Umlaufbahn eines Himmelskörpers.",answer:"ORBIT"},{clue:"Ordnet Termine nach Tagen.",answer:"KALENDER"},{clue:"Speichert digitale Informationen.",answer:"DATEI"},{clue:"Gerät zum Ausdrucken.",answer:"DRUCKER"},
 {clue:"Musikalischer Grundschlag.",answer:"TAKT"},{clue:"Kurze Unterbrechung.",answer:"PAUSE"},{clue:"Teil einer Straße für Fußgänger.",answer:"GEHWEG"},{clue:"Ort für startende und landende Flugzeuge.",answer:"FLUGHAFEN"},{clue:"Behälter für Reisegepäck.",answer:"KOFFER"},{clue:"Kleine natürliche Wasseransammlung.",answer:"TEICH"},
];

const q=(prompt:string,options:string[],answer:string,level:BrainFitMode="relaxed"):BrainFitChoiceTask=>({prompt,options,answer,level});
export const CATEGORY_TASKS:BrainFitChoiceTask[]=[
 q("Was passt nicht zu Obst?",["Apfel","Birne","Karotte","Pflaume"],"Karotte"),q("Was passt nicht zu Werkzeug?",["Hammer","Zange","Säge","Kissen"],"Kissen"),q("Was passt nicht zu Tieren?",["Hund","Katze","Schrank","Vogel"],"Schrank"),q("Was passt nicht zu Kleidung?",["Jacke","Hose","Mütze","Teller"],"Teller"),
 q("Was passt nicht zu Verkehrsmitteln?",["Bus","Zug","Fahrrad","Sofa"],"Sofa"),q("Was passt nicht zu Schreibwaren?",["Stift","Heft","Radiergummi","Pfanne"],"Pfanne"),q("Was passt nicht zu Musik?",["Melodie","Rhythmus","Klang","Schraubenzieher"],"Schraubenzieher"),q("Was passt nicht zum Arztbesuch?",["Termin","Wartezimmer","Rezept","Fahrkarte"],"Fahrkarte"),
 q("Welcher Begriff gehört nicht zur Wetterbeobachtung?",["Luftdruck","Temperatur","Niederschlag","Kontonummer"],"Kontonummer","normal"),q("Welcher Begriff passt nicht zur Navigation?",["Route","Kompass","Koordinate","Kochlöffel"],"Kochlöffel","normal"),q("Was gehört nicht zur Datenverarbeitung?",["Datei","Tabelle","Datenbank","Gießkanne"],"Gießkanne","normal"),q("Welcher Begriff gehört nicht zum Argumentieren?",["Begründung","Beleg","Schlussfolgerung","Tapete"],"Tapete","normal"),
 q("Welcher Begriff ist kein logisches Schlussverfahren?",["Deduktion","Induktion","Abduktion","Dekoration"],"Dekoration","challenge"),q("Was ist kein Begriff aus der Semantik?",["Synonymie","Antonymie","Polysemie","Geometrie"],"Geometrie","challenge"),q("Welcher Begriff gehört nicht zu Projektsteuerung?",["Meilenstein","Abhängigkeit","Priorität","Wasserfall"],"Wasserfall","challenge"),q("Welche Größe ist keine physikalische Messgröße?",["Temperatur","Masse","Zeit","Meinung"],"Meinung","challenge"),
];

export const SEQUENCE_TASKS:BrainFitChoiceTask[]=[
 q("2 · 4 · 6 · 8 · ?",["9","10","11","12"],"10"),q("5 · 10 · 15 · 20 · ?",["22","25","30","35"],"25"),q("1 · 2 · 4 · 8 · ?",["10","12","16","18"],"16"),q("10 · 9 · 8 · 7 · ?",["5","6","8","9"],"6"),q("3 · 6 · 9 · 12 · ?",["13","14","15","16"],"15"),q("A · C · E · G · ?",["H","I","J","K"],"I"),
 q("2 · 6 · 18 · 54 · ?",["108","126","162","216"],"162","normal"),q("64 · 32 · 16 · 8 · ?",["2","4","6","10"],"4","normal"),q("2 · 3 · 5 · 8 · 12 · ?",["15","16","17","18"],"17","normal"),q("4 · 7 · 13 · 22 · 34 · ?",["46","47","49","52"],"49","normal"),q("3 · 7 · 15 · 31 · ?",["47","55","63","64"],"63","normal"),
 q("2 · 5 · 11 · 23 · 47 · ?",["71","93","95","97"],"95","challenge"),q("1 · 4 · 10 · 19 · 31 · ?",["42","44","46","48"],"46","challenge"),q("81 · 27 · 9 · 3 · ?",["0","1","2","6"],"1","challenge"),q("3 · 4 · 7 · 11 · 18 · 29 · ?",["40","45","47","51"],"47","challenge"),q("2 · 4 · 12 · 48 · ?",["120","180","240","288"],"240","challenge"),
];

export const EVERYDAY_MATH_TASKS:BrainFitChoiceTask[]=[
 q("Ein Brot kostet 3 €. Zwei Brote kosten?",["5 €","6 €","7 €","8 €"],"6 €"),q("Du hast 20 € und zahlst 14 €. Wie viel bleibt?",["4 €","5 €","6 €","7 €"],"6 €"),q("4 Äpfel kosten 8 €. Was kostet 1 Apfel?",["1 €","2 €","3 €","4 €"],"2 €"),q("3 Flaschen mit je 2 Litern ergeben?",["4 l","5 l","6 l","8 l"],"6 l"),q("Ein Kaffee kostet 4 €. Du zahlst 10 €. Rückgeld?",["4 €","5 €","6 €","7 €"],"6 €"),
 q("Ein Artikel kostet 24 €. Mit 25 % Rabatt kostet er?",["16 €","18 €","20 €","21 €"],"18 €","normal"),q("3 Packungen zu je 4,50 € kosten zusammen?",["12,50 €","13,50 €","14,00 €","15,50 €"],"13,50 €","normal"),q("1,5 kg kosten 6 €. Was kosten 500 g?",["1 €","2 €","2,50 €","3 €"],"2 €","normal"),q("Eine Rechnung über 80 € wird halbiert. Anteil pro Person?",["35 €","40 €","45 €","50 €"],"40 €","normal"),q("Ein Termin dauert 1 h 20 min. Zwei Termine dauern?",["2 h","2 h 20 min","2 h 40 min","3 h"],"2 h 40 min","normal"),
 q("Ein Preis von 120 € steigt um 15 %. Neuer Preis?",["132 €","136 €","138 €","142 €"],"138 €","challenge"),q("3/4 von 80 Stück sind?",["50","55","60","65"],"60","challenge"),q("Ein Produkt kostet netto 50 €. Mit 20 % USt sind es?",["55 €","58 €","60 €","62 €"],"60 €","challenge"),q("2,4 kg werden auf 6 gleiche Portionen verteilt. Pro Portion?",["300 g","350 g","400 g","450 g"],"400 g","challenge"),q("Von 250 € werden zuerst 10 %, danach 20 € abgezogen. Rest?",["200 €","205 €","210 €","215 €"],"205 €","challenge"),
];

export const TIME_ORDER_TASKS:BrainFitChoiceTask[]=[
 q("Was kommt im Tagesablauf normalerweise zuerst?",["Frühstück","Abendessen","Schlafengehen","Mittagessen"],"Frühstück"),q("Welche Uhrzeit ist später?",["08:00","11:30","07:45","06:15"],"11:30"),q("Was kommt nach Dienstag?",["Montag","Mittwoch","Freitag","Sonntag"],"Mittwoch"),q("Ein Termin beginnt um 14:00 und dauert 1 Stunde. Ende?",["14:30","15:00","15:30","16:00"],"15:00"),q("Welcher Monat folgt auf April?",["März","Mai","Juni","Juli"],"Mai"),
 q("Ein Termin beginnt 09:15 und dauert 45 Minuten. Ende?",["09:45","10:00","10:15","11:00"],"10:00","normal"),q("Ein Bus fährt 17:20. Zehn Minuten vorher ist?",["17:00","17:10","17:15","17:30"],"17:10","normal"),q("Ein Film beginnt 18:40 und dauert 1 h 50 min. Ende?",["20:20","20:30","20:40","21:30"],"20:30","normal"),q("Von 13:25 bis 15:05 vergehen?",["1 h 20 min","1 h 30 min","1 h 40 min","1 h 50 min"],"1 h 40 min","normal"),q("Ein Termin wird von 10:45 um 35 Minuten verschoben. Neue Zeit?",["11:10","11:20","11:25","11:30"],"11:20","normal"),
 q("Abfahrt 22:50, Fahrzeit 2 h 25 min. Ankunft?",["00:55","01:05","01:15","01:25"],"01:15","challenge"),q("Zwischen 08:35 und 12:20 liegen?",["3 h 35 min","3 h 45 min","3 h 55 min","4 h 05 min"],"3 h 45 min","challenge"),q("Ein Meeting startet 16:55, dauert 95 Minuten. Ende?",["18:20","18:30","18:40","18:50"],"18:30","challenge"),q("23:40 plus 50 Minuten ergibt?",["00:20","00:30","00:40","01:30"],"00:30","challenge"),q("Ein Termin ist 14:10. 2 h 35 min vorher war es?",["11:25","11:35","11:45","12:35"],"11:35","challenge"),
];

export function shuffled<T>(items:T[]):T[]{return[...items].sort(()=>Math.random()-.5)}
function quizTaskId(area:BrainFitArea,task:BrainFitChoiceTask,index:number){const normalized=task.prompt.toLocaleLowerCase("de-AT").replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"").slice(0,56);return`brainfit-${area}-${normalized||index}`}
const rank:Record<BrainFitMode,number>={relaxed:1,normal:2,challenge:3};
export function variedQuizTasks(area:BrainFitArea,mode:BrainFitMode):BrainFitChoiceTask[]{const source=area==="categories"?CATEGORY_TASKS:area==="sequence"?SEQUENCE_TASKS:area==="everydayMath"?EVERYDAY_MATH_TASKS:area==="timeOrder"?TIME_ORDER_TASKS:[];const count=mode==="relaxed"?6:mode==="normal"?8:10,scope=`brainfit-${area}-v4`,eligible=source.filter(task=>rank[task.level??"relaxed"]<=rank[mode]),candidates=eligible.map((task,index)=>({...task,id:quizTaskId(area,task,index)})),recent=readRecentTaskIds(scope,BRAIN_FIT_V4_HISTORY_LIMIT),picked=chooseFresh(candidates,count,recent);rememberTaskIds(scope,picked.map(task=>task.id),BRAIN_FIT_V4_HISTORY_LIMIT);return picked.map(({id:_id,level:_level,...task})=>({...task,options:shuffled(task.options)}))}
