"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { exerciseLibrary } from "@/data/exercises";
import { memoryExerciseLibrary } from "@/data/memory-exercises";
import type { Exercise } from "@/features/exercise-runner/types";
import { ExerciseRunner } from "@/components/training/ExerciseRunner";
import { clearActiveSession, loadActiveSession, loadPreferences, saveActiveSession } from "@/features/session-engine/storage";
import type { SessionMode, UserPreferences } from "@/features/session-engine/types";
import { loadResults } from "@/features/progress-engine/storage";
import { selectAdaptiveExercises, type AdaptiveDecision } from "@/features/adaptive-engine";
import { getDailyGeneratedExercises } from "@/features/exercise-generator";

const modes:{id:SessionMode;title:string;time:string;text:string;icon:string}[]=[
{id:"quick",title:"Schnelltraining",time:"≈ 5 Min.",text:"Drei kompakte Aufgaben für einen klaren Impuls.",icon:"⚡"},
{id:"daily",title:"Tagestraining",time:"≈ 10 Min.",text:"Eine ausgewogene Einheit mit mehreren Denkformen.",icon:"☀"},
{id:"focus",title:"Fokustraining",time:"Ein Bereich",text:"Konzentriere dich auf eine ausgewählte Trainingswelt.",icon:"◎"},
{id:"balanced",title:"Ausgewogen",time:"Mehrere Labs",text:"Abwechslung für ein vielseitiges Training.",icon:"◇"},
{id:"coach",title:"Coach-Empfehlung",time:"Adaptiv",text:"Die Plattform wählt einen sinnvollen nächsten Schwerpunkt.",icon:"✦"}
];

export function SessionStudio(){
 const [prefs,setPrefs]=useState<UserPreferences|null>(null); const [mode,setMode]=useState<SessionMode|null>(null); const [sessionExercises,setSessionExercises]=useState<Exercise[]>([]); const [resume,setResume]=useState(false); const [adaptiveDecision,setAdaptiveDecision]=useState<AdaptiveDecision|null>(null);
 useEffect(()=>{setPrefs(loadPreferences());setResume(Boolean(loadActiveSession()))},[]);
 const fullLibrary=useMemo(()=>[...exerciseLibrary,...memoryExerciseLibrary,...getDailyGeneratedExercises(25)],[]);
 const allowed=useMemo(()=>fullLibrary.filter(e=>!prefs||prefs.domains.includes(e.domain)),[fullLibrary,prefs]);
 function start(selectedMode:SessionMode){const count=selectedMode==="quick"?3:selectedMode==="daily"?6:selectedMode==="focus"?5:selectedMode==="balanced"?8:6;let pool=[...allowed];if(selectedMode==="focus"&&prefs?.domains[0])pool=pool.filter(e=>e.domain===prefs.domains[0]);
 let chosen:Exercise[]=[];
 if(selectedMode==="coach"){
  const adaptive=selectAdaptiveExercises(pool,loadResults(),prefs,count);chosen=adaptive.exercises;setAdaptiveDecision(adaptive.decision);
 } else {
  setAdaptiveDecision(null);const shuffled=[...pool].sort(()=>Math.random()-.5);const usedDomains=new Set<string>();
  if(selectedMode==="balanced"||selectedMode==="daily"){for(const item of shuffled){if(!usedDomains.has(item.domain)){chosen.push(item);usedDomains.add(item.domain)}if(chosen.length>=count)break}}
  for(const item of shuffled){if(chosen.length>=count)break;if(!chosen.some(x=>x.id===item.id))chosen.push(item)}
 }
 saveActiveSession({id:`session-${Date.now()}`,mode:selectedMode,exerciseIds:chosen.map(e=>e.id),startedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});setSessionExercises(chosen);setMode(selectedMode);setResume(false)}
 function resumeSession(){const active=loadActiveSession();if(!active)return;const chosen=active.exerciseIds.map(id=>fullLibrary.find(e=>e.id===id)).filter(Boolean) as Exercise[];setSessionExercises(chosen);setMode(active.mode);setResume(false)}
 if(mode&&sessionExercises.length)return <div>{adaptiveDecision&&<div className="adaptive-session-note"><strong>Adaptive Auswahl: {adaptiveDecision.targetDomain} · {adaptiveDecision.targetDifficulty}</strong><span>{adaptiveDecision.reason}</span></div>}<div className="session-context"><span className="eyebrow">Aktive Session · {modes.find(x=>x.id===mode)?.title}</span><button className="text-button" onClick={()=>{clearActiveSession();setMode(null);setSessionExercises([])}}>Session bewusst beenden</button></div><ExerciseRunner exercises={sessionExercises} sessionSize={sessionExercises.length} sessionLabel="Unified Adaptive Session 3.7" onSessionComplete={clearActiveSession}/></div>;
 return <>
  <section className="session-hero panel"><div><span className="eyebrow">Beta 3.7 · Content Expansion</span><h1>{prefs?`${prefs.name}, wie möchtest du heute trainieren?`:"Stelle deine Trainingseinheit zusammen."}</h1><p className="lead">Ein klarer Ablauf verbindet Vorbereitung, Aufgabe, Feedback und Abschluss zu einer durchgängigen Session.</p></div><Link className="btn btn-secondary" href="/onboarding">Einstellungen anpassen</Link></section>
  {resume&&<section className="resume-banner"><div><strong>Eine begonnene Session wartet auf dich.</strong><span>Du kannst fortsetzen oder bewusst neu starten.</span></div><div><button className="btn btn-primary" onClick={resumeSession}>Fortsetzen</button><button className="btn btn-secondary" onClick={()=>{clearActiveSession();setResume(false)}}>Verwerfen</button></div></section>}
  <section className="session-mode-grid">{modes.map(item=><button key={item.id} className="session-mode-card" onClick={()=>start(item.id)}><span className="session-mode-icon">{item.icon}</span><small>{item.time}</small><h2>{item.title}</h2><p>{item.text}</p><b>Session starten →</b></button>)}</section>
 </>;
}
