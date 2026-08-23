"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BrainFitCompletionPanel.module.css";
import {
  BRAIN_FIT_COMPLETION_KEY, COMPLETION_AREAS, completionAchievements, completionAverage,
  dailyMixTasks, emptyCompletionStats, recordCompletion, tasksForArea, todayKey,
  type CompletionArea, type CompletionStats, type CompletionTask,
} from "@/lib/brainFitCompletion";

type View = "daily" | CompletionArea;

export function BrainFitCompletionPanel(){
  const [view,setView]=useState<View>("daily");
  const [stats,setStats]=useState<CompletionStats>(()=>emptyCompletionStats());
  const [tasks,setTasks]=useState<CompletionTask[]>(()=>dailyMixTasks());
  const [index,setIndex]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [complete,setComplete]=useState(false);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(BRAIN_FIT_COMPLETION_KEY);
      if(raw) setStats({...emptyCompletionStats(),...JSON.parse(raw)});
    }catch{}
  },[]);

  const current=tasks[index];
  const isCorrect=selected!==null&&selected===current?.answer;
  const achievements=useMemo(()=>completionAchievements(stats),[stats]);
  const unlocked=achievements.filter(item=>item.unlocked).length;

  function load(next:View){
    setView(next);setIndex(0);setCorrect(0);setSelected(null);setComplete(false);
    setTasks(next==="daily"?dailyMixTasks():tasksForArea(next,6));
  }

  function answer(option:string){if(selected!==null||!current)return;setSelected(option);if(option===current.answer)setCorrect(value=>value+1);}

  function next(){
    if(!selected)return;
    if(index<tasks.length-1){setIndex(value=>value+1);setSelected(null);return;}
    const finalCorrect=correct;
    const score=Math.round((finalCorrect/tasks.length)*100);
    const nextStats=recordCompletion(stats,score);
    setStats(nextStats);setComplete(true);
    try{localStorage.setItem(BRAIN_FIT_COMPLETION_KEY,JSON.stringify(nextStats));}catch{}
  }

  return <section className={styles.wrap} aria-labelledby="completion-title">
    <div className={styles.head}>
      <div><p className="eyebrow">Learning Expansion 3.7.6 · Completion Pack</p><h2 id="completion-title">Tagesmix & zusätzliche Gehirnfit-Welten.</h2><p>Kurze, ruhige Einheiten ergänzen die acht Hauptübungen um Sprache, Zuordnung, Sprichwörter und Alltagsorientierung. Alles ohne Zeitdruck.</p></div>
      <div className={styles.summary}><span>Runden <strong>{stats.sessions}</strong></span><span>Ø <strong>{stats.sessions?`${completionAverage(stats)}%`:"–"}</strong></span><span>Erfolge <strong>{unlocked}/{achievements.length}</strong></span></div>
    </div>

    <div className={styles.nav} aria-label="Zusätzliche Gehirnfit-Bereiche">
      <button type="button" aria-pressed={view==="daily"} onClick={()=>load("daily")}>🌤️ Tagesmix</button>
      {COMPLETION_AREAS.map(area=><button type="button" key={area.id} aria-pressed={view===area.id} onClick={()=>load(area.id)}>{area.icon} {area.title}</button>)}
    </div>

    <div className={styles.card}>
      <div className={styles.cardHead}><div><span>{view==="daily"?"Gemischte Runde":COMPLETION_AREAS.find(area=>area.id===view)?.subtitle}</span><h3>{view==="daily"?"Dein heutiger Gehirnfit-Mix":COMPLETION_AREAS.find(area=>area.id===view)?.title}</h3></div><span>{complete?"Abgeschlossen":`${Math.min(index+1,tasks.length)}/${tasks.length}`}</span></div>

      {!complete&&current&&<div className={styles.task}>
        <p className={styles.areaTag}>{COMPLETION_AREAS.find(area=>area.id===current.area)?.icon} {COMPLETION_AREAS.find(area=>area.id===current.area)?.title}</p>
        <h4>{current.prompt}</h4>
        <div className={styles.options}>{current.options.map(option=><button type="button" key={option} onClick={()=>answer(option)} disabled={selected!==null} data-selected={selected===option} data-correct={selected!==null&&option===current.answer}>{option}</button>)}</div>
        {selected&&<div className={isCorrect?styles.good:styles.help}>{isCorrect?"Richtig ✓":`Fast – richtig wäre: ${current.answer}. ${current.hint}`}</div>}
        <button className={styles.primary} type="button" disabled={!selected} onClick={next}>{index===tasks.length-1?"Auswertung":"Nächste Aufgabe"}</button>
      </div>}

      {complete&&<div className={styles.result}><strong>{Math.round((correct/tasks.length)*100)}%</strong><h4>Runde abgeschlossen.</h4><p>{correct} von {tasks.length} Aufgaben richtig. Du kannst dieselbe Welt mit einer neuen Variante wiederholen oder zum Tagesmix wechseln.</p><div className={styles.resultActions}><button type="button" onClick={()=>load(view)}>Neue Variante</button><button type="button" onClick={()=>load("daily")}>Tagesmix öffnen</button></div></div>}
    </div>

    <div className={styles.achievements} aria-label="Gehirnfit-Erfolge"><div><p className="eyebrow">Meilensteine</p><h3>Fortschritt sichtbar machen.</h3><p>Die Erfolge sind Motivation, keine Bewertung. Sie werden ausschließlich lokal in diesem Browser gespeichert.</p></div><div className={styles.badges}>{achievements.map(item=><span key={item.label} data-unlocked={item.unlocked}>{item.unlocked?"✓":"○"} {item.label}</span>)}</div></div>

    {stats.completedToday===todayKey()&&<p className={styles.today}>Heute bereits eine Completion-Runde abgeschlossen ✓</p>}
  </section>;
}
