export type CompletionArea = "missingWords" | "proverbs" | "symbolMatch" | "orientation";
export type CompletionTask = { area:CompletionArea; prompt:string; options:string[]; answer:string; hint:string };
export type CompletionStats = { sessions:number; totalScore:number; bestScore:number; completedToday:string; lastScore:number };

export const BRAIN_FIT_COMPLETION_KEY = "neburion-v65-brain-fit-completion-v376";

export const COMPLETION_AREAS: Array<{id:CompletionArea;icon:string;title:string;subtitle:string}> = [
  {id:"missingWords",icon:"📝",title:"Fehlende Wörter",subtitle:"Sprache & Satzverständnis"},
  {id:"proverbs",icon:"💬",title:"Sprichwörter",subtitle:"Erinnern & Sprachwissen"},
  {id:"symbolMatch",icon:"🖼️",title:"Bild & Begriff",subtitle:"Zuordnen & Wiedererkennen"},
  {id:"orientation",icon:"🧭",title:"Alltagswissen",subtitle:"Orientierung & Alltag"},
];

export const COMPLETION_TASKS: CompletionTask[] = [
  {area:"missingWords",prompt:"Am Morgen trinke ich gern eine Tasse ___.",options:["Kaffee","Schrank","Wiese","Schuh"],answer:"Kaffee",hint:"Gesucht ist ein typisches Getränk."},
  {area:"missingWords",prompt:"Bei Regen nehme ich einen ___ mit.",options:["Regenschirm","Teller","Kissen","Löffel"],answer:"Regenschirm",hint:"Er schützt vor Nässe."},
  {area:"missingWords",prompt:"Im Winter trage ich eine warme ___.",options:["Jacke","Gabel","Tasse","Lampe"],answer:"Jacke",hint:"Gesucht ist Kleidung."},
  {area:"missingWords",prompt:"Zum Schreiben brauche ich einen ___.",options:["Stift","Topf","Schlüssel","Schuh"],answer:"Stift",hint:"Damit schreibt man auf Papier."},
  {area:"missingWords",prompt:"Zum Frühstück esse ich gern Brot mit ___.",options:["Marmelade","Seife","Hammer","Kabel"],answer:"Marmelade",hint:"Gesucht ist ein Brotaufstrich."},
  {area:"missingWords",prompt:"Der Zug fährt am ___ ab.",options:["Bahnhof","Garten","Bad","Bett"],answer:"Bahnhof",hint:"Dort beginnen viele Zugreisen."},

  {area:"proverbs",prompt:"Morgenstund hat ___ im Mund.",options:["Gold","Brot","Regen","Holz"],answer:"Gold",hint:"Ein bekanntes Sprichwort über den frühen Start."},
  {area:"proverbs",prompt:"Viele Köche verderben den ___.",options:["Brei","Tisch","Garten","Schuh"],answer:"Brei",hint:"Es geht um zu viele Beteiligte."},
  {area:"proverbs",prompt:"Übung macht den ___.",options:["Meister","Sommer","Kaffee","Weg"],answer:"Meister",hint:"Wiederholung verbessert Können."},
  {area:"proverbs",prompt:"Aller Anfang ist ___.",options:["schwer","rund","leise","blau"],answer:"schwer",hint:"Der Beginn braucht oft mehr Kraft."},
  {area:"proverbs",prompt:"Was du heute kannst besorgen, das verschiebe nicht auf ___.",options:["morgen","gestern","mittags","Sonntag"],answer:"morgen",hint:"Nicht aufschieben."},
  {area:"proverbs",prompt:"Ende gut, alles ___.",options:["gut","neu","klein","offen"],answer:"gut",hint:"Ein positives Ende zählt."},

  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🐶?",options:["Hund","Katze","Vogel","Fisch"],answer:"Hund",hint:"Ein Haustier mit vier Pfoten."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu ☕?",options:["Kaffee","Brot","Schlüssel","Baum"],answer:"Kaffee",hint:"Ein warmes Getränk."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🚲?",options:["Fahrrad","Zug","Auto","Boot"],answer:"Fahrrad",hint:"Es hat zwei Räder und Pedale."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🌳?",options:["Baum","Haus","Tasse","Uhr"],answer:"Baum",hint:"Er wächst im Wald oder Garten."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🔑?",options:["Schlüssel","Lampe","Teller","Stuhl"],answer:"Schlüssel",hint:"Damit öffnet man eine Tür."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu ⏰?",options:["Uhr","Kissen","Schrank","Schuh"],answer:"Uhr",hint:"Sie zeigt die Zeit."},

  {area:"orientation",prompt:"Wo kauft man Medikamente?",options:["Apotheke","Bahnhof","Bäckerei","Park"],answer:"Apotheke",hint:"Gesucht ist ein Fachgeschäft für Arzneimittel."},
  {area:"orientation",prompt:"Wo hebt man normalerweise Bargeld ab?",options:["Bankomat","Backofen","Briefkasten","Kühlschrank"],answer:"Bankomat",hint:"Dort erhält man Geld mit Karte."},
  {area:"orientation",prompt:"Was braucht man typischerweise für eine Busfahrt?",options:["Fahrschein","Kochtopf","Handtuch","Kissen"],answer:"Fahrschein",hint:"Eine Fahrberechtigung."},
  {area:"orientation",prompt:"Welche Nummer steht in Österreich für den Euro-Notruf?",options:["112","911","999","101"],answer:"112",hint:"Europäische Notrufnummer."},
  {area:"orientation",prompt:"Was prüft man vor einem Arzttermin am besten?",options:["Datum und Uhrzeit","Schuhgröße","Wetter von gestern","Fernsehprogramm"],answer:"Datum und Uhrzeit",hint:"Damit man pünktlich ist."},
  {area:"orientation",prompt:"Wo wirft man einen frankierten Brief ein?",options:["Briefkasten","Kühlschrank","Schrank","Waschmaschine"],answer:"Briefkasten",hint:"Er gehört zur Post."},
];

export function emptyCompletionStats():CompletionStats{return {sessions:0,totalScore:0,bestScore:0,completedToday:"",lastScore:0};}
export function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
export function shuffledCompletion<T>(items:T[]):T[]{return [...items].sort(()=>Math.random()-.5);}
export function tasksForArea(area:CompletionArea,count=4){return shuffledCompletion(COMPLETION_TASKS.filter(task=>task.area===area)).slice(0,count).map(task=>({...task,options:shuffledCompletion(task.options)}));}
export function dailyMixTasks(count=8){const grouped=COMPLETION_AREAS.flatMap(area=>tasksForArea(area.id,2));return shuffledCompletion(grouped).slice(0,count);}
export function recordCompletion(stats:CompletionStats,score:number):CompletionStats{const safe=Math.max(0,Math.min(100,Math.round(score)));return {sessions:stats.sessions+1,totalScore:stats.totalScore+safe,bestScore:Math.max(stats.bestScore,safe),lastScore:safe,completedToday:todayKey()};}
export function completionAverage(stats:CompletionStats){return stats.sessions?Math.round(stats.totalScore/stats.sessions):0;}
export function completionAchievements(stats:CompletionStats){return [
  {label:"Erste Runde",unlocked:stats.sessions>=1},
  {label:"5 Gehirnfit-Runden",unlocked:stats.sessions>=5},
  {label:"10 Gehirnfit-Runden",unlocked:stats.sessions>=10},
  {label:"80 % oder mehr",unlocked:stats.bestScore>=80},
  {label:"Perfekte Runde",unlocked:stats.bestScore>=100},
  {label:"Heute aktiv",unlocked:stats.completedToday===todayKey()},
];}
