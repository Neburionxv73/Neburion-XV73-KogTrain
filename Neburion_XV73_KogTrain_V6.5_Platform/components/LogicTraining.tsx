"use client";

import { useEffect, useState } from "react";
import { sample, shuffleOptions } from "@/lib/dynamicTraining";
import styles from "./LogicTraining.module.css";

type LogicQuestion = { id: string; category: string; prompt: string; detail: string; options: string[]; answer: number; explanation: string };
type LogicStats = { sessions: number; bestScore: number; recentIds: string[] };
const STORAGE_KEY = "neburion-v65-logic-stats-v2";
const SESSION_LENGTH = 8;

const pool: LogicQuestion[] = [
  { id:"num-double", category:"Zahlenfolge", prompt:"Welche Zahl folgt?", detail:"2 · 4 · 8 · 16 · ?", options:["20","24","32","36"], answer:2, explanation:"Jede Zahl wird verdoppelt." },
  { id:"num-gaps", category:"Zahlenfolge", prompt:"Welche Zahl ergänzt die Reihe?", detail:"3 · 6 · 11 · 18 · ?", options:["25","27","29","31"], answer:1, explanation:"Die Abstände sind +3, +5, +7, +9." },
  { id:"num-squares", category:"Zahlenfolge", prompt:"Welche Zahl folgt?", detail:"1 · 4 · 9 · 16 · ?", options:["20","24","25","36"], answer:2, explanation:"Es sind Quadratzahlen: 1² bis 5²." },
  { id:"num-minus", category:"Zahlenfolge", prompt:"Welche Zahl folgt?", detail:"50 · 44 · 38 · 32 · ?", options:["24","25","26","28"], answer:2, explanation:"Jeweils minus 6." },
  { id:"num-fibo", category:"Zahlenfolge", prompt:"Welche Zahl folgt?", detail:"2 · 3 · 5 · 8 · 13 · ?", options:["18","20","21","24"], answer:2, explanation:"Jede Zahl ist die Summe der zwei vorherigen." },
  { id:"sym-alt", category:"Symbolmuster", prompt:"Welches Symbol kommt als Nächstes?", detail:"●  ▲  ●  ▲  ●  ?", options:["■","▲","●","◆"], answer:1, explanation:"Kreis und Dreieck wechseln sich ab." },
  { id:"sym-cycle", category:"Symbolmuster", prompt:"Setze das Muster fort.", detail:"■  ●  ▲  ■  ●  ?", options:["◆","▲","■","●"], answer:1, explanation:"Drei Symbole wiederholen sich zyklisch." },
  { id:"sym-pairs", category:"Symbolmuster", prompt:"Was folgt?", detail:"◆ ◆  ● ●  ▲ ▲  ◆ ◆  ?", options:["● ●","▲ ▲","■ ■","◆ ◆"], answer:0, explanation:"Die Symbolpaare laufen ◆, ●, ▲ im Kreis." },
  { id:"logic-chain", category:"Schlussfolgerung", prompt:"Welche Aussage folgt logisch?", detail:"Alle Lumen sind Riva. Alle Riva sind Taren.", options:["Alle Taren sind Lumen","Kein Lumen ist Taren","Alle Lumen sind Taren","Nur manche Riva sind Taren"], answer:2, explanation:"Die Zugehörigkeit überträgt sich entlang der Kette." },
  { id:"logic-none", category:"Schlussfolgerung", prompt:"Welche Aussage ist sicher?", detail:"Kein Naro ist blau. Mira ist ein Naro.", options:["Mira ist blau","Mira ist nicht blau","Mira ist rot","Naros sind rot"], answer:1, explanation:"Wenn kein Naro blau ist, kann Mira als Naro nicht blau sein." },
  { id:"logic-some", category:"Schlussfolgerung", prompt:"Was lässt sich sicher sagen?", detail:"Alle Fera sind schnell. Kiro ist ein Fera.", options:["Kiro ist langsam","Kiro ist schnell","Alle Schnellen sind Fera","Kiro ist kein Fera"], answer:1, explanation:"Kiro gehört zur Gruppe, für die die Eigenschaft gilt." },
  { id:"odd-4", category:"Ausschluss", prompt:"Welche Zahl passt nicht?", detail:"4 · 8 · 12 · 15 · 20", options:["8","12","15","20"], answer:2, explanation:"Alle anderen Zahlen sind durch 4 teilbar." },
  { id:"odd-prime", category:"Ausschluss", prompt:"Welche Zahl passt nicht?", detail:"2 · 3 · 5 · 7 · 9 · 11", options:["5","7","9","11"], answer:2, explanation:"9 ist als einzige Zahl nicht prim." },
  { id:"mapping-3", category:"Regel", prompt:"Welche Regel setzt sich fort?", detail:"1 → 3 · 2 → 6 · 4 → 12 · 7 → ?", options:["14","18","21","28"], answer:2, explanation:"Die Eingabe wird mit 3 multipliziert." },
  { id:"mapping-plus", category:"Regel", prompt:"Welche Ausgabe fehlt?", detail:"3 → 8 · 5 → 10 · 9 → 14 · 12 → ?", options:["15","16","17","18"], answer:2, explanation:"Zur Eingabe werden 5 addiert." },
  { id:"order", category:"Ordnung", prompt:"Welche Reihenfolge ist korrekt?", detail:"Mira ist älter als Taro. Taro ist älter als Leni.", options:["Leni > Mira > Taro","Mira > Taro > Leni","Taro > Mira > Leni","Mira > Leni > Taro"], answer:1, explanation:"Aus beiden Aussagen entsteht eine eindeutige Altersreihenfolge." },
  { id:"days", category:"Alltagslogik", prompt:"Welcher Tag folgt zwei Tage nach Montag?", detail:"Denke in festen Schritten weiter.", options:["Dienstag","Mittwoch","Donnerstag","Freitag"], answer:1, explanation:"Ein Tag nach Montag ist Dienstag, zwei Tage danach Mittwoch." },
  { id:"direction", category:"Räumliche Logik", prompt:"Du blickst nach Norden und drehst dich zweimal nach rechts. Wohin blickst du?", detail:"Jede Drehung entspricht 90°.", options:["Norden","Osten","Süden","Westen"], answer:2, explanation:"Zweimal rechts bedeutet 180°: Süden." },
  { id:"letters", category:"Muster", prompt:"Welcher Buchstabe folgt?", detail:"A · C · E · G · ?", options:["H","I","J","K"], answer:1, explanation:"Es wird jeweils ein Buchstabe übersprungen." },
  { id:"letters-back", category:"Muster", prompt:"Welcher Buchstabe folgt?", detail:"Z · W · T · Q · ?", options:["N","O","P","M"], answer:0, explanation:"Es geht jeweils drei Buchstaben zurück." }
];

