"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildWeeklyPlan, type PlannedTarget } from "@/lib/globalAdaptiveV2";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import styles from "./UnifiedTrainingJourney.module.css";

type Duration = 10 | 20 | 30;
type JourneyTrack = "adaptive" | "focus" | "labs" | "brainfit";

const DURATIONS: Array<{value:Duration;label:string;detail:string;slots:number}> = [
  {value:10,label:"10 Minuten",detail:"Kompakt & gezielt",slots:1},
  {value:20,label:"20 Minuten",detail:"Ausgewogener Coach-Mix",slots:2},
  {value:30,label:"30 Minuten",detail:"3 adaptive Schwerpunkte",slots:3},
];

const TRACKS: Array<{id:JourneyTrack;icon:string;title:string;description:string;href:string}> = [
  {id:"adaptive",icon:"✦",title:"Adaptive Coach Journey",description:"Der Coach wählt aus deinem echten Fortschritt automatisch die sinnvollsten nächsten Bereiche.",href:"/training/journey"},
  {id:"focus",icon:"◎",title:"Persönlicher Lernmix",description:"Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion und Merkfähigkeit kombinieren.",href:"/training/focus"},
  {id:"labs",icon:"◇",title:"Spezial-Labs",description:"Memory, Attention, Logic, Language und Visual gezielt vertiefen.",href:"/#training"},
  {id:"brainfit",icon:"▦",title:"Gehirnfit & Alltag",description:"Rätsel, Alltag, Sprache und Gedächtnis in ruhigem Tempo trainieren.",href:"/training/brain-fit"},
];

const strategyLabel = { coverage:"Abdeckung", improve:"Verbessern", stabilize:"Stabilisieren", stretch:"Fordern" } as const;
const difficultyLabel = {1:"Basis",2:"Aufbau",3:"Challenge"} as const;

