"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, TrainingDomain } from "@/features/cognitive-engine/types";
import type { SessionDuration, TrainingGoal } from "@/features/session-engine/types";
import { loadPreferences, savePreferences } from "@/features/session-engine/storage";

const domains: {id: TrainingDomain; label: string; icon: string}[] = [
  {id:"gedaechtnis",label:"Gedächtnis",icon:"🧠"},{id:"aufmerksamkeit",label:"Aufmerksamkeit",icon:"🎯"},
  {id:"logik",label:"Logik",icon:"◇"},{id:"sprache",label:"Sprache",icon:"Aa"},{id:"visuell",label:"Visuell",icon:"◉"}
];

export function OnboardingFlow(){
  const router=useRouter(); const [step,setStep]=useState(1); const [name,setName]=useState("Edi");
  const [goal,setGoal]=useState<TrainingGoal>("ausgewogen"); const [duration,setDuration]=useState<SessionDuration>(10);
  const [selected,setSelected]=useState<TrainingDomain[]>(["gedaechtnis","aufmerksamkeit","logik","sprache","visuell"]);
  const [difficulty,setDifficulty]=useState<Difficulty>("leicht"); const [focusMode,setFocusMode]=useState(false);
  useEffect(()=>{const stored=loadPreferences();if(stored){setName(stored.name);setGoal(stored.goal);setDuration(stored.duration);setSelected(stored.domains);setDifficulty(stored.difficulty);setFocusMode(stored.focusMode)}},[]);
  function toggle(id:TrainingDomain){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
  function finish(){savePreferences({name:name.trim()||"Edi",goal,duration,domains:selected.length?selected:["gedaechtnis"],difficulty,focusMode,completedAt:new Date().toISOString()});if(focusMode)document.documentElement.dataset.readingMode="focus";router.push("/session")}
  return <div className="onboarding-shell panel">
    <div className="onboarding-progress"><span style={{width:`${step*25}%`}}/></div>
    <span className="eyebrow">Beta 3.1 · Einrichtung {step}/4</span>
    {step===1&&<section><h1>Willkommen bei deinem persönlichen Training.</h1><p className="lead">Vier kurze Schritte reichen. Du kannst später alles ändern.</p><label className="field-label">Wie dürfen wir dich begrüßen?<input value={name} onChange={e=>setName(e.target.value)} /></label><div className="choice-grid compact">{(["ausgewogen","alltag","fokus","gedaechtnis"] as TrainingGoal[]).map(x=><button key={x} className={`setup-choice ${goal===x?"is-selected":""}`} onClick={()=>setGoal(x)}>{x==="ausgewogen"?"Ausgewogen":x==="alltag"?"Fit für den Alltag":x==="fokus"?"Mehr Fokus":"Gedächtnis stärken"}</button>)}</div></section>}
    {step===2&&<section><h1>Welche Trainingswelten passen zu dir?</h1><p className="lead">Wähle einen oder mehrere Bereiche. Abwechslung bleibt jederzeit möglich.</p><div className="domain-select-grid">{domains.map(d=><button key={d.id} onClick={()=>toggle(d.id)} className={`domain-select ${selected.includes(d.id)?"is-selected":""}`}><span>{d.icon}</span><strong>{d.label}</strong><small>{selected.includes(d.id)?"Ausgewählt":"Hinzufügen"}</small></button>)}</div></section>}
    {step===3&&<section><h1>Bestimme Dauer und Einstieg.</h1><div className="setup-columns"><div><h3>Trainingsdauer</h3><div className="choice-grid compact">{([5,10,15] as SessionDuration[]).map(x=><button key={x} className={`setup-choice ${duration===x?"is-selected":""}`} onClick={()=>setDuration(x)}>{x} Minuten</button>)}</div></div><div><h3>Schwierigkeit</h3><select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="einstieg">Einstieg</option><option value="leicht">Leicht</option><option value="mittel">Mittel</option><option value="schwer">Schwer</option><option value="profi">Profi</option></select></div></div></section>}
    {step===4&&<section><h1>Dein Training ist bereit.</h1><div className="privacy-note"><strong>Lokal und transparent</strong><p>Deine Einstellungen und Trainingsergebnisse bleiben in diesem Browser. Neburion XV73 stellt keine medizinische Diagnose.</p></div><label className="focus-check"><input type="checkbox" checked={focusMode} onChange={e=>setFocusMode(e.target.checked)}/><span><strong>Fokusansicht aktivieren</strong><small>Ruhigere Hintergründe und stärkere Abgrenzung.</small></span></label></section>}
    <div className="onboarding-actions">{step>1&&<button className="btn btn-secondary" onClick={()=>setStep(s=>s-1)}>Zurück</button>}<button className="btn btn-primary" onClick={()=>step<4?setStep(s=>s+1):finish()}>{step<4?"Weiter":"Training zusammenstellen"}</button></div>
  </div>
}
