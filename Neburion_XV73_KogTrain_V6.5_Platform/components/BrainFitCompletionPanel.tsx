"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BrainFitCompletionPanel.module.css";
import {
  BRAIN_FIT_COMPLETION_KEY, BRAIN_FIT_COMPLETION_RECENT_KEY, COMPLETION_AREAS,
  completionAchievements, completionAverage, completionTaskKey, dailyMixTasks,
  emptyCompletionStats, recordCompletion, tasksForArea, todayKey,
  type CompletionArea, type CompletionStats, type CompletionTask,
} from "@/lib/brainFitCompletion";
import { localizeBrainFitCompletionText } from "@/lib/brainFitCompletionLocale";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

type View = "daily" | CompletionArea;

function freshTasks(view:View):CompletionTask[]{
  if(typeof window==="undefined") return view==="daily"?dailyMixTasks():tasksForArea(view,6);
  let recent:string[]=[];
  try{const raw=localStorage.getItem(BRAIN_FIT_COMPLETION_RECENT_KEY);if(raw)recent=JSON.parse(raw);}catch{}
  const next=view==="daily"?dailyMixTasks(8,recent):tasksForArea(view,6,recent);
  const merged=[...recent,...next.map(completionTaskKey)].slice(-32);
  try{localStorage.setItem(BRAIN_FIT_COMPLETION_RECENT_KEY,JSON.stringify(merged));}catch{}
  return next;
}

export function BrainFitCompletionPanel(){
  const {language,pick}=usePlatformLanguage();
  const tr=(value:string|undefined)=>localizeBrainFitCompletionText(value,language);
  const [view,setView]=useState<View>("daily");
  const [stats,setStats]=useState<CompletionStats>(()=>emptyCompletionStats());
  const [tasks,setTasks]=useState<CompletionTask[]>(()=>freshTasks("daily"));
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
    setTasks(freshTasks(next));
  }

  function answer(option:string){if(selected!==null||!current)return;setSelected(option);if(option===current.answer)setCorrect(value=>value+1);}

  function next(){
    if(!selected)return;
    if(index<tasks.length-1){setIndex(value=>value+1);setSelected(null);return;}
    const score=Math.round((correct/tasks.length)*100);
    const nextStats=recordCompletion(stats,score);
    setStats(nextStats);setComplete(true);
    try{localStorage.setItem(BRAIN_FIT_COMPLETION_KEY,JSON.stringify(nextStats));}catch{}
  }

  const viewArea=view==="daily"?null:COMPLETION_AREAS.find(item=>item.id===view);
  const currentArea=current?COMPLETION_AREAS.find(item=>item.id===current.area):null;

  return <section className={styles.wrap} aria-labelledby="completion-title">
    <div className={styles.head}>
      <div><p className="eyebrow">Learning Expansion 3.7.6 · Completion Pack</p><h2 id="completion-title">{pick("Tagesmix & zusätzliche Gehirnfit-Welten.","Daily mix & additional BrainFit worlds.")}</h2><p>{pick("Kurze, ruhige Einheiten ergänzen die acht Hauptübungen um Sprache, Zuordnung, Sprichwörter und Alltagsorientierung. Alles ohne Zeitdruck.","Short, calm sessions complement the eight main exercises with language, matching, proverbs and everyday orientation. Everything is without time pressure.")}</p></div>
      <div className={styles.summary}><span>{pick("Runden","Rounds")} <strong>{stats.sessions}</strong></span><span>Ø <strong>{stats.sessions?`${completionAverage(stats)}%`:"–"}</strong></span><span>{pick("Erfolge","Achievements")} <strong>{unlocked}/{achievements.length}</strong></span></div>
    </div>

    <div className={styles.nav} aria-label={pick("Zusätzliche Gehirnfit-Bereiche","Additional BrainFit areas")}>
      <button type="button" aria-pressed={view==="daily"} onClick={()=>load("daily")}>🌤️ {pick("Tagesmix","Daily mix")}</button>
      {COMPLETION_AREAS.map(item=><button type="button" key={item.id} aria-pressed={view===item.id} onClick={()=>load(item.id)}>{item.icon} {tr(item.title)}</button>)}
    </div>

    <div className={styles.card}>
      <div className={styles.cardHead}><div><span>{view==="daily"?pick("Gemischte Runde","Mixed round"):tr(viewArea?.subtitle)}</span><h3>{view==="daily"?pick("Dein heutiger Gehirnfit-Mix","Your BrainFit mix for today"):tr(viewArea?.title)}</h3></div><span>{complete?pick("Abgeschlossen","Complete"):`${Math.min(index+1,tasks.length)}/${tasks.length}`}</span></div>

      {!complete&&current&&<div className={styles.task}>
        <p className={styles.areaTag}>{currentArea?.icon} {tr(currentArea?.title)}</p>
        <h4>{tr(current.prompt)}</h4>
        <div className={styles.options}>{current.options.map(option=><button type="button" key={option} onClick={()=>answer(option)} disabled={selected!==null} data-selected={selected===option} data-correct={selected!==null&&option===current.answer}>{tr(option)}</button>)}</div>
        {selected&&<div className={isCorrect?styles.good:styles.help}>{isCorrect?pick("Richtig ✓","Correct ✓"):`${pick("Fast – richtig wäre:","Not quite — correct answer:")} ${tr(current.answer)}. ${tr(current.hint)}`}</div>}
        <button className={styles.primary} type="button" disabled={!selected} onClick={next}>{index===tasks.length-1?pick("Auswertung","Results"):pick("Nächste Aufgabe","Next task")}</button>
      </div>}

      {complete&&<div className={styles.result}><strong>{Math.round((correct/tasks.length)*100)}%</strong><h4>{pick("Runde abgeschlossen.","Round complete.")}</h4><p>{pick(`${correct} von ${tasks.length} Aufgaben richtig. Du kannst dieselbe Welt mit einer neuen Variante wiederholen oder zum Tagesmix wechseln.`,`${correct} of ${tasks.length} tasks correct. You can repeat the same world with a new variant or switch to the daily mix.`)}</p><div className={styles.resultActions}><button type="button" onClick={()=>load(view)}>{pick("Neue Variante","New variant")}</button><button type="button" onClick={()=>load("daily")}>{pick("Tagesmix öffnen","Open daily mix")}</button></div></div>}
    </div>

    <div className={styles.achievements} aria-label={pick("Gehirnfit-Erfolge","BrainFit achievements")}><div><p className="eyebrow">{pick("Meilensteine","Milestones")}</p><h3>{pick("Fortschritt sichtbar machen.","Make progress visible.")}</h3><p>{pick("Die Erfolge sind Motivation, keine Bewertung. Sie werden ausschließlich lokal in diesem Browser gespeichert.","Achievements are for motivation, not evaluation. They are stored only locally in this browser.")}</p></div><div className={styles.badges}>{achievements.map(item=><span key={item.label} data-unlocked={item.unlocked}>{item.unlocked?"✓":"○"} {tr(item.label)}</span>)}</div></div>

    {stats.completedToday===todayKey()&&<p className={styles.today}>{pick("Heute bereits eine Completion-Runde abgeschlossen ✓","A completion round has already been finished today ✓")}</p>}
  </section>;
}