export function UnifiedTrainingJourney(){
  const [duration,setDuration]=useState<Duration>(20);
  const [track,setTrack]=useState<JourneyTrack>("adaptive");
  const [snapshot,setSnapshot]=useState<ProgressSnapshot|null>(null);

  useEffect(()=>{ try{setSnapshot(getProgressSnapshot());}catch{setSnapshot(null);} },[]);

  const durationConfig=DURATIONS.find(item=>item.value===duration)!;
  const selected=TRACKS.find(item=>item.id===track)!;
  const todayProgress=snapshot ? Math.min(100,Math.round((snapshot.todaySessions/snapshot.dailyGoal)*100)) : 0;
  const adaptivePlan=useMemo<PlannedTarget[]>(()=>{
    if(!snapshot) return [];
    return buildWeeklyPlan(snapshot.labs.map(lab=>({
      id:`journey-${lab.id}`, label:lab.label, route:lab.href,
      sessions:lab.sessions, accuracy:lab.bestPercent,
    })),durationConfig.slots);
  },[snapshot,durationConfig.slots]);
  const sessionPlan=track==="adaptive"
    ? `${durationConfig.slots} Coach-${durationConfig.slots===1?"Schwerpunkt":"Schwerpunkte"} · aus deinem aktuellen Fortschritt`
    : `${durationConfig.slots} ${durationConfig.slots===1?"Schwerpunkt":"Schwerpunkte"} · frei gewählter Trainingsweg`;
  const startHref=track==="adaptive" ? (adaptivePlan[0]?.route ?? "/training/focus") : selected.href;

  return <section className={styles.shell} aria-labelledby="journey-title">
    <div className={styles.hero}>
      <div><p className="eyebrow">Adaptive Training Journey V4</p><h1 id="journey-title">Deine nächste Einheit wird aus deinem Fortschritt gebaut.</h1><p>Wähle 10, 20 oder 30 Minuten. Der Adaptive Coach kombiniert daraus bis zu drei Trainingsschwerpunkte und erklärt, warum sie jetzt sinnvoll sind.</p></div>
      <div className={styles.todayCard}><span>Heute</span><strong>{snapshot?`${snapshot.todaySessions}/${snapshot.dailyGoal}`:"–"} Sessions</strong><div className={styles.bar}><span style={{width:`${todayProgress}%`}}/></div><small>{todayProgress>=100?"Tagesziel erreicht – weitere Einheiten sind optional.":"Deine Journey berücksichtigt den aktuell gespeicherten Trainingsstand."}</small></div>
    </div>

    <div className={styles.controlGrid}>
      <section className={styles.panel} aria-labelledby="duration-title"><p className="eyebrow">1 · Zeit wählen</p><h2 id="duration-title">Wie lange möchtest du trainieren?</h2><div className={styles.durationGrid}>{DURATIONS.map(item=><button key={item.value} type="button" aria-pressed={duration===item.value} onClick={()=>setDuration(item.value)}><strong>{item.label}</strong><span>{item.detail}</span></button>)}</div></section>
      <section className={styles.panel} aria-labelledby="track-title"><p className="eyebrow">2 · Trainingslogik</p><h2 id="track-title">Coach oder freie Auswahl?</h2><div className={styles.trackGrid}>{TRACKS.map(item=><button key={item.id} type="button" aria-pressed={track===item.id} onClick={()=>setTrack(item.id)}><span className={styles.trackIcon} aria-hidden="true">{item.icon}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></button>)}</div></section>
    </div>

    {track==="adaptive" && <section className={styles.adaptivePlan} aria-labelledby="adaptive-plan-title">
      <div className={styles.planHead}><div><p className="eyebrow">3 · Dein Coach-Plan</p><h2 id="adaptive-plan-title">{duration} Minuten · {adaptivePlan.length || durationConfig.slots} adaptive {durationConfig.slots===1?"Station":"Stationen"}</h2></div><span>{snapshot?"Live aus Progress Insights":"Fortschritt wird geladen"}</span></div>
      <div className={styles.stationGrid}>{adaptivePlan.map((item,index)=><article key={item.id} className={styles.station}><b>0{index+1}</b><div><small>{strategyLabel[item.strategy]} · Evidenz {item.confidence}</small><strong>{item.label}</strong><p>{item.reason}</p><div className={styles.stationSignals}><span>Niveau {item.difficulty} · {difficultyLabel[item.difficulty]}</span><span>{item.sessions} Sessions</span><span>{item.sessions?`${item.accuracy}% Leistung`:"Noch untrainiert"}</span></div><Link href={item.route}>Station starten →</Link></div></article>)}</div>
    </section>}

    <section className={styles.startCard} aria-labelledby="start-title"><div><p className="eyebrow">{track==="adaptive"?"4":"3"} · Loslegen</p><h2 id="start-title">{track==="adaptive"?"Adaptive Journey starten":selected.title}</h2><p>{sessionPlan}. Nach jeder Station kannst du zum Journey-Plan zurückkehren und mit dem nächsten Schwerpunkt fortfahren.</p></div><div className={styles.startActions}><Link className={styles.primaryAction} href={startHref}>Jetzt {duration} Minuten starten →</Link><Link className={styles.secondaryAction} href="/#fortschritt">Fortschritt ansehen</Link></div></section>

    <div className={styles.quickGrid}><Link href="/training/focus"><span>◎</span><strong>Lernmix</strong><small>Fokusbereiche kombinieren</small></Link><Link href="/training/brain-fit"><span>▦</span><strong>Gehirnfit</strong><small>Rätsel & Alltag</small></Link><Link href="/#training"><span>◇</span><strong>Labs</strong><small>Vertieft trainieren</small></Link></div>
    <p className={styles.note}>Adaptive Journey V4 verwendet ausschließlich lokal gespeicherte Trainingswerte. Ohne ausreichende Evidenz priorisiert der Coach zunächst Abdeckung statt künstlich hohe Schwierigkeit.</p>
  </section>;
}
