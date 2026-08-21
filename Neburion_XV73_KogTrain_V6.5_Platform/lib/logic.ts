import { difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type LogicMode = "sequence" | "rule" | "analogy" | "deduction" | "matrix" | "operator" | "exclusion" | "spatial";
export type LogicTask = { id:string; mode:LogicMode; prompt:string; detail:string; options:string[]; answer:number; explanation:string };
export type LogicSession = { difficulty:Difficulty; tasks:LogicTask[] };
export const LOGIC_SESSION_LENGTH = 8;
export const LOGIC_STORAGE_KEY = "neburion-v65-logic-stats-v3";

function task(id:string, mode:LogicMode, prompt:string, detail:string, correct:string, distractors:string[], explanation:string):LogicTask {
  const options = shuffled([correct, ...distractors]).slice(0,4);
  return { id, mode, prompt, detail, options, answer:options.indexOf(correct), explanation };
}

function sequence(seed:number, difficulty:Difficulty):LogicTask {
  if (difficulty === 1) { const start=randomInt(2,9), step=randomInt(2,6); const values=[0,1,2,3].map(i=>start+i*step); const correct=String(start+4*step); return task(`seq-${seed}`,"sequence","Welche Zahl folgt?",`${values.join(" · ")} · ?`,correct,[String(Number(correct)+step),String(Number(correct)-1),String(Number(correct)+1)],`Die Folge steigt jeweils um ${step}.`); }
  if (difficulty === 2) { const a=randomInt(1,5), d=randomInt(2,4); const vals=[a,a+d,a+d*3,a+d*6]; const correct=String(a+d*10); return task(`seq-${seed}`,"sequence","Welche Zahl setzt die Folge fort?",`${vals.join(" · ")} · ?`,correct,[String(Number(correct)-d),String(Number(correct)+d),String(Number(correct)+2*d)],"Die Abstände wachsen schrittweise: +1d, +2d, +3d, +4d."); }
  const a=randomInt(2,5), b=randomInt(2,5); const vals=[a,b,a+b,a+2*b,2*a+3*b]; const correct=String(3*a+5*b); return task(`seq-${seed}`,"sequence","Welche Zahl folgt in der rekursiven Reihe?",`${vals.join(" · ")} · ?`,correct,[String(Number(correct)-1),String(Number(correct)+1),String(Number(correct)+a)],"Jede Zahl entsteht aus der Summe der beiden vorherigen.");
}

function rule(seed:number, difficulty:Difficulty):LogicTask {
  const mul=difficulty===1?2:difficulty===2?3:4, add=difficulty===3?randomInt(1,5):0, input=randomInt(3,9), correct=String(input*mul+add);
  const detail=add?`2 → ${2*mul+add} · 4 → ${4*mul+add} · ${input} → ?`:`2 → ${2*mul} · 4 → ${4*mul} · ${input} → ?`;
  return task(`rule-${seed}`,"rule","Welche Ausgabe ist korrekt?",detail,correct,[String(input*mul),String(Number(correct)+mul),String(Number(correct)-1)],add?`Regel: ×${mul}, danach +${add}.`:`Regel: ×${mul}.`);
}

function analogy(seed:number, difficulty:Difficulty):LogicTask {
  const variants=[
    ["Hand : Finger = Fuß : ?","Zehe",["Knie","Arm","Schulter"],"Teil-Ganzes-Beziehung."],
    ["Vogel : fliegen = Fisch : ?","schwimmen",["springen","laufen","graben"],"Lebewesen und typische Fortbewegung."],
    ["Buch : lesen = Musik : ?","hören",["sehen","tragen","zeichnen"],"Objekt und typische Tätigkeit."],
    ["Tag : Woche = Monat : ?","Jahr",["Stunde","Minute","Jahrzehnt"],"Kleinere zu größerer Zeiteinheit."],
  ] as const;
  const v=variants[(seed+difficulty)%variants.length];
  return task(`ana-${seed}`,"analogy","Ergänze die Analogie.",v[0],v[1],[...v[2]],v[3]);
}

function deduction(seed:number, difficulty:Difficulty):LogicTask {
  if (difficulty===1) return task(`ded-${seed}`,"deduction","Was folgt sicher?","Alle Riva sind Taren. Lio ist ein Riva.","Lio ist ein Taren",["Lio ist kein Taren","Alle Taren sind Riva","Nichts ist sicher"],"Die Eigenschaft gilt für jedes Mitglied der Gruppe.");
  if (difficulty===2) return task(`ded-${seed}`,"deduction","Welche Aussage ist zwingend?","Kein Naro ist blau. Mira ist ein Naro.","Mira ist nicht blau",["Mira ist blau","Mira ist rot","Alle Nicht-Blauen sind Naros"],"Mira gehört zu einer Gruppe, für die Blau ausgeschlossen ist.");
  return task(`ded-${seed}`,"deduction","Welche Schlussfolgerung ist gültig?","Alle A sind B. Einige B sind C.","Einige B sind C",["Alle A sind C","Kein A ist C","Alle C sind A"],"Nur die ausdrücklich gegebene Teilmengen-Aussage ist sicher.");
}

function matrix(seed:number, difficulty:Difficulty):LogicTask {
  const shapes=["●","▲","■","◆"]; const a=shapes[seed%4], b=shapes[(seed+1)%4], c=shapes[(seed+2)%4];
  const detail=difficulty===1?`${a} ${b} | ${a} ${b} | ${a} ?`:`${a} ${b} ${c} | ${b} ${c} ${a} | ${c} ${a} ?`;
  const correct=difficulty===1?b:b;
  return task(`mat-${seed}`,"matrix","Welches Symbol ergänzt die Matrix?",detail,correct,shapes.filter(s=>s!==correct).slice(0,3),"Die Symbolfolge wird in jeder Gruppe nach demselben Rotationsmuster fortgeführt.");
}

function operator(seed:number, difficulty:Difficulty):LogicTask {
  const x=randomInt(2,7), y=randomInt(2,6); const correct=difficulty===3?x*y+y:x+y*2;
  const detail=difficulty===3?`Wenn a ★ b = a×b + b, was ist ${x} ★ ${y}?`:`Wenn a ★ b = a + 2b, was ist ${x} ★ ${y}?`;
  return task(`op-${seed}`,"operator","Berechne mit der neuen Operatorregel.",detail,String(correct),[String(correct+1),String(correct-1),String(x*y)],difficulty===3?"Setze a und b in a×b+b ein.":"Setze a und b in a+2b ein.");
}

function exclusion(seed:number, difficulty:Difficulty):LogicTask {
  const sets=difficulty===1?["4","8","12","15","20"]:difficulty===2?["2","3","5","7","9","11"]:["9","16","25","36","45","49"];
  const correct=difficulty===1?"15":difficulty===2?"9":"45";
  const reason=difficulty===1?"Alle anderen sind durch 4 teilbar.":difficulty===2?"Alle anderen sind Primzahlen.":"Alle anderen sind Quadratzahlen.";
  return task(`exc-${seed}`,"exclusion","Welche Zahl passt nicht?",sets.join(" · "),correct,sets.filter(x=>x!==correct).slice(0,3),reason);
}

function spatial(seed:number, difficulty:Difficulty):LogicTask {
  const turns=difficulty===1?1:difficulty===2?2:3; const dirs=["Norden","Osten","Süden","Westen"]; const start=seed%4; const correct=dirs[(start+turns)%4];
  return task(`spa-${seed}`,"spatial","Wohin blickst du danach?`, `Start: ${dirs[start]}. Drehe dich ${turns}× nach rechts.",correct,dirs.filter(d=>d!==correct),`Jede Rechtsdrehung entspricht 90°.`);
}

export function createLogicSession(bestScore:number):LogicSession {
  const difficulty=difficultyFromPercent((bestScore/LOGIC_SESSION_LENGTH)*100);
  const seed=Date.now()%100000;
  const tasks=[sequence(seed,difficulty),rule(seed+1,difficulty),analogy(seed+2,difficulty),deduction(seed+3,difficulty),matrix(seed+4,difficulty),operator(seed+5,difficulty),exclusion(seed+6,difficulty),spatial(seed+7,difficulty)];
  return { difficulty, tasks:shuffled(tasks) };
}
