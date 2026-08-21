"use client";

import { useEffect, useRef, useState } from "react";
import { createFocusSession, FOCUS_AREAS, FOCUS_STORAGE_KEY, type FocusArea, type FocusTask } from "@/lib/learningExpansion";
import type { Difficulty } from "@/lib/dynamicTraining";
import styles from "./FocusTraining.module.css";

type Phase="setup"|"preview"|"question"|"feedback"|"done";

export function FocusTraining(){
  const [areas,setAreas]=useState<FocusArea[]>(["math","words","translation"]);
  const [difficulty,setDifficulty]=useState<Difficulty>(1);
  const [tasks,setTasks]=useState<FocusTask[]>([]);
  const [index,setIndex]=useState(0);
  const [phase,setPhase]=useState<Phase>("setup");
  const [selected,setSelected]=useState<number|null>(null);
  const [score,setScore]=useState(0);
  const [reactionTimes,setReactionTimes]=useState<number[]>([]);
  const shownAt=useRef(0);
  const current=tasks[index];

  useEffect(()=>{try{const raw=localStorage.getItem(FOCUS_STORAGE_KEY);if(!raw)return;const saved=JSON.parse(raw);if(Array.isArray(saved.areas))setAreas(saved.areas);if([1,2,3].includes(saved.difficulty))setDifficulty(saved.difficulty);}catch{}},[]);
  useEffect(()=>{if(phase!=="preview"||!current?.previewMs)return;const timer=window.setTimeout(()=>{shownAt.current=performance.now();setPhase("question");},current.previewMs);return()=>window.clearTimeout(timer);},[phase,current]);

  function toggle(area:FocusArea){setAreas((value)=>value.includes(area)?(value.length===1?value:value.filter((item)=>item!==area)):[...value,area]);}
  function start(){const next=createFocusSession(areas,difficulty,10);setTasks(next);setIndex(0);setScore(0);setSelected(null);setReactionTimes([]);try{localStorage.setItem(FOCUS_STORAGE_KEY,JSON.stringify({areas,difficulty}));}catch{}const first=next[0];if(first.preview){setPhase("preview");}else{shownAt.current=performance.now();setPhase("question");}}
  function answer(optionIndex:number){if(!current||phase!=="question")return;const correct=optionIndex===current.answer;setSelected(optionIndex);if(correct)setScore((value)=>value+1);if(current.area==="reaction")setReactionTimes((value)=>[...value,Math.round(performance.now()-shownAt.current)]);setPhase("feedback");}
  function next(){if(index>=tasks.length-1){setPhase("done");return;}const nextIndex=index+1;setIndex(nextIndex);setSelected(null);const task=tasks[nextIndex];if(task.preview){setPhase("preview");}else{shownAt.current=performance.now();setPhase("question");}}
  const avgReaction=reactionTimes.length?Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length):0;

  if(phase==="setup")return <section className={styles.trainer} aria-labelledby="focus-title"><div className={styles.setup}><p className="eyebrow">Mein Fokus · Learning Expansion 3.0</p><h1 id="focus-title">Was möchtest du heute gezielt verbessern?</h1><p>Wähle einen oder mehrere Bereiche. KogTrain mischt daraus eine abwechslungsreiche Session mit zehn Aufgaben.</p><div className={styles.areaGrid}>{FOCUS_AREAS.map((area)=><button key={area.id} type="button" className={areas.includes(area.id)?styles.active:""} onClick={()=>toggle(area.id)} aria-pressed={areas.includes(area.id)}><span className={styles.icon}>{area.icon}</span><strong>{area.title}</strong><small>{area.subtitle}</small><p>{area.description}</p></button>)}</div><div className={styles.controls}><div><span>Schwierigkeit</span><div className={styles.levels}>{([1,2,3] as Difficulty[]).map((level)=><button key={level} type="button" onClick={()=>setDifficulty(level)} aria-pressed={difficulty===level} className={difficulty===level?styles.levelActive:""}>{level===1?"Leicht":level===2?"Standard":"Challenge"}</button>)}</div></div><button className="primaryButton" type="button" onClick={start}>Meine Session starten</button></div></div></section>;

  return <section className={styles.trainer} aria-live="polite"><div className={styles.sessionTop}><span>Aufgabe {Math.min(index+1,tasks.length)}/{tasks.length}</span><span>{current?.label ?? "Auswertung"}</span><span>Level {difficulty}</span></div>{phase==="preview"&&current?.preview&&<div className={styles.stage}><p className="eyebrow">Merkfähigkeit</p><h2>Präge dir die Folge ein.</h2><div className={styles.preview}>{current.preview.map((item,i)=><span key={`${item}-${i}`}>{item}</span>)}</div><p>Gleich wird die Folge ausgeblendet.</p></div>}{phase==="question"&&current&&<div className={styles.stage}><p className="eyebrow">{current.label}</p><h2>{current.prompt}</h2><div className={styles.detail}>{current.detail}</div><div className={styles.options}>{current.options.map((option,optionIndex)=><button key={`${option}-${optionIndex}`} type="button" onClick={()=>answer(optionIndex)}><kbd>{optionIndex+1}</kbd><span>{option}</span></button>)}</div></div>}{phase==="feedback"&&current&&selected!==null&&<div className={styles.stage}><p className={`${styles.badge} ${selected===current.answer?styles.correct:styles.incorrect}`}>{selected===current.answer?"Richtig ✓":"Fast – weiter geht’s"}</p><h2>{selected===current.answer?"Sauber gelöst.":`Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p>{current.area==="reaction"&&<p>Reaktionszeit: <strong>{reactionTimes.at(-1)} ms</strong></p>}<button className="primaryButton" type="button" onClick={next}>{index===tasks.length-1?"Auswertung":"Nächste Aufgabe"}</button></div>}{phase==="done"&&<div className={styles.stage}><p className="eyebrow">Session geschafft 🎉</p><h2>{score}/{tasks.length} Aufgaben richtig</h2><div className={styles.bigScore}>{Math.round((score/tasks.length)*100)}%</div><p>{avgReaction?`Ø Reaktionszeit: ${avgReaction} ms · `:""}Deine Auswahl bleibt gespeichert. Die nächste Session erzeugt neue Aufgaben.</p><div className={styles.finishActions}><button className="primaryButton" type="button" onClick={start}>Neue Session</button><button className={styles.secondaryButton} type="button" onClick={()=>setPhase("setup")}>Fokus ändern</button></div></div>}</section>;
}
