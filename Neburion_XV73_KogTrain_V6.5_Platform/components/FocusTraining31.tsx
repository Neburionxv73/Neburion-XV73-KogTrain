"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
type SkillStat = { attempts:number; correct:number };
type SkillStats = Record<FocusArea,SkillStat>;
type Stats = {
  sessions:number;
  lastAccuracy?:number;
  bestAccuracy:number;
  history:string[];
  skillStats:SkillStats;
};
type Prefs = {
  areas:FocusArea[];
  topics:FocusTopic[];
  difficulty:Difficulty;
  adaptive:boolean;
  mode:SessionMode;
  weeklyTarget:number;
};
type GoalPreset = {
  id:string;
  title:string;
  description:string;
  areas:FocusArea[];
  topics:FocusTopic[];
};

const EMPTY_SKILLS:SkillStats={
  math:{attempts:0,correct:0},
  words:{attempts:0,correct:0},
  translation:{attempts:0,correct:0},
  attention:{attempts:0,correct:0},
  reaction:{attempts:0,correct:0},
  memory:{attempts:0,correct:0},
};
const EMPTY_STATS:Stats={sessions:0,bestAccuracy:0,history:[],skillStats:EMPTY_SKILLS};
const WEEK_TARGETS=[3,5,7];
const GOALS:GoalPreset[]=[
  {id:"mental-math",title:"Kopfrechnen verbessern",description:"Plus, Minus, Mal, Division und Zahlenfolgen gezielt festigen.",areas:["math"],topics:["plus","minus","mal","division","zahlenfolge"]},
  {id:"language",title:"Wort & Sprache stärken",description:"Wortsuche, Rechtschreibung, Synonyme und Antonyme trainieren.",areas:["words"],topics:["wortsuche","buchstabensalat","synonym","antonym","rechtschreibung"]},
  {id:"english",title:"Englisch erweitern",description:"Deutsch ↔ Englisch mit Alltag, Arbeit, Natur, Essen und Reisen.",areas:["translation"],topics:["alltag","arbeit","natur","essen","reisen"]},
  {id:"focus",title:"Konzentration steigern",description:"Selektive Aufmerksamkeit und Reizfilter gezielt schärfen.",areas:["attention"],topics:["zielreiz","abweichung","buchstabenfilter"]},
  {id:"reaction",title:"Reaktion verbessern",description:"Farbe, Form und Regelwechsel schneller erkennen.",areas:["reaction"],topics:["farbe","form","regelwechsel"]},
  {id:"memory",title:"Merkfähigkeit trainieren",description:"Wörter, Zahlen und Symbole sicherer speichern und abrufen.",areas:["memory"],topics:["symbole","woerter","zahlen"]},
];

function percent(stat:SkillStat){return stat.attempts?Math.round((stat.correct/stat.attempts)*100):0;}
function currentWeekKey(date=new Date()){
  const copy=new Date(date);
  const day=(copy.getDay()+6)%7;
  copy.setHours(0,0,0,0);
  copy.setDate(copy.getDate()-day);
  return copy.toISOString().slice(0,10);
}
function sessionsThisWeek(history:string[]){
  const start=currentWeekKey();
  return history.filter(item=>item>=start).length;
}

