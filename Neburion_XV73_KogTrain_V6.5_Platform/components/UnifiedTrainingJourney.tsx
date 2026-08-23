"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProgressSnapshot, type LabProgress, type ProgressSnapshot } from "@/lib/progress";
import styles from "./UnifiedTrainingJourney.module.css";

type Duration = 5 | 10 | 15;
type JourneyTrack = "focus" | "labs" | "brainfit" | "coach";

const DURATIONS: Array<{value:Duration;label:string;detail:string}> = [
  {value:5,label:"5 Minuten",detail:"Kurz & fokussiert"},
  {value:10,label:"10 Minuten",detail:"Ausgewogene Einheit"},
  {value:15,label:"15 Minuten",detail:"Vertieft trainieren"},
];

const TRACKS: Array<{id:JourneyTrack;icon:string;title:string;description:string;href:string}> = [
  {id:"focus",icon:"◎",title:"Persönlicher Lernmix",description:"Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion und Merkfähigkeit kombinieren.",href:"/training/focus"},
  {id:"labs",icon:"◇",title:"Spezial-Labs",description:"Memory, Attention, Logic, Language und Visual gezielt vertiefen.",href:"/#training"},
  {id:"brainfit",icon:"✦",title:"Gehirnfit & Alltag",description:"Rätsel, Alltag, Sprache und Gedächtnis in ruhigem Tempo trainieren.",href:"/training/brain-fit"},
  {id:"coach",icon:"↗",title:"Coach-Empfehlung",description:"Mit dem Bereich starten, der anhand deiner lokalen Trainingswerte heute sinnvoll ist.",href:"/#coach"},
];

function displayName(item:LabProgress|null){
  if(!item) return "Trainingsbasis aufbauen";
  return item.id === "brainFit" ? item.label : `${item.label} Lab`;
}

export function UnifiedTrainingJourney(){
  const [duration,setDuration]=useState<Duration>(10);
  const [track,setTrack]=useState<JourneyTrack>("coach");
  const [snapshot,setSnapshot]=useState<ProgressSnapshot|null>(null);

  useEffect(()=>{
    try{setSnapshot(getProgressSnapshot());}catch{setSnapshot(null);}
  },[]);

  const recommended=snapshot?.recommendation ?? null;
  const selected=TRACKS.find(item=>item.id===track)!;
  const startHref=track==="coach" && recommended ? recommended.href : selected.href;
  const todayProgress=snapshot ? Math.min(100,Math.round((snapshot.todaySessions/snapshot.dailyGoal)*100)) : 0;
  const sessionPlan=useMemo(()=>{
    if(duration===5) return "1 Kernbereich · kompakte Runde";
    if(duration===10) return "2 Schwerpunkte · ausgewogener Mix";
    return "3 Schwerpunkte · vertiefte Einheit";
  },[duration]);

  return <section className={styles.shell} aria-labelledby="journey-title">
    <div className={styles.hero}>
      <div>
        <p className="eyebrow">Learning Expansion 3.8 · Unified Training Journey</p>
        <h1 id="journey-title">Heute trainieren – ohne Umwege.</h1>
        <p>Wähle Dauer und Trainingsweg. KogTrain führt dich von einem zentralen Startpunkt direkt in die passende Einheit und danach wieder zurück in deinen Fortschritt.</p>
      </div>
      <div className={styles.todayCard}>
        <span>Heute</span>
        <strong>{snapshot?`${snapshot.todaySessions}/${snapshot.dailyGoal}`:"–"} Sessions</strong>
        <div className={styles.bar}><span style={{width:`${todayProgress}%`}}/></div>
        <small>{todayProgress>=100?"Tagesziel erreicht – weitere Einheiten sind optional.":"Noch eine Einheit bringt dich deinem Tagesziel näher."}</small>
      </div>
    </div>

    <div className={styles.controlGrid}>
      <section className={styles.panel} aria-labelledby="duration-title">
        <p className="eyebrow">1 · Zeit wählen</p>
        <h2 id="duration-title">Wie lange möchtest du trainieren?</h2>
        <div className={styles.durationGrid}>
          {DURATIONS.map(item=><button key={item.value} type="button" aria-pressed={duration===item.value} onClick={()=>setDuration(item.value)}><strong>{item.label}</strong><span>{item.detail}</span></button>)}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="track-title">
        <p className="eyebrow">2 · Weg wählen</p>
        <h2 id="track-title">Was passt heute zu dir?</h2>
        <div className={styles.trackGrid}>
          {TRACKS.map(item=><button key={item.id} type="button" aria-pressed={track===item.id} onClick={()=>setTrack(item.id)}><span className={styles.trackIcon} aria-hidden="true">{item.icon}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></button>)}
        </div>
      </section>
    </div>

    <section className={styles.startCard} aria-labelledby="start-title">
      <div>
        <p className="eyebrow">3 · Session starten</p>
        <h2 id="start-title">{track==="coach"?displayName(recommended):selected.title}</h2>
        <p>{sessionPlan}. {track==="coach"&&recommended?`Empfohlen aufgrund deines aktuellen lokalen Profils: ${recommended.accent}.`:"Du kannst nach der Einheit direkt zu Progress & Coach zurückkehren."}</p>
      </div>
      <div className={styles.startActions}>
        <Link className={styles.primaryAction} href={startHref}>Jetzt {duration} Minuten starten →</Link>
        <Link className={styles.secondaryAction} href="/#fortschritt">Fortschritt ansehen</Link>
      </div>
    </section>

    <div className={styles.quickGrid}>
      <Link href="/training/focus"><span>◎</span><strong>Lernmix</strong><small>Fokusbereiche kombinieren</small></Link>
      <Link href="/training/brain-fit"><span>✦</span><strong>Gehirnfit</strong><small>Rätsel & Alltag</small></Link>
      <Link href="/#training"><span>◇</span><strong>Labs</strong><small>Vertieft trainieren</small></Link>
      <Link href="/#coach"><span>↗</span><strong>Coach</strong><small>Empfehlung öffnen</small></Link>
    </div>

    <p className={styles.note}>Die Journey speichert keine zusätzlichen personenbezogenen Daten. Sie verwendet ausschließlich die bereits lokal im Browser vorhandenen Trainingswerte.</p>
  </section>;
}