export function LogicTraining() {
  const [sessionQuestions, setSessionQuestions] = useState<LogicQuestion[]>([]);
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"intro"|"question"|"feedback"|"done">("intro");
  const [stats, setStats] = useState<LogicStats>({ sessions:0, bestScore:0, recentIds:[] });

  useEffect(() => { try { const raw=localStorage.getItem(STORAGE_KEY); if(raw) setStats(JSON.parse(raw)); } catch {} }, []);

  function makeSession() {
    const fresh = pool.filter((item) => !stats.recentIds.includes(item.id));
    const source = fresh.length >= SESSION_LENGTH ? fresh : pool;
    return sample(source, SESSION_LENGTH).map(shuffleOptions);
  }
  function start() { setSessionQuestions(makeSession()); setIndex(0); setSelected(null); setScore(0); setPhase("question"); }
  function answer(optionIndex:number) { if(phase!=="question") return; setSelected(optionIndex); if(optionIndex===sessionQuestions[index].answer) setScore((v)=>v+1); setPhase("feedback"); }
  function next() {
    if(index>=sessionQuestions.length-1) {
      const nextStats={ sessions:stats.sessions+1, bestScore:Math.max(stats.bestScore,score), recentIds:sessionQuestions.map((q)=>q.id) };
      setStats(nextStats); try{localStorage.setItem(STORAGE_KEY,JSON.stringify(nextStats));}catch{} setPhase("done"); return;
    }
    setIndex((v)=>v+1); setSelected(null); setPhase("question");
  }
  const current=sessionQuestions[index]; const percent=sessionQuestions.length?Math.round((score/sessionQuestions.length)*100):0;

  return <section className={styles.logicTrainer} aria-live="polite">
    <div className="trainingStats"><span>Sessions {stats.sessions}</span><span>Bestwert {stats.bestScore} / {SESSION_LENGTH}</span><span>{phase==="question"||phase==="feedback"?`Aufgabe ${index+1} / ${SESSION_LENGTH}`:"Logic Lab"}</span></div>
    {phase==="intro"&&<div className="trainingStage"><p className="eyebrow">20er Aufgabenpool</p><h2>Jede Session ist anders.</h2><p>Acht Aufgaben werden zufällig ausgewählt. Die zuletzt verwendeten Aufgaben werden nach Möglichkeit ausgeschlossen und Antworten neu gemischt.</p><button className="primary trainingButton" type="button" onClick={start}>Session generieren</button></div>}
    {phase==="question"&&current&&<div className={`trainingStage ${styles.logicStage}`}><p className="eyebrow">{current.category}</p><p className="roundLabel">Aufgabe {index+1}</p><h2>{current.prompt}</h2><div className={styles.logicPattern}>{current.detail}</div><div className={styles.logicOptions}>{current.options.map((option,optionIndex)=><button key={`${current.id}-${option}`} type="button" onClick={()=>answer(optionIndex)}>{option}</button>)}</div></div>}
    {phase==="feedback"&&current&&selected!==null&&<div className={`trainingStage ${styles.logicStage}`}><p className={`feedbackBadge ${selected===current.answer?"correct":"incorrect"}`}>{selected===current.answer?"Richtig":"Noch nicht"}</p><h2>{selected===current.answer?"Regel erkannt.":`Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p><button className="primary trainingButton" type="button" onClick={next}>{index===SESSION_LENGTH-1?"Auswertung":"Nächste Aufgabe"}</button></div>}
    {phase==="done"&&<div className="trainingStage resultStage"><p className="eyebrow">Session abgeschlossen</p><h2>{percent}% richtig</h2><div className="finalScore"><strong>{score}</strong><span>/ {SESSION_LENGTH}</span></div><p>Die nächste Session bevorzugt andere Aufgaben.</p><button className="primary trainingButton" type="button" onClick={start}>Neue Session generieren</button></div>}
  </section>;
}
