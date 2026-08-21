"use client";

import { useEffect, useRef, useState } from "react";
import { FOCUS_AREAS, type FocusArea } from "@/lib/learningExpansion";
import type { Difficulty } from "@/lib/dynamicTraining";
import {
  adaptiveDifficulty,
  createDailyChallenge,
  createPersonalSession,
  PERSONAL_PREF_KEY,
  PERSONAL_STATS_KEY,
  SESSION_MODES,
  TOPICS,
  type FocusTopic,
  type PersonalTask,
  type SessionMode,
} from "@/lib/personalTraining";
import styles from "./FocusTraining.module.css";

type Phase = "setup" | "preview" | "question" | "feedback" | "done";
type Stats = { sessions:number; lastAccuracy?:number; bestAccuracy:number };
type Prefs = { areas:FocusArea[]; topics:FocusTopic[]; difficulty:Difficulty; adaptive:boolean; mode:SessionMode };
const EMPTY_STATS:Stats={sessions:0,bestAccuracy:0};

export function FocusTraining31(){
  const [areas,setAreas]=useState<FocusArea[]>(["math","words","translation"]);
  const [topics,setTopics]=useState<FocusTopic[]>([]);
  const [difficulty,setDifficulty]=useState<Difficulty>(1);
  const [adaptive,setAdaptive]=useState(true);
  const [mode,setMode]=useState<SessionMode>("standard");
  const [stats,setStats]=useState<Stats>(EMPTY_STATS);
  const [tasks,setTasks]=useState<PersonalTask[]>([]);
  const [index,setIndex]=useState(0);
  const [phase,setPhase]=useState<Phase>("setup");
  const [selected,setSelected]=useState<number|null>(null);
  const [results,setResults]=useState<boolean[]>([]);
  const [reactionTimes,setReactionTimes]=useState<number[]>([]);
  const [sessionDifficulty,setSessionDifficulty]=useState<Difficulty>(1);
  const [daily,setDaily]=useState(false);
  const shownAt=useRef(0);
  const current=tasks[index];
  const score=results.filter(Boolean).length;

  useEffect(()=>{try{const raw=localStorage.getItem(PERSONAL_PREF_KEY);if(raw){const p=JSON.parse(raw) as Prefs;if(Array.isArray(p.areas)&&p.areas.length)setAreas(p.areas);if(Array.isArray(p.topics))setTopics(p.topics);if([1,2,3].includes(p.difficulty))setDifficulty(p.difficulty);if(typeof p.adaptive==="boolean")setAdaptive(p.adaptive);if(SESSION_MODES.some(m=>m.id===p.mode))setMode(p.mode);}const statRaw=localStorage.getItem(PERSONAL_STATS_KEY);if(statRaw)setStats({...EMPTY_STATS,...JSON.parse(statRaw)});}catch{}},[]);
  useEffect(()=>{if(phase!=="preview"||!current?.previewMs)return;const timer=window.setTimeout(()=>{shownAt.current=performance.now();setPhase("question");},current.previewMs);return()=>window.clearTimeout(timer);},[phase,current]);
  useEffect(()=>{if(phase!=="question")return;const handler=(event:KeyboardEvent)=>{const i=Number(event.key)-1;if(i>=0&&i<4)answer(i);};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);});

  function savePrefs(next?:Partial<Prefs>){const p:Prefs={areas,topics,difficulty,adaptive,mode,...next};try{localStorage.setItem(PERSONAL_PREF_KEY,JSON.stringify(p));}catch{}}
  function toggleArea(area:FocusArea){setAreas(value=>value.includes(area)?(value.length===1?value:value.filter(x=>x!==area)):[...value,area]);}
  function toggleTopic(topic:FocusTopic){setTopics(value=>value.includes(topic)?value.filter(x=>x!==topic):[...value,topic]);}
  function start(kind:"personal"|"daily"){
    const modeConfig=SESSION_MODES.find(m=>m.id===mode)??SESSION_MODES[1];
    const level=kind==="daily"?2:(adaptive?adaptiveDifficulty(stats.lastAccuracy,difficulty):difficulty);
    const next=kind==="daily"?createDailyChallenge():createPersonalSession(areas,topics,level,modeConfig.length);
    setTasks(next);setIndex(0);setSelected(null);setResults([]);setReactionTimes([]);setSessionDifficulty(level);setDaily(kind==="daily");savePrefs();
    if(next[0]?.preview)setPhase("preview");else{shownAt.current=performance.now();setPhase("question");}
  }
  function answer(optionIndex:number){if(!current||phase!=="question")return;const correct=optionIndex===current.answer;setSelected(optionIndex);setResults(value=>[...value,correct]);if(current.area==="reaction")setReactionTimes(value=>[...value,Math.round(performance.now()-shownAt.current)]);setPhase("feedback");}
  function finish(){const accuracy=tasks.length?Math.round((results.filter(Boolean).length/tasks.length)*100):0;const next={sessions:stats.sessions+1,lastAccuracy:accuracy,bestAccuracy:Math.max(stats.bestAccuracy,accuracy)};setStats(next);try{localStorage.setItem(PERSONAL_STATS_KEY,JSON.stringify(next));}catch{}setPhase("done");}
  function next(){if(index>=tasks.length-1){finish();return;}const n=index+1;setIndex(n);setSelected(null);if(tasks[n].preview)setPhase("preview");else{shownAt.current=performance.now();setPhase("question");}}
  const avgReaction=reactionTimes.length?Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length):0;

  if(phase==="setup")return <section className={styles.trainer} aria-labelledby="focus-title"><div className={styles.setup}>
    <p className="eyebrow">Learning Expansion 3.1 · Persönlicher Trainingsplan</p>
    <h1 id="focus-title">Was möchtest du heute gezielt verbessern?</h1>
    <p>Wähle Bereiche und auf Wunsch einzelne Unterthemen. Keine Unterthemen-Auswahl bedeutet: KogTrain mischt alle Übungen des aktiven Bereichs.</p>
    <p><strong>{stats.sessions}</strong> Fokus-Sessions · Bestwert <strong>{stats.bestAccuracy}%</strong>{stats.lastAccuracy!==undefined?` · zuletzt ${stats.lastAccuracy}%`:""}</p>

    <div className={styles.areaGrid}>{FOCUS_AREAS.map(area=><button key={area.id} type="button" className={areas.includes(area.id)?styles.active:""} onClick={()=>toggleArea(area.id)} aria-pressed={areas.includes(area.id)}><span className={styles.icon}>{area.icon}</span><strong>{area.title}</strong><small>{area.subtitle}</small><p>{area.description}</p></button>)}</div>

    <h2>Gezielte Übungen</h2>
    {areas.map(area=><div key={area} style={{marginBottom:16}}><strong>{FOCUS_AREAS.find(x=>x.id===area)?.title}</strong><div className={styles.levels} style={{marginTop:8}}>{TOPICS[area].map(topic=><button key={topic.id} type="button" className={topics.includes(topic.id)?styles.levelActive:""} aria-pressed={topics.includes(topic.id)} onClick={()=>toggleTopic(topic.id)}>{topic.label}</button>)}</div></div>)}

    <div className={styles.controls} style={{marginTop:30}}><div><span>Session-Länge</span><div className={styles.levels}>{SESSION_MODES.map(item=><button key={item.id} type="button" className={mode===item.id?styles.levelActive:""} onClick={()=>{setMode(item.id);savePrefs({mode:item.id});}}><strong>{item.label}</strong> · {item.note}</button>)}</div></div><div><span>Grundniveau</span><div className={styles.levels}>{([1,2,3] as Difficulty[]).map(level=><button key={level} type="button" className={difficulty===level?styles.levelActive:""} onClick={()=>{setDifficulty(level);savePrefs({difficulty:level});}}>{level===1?"Leicht":level===2?"Standard":"Challenge"}</button>)}</div><label style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}><input type="checkbox" checked={adaptive} onChange={e=>{setAdaptive(e.target.checked);savePrefs({adaptive:e.target.checked});}}/> Adaptiv an letzte Leistung anpassen</label></div></div>

    <div className={styles.finishActions} style={{marginTop:30}}><button className="primaryButton" type="button" onClick={()=>start("personal")}>Meinen Trainingsplan starten</button><button className={styles.secondaryButton} type="button" onClick={()=>start("daily")} style={{marginTop:20}}>Tages-Challenge · 8 Aufgaben</button></div>
  </div></section>;

  return <section className={styles.trainer} aria-live="polite"><div className={styles.sessionTop}><span>{daily?"Tages-Challenge":"Persönlicher Plan"}</span><span>Aufgabe {Math.min(index+1,tasks.length)}/{tasks.length}</span><span>{current?.topicLabel??current?.label??"Auswertung"}</span><span>Level {sessionDifficulty}</span></div>
    {phase==="preview"&&current?.preview&&<div className={styles.stage}><p className="eyebrow">Merkfähigkeit</p><h2>Präge dir die Folge ein.</h2><div className={styles.preview}>{current.preview.map((item,i)=><span key={`${item}-${i}`}>{item}</span>)}</div><p>Gleich wird die Folge ausgeblendet.</p></div>}
    {phase==="question"&&current&&<div className={styles.stage}><p className="eyebrow">{current.topicLabel??current.label}</p><h2>{current.prompt}</h2><div className={styles.detail}>{current.detail}</div><div className={styles.options}>{current.options.map((option,i)=><button key={`${option}-${i}`} type="button" onClick={()=>answer(i)}><kbd>{i+1}</kbd><span>{option}</span></button>)}</div><p>Tastatur: 1–4</p></div>}
    {phase==="feedback"&&current&&selected!==null&&<div className={styles.stage}><p className={`${styles.badge} ${selected===current.answer?styles.correct:styles.incorrect}`}>{selected===current.answer?"Richtig ✓":"Fast – weiter geht’s"}</p><h2>{selected===current.answer?"Sauber gelöst.":`Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p>{current.area==="reaction"&&<p>Reaktionszeit: <strong>{reactionTimes.at(-1)} ms</strong></p>}<button className="primaryButton" type="button" onClick={next}>{index===tasks.length-1?"Auswertung":"Nächste Aufgabe"}</button></div>}
    {phase==="done"&&<div className={styles.stage}><p className="eyebrow">Geschafft 🎉</p><h2>{score}/{tasks.length} Aufgaben richtig</h2><div className={styles.bigScore}>{Math.round((score/tasks.length)*100)}%</div><p>{avgReaction?`Ø Reaktionszeit: ${avgReaction} ms · `:""}{adaptive&&!daily?"Die nächste Session passt das Niveau anhand deiner letzten Leistung an.":"Dein Training bleibt auf dem gewählten Niveau."}</p><div className={styles.finishActions}><button className="primaryButton" type="button" onClick={()=>start(daily?"daily":"personal")}>Noch eine Session</button><button className={styles.secondaryButton} type="button" onClick={()=>setPhase("setup")}>Plan anpassen</button></div></div>}
  </section>;
}
