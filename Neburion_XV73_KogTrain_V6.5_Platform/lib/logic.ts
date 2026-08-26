import { createSessionSeed, difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type LogicMode = "sequence" | "rule" | "analogy" | "deduction" | "matrix" | "operator" | "exclusion" | "spatial";
export type LogicTask = { id:string; mode:LogicMode; prompt:string; detail:string; options:string[]; answer:number; explanation:string };
export type LogicSession = { difficulty:Difficulty; tasks:LogicTask[] };
export const LOGIC_SESSION_LENGTH = 8;
export const LOGIC_STORAGE_KEY = "neburion-v65-logic-stats-v3";

function makeTask(id:string, mode:LogicMode, prompt:string, detail:string, correct:string, distractors:string[], explanation:string):LogicTask {
  const options=shuffled([correct,...distractors.filter((item)=>item!==correct)]).slice(0,4);
  return {id,mode,prompt,detail,options,answer:options.indexOf(correct),explanation};
}
function sequence(seed:number,difficulty:Difficulty){
  if(difficulty===1){const start=randomInt(2,9),step=randomInt(2,6),values=[0,1,2,3].map(i=>start+i*step),correct=String(start+4*step);return makeTask(`seq-${seed}`,"sequence","Welche Zahl folgt?",`${values.join(" · ")} · ?`,correct,[String(+correct+step),String(+correct-1),String(+correct+1)],`Die Folge steigt jeweils um ${step}.`);}
  if(difficulty===2){const a=randomInt(1,5),d=randomInt(2,4),values=[a,a+d,a+d*3,a+d*6],correct=String(a+d*10);return makeTask(`seq-${seed}`,"sequence","Welche Zahl setzt die Folge fort?",`${values.join(" · ")} · ?`,correct,[String(+correct-d),String(+correct+d),String(+correct+2*d)],"Die Abstände wachsen schrittweise: +d, +2d, +3d, +4d.");}
  const a=randomInt(2,5),b=randomInt(2,5),values=[a,b,a+b,a+2*b,2*a+3*b],correct=String(3*a+5*b);return makeTask(`seq-${seed}`,"sequence","Welche Zahl folgt in der rekursiven Reihe?",`${values.join(" · ")} · ?`,correct,[String(+correct-1),String(+correct+1),String(+correct+a)],"Jede Zahl ist die Summe der beiden vorherigen.");
}
function rule(seed:number,difficulty:Difficulty){const mul=difficulty===1?2:difficulty===2?3:randomInt(3,5),add=difficulty===3?randomInt(1,6):difficulty===2?randomInt(0,3):0,input=randomInt(3,9),correct=String(input*mul+add),detail=`2 → ${2*mul+add} · 4 → ${4*mul+add} · ${input} → ?`;return makeTask(`rule-${seed}`,"rule","Welche Ausgabe ist korrekt?",detail,correct,[String(input*mul),String(+correct+mul),String(+correct-1)],add?`Regel: ×${mul}, danach +${add}.`:`Regel: ×${mul}.`);}
function analogy(seed:number,difficulty:Difficulty){const variants=[
  ["Hand : Finger = Fuß : ?","Zehe",["Knie","Arm","Schulter"],"Teil-Ganzes-Beziehung."],
  ["Vogel : fliegen = Fisch : ?","schwimmen",["springen","laufen","graben"],"Lebewesen und typische Fortbewegung."],
  ["Buch : lesen = Musik : ?","hören",["sehen","tragen","zeichnen"],"Objekt und typische Tätigkeit."],
  ["Tag : Woche = Monat : ?","Jahr",["Stunde","Minute","Jahrzehnt"],"Kleinere zu größerer Zeiteinheit."],
  ["Pinsel : malen = Stift : ?","schreiben",["schneiden","messen","kochen"],"Werkzeug und typische Tätigkeit."],
  ["Thermometer : Temperatur = Waage : ?","Gewicht",["Länge","Zeit","Lautstärke"],"Messgerät und Messgröße."],
  ["Kapitel : Buch = Szene : ?","Film",["Karte","Tisch","Fenster"],"Bestandteil und Ganzes."],
  ["Frage : Antwort = Problem : ?","Lösung",["Pause","Geräusch","Farbe"],"Ausgangslage und passende Auflösung."]
] as const;const v=variants[(seed+difficulty)%variants.length];return makeTask(`ana-${seed}`,"analogy","Ergänze die Analogie.",v[0],v[1],[...v[2]],v[3]);}
function deduction(seed:number,difficulty:Difficulty){
  const easy=[
    ["Alle Riva sind Taren. Lio ist ein Riva.","Lio ist ein Taren",["Lio ist kein Taren","Alle Taren sind Riva","Nichts ist sicher"],"Die Eigenschaft gilt für jedes Mitglied der Gruppe."],
    ["Alle Mera sind rund. Tavi ist ein Mera.","Tavi ist rund",["Tavi ist eckig","Alles Runde ist Mera","Tavi ist blau"],"Tavi gehört zur vollständig beschriebenen Gruppe."],
    ["Kein Savo ist schwer. Nilo ist ein Savo.","Nilo ist nicht schwer",["Nilo ist schwer","Alles Leichte ist Savo","Nilo ist rot"],"Für jedes Savo ist die Eigenschaft schwer ausgeschlossen."]
  ] as const;
  const medium=[
    ["Kein Naro ist blau. Mira ist ein Naro.","Mira ist nicht blau",["Mira ist blau","Mira ist rot","Alle Nicht-Blauen sind Naros"],"Mira gehört zu einer Gruppe, für die Blau ausgeschlossen ist."],
    ["Alle Kelo sind schnell. Kein schnelles Wesen ist träge. Ria ist ein Kelo.","Ria ist nicht träge",["Ria ist träge","Ria ist langsam","Alle Nicht-Trägen sind Kelo"],"Kelo impliziert schnell; schnell schließt träge aus."],
    ["Einige Varo sind Musiker. Alle Musiker üben. ","Einige Varo üben",["Alle Varo üben","Kein Varo übt","Alle Übenden sind Musiker"],"Die existierende Teilgruppe der Musiker übt."]
  ] as const;
  const hard=[
    ["Alle A sind B. Einige B sind C.","Einige B sind C",["Alle A sind C","Kein A ist C","Alle C sind A"],"Nur die ausdrücklich gegebene Teilmengen-Aussage ist sicher."],
    ["Alle P sind Q. Kein Q ist R. X ist P.","X ist nicht R",["X ist R","Alle R sind P","Kein P ist Q"],"P führt zu Q und Q schließt R aus."],
    ["Einige D sind E. Alle E sind F.","Einige D sind F",["Alle D sind F","Kein D ist F","Alle F sind E"],"Mindestens die D, die E sind, gehören auch zu F."]
  ] as const;
  const pool=difficulty===1?easy:difficulty===2?medium:hard;const v=pool[seed%pool.length];return makeTask(`ded-${seed}`,"deduction","Welche Aussage folgt sicher?",v[0],v[1],[...v[2]],v[3]);
}
function matrix(seed:number,difficulty:Difficulty){const shapes=["●","▲","■","◆","✦"],a=shapes[seed%shapes.length],b=shapes[(seed+1)%shapes.length],c=shapes[(seed+2)%shapes.length],detail=difficulty===1?`${a} ${b} | ${a} ${b} | ${a} ?`:`${a} ${b} ${c} | ${b} ${c} ${a} | ${c} ${a} ?`,correct=b;return makeTask(`mat-${seed}`,"matrix","Welches Symbol ergänzt die Matrix?",detail,correct,shapes.filter(s=>s!==correct).slice(0,3),"Die Symbolfolge wird in jeder Gruppe nach demselben Rotationsmuster fortgeführt.");}
function operator(seed:number,difficulty:Difficulty){const x=randomInt(2,7),y=randomInt(2,6),variant=seed%3,correct=variant===0?x+y*2:variant===1?x*y+y:x*2+y,detail=variant===0?`Wenn a ★ b = a + 2b, was ist ${x} ★ ${y}?`:variant===1?`Wenn a ★ b = a×b + b, was ist ${x} ★ ${y}?`:`Wenn a ★ b = 2a + b, was ist ${x} ★ ${y}?`;return makeTask(`op-${seed}`,"operator","Berechne mit der neuen Operatorregel.",detail,String(correct),[String(correct+1),String(correct-1),String(x*y)],"Setze die beiden Zahlen exakt in die angegebene Operatorregel ein.");}
function exclusion(seed:number,difficulty:Difficulty){const pools=[
  {values:["4","8","12","15","20"],correct:"15",reason:"Alle anderen sind durch 4 teilbar."},
  {values:["6","12","18","25","30"],correct:"25",reason:"Alle anderen sind durch 6 teilbar."},
  {values:["2","3","5","7","9","11"],correct:"9",reason:"Alle anderen sind Primzahlen."},
  {values:["11","13","17","21","23"],correct:"21",reason:"Alle anderen sind Primzahlen."},
  {values:["9","16","25","36","45","49"],correct:"45",reason:"Alle anderen sind Quadratzahlen."},
  {values:["8","27","64","81","125"],correct:"81",reason:"Alle anderen sind Kubikzahlen."}
];const range=difficulty===1?pools.slice(0,2):difficulty===2?pools.slice(2,4):pools.slice(4);const v=range[seed%range.length];return makeTask(`exc-${seed}`,"exclusion","Welche Zahl passt nicht?",v.values.join(" · "),v.correct,v.values.filter(x=>x!==v.correct).slice(0,3),v.reason);}
function spatial(seed:number,difficulty:Difficulty){const turns=difficulty===1?1:difficulty===2?2:3,dirs=["Norden","Osten","Süden","Westen"],start=seed%4,right=seed%2===0,correct=dirs[(start+(right?turns:4-turns))%4];return makeTask(`spa-${seed}`,"spatial","Wohin blickst du danach?",`Start: ${dirs[start]}. Drehe dich ${turns}× nach ${right?"rechts":"links"}.`,correct,dirs.filter(d=>d!==correct),"Jede Vierteldrehung entspricht 90°.");}

export function createLogicSession(bestScore:number):LogicSession{const difficulty=difficultyFromPercent(bestScore/LOGIC_SESSION_LENGTH*100),seed=createSessionSeed(),tasks=[sequence(seed,difficulty),rule(seed+1,difficulty),analogy(seed+2,difficulty),deduction(seed+3,difficulty),matrix(seed+4,difficulty),operator(seed+5,difficulty),exclusion(seed+6,difficulty),spatial(seed+7,difficulty)];return {difficulty,tasks:shuffled(tasks)};}
