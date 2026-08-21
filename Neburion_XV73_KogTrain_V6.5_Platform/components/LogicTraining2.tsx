"use client";

import { useEffect, useState } from "react";
import { createLogicSession, LOGIC_SESSION_LENGTH, LOGIC_STORAGE_KEY, type LogicMode, type LogicSession } from "@/lib/logic";
import styles from "./LogicTraining.module.css";

type ModeStat={attempts:number;correct:number};
type Stats={sessions:number;bestScore:number;modeStats:Partial<Record<LogicMode,ModeStat>>};
type Outcome={mode:LogicMode;correct:boolean};
type Phase="intro"|"question"|"feedback"|"done";
const initialStats:Stats={sessions:0,bestScore:0,modeStats:{}};
const labels:Record<LogicMode,string>={sequence:"Zahlenreihen",rule:"Regeln",analogy:"Analogien",deduction:"Schlüsse",matrix:"Matrizen",operator:"Operatoren",exclusion:"Ausschluss",spatial:"Raumlogik"};

export function LogicTraining2(){
  const [session,setSession]=useState<LogicSession|null>(null);
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [outcomes,setOutcomes]=useState<Outcome[]>([]);
  const [phase,setPhase]=useState<Phase>("intro");
  const [stats,setStats]=useState<Stats>(initialStats);

  useEffect(()=>{try{const raw=localStorage.getItem(LOGIC_STORAGE_KEY);if(raw)setStats({...initialStats,...JSON.parse(raw)});}catch{}},[]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if(phase!=="question"||!session)return;const n=Number(event.key)-1;if(n>=0&&n<session.tasks[index].options.length)answer(n);};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);});

  function start(){setSession(createLogicSession(stats.bestScore));setIndex(0);setSelected(null);setOutcomes([]);setPhase("question");}
  function answer(optionIndex:number){if(!session||phase!=="question")return;const current=session.tasks[index];setSelected(optionIndex);setOutcomes(v=>[...v,{mode:current.mode,correct:optionIndex===current.answer}]);setPhase("feedback");}
  function next(){if(!session)return;if(index<session.tasks.length-1){setIndex(v=>v+1);setSelected(null);setPhase("question");return;}const score=outcomes.filter(x=>x.correct).length;const modeStats={...stats.modeStats};outcomes.forEach(x=>{const current=modeStats[x.mode]??{attempts:0,correct:0};modeStats[x.mode]={attempts:current.attempts+1,correct:current.correct+(x.correct?1:0)};});const nextStats={sessions:stats.sessions+1,bestScore:Math.max(stats.bestScore,score),modeStats};setStats(nextStats);try{localStorage.setItem(LOGIC_STORAGE_KEY,JSON.stringify(nextStats));}catch{}setPhase("done");}

  const current=session?.tasks[index];const score=outcomes.filter(x=>x.correct).length;const percent=session?Math.round(score/session.tasks.length*100):0;
  return <section className={styles.logicTrainer} aria-live="polite">
    <div className="trainingStats"><span>Sessions {stats.sessions}</span><span>Bestwert {stats.bestScore}/{LOGIC_SESSION_LENGTH}</span><span>{session?`Level ${session.difficulty}`:"Logic Lab 2.0"}</span></div>
    {phase==="intro"&&<div className="trainingStage"><p className="eyebrow">8 Logikmodi</p><h2>Regeln erkennen. Schlüsse ziehen. Probleme lösen.</h2><p>Jede Session kombiniert Zahlenreihen, Regeln, Analogien, Schlussfolgerungen, Matrizen, Operatorlogik, Ausschluss- und Raumaufgaben.</p><div className={styles.modeGrid}>{Object.values(labels).map(label=><span key={label}>{label}</span>)}</div><button className="primary trainingButton" type="button" onClick={start}>Logic Session starten</button></div>}
    {phase==="question"&&current&&session&&<div className={`trainingStage ${styles.logicStage}`}><p className="eyebrow">{labels[current.mode]} · Aufgabe {index+1}/{session.tasks.length}</p><h2>{current.prompt}</h2><div className={styles.logicPattern}>{current.detail}</div><div className={styles.logicOptions}>{current.options.map((option,optionIndex)=><button key={`${current.id}-${optionIndex}`} type="button" onClick={()=>answer(optionIndex)}><kbd>{optionIndex+1}</kbd>{option}</button>)}</div></div>}
    {phase==="feedback"&&current&&selected!==null&&<div className={`trainingStage ${styles.logicStage}`}><p className={`feedbackBadge ${selected===current.answer?"correct":"incorrect"}`}>{selected===current.answer?"Richtig":"Noch nicht"}</p><h2>{selected===current.answer?"Logik erkannt.":`Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p><button className="primary trainingButton" type="button" onClick={next}>{session&&index===session.tasks.length-1?"Auswertung":"Nächste Aufgabe"}</button></div>}
    {phase==="done"&&session&&<div className="trainingStage resultStage"><p className="eyebrow">Session abgeschlossen</p><h2>{percent}% richtig</h2><div className="finalScore"><strong>{score}</strong><span>/ {session.tasks.length}</span></div><div className={styles.modeStats}>{(Object.entries(stats.modeStats) as [LogicMode,ModeStat][]).map(([mode,value])=><div key={mode}><span>{labels[mode]}</span><strong>{value.attempts?Math.round(value.correct/value.attempts*100):0}%</strong></div>)}</div><button className="primary trainingButton" type="button" onClick={start}>Neue Logic Session</button></div>}
  </section>;
}
