export type CompletionArea = "missingWords" | "proverbs" | "symbolMatch" | "orientation";
export type CompletionTask = { area:CompletionArea; prompt:string; options:string[]; answer:string; hint:string };
export type CompletionStats = { sessions:number; totalScore:number; bestScore:number; completedToday:string; lastScore:number };

export const BRAIN_FIT_COMPLETION_KEY = "neburion-v65-brain-fit-completion-v376";
export const BRAIN_FIT_COMPLETION_RECENT_KEY = "neburion-v65-brain-fit-completion-recent-v2";

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
  {area:"missingWords",prompt:"Für eine Wanderung packe ich Wasser in den ___.",options:["Rucksack","Backofen","Briefkasten","Schreibtisch"],answer:"Rucksack",hint:"Damit trägt man Dinge unterwegs."},
  {area:"missingWords",prompt:"Vor dem Schlafengehen stelle ich den ___ auf sieben Uhr.",options:["Wecker","Teller","Besen","Topf"],answer:"Wecker",hint:"Er erinnert dich am Morgen an die Uhrzeit."},
  {area:"missingWords",prompt:"Gemüse schneide ich auf einem ___.",options:["Schneidebrett","Kopfkissen","Regenschirm","Teppich"],answer:"Schneidebrett",hint:"Es gehört in die Küche."},
  {area:"missingWords",prompt:"Für kalte Getränke stelle ich die Flasche in den ___.",options:["Kühlschrank","Kleiderschrank","Briefkasten","Ofen"],answer:"Kühlschrank",hint:"Dort bleiben Lebensmittel kühl."},
  {area:"missingWords",prompt:"Zum Öffnen der Haustür brauche ich meinen ___.",options:["Schlüssel","Löffel","Besen","Teller"],answer:"Schlüssel",hint:"Er passt in das Türschloss."},
  {area:"missingWords",prompt:"Beim Radfahren trage ich zur Sicherheit einen ___.",options:["Helm","Schal","Topf","Ordner"],answer:"Helm",hint:"Er schützt den Kopf."},
  {area:"missingWords",prompt:"Eine wichtige Notiz schreibe ich in meinen ___.",options:["Kalender","Kochtopf","Schuh","Teppich"],answer:"Kalender",hint:"Darin lassen sich Termine und Erinnerungen festhalten."},
  {area:"missingWords",prompt:"Nach dem Händewaschen trockne ich sie mit einem ___.",options:["Handtuch","Kissen","Hammer","Schlüssel"],answer:"Handtuch",hint:"Es nimmt Wasser auf."},

  {area:"proverbs",prompt:"Morgenstund hat ___ im Mund.",options:["Gold","Brot","Regen","Holz"],answer:"Gold",hint:"Ein bekanntes Sprichwort über den frühen Start."},
  {area:"proverbs",prompt:"Viele Köche verderben den ___.",options:["Brei","Tisch","Garten","Schuh"],answer:"Brei",hint:"Es geht um zu viele Beteiligte."},
  {area:"proverbs",prompt:"Übung macht den ___.",options:["Meister","Sommer","Kaffee","Weg"],answer:"Meister",hint:"Wiederholung verbessert Können."},
  {area:"proverbs",prompt:"Aller Anfang ist ___.",options:["schwer","rund","leise","blau"],answer:"schwer",hint:"Der Beginn braucht oft mehr Kraft."},
  {area:"proverbs",prompt:"Was du heute kannst besorgen, das verschiebe nicht auf ___.",options:["morgen","gestern","mittags","Sonntag"],answer:"morgen",hint:"Nicht aufschieben."},
  {area:"proverbs",prompt:"Ende gut, alles ___.",options:["gut","neu","klein","offen"],answer:"gut",hint:"Ein positives Ende zählt."},
  {area:"proverbs",prompt:"Wo ein Wille ist, ist auch ein ___.",options:["Weg","Stuhl","Regen","Berg"],answer:"Weg",hint:"Entschlossenheit hilft beim Finden einer Lösung."},
  {area:"proverbs",prompt:"Geteiltes Leid ist halbes ___.",options:["Leid","Brot","Haus","Glück"],answer:"Leid",hint:"Gemeinsam trägt sich eine Belastung leichter."},
  {area:"proverbs",prompt:"Wer anderen eine Grube gräbt, fällt selbst ___.",options:["hinein","hinaus","hinauf","vorbei"],answer:"hinein",hint:"Das Sprichwort warnt vor Schadenfreude."},
  {area:"proverbs",prompt:"Kleider machen ___.",options:["Leute","Tage","Straßen","Bäume"],answer:"Leute",hint:"Äußeres beeinflusst den Eindruck."},
  {area:"proverbs",prompt:"Reden ist Silber, Schweigen ist ___.",options:["Gold","Holz","Wasser","Papier"],answer:"Gold",hint:"Das Sprichwort bewertet Zurückhaltung besonders hoch."},
  {area:"proverbs",prompt:"Andere Länder, andere ___.",options:["Sitten","Tassen","Fenster","Schuhe"],answer:"Sitten",hint:"Gemeint sind unterschiedliche Gewohnheiten und Regeln."},
  {area:"proverbs",prompt:"Wer rastet, der ___.",options:["rostet","lacht","rennt","kocht"],answer:"rostet",hint:"Aktivität hält in Bewegung."},
  {area:"proverbs",prompt:"Zeit ist ___.",options:["Geld","Holz","Regen","Sand"],answer:"Geld",hint:"Das Sprichwort betont den Wert von Zeit."},

  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🐶?",options:["Hund","Katze","Vogel","Fisch"],answer:"Hund",hint:"Ein Haustier mit vier Pfoten."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu ☕?",options:["Kaffee","Brot","Schlüssel","Baum"],answer:"Kaffee",hint:"Ein warmes Getränk."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🚲?",options:["Fahrrad","Zug","Auto","Boot"],answer:"Fahrrad",hint:"Es hat zwei Räder und Pedale."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🌳?",options:["Baum","Haus","Tasse","Uhr"],answer:"Baum",hint:"Er wächst im Wald oder Garten."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🔑?",options:["Schlüssel","Lampe","Teller","Stuhl"],answer:"Schlüssel",hint:"Damit öffnet man eine Tür."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu ⏰?",options:["Uhr","Kissen","Schrank","Schuh"],answer:"Uhr",hint:"Sie zeigt die Zeit."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🧭?",options:["Kompass","Tasse","Besen","Buch"],answer:"Kompass",hint:"Er hilft bei der Orientierung."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🥕?",options:["Karotte","Apfel","Brot","Käse"],answer:"Karotte",hint:"Ein orangefarbenes Gemüse."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 📚?",options:["Bücher","Schuhe","Teller","Fenster"],answer:"Bücher",hint:"Man liest darin."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🔨?",options:["Hammer","Löffel","Kissen","Schlüssel"],answer:"Hammer",hint:"Ein Werkzeug zum Einschlagen von Nägeln."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu ✉️?",options:["Brief","Tasse","Lampe","Besen"],answer:"Brief",hint:"Er wird verschickt oder zugestellt."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🚌?",options:["Bus","Boot","Fahrrad","Schrank"],answer:"Bus",hint:"Ein öffentliches Verkehrsmittel auf der Straße."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🥛?",options:["Milch","Kaffee","Brot","Hammer"],answer:"Milch",hint:"Ein helles Getränk."},
  {area:"symbolMatch",prompt:"Welcher Begriff passt zu 🧤?",options:["Handschuh","Schuh","Hut","Teller"],answer:"Handschuh",hint:"Er wird an der Hand getragen."},

  {area:"orientation",prompt:"Wo kauft man Medikamente?",options:["Apotheke","Bahnhof","Bäckerei","Park"],answer:"Apotheke",hint:"Gesucht ist ein Fachgeschäft für Arzneimittel."},
  {area:"orientation",prompt:"Wo hebt man normalerweise Bargeld ab?",options:["Bankomat","Backofen","Briefkasten","Kühlschrank"],answer:"Bankomat",hint:"Dort erhält man Geld mit Karte."},
  {area:"orientation",prompt:"Was braucht man typischerweise für eine Busfahrt?",options:["Fahrschein","Kochtopf","Handtuch","Kissen"],answer:"Fahrschein",hint:"Eine Fahrberechtigung."},
  {area:"orientation",prompt:"Welche Nummer steht in Österreich für den Euro-Notruf?",options:["112","911","999","101"],answer:"112",hint:"Europäische Notrufnummer."},
  {area:"orientation",prompt:"Was prüft man vor einem Arzttermin am besten?",options:["Datum und Uhrzeit","Schuhgröße","Wetter von gestern","Fernsehprogramm"],answer:"Datum und Uhrzeit",hint:"Damit man pünktlich ist."},
  {area:"orientation",prompt:"Wo wirft man einen frankierten Brief ein?",options:["Briefkasten","Kühlschrank","Schrank","Waschmaschine"],answer:"Briefkasten",hint:"Er gehört zur Post."},
  {area:"orientation",prompt:"Welche Information hilft dir an einer Bushaltestelle am meisten?",options:["Fahrplan","Speisekarte","Rezept","Fernsehprogramm"],answer:"Fahrplan",hint:"Er zeigt Abfahrtszeiten und Linien."},
  {area:"orientation",prompt:"Du möchtest Lebensmittel kühl halten. Was nutzt du?",options:["Kühlschrank","Backofen","Heizkörper","Lampe"],answer:"Kühlschrank",hint:"Er hält Lebensmittel bei niedriger Temperatur."},
  {area:"orientation",prompt:"Was kontrollierst du vor dem Verlassen der Wohnung sinnvollerweise?",options:["Schlüssel","Sofakissen","Blumenvase","Teppichmuster"],answer:"Schlüssel",hint:"Ohne ihn kommst du möglicherweise nicht wieder hinein."},
  {area:"orientation",prompt:"Auf einer Rechnung steht 18 € und du bezahlst mit 20 €. Wie viel Rückgeld erhältst du?",options:["2 €","1 €","3 €","5 €"],answer:"2 €",hint:"20 minus 18."},
  {area:"orientation",prompt:"Du hast um 14:30 Uhr einen Termin. Wann solltest du spätestens losgehen, wenn der Weg 20 Minuten dauert?",options:["14:10 Uhr","14:25 Uhr","14:30 Uhr","13:30 Uhr"],answer:"14:10 Uhr",hint:"Ziehe die Wegzeit vom Termin ab."},
  {area:"orientation",prompt:"Welche Ampelfarbe bedeutet im Straßenverkehr normalerweise Stopp?",options:["Rot","Grün","Blau","Weiß"],answer:"Rot",hint:"Diese Farbe signalisiert Anhalten."},
  {area:"orientation",prompt:"Wo findest du normalerweise Abfahrtszeiten für einen Zug?",options:["Fahrplan","Speisekarte","Kassenbon","Rezept"],answer:"Fahrplan",hint:"Er enthält Zeiten und Verbindungen."},
  {area:"orientation",prompt:"Du kaufst zwei Artikel zu je 4 €. Wie hoch ist der Gesamtpreis?",options:["8 €","6 €","4 €","10 €"],answer:"8 €",hint:"Addiere beide Einzelpreise."},
];