export function FocusTraining31(){
  const [areas,setAreas]=useState<FocusArea[]>(["math","words","translation"]);
  const [topics,setTopics]=useState<FocusTopic[]>([]);
  const [difficulty,setDifficulty]=useState<Difficulty>(1);
  const [adaptive,setAdaptive]=useState(true);
  const [mode,setMode]=useState<SessionMode>("standard");
  const [weeklyTarget,setWeeklyTarget]=useState(3);
  const [stats,setStats]=useState<Stats>(EMPTY_STATS);
  const [tasks,setTasks]=useState<PersonalTask[]>([]);
  const [index,setIndex]=useState(0);
  const [phase,setPhase]=useState<Phase>("setup");
  const [selected,setSelected]=useState<number|null>(null);
  const [results,setResults]=useState<boolean[]>([]);
  const [reactionTimes,setReactionTimes]=useState<number[]>([]);
  const [sessionDifficulty,setSessionDifficulty]=useState<Difficulty>(1);
  const [sessionLabel,setSessionLabel]=useState("Persönlicher Plan");
  const shownAt=useRef(0);
  const current=tasks[index];
  const score=results.filter(Boolean).length;

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(PERSONAL_PREF_KEY);
      if(raw){
        const p=JSON.parse(raw) as Partial<Prefs>;
        if(Array.isArray(p.areas)&&p.areas.length)setAreas(p.areas);
        if(Array.isArray(p.topics))setTopics(p.topics);
        if(p.difficulty&&[1,2,3].includes(p.difficulty))setDifficulty(p.difficulty);
        if(typeof p.adaptive==="boolean")setAdaptive(p.adaptive);
        if(p.mode&&SESSION_MODES.some(m=>m.id===p.mode))setMode(p.mode);
        if(typeof p.weeklyTarget==="number"&&WEEK_TARGETS.includes(p.weeklyTarget))setWeeklyTarget(p.weeklyTarget);
      }
      const statRaw=localStorage.getItem(PERSONAL_STATS_KEY);
      if(statRaw){
        const parsed=JSON.parse(statRaw) as Partial<Stats>;
        setStats({
          sessions:parsed.sessions??0,
          lastAccuracy:parsed.lastAccuracy,
          bestAccuracy:parsed.bestAccuracy??0,
          history:Array.isArray(parsed.history)?parsed.history:[],
          skillStats:{...EMPTY_SKILLS,...(parsed.skillStats??{})},
        });
      }
    }catch{}
  },[]);

  useEffect(()=>{
    if(phase!=="preview"||!current?.previewMs)return;
    const timer=window.setTimeout(()=>{shownAt.current=performance.now();setPhase("question");},current.previewMs);
    return()=>window.clearTimeout(timer);
  },[phase,current]);

  useEffect(()=>{
    if(phase!=="question")return;
    const handler=(event:KeyboardEvent)=>{const i=Number(event.key)-1;if(i>=0&&i<4)answer(i);};
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  });

  const recommendedArea=useMemo<FocusArea>(()=>{
    const pool=areas.length?areas:FOCUS_AREAS.map(area=>area.id);
    return [...pool].sort((a,b)=>{
      const sa=stats.skillStats[a];
      const sb=stats.skillStats[b];
      if(sa.attempts===0&&sb.attempts>0)return -1;
      if(sb.attempts===0&&sa.attempts>0)return 1;
      return percent(sa)-percent(sb);
    })[0]??"math";
  },[areas,stats.skillStats]);
  const recommendedInfo=FOCUS_AREAS.find(area=>area.id===recommendedArea);
  const weekCount=sessionsThisWeek(stats.history);

  function savePrefs(next?:Partial<Prefs>){
    const p:Prefs={areas,topics,difficulty,adaptive,mode,weeklyTarget,...next};
    try{localStorage.setItem(PERSONAL_PREF_KEY,JSON.stringify(p));}catch{}
  }
  function toggleArea(area:FocusArea){setAreas(value=>value.includes(area)?(value.length===1?value:value.filter(x=>x!==area)):[...value,area]);}
  function toggleTopic(topic:FocusTopic){setTopics(value=>value.includes(topic)?value.filter(x=>x!==topic):[...value,topic]);}
  function applyGoal(goal:GoalPreset){setAreas(goal.areas);setTopics(goal.topics);savePrefs({areas:goal.areas,topics:goal.topics});}

  function start(kind:"personal"|"daily"|"recommended"){
    const modeConfig=SESSION_MODES.find(m=>m.id===mode)??SESSION_MODES[1];
    const level=kind==="daily"?2:(adaptive?adaptiveDifficulty(stats.lastAccuracy,difficulty):difficulty);
    const recommendedTopics=TOPICS[recommendedArea].map(item=>item.id);
    const next=kind==="daily"
      ?createDailyChallenge()
      :kind==="recommended"
        ?createPersonalSession([recommendedArea],recommendedTopics,level,modeConfig.length)
        :createPersonalSession(areas,topics,level,modeConfig.length);
    setTasks(next);
    setIndex(0);
    setSelected(null);
    setResults([]);
    setReactionTimes([]);
    setSessionDifficulty(level);
    setSessionLabel(kind==="daily"?"Tages-Challenge":kind==="recommended"?`Heute empfohlen · ${recommendedInfo?.title??"Fokus"}`:"Persönlicher Lernpfad");
    savePrefs();
    if(next[0]?.preview)setPhase("preview");else{shownAt.current=performance.now();setPhase("question");}
  }

  function answer(optionIndex:number){
    if(!current||phase!=="question")return;
    const correct=optionIndex===current.answer;
    setSelected(optionIndex);
    setResults(value=>[...value,correct]);
    if(current.area==="reaction")setReactionTimes(value=>[...value,Math.round(performance.now()-shownAt.current)]);
    setPhase("feedback");
  }

  function finish(){
    const accuracy=tasks.length?Math.round((results.filter(Boolean).length/tasks.length)*100):0;
    const nextSkills:SkillStats={
      math:{...stats.skillStats.math},words:{...stats.skillStats.words},translation:{...stats.skillStats.translation},
      attention:{...stats.skillStats.attention},reaction:{...stats.skillStats.reaction},memory:{...stats.skillStats.memory},
    };
    tasks.forEach((task,taskIndex)=>{
      const currentSkill=nextSkills[task.area];
      currentSkill.attempts+=1;
      if(results[taskIndex])currentSkill.correct+=1;
    });
    const today=new Date().toISOString().slice(0,10);
    const next:Stats={
      sessions:stats.sessions+1,
      lastAccuracy:accuracy,
      bestAccuracy:Math.max(stats.bestAccuracy,accuracy),
      history:[...stats.history,today].slice(-120),
      skillStats:nextSkills,
    };
    setStats(next);
    try{localStorage.setItem(PERSONAL_STATS_KEY,JSON.stringify(next));}catch{}
    setPhase("done");
  }

  function next(){
    if(index>=tasks.length-1){finish();return;}
    const n=index+1;
    setIndex(n);
    setSelected(null);
    if(tasks[n].preview)setPhase("preview");else{shownAt.current=performance.now();setPhase("question");}
  }

  const avgReaction=reactionTimes.length?Math.round(reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length):0;

  if(phase==="setup")return <section className={styles.trainer} aria-labelledby="focus-title"><div className={styles.setup}>
    <p className="eyebrow">Learning Expansion 3.3 · Personal Learning Paths</p>
    <h1 id="focus-title">Dein persönlicher Lernpfad.</h1>
    <p>Definiere ein Lernziel oder stelle deinen Plan frei zusammen. KogTrain priorisiert schwächere Bereiche, verfolgt dein Wochenziel und empfiehlt dir eine passende Session für heute.</p>
    <p><strong>{stats.sessions}</strong> Fokus-Sessions · Bestwert <strong>{stats.bestAccuracy}%</strong>{stats.lastAccuracy!==undefined?` · zuletzt ${stats.lastAccuracy}%`:""}</p>

    <h2>Lernziel wählen</h2>
    <div className={styles.areaGrid}>{GOALS.map(goal=><button key={goal.id} type="button" onClick={()=>applyGoal(goal)}><span className={styles.icon}>◎</span><strong>{goal.title}</strong><small>{goal.areas.map(area=>FOCUS_AREAS.find(item=>item.id===area)?.title).join(" · ")}</small><p>{goal.description}</p></button>)}</div>

    <h2>Heute empfohlen</h2>
    <div className={styles.stage} style={{minHeight:"unset",padding:"32px",alignItems:"flex-start",textAlign:"left"}}>
      <p className="eyebrow">Nächster sinnvoller Fokus</p>
      <h2 style={{marginBottom:12}}>{recommendedInfo?.title??"Mathematik"}</h2>
      <p>{stats.skillStats[recommendedArea].attempts?`Aktueller Trainingswert: ${percent(stats.skillStats[recommendedArea])}%. Dieser Bereich liegt innerhalb deines gewählten Plans aktuell am niedrigsten.`:"Für diesen Bereich liegen noch keine Trainingsdaten vor. Eine erste Session schafft die Grundlage für präzisere Empfehlungen."}</p>
      <button className="primaryButton" type="button" onClick={()=>start("recommended")}>Empfohlene Session starten</button>
    </div>

    <h2>Wochenrhythmus</h2>
    <p><strong>{weekCount}/{weeklyTarget}</strong> Sessions in dieser Woche. Kleine, regelmäßige Einheiten sind wichtiger als ein einzelner langer Block.</p>
    <div className={styles.levels}>{WEEK_TARGETS.map(target=><button key={target} type="button" className={weeklyTarget===target?styles.levelActive:""} onClick={()=>{setWeeklyTarget(target);savePrefs({weeklyTarget:target});}}>{target} Sessions / Woche</button>)}</div>

    <h2>Skill-Profil</h2>
    <div className={styles.areaGrid}>{FOCUS_AREAS.map(area=>{const skill=stats.skillStats[area.id];return <button key={area.id} type="button" className={areas.includes(area.id)?styles.active:""} onClick={()=>toggleArea(area.id)} aria-pressed={areas.includes(area.id)}><span className={styles.icon}>{area.icon}</span><strong>{area.title}</strong><small>{skill.attempts?`${percent(skill)}% · ${skill.attempts} Aufgaben`:"Noch untrainiert"}</small><p>{area.description}</p></button>})}</div>

    <h2>Gezielte Übungen</h2>
    {areas.map(area=><div key={area} style={{marginBottom:22}}><strong>{FOCUS_AREAS.find(x=>x.id===area)?.title}</strong><div className={styles.levels} style={{marginTop:10}}>{TOPICS[area].map(topic=><button key={topic.id} type="button" className={topics.includes(topic.id)?styles.levelActive:""} aria-pressed={topics.includes(topic.id)} onClick={()=>toggleTopic(topic.id)}>{topic.label}</button>)}</div></div>)}

    <div className={styles.controls}><div><span>Session-Länge</span><div className={styles.levels}>{SESSION_MODES.map(item=><button key={item.id} type="button" className={mode===item.id?styles.levelActive:""} onClick={()=>{setMode(item.id);savePrefs({mode:item.id});}}><strong>{item.label}</strong> · {item.note}</button>)}</div></div><div><span>Grundniveau</span><div className={styles.levels}>{([1,2,3] as Difficulty[]).map(level=><button key={level} type="button" className={difficulty===level?styles.levelActive:""} onClick={()=>{setDifficulty(level);savePrefs({difficulty:level});}}>{level===1?"Leicht":level===2?"Standard":"Challenge"}</button>)}</div><label style={{display:"flex",gap:10,alignItems:"center",marginTop:14,lineHeight:1.5}}><input type="checkbox" checked={adaptive} onChange={e=>{setAdaptive(e.target.checked);savePrefs({adaptive:e.target.checked});}}/> Adaptiv an letzte Leistung anpassen</label></div></div>

    <div className={styles.finishActions}><button className="primaryButton" type="button" onClick={()=>start("personal")}>Meinen Lernpfad starten</button><button className={styles.secondaryButton} type="button" onClick={()=>start("daily")}>Tages-Challenge · 8 Aufgaben</button></div>
  </div></section>;

  return <section className={styles.trainer} aria-live="polite"><div className={styles.sessionTop}><span>{sessionLabel}</span><span>Aufgabe {Math.min(index+1,tasks.length)}/{tasks.length}</span><span>{current?.topicLabel??current?.label??"Auswertung"}</span><span>Level {sessionDifficulty}</span></div>
    {phase==="preview"&&current?.preview&&<div className={styles.stage}><p className="eyebrow">Merkfähigkeit</p><h2>Präge dir die Folge ein.</h2><div className={styles.preview}>{current.preview.map((item,i)=><span key={`${item}-${i}`}>{item}</span>)}</div><p>Gleich wird die Folge ausgeblendet.</p></div>}
    {phase==="question"&&current&&<div className={styles.stage}><p className="eyebrow">{current.topicLabel??current.label}</p><h2>{current.prompt}</h2><div className={styles.detail}>{current.detail}</div><div className={styles.options}>{current.options.map((option,i)=><button key={`${option}-${i}`} type="button" onClick={()=>answer(i)}><kbd>{i+1}</kbd><span>{option}</span></button>)}</div><p>Tastatur: 1–4</p></div>}
    {phase==="feedback"&&current&&selected!==null&&<div className={styles.stage}><p className={`${styles.badge} ${selected===current.answer?styles.correct:styles.incorrect}`}>{selected===current.answer?"Richtig ✓":"Fast – weiter geht’s"}</p><h2>{selected===current.answer?"Sauber gelöst.":`Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p>{current.area==="reaction"&&<p>Reaktionszeit: <strong>{reactionTimes.at(-1)} ms</strong></p>}<button className="primaryButton" type="button" onClick={next}>{index===tasks.length-1?"Auswertung":"Nächste Aufgabe"}</button></div>}
    {phase==="done"&&<div className={styles.stage}><p className="eyebrow">Geschafft 🎉</p><h2>{score}/{tasks.length} Aufgaben richtig</h2><div className={styles.bigScore}>{Math.round((score/tasks.length)*100)}%</div><p>{avgReaction?`Ø Reaktionszeit: ${avgReaction} ms · `:""}{adaptive?"Die nächste Empfehlung berücksichtigt deine aktualisierten Skill-Werte.":"Dein Training bleibt auf dem gewählten Niveau."}</p><div className={styles.finishActions}><button className="primaryButton" type="button" onClick={()=>setPhase("setup")}>Zum Lernpfad</button><button className={styles.secondaryButton} type="button" onClick={()=>start("recommended")}>Heute empfohlen</button></div></div>}
  </section>;
}
