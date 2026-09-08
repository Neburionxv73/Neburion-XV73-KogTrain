"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BRAIN_FIT_STORAGE_KEY,
  emptyBrainFitStats,
  mergeBrainFitStats,
  recordBrainFitResult,
  variedQuizTasks,
  type BrainFitArea,
  type BrainFitChoiceTask,
  type BrainFitMode,
  type BrainFitStats,
} from "@/lib/brainFit";
import {
  applyAdaptiveDifficultyResult,
  createAdaptiveDifficultyState,
  difficultyLabel,
  type AdaptiveDifficultyState,
} from "@/lib/adaptiveDifficultyV5";
import { localizeTrainingText } from "@/lib/trainingLocale";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./BrainFitAdaptiveV5.module.css";

const AREAS:BrainFitArea[]=["categories","sequence","everydayMath","timeOrder"];
const LABELS_DE:Record<string,string>={categories:"Kategorien",sequence:"Reihen & Folgen",everydayMath:"Alltagsrechnen",timeOrder:"Zeit & Reihenfolge"};
const LABELS_EN:Record<string,string>={categories:"Categories",sequence:"Sequences & patterns",everydayMath:"Everyday math",timeOrder:"Time & order"};
const SESSION_LENGTH=8;

function modeForLevel(level:number):BrainFitMode{return level<=1?"relaxed":level===2?"normal":"challenge";}
function buildTask(area:BrainFitArea,level:number,used:Set<string>):BrainFitChoiceTask{
  const pool=variedQuizTasks(area,modeForLevel(level));
  return pool.find(task=>!used.has(`${area}:${task.prompt}`)) ?? pool[0];
}

