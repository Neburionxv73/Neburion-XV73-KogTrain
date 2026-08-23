"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import styles from "./UnifiedTrainingJourney.module.css";

type Duration = 5 | 10 | 15;
type JourneyTrack = "focus" | "labs" | "brainfit";

const DURATIONS: Array<{value:Duration;label:string;detail:string}> = [
  {value:5,label:"5 Minuten",detail:"Kurz & fokussiert"},
  {value:10,label:"10 Minuten",detail:"Ausgewogene Einheit"},
  {value:15,label:"15 Minuten",detail:"Vertieft trainieren"},
];

const TRACKS: Array<{id:JourneyTrack;icon:string;title:string;description:string;href:string}> = [
  {id:"focus",icon:"◎",title:"Persönlicher Lernmix",description:"Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion und Merkfähigkeit kombinieren.",href:"/training/focus"},
  {id:"labs",icon:"◇",title:"Spezial-Labs",description:"Memory, Attention, Logic, Language und Visual gezielt vertiefen.",href:"/#training"},
  {id:"brainfit",icon:"✦",title:"Gehirnfit & Alltag",description:"Rätsel, Alltag, Sprache und Gedächtnis in ruhigem Tempo trainieren.",href:"/training/brain-fit"},
];

export function UnifiedTrainingJourney(){
  const [duration,setDuration]=useState<Duration>(10);
  const [track,setTrack]=useState<JourneyTrack>("focus");
  const [snapshot,setSnapshot]=useState<ProgressSnapshot|null>(null);

  useEffect(()=>{
    try{setSnapshot(getProgressSnapshot());}catch{setSnapshot(null);}
  },[]);

  const selected=TRACKS.find(item=>item.id===track)!;
  const todayProgress=snapshot ? Math.min(100,Math.round((snapshot.todaySessions/snapshot.dailyGoal)*100)) : 0;
  const sessionPlan=useMemo(()=>{
    if(duration===5) return "1 Kernbereich · kompakte Runde";
    if(duration===10) return "2 Schwerpunkte · ausgewogener Mix";
    return "3 Schwerpunkte · vertiefte Einheit";
  },[duration]);

  return <section className={styles.shell} aria-labelledby="journey-title">
    <div className={styles.hero}>
      <div>
        <p className="eyebrow">Heute trainieren</p>
        <h1 id="journey-title">Ohne Umwege in deine nächste Einheit.</h1>
        <p>Wähle Dauer und Trainingsweg. Danach geht es direkt in die passende Einheit und von dort wieder zurück zu deinem Fortschritt.</p>
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
        <h2 id="track-title">Was möchtest du trainieren?</h2>
        <div className={styles.trackGrid}>
          {TRACKS.map(item=><button key={item.id} type="button" aria-pressed={track===item.id} onClick={()=>setTrack(item.id)}><span className={styles.trackIcon} aria-hidden="true">{item.icon}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></button>)}
        </div>
      </section>
    </div>

    <section className={styles.startCard} aria-labelledby="start-title">
      <div>
        <p className="eyebrow">3 · Loslegen</p>
        <h2 id="start-title">{selected.title}</h2>
        <p>{sessionPlan}. Nach der Einheit kannst du direkt deinen Fortschritt ansehen.</p>
      </div>
      <div className={styles.startActions}>
        <Link className={styles.primaryAction} href={selected.href}>Jetzt {duration} Minuten starten →</Link>
        <Link className={styles.secondaryAction} href="/#fortschritt">Fortschritt ansehen</Link>
      </div>
    </section>

    <div className={styles.quickGrid}>
      <Link href="/training/focus"><span>◎</span><strong>Lernmix</strong><small>Fokusbereiche kombinieren</small></Link>
      <Link href="/training/brain-fit"><span>✦</span><strong>Gehirnfit</strong><small>Rätsel & Alltag</small></Link>
      <Link href="/#training"><span>◇</span><strong>Labs</strong><small>Vertieft trainieren</small></Link>
    </div>

    <p className={styles.note}>Die Auswahl nutzt nur die Trainingswerte, die bereits lokal in diesem Browser gespeichert sind.</p>
  </section>;
}