export function completionTaskKey(task:CompletionTask){return `${task.area}:${task.prompt}`;}
export function emptyCompletionStats():CompletionStats{return {sessions:0,totalScore:0,bestScore:0,completedToday:"",lastScore:0};}
export function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
export function shuffledCompletion<T>(items:T[]):T[]{const copy=[...items];for(let i=copy.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function freshPool(pool:CompletionTask[],avoid:string[]){const recent=new Set(avoid);const fresh=pool.filter(task=>!recent.has(completionTaskKey(task)));return fresh.length?fresh:pool;}
export function tasksForArea(area:CompletionArea,count=4,avoid:string[]=[]){const pool=COMPLETION_TASKS.filter(task=>task.area===area);const preferred=freshPool(pool,avoid);const selected=shuffledCompletion(preferred).slice(0,count);if(selected.length<count){const used=new Set(selected.map(completionTaskKey));selected.push(...shuffledCompletion(pool.filter(task=>!used.has(completionTaskKey(task)))).slice(0,count-selected.length));}return selected.map(task=>({...task,options:shuffledCompletion(task.options)}));}
export function dailyMixTasks(count=8,avoid:string[]=[]){const perArea=Math.max(2,Math.ceil(count/COMPLETION_AREAS.length));const grouped=COMPLETION_AREAS.flatMap(area=>tasksForArea(area.id,perArea,avoid));return shuffledCompletion(grouped).slice(0,count);}
export function recordCompletion(stats:CompletionStats,score:number):CompletionStats{const safe=Math.max(0,Math.min(100,Math.round(score)));return {sessions:stats.sessions+1,totalScore:stats.totalScore+safe,bestScore:Math.max(stats.bestScore,safe),lastScore:safe,completedToday:todayKey()};}
export function completionAverage(stats:CompletionStats){return stats.sessions?Math.round(stats.totalScore/stats.sessions):0;}
export function completionAchievements(stats:CompletionStats){const average=completionAverage(stats);return [
  {label:"Erste Runde",unlocked:stats.sessions>=1},
  {label:"5 Gehirnfit-Runden",unlocked:stats.sessions>=5},
  {label:"10 Gehirnfit-Runden",unlocked:stats.sessions>=10},
  {label:"25 Gehirnfit-Runden",unlocked:stats.sessions>=25},
  {label:"50 Gehirnfit-Runden",unlocked:stats.sessions>=50},
  {label:"70 % Durchschnitt",unlocked:stats.sessions>=5&&average>=70},
  {label:"85 % Durchschnitt",unlocked:stats.sessions>=10&&average>=85},
  {label:"80 % oder mehr",unlocked:stats.bestScore>=80},
  {label:"90 % oder mehr",unlocked:stats.bestScore>=90},
  {label:"Perfekte Runde",unlocked:stats.bestScore>=100},
  {label:"Starker Abschluss",unlocked:stats.sessions>=1&&stats.lastScore>=80},
  {label:"Heute aktiv",unlocked:stats.completedToday===todayKey()},
];}