export function BrainFitAdaptiveV5(){
  const {language,pick}=usePlatformLanguage();
  const tr=(value:string|undefined)=>localizeTrainingText(value,language);
  const labels=language==="en"?LABELS_EN:LABELS_DE;
  const [stats,setStats]=useState<BrainFitStats>(()=>emptyBrainFitStats());
  const [running,setRunning]=useState(false);
  const [index,setIndex]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [adaptive,setAdaptive]=useState<AdaptiveDifficultyState>(createAdaptiveDifficultyState(1));
  const [task,setTask]=useState<BrainFitChoiceTask|null>(null);
  const [area,setArea]=useState<BrainFitArea>(AREAS[0]);
  const [used,setUsed]=useState<Set<string>>(()=>new Set());

  useEffect(()=>{try{const raw=localStorage.getItem(BRAIN_FIT_STORAGE_KEY);if(raw)setStats(mergeBrainFitStats(JSON.parse(raw)));}catch{}},[]);

  const percent=useMemo(()=>index?Math.round(correct/index*100):0,[correct,index]);

  function start(){
    const nextAdaptive=createAdaptiveDifficultyState(1);
    const nextUsed=new Set<string>();
    const nextArea=AREAS[0];
    const nextTask=buildTask(nextArea,nextAdaptive.level,nextUsed);
    nextUsed.add(`${nextArea}:${nextTask.prompt}`);
    setAdaptive(nextAdaptive);setUsed(nextUsed);setArea(nextArea);setTask(nextTask);setIndex(0);setCorrect(0);setSelected(null);setRunning(true);
  }

  function choose(option:string){
    if(!task||selected)return;
    const isCorrect=option===task.answer;
    setSelected(option);
    if(isCorrect)setCorrect(value=>value+1);
    setAdaptive(current=>applyAdaptiveDifficultyResult(current,isCorrect));
  }

  function next(){
    if(!task||!selected)return;
    const completed=index+1;
    if(completed>=SESSION_LENGTH){
      const finalCorrect=correct+(selected===task.answer?1:0);
      const score=Math.round(finalCorrect/SESSION_LENGTH*100);
      const nextStats=AREAS.reduce((current,target)=>recordBrainFitResult(current,target,score),stats);
      setStats(nextStats);
      try{localStorage.setItem(BRAIN_FIT_STORAGE_KEY,JSON.stringify(nextStats));}catch{}
      setIndex(completed);setRunning(false);setTask(null);setSelected(null);return;
    }
    const nextArea=AREAS[completed%AREAS.length];
    const nextTask=buildTask(nextArea,adaptive.level,used);
    const nextUsed=new Set(used);nextUsed.add(`${nextArea}:${nextTask.prompt}`);
    setUsed(nextUsed);setArea(nextArea);setTask(nextTask);setIndex(completed);setSelected(null);
  }

  return <section className={styles.shell} aria-labelledby="brainfit-v5-title" data-adaptive-level={adaptive.level}>
    <div className={styles.head}>
      <div><p className="eyebrow">BrainFit V5 · Adaptive Difficulty</p><h2 id="brainfit-v5-title">{pick("Gemischte Denk-Session mit echter Dynamik.","Mixed thinking session with real dynamic difficulty.")}</h2><p>{pick("Vier Alltags- und Denkbereiche wechseln automatisch. Drei sichere Treffer können das Niveau um eine Stufe erhöhen; zwei Fehler in Folge senken es höchstens um eine Stufe.","Four everyday and thinking areas alternate automatically. Three reliable correct answers can raise the level by one step; two consecutive errors lower it by at most one step.")}</p></div>
      <div className={styles.level}><span>{pick("Dynamik","Dynamic")}</span><strong>{adaptive.level} · {tr(difficultyLabel(adaptive.level))}</strong></div>
    </div>

    {!running&&!task&&index<SESSION_LENGTH&&<div className={styles.start}><p>{pick(`Die Session umfasst ${SESSION_LENGTH} Aufgaben aus Kategorien, Reihen & Folgen, Alltagsrechnen sowie Zeit & Reihenfolge.`,`The session contains ${SESSION_LENGTH} tasks covering categories, sequences & patterns, everyday math, and time & order.`)}</p><button type="button" className="primaryButton" onClick={start}>{pick("BrainFit V5 starten","Start BrainFit V5")}</button></div>}

    {running&&task&&<div className={styles.stage} aria-live="polite">
      <div className={styles.meta}><span>{labels[area]}</span><span>{pick("Aufgabe","Task")} {index+1}/{SESSION_LENGTH}</span></div>
      <h3>{tr(task.prompt)}</h3>
      <div className={styles.options}>{task.options.map(option=><button key={option} type="button" onClick={()=>choose(option)} disabled={Boolean(selected)} data-selected={selected===option} data-correct={Boolean(selected)&&option===task.answer}>{tr(option)}</button>)}</div>
      {selected&&<div className={selected===task.answer?styles.good:styles.info}><strong>{selected===task.answer?pick("Richtig ✓","Correct ✓"):`${pick("Richtig wäre:","Correct answer:")} ${tr(task.answer)}`}</strong><span>{tr(adaptive.reason)}</span></div>}
      <button type="button" className="primaryButton" disabled={!selected} onClick={next}>{index===SESSION_LENGTH-1?pick("Auswertung","Results"):pick("Nächste Aufgabe","Next task")}</button>
    </div>}

    {!running&&index>=SESSION_LENGTH&&<div className={styles.result}><strong>{Math.round(correct/SESSION_LENGTH*100)}%</strong><h3>{pick("Adaptive BrainFit Session abgeschlossen.","Adaptive BrainFit session complete.")}</h3><p>{pick(`${correct} von ${SESSION_LENGTH} Aufgaben richtig · Endniveau ${adaptive.level} ${difficultyLabel(adaptive.level)}.`,`${correct} of ${SESSION_LENGTH} tasks correct · Final level ${adaptive.level} ${tr(difficultyLabel(adaptive.level))}.`)}</p><button type="button" className="primaryButton" onClick={start}>{pick("Neue V5 Session","New V5 session")}</button></div>}
  </section>;
}
