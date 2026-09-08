"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildWeeklyPlan, type PlannedTarget, type AdaptiveStrategy, type AdaptiveConfidence } from "@/lib/globalAdaptiveV2";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import { usePlatformLanguage, type PlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./UnifiedTrainingJourney.module.css";

type Duration = 10 | 20 | 30;
type JourneyTrack = "adaptive" | "focus" | "labs" | "brainfit";

const DURATIONS: Array<{value:Duration;de:string;en:string;deDetail:string;enDetail:string;slots:number}> = [
  {value:10,de:"10 Minuten",en:"10 minutes",deDetail:"Kompakt & gezielt",enDetail:"Compact & focused",slots:1},
  {value:20,de:"20 Minuten",en:"20 minutes",deDetail:"Ausgewogener Coach-Mix",enDetail:"Balanced coach mix",slots:2},
  {value:30,de:"30 Minuten",en:"30 minutes",deDetail:"3 adaptive Schwerpunkte",enDetail:"3 adaptive focus areas",slots:3},
];

const TRACKS = [
  {id:"adaptive" as const,icon:"✦",de:"Adaptive Coach Journey",en:"Adaptive Coach Journey",deDescription:"Der Coach wählt aus deinem echten Fortschritt automatisch die sinnvollsten nächsten Bereiche.",enDescription:"The coach automatically selects the most useful next areas from your real progress.",href:"/training/journey"},
  {id:"focus" as const,icon:"◎",de:"Persönlicher Lernmix",en:"Personal learning mix",deDescription:"Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion und Merkfähigkeit kombinieren.",enDescription:"Combine mathematics, language, English, attention, reaction and memory.",href:"/training/focus"},
  {id:"labs" as const,icon:"◇",de:"Spezial-Labs",en:"Specialized labs",deDescription:"Memory, Attention, Logic, Language und Visual gezielt vertiefen.",enDescription:"Train Memory, Attention, Logic, Language and Visual in depth.",href:"/#training"},
  {id:"brainfit" as const,icon:"▦",de:"Gehirnfit & Alltag",en:"BrainFit & everyday skills",deDescription:"Rätsel, Alltag, Sprache und Gedächtnis in ruhigem Tempo trainieren.",enDescription:"Train puzzles, everyday skills, language and memory at a calm pace.",href:"/training/brain-fit"},
];

const strategyLabel: Record<AdaptiveStrategy,{de:string;en:string}> = { coverage:{de:"Abdeckung",en:"Coverage"}, improve:{de:"Verbessern",en:"Improve"}, stabilize:{de:"Stabilisieren",en:"Stabilize"}, stretch:{de:"Fordern",en:"Stretch"} };
const difficultyLabel: Record<1|2|3,{de:string;en:string}> = {1:{de:"Basis",en:"Base"},2:{de:"Aufbau",en:"Build"},3:{de:"Challenge",en:"Challenge"}};
const confidenceLabel: Record<AdaptiveConfidence,{de:string;en:string}> = {low:{de:"niedrig",en:"low"},medium:{de:"mittel",en:"medium"},high:{de:"hoch",en:"high"}};

function localReason(item: PlannedTarget, language: PlatformLanguage) {
  if (language === "de") return item.reason;
  if (item.strategy === "coverage") return item.sessions === 0 ? "Not trained yet — build broad coverage first." : "Evidence is still limited — another run will create a more reliable baseline.";
  if (item.strategy === "improve") return item.confidence === "low" ? "Currently weaker, but evidence is still limited — check it directly and stabilize." : "Several results show the greatest development potential here.";
  if (item.strategy === "stabilize") return "Solid intermediate level — consolidate it with more sessions before difficulty increases.";
  return "Stable area — continue with a controlled increase in difficulty.";
}

function localLabLabel(item: PlannedTarget, language: PlatformLanguage) {
  if (language === "de") return item.label;
  const id = item.id.toLowerCase();
  const route = item.route.toLowerCase();
  if (id.includes("memory") || route.includes("/memory")) return "Memory";
  if (id.includes("attention") || route.includes("/attention")) return "Attention";
  if (id.includes("logic") || route.includes("/logic")) return "Logic";
  if (id.includes("language") || route.includes("/language")) return "Language";
  if (id.includes("visual") || route.includes("/visual")) return "Visual";
  if (id.includes("brain") || route.includes("brain-fit")) return "BrainFit";
  return item.label;
}

export function UnifiedTrainingJourney(){
  const { language, pick } = usePlatformLanguage();
  const [duration,setDuration]=useState<Duration>(20);
  const [track,setTrack]=useState<JourneyTrack>("adaptive");
  const [snapshot,setSnapshot]=useState<ProgressSnapshot|null>(null);

  useEffect(()=>{ try{setSnapshot(getProgressSnapshot());}catch{setSnapshot(null);} },[]);

  const durationConfig=DURATIONS.find(item=>item.value===duration)!;
  const selected=TRACKS.find(item=>item.id===track)!;
  const todayProgress=snapshot ? Math.min(100,Math.round((snapshot.todaySessions/snapshot.dailyGoal)*100)) : 0;
  const adaptivePlan=useMemo<PlannedTarget[]>(()=>{
    if(!snapshot) return [];
    return buildWeeklyPlan(snapshot.labs.map(lab=>({ id:`journey-${lab.id}`, label:lab.label, route:lab.href, sessions:lab.sessions, accuracy:lab.bestPercent })),durationConfig.slots);
  },[snapshot,durationConfig.slots]);
  const sessionPlan=track==="adaptive"
    ? pick(`${durationConfig.slots} Coach-${durationConfig.slots===1?"Schwerpunkt":"Schwerpunkte"} · aus deinem aktuellen Fortschritt`, `${durationConfig.slots} coach ${durationConfig.slots===1?"focus area":"focus areas"} · based on your current progress`)
    : pick(`${durationConfig.slots} ${durationConfig.slots===1?"Schwerpunkt":"Schwerpunkte"} · frei gewählter Trainingsweg`, `${durationConfig.slots} ${durationConfig.slots===1?"focus area":"focus areas"} · freely selected training path`);
  const startHref=track==="adaptive" ? (adaptivePlan[0]?.route ?? "/training/focus") : selected.href;

  return <section className={styles.shell} aria-labelledby="journey-title">
    <div className={styles.hero}>
      <div><p className="eyebrow">Adaptive Training Journey V4</p><h1 id="journey-title">{pick("Deine nächste Einheit wird aus deinem Fortschritt gebaut.", "Your next session is built from your progress.")}</h1><p>{pick("Wähle 10, 20 oder 30 Minuten. Der Adaptive Coach kombiniert daraus bis zu drei Trainingsschwerpunkte und erklärt, warum sie jetzt sinnvoll sind.", "Choose 10, 20 or 30 minutes. The Adaptive Coach combines up to three training focus areas and explains why they make sense now.")}</p></div>
      <div className={styles.todayCard}><span>{pick("Heute", "Today")}</span><strong>{snapshot?`${snapshot.todaySessions}/${snapshot.dailyGoal}`:"–"} Sessions</strong><div className={styles.bar}><span style={{width:`${todayProgress}%`}}/></div><small>{todayProgress>=100?pick("Tagesziel erreicht – weitere Einheiten sind optional.", "Daily goal reached — additional sessions are optional."):pick("Deine Journey berücksichtigt den aktuell gespeicherten Trainingsstand.", "Your journey uses your currently stored training progress.")}</small></div>
    </div>

    <div className={styles.controlGrid}>
      <section className={styles.panel} aria-labelledby="duration-title"><p className="eyebrow">1 · {pick("Zeit wählen", "Choose time")}</p><h2 id="duration-title">{pick("Wie lange möchtest du trainieren?", "How long would you like to train?")}</h2><div className={styles.durationGrid}>{DURATIONS.map(item=><button key={item.value} type="button" aria-pressed={duration===item.value} onClick={()=>setDuration(item.value)}><strong>{language==="en"?item.en:item.de}</strong><span>{language==="en"?item.enDetail:item.deDetail}</span></button>)}</div></section>
      <section className={styles.panel} aria-labelledby="track-title"><p className="eyebrow">2 · {pick("Trainingslogik", "Training logic")}</p><h2 id="track-title">{pick("Coach oder freie Auswahl?", "Coach or free selection?")}</h2><div className={styles.trackGrid}>{TRACKS.map(item=><button key={item.id} type="button" aria-pressed={track===item.id} onClick={()=>setTrack(item.id)}><span className={styles.trackIcon} aria-hidden="true">{item.icon}</span><span><strong>{language==="en"?item.en:item.de}</strong><small>{language==="en"?item.enDescription:item.deDescription}</small></span></button>)}</div></section>
    </div>

    {track==="adaptive" && <section className={styles.adaptivePlan} aria-labelledby="adaptive-plan-title">
      <div className={styles.planHead}><div><p className="eyebrow">3 · {pick("Dein Coach-Plan", "Your coach plan")}</p><h2 id="adaptive-plan-title">{duration} {pick("Minuten", "minutes")} · {adaptivePlan.length || durationConfig.slots} {pick(`adaptive ${durationConfig.slots===1?"Station":"Stationen"}`, `adaptive ${durationConfig.slots===1?"station":"stations"}`)}</h2></div><span>{snapshot?pick("Live aus Progress Insights", "Live from Progress Insights"):pick("Fortschritt wird geladen", "Loading progress")}</span></div>
      <div className={styles.stationGrid}>{adaptivePlan.map((item,index)=><article key={item.id} className={styles.station}><b>0{index+1}</b><div><small>{strategyLabel[item.strategy][language]} · {pick("Evidenz", "Evidence")} {confidenceLabel[item.confidence][language]}</small><strong>{localLabLabel(item,language)}</strong><p>{localReason(item,language)}</p><div className={styles.stationSignals}><span>{pick("Niveau", "Level")} {item.difficulty} · {difficultyLabel[item.difficulty][language]}</span><span>{item.sessions} Sessions</span><span>{item.sessions?`${item.accuracy}% ${pick("Leistung", "performance")}`:pick("Noch untrainiert", "Not trained yet")}</span></div><Link href={item.route}>{pick("Station starten →", "Start station →")}</Link></div></article>)}</div>
    </section>}

    <section className={styles.startCard} aria-labelledby="start-title"><div><p className="eyebrow">{track==="adaptive"?"4":"3"} · {pick("Loslegen", "Get started")}</p><h2 id="start-title">{track==="adaptive"?pick("Adaptive Journey starten", "Start Adaptive Journey"):(language==="en"?selected.en:selected.de)}</h2><p>{sessionPlan}. {pick("Nach jeder Station kannst du zum Journey-Plan zurückkehren und mit dem nächsten Schwerpunkt fortfahren.", "After each station, you can return to the journey plan and continue with the next focus area.")}</p></div><div className={styles.startActions}><Link className={styles.primaryAction} href={startHref}>{pick(`Jetzt ${duration} Minuten starten →`, `Start ${duration} minutes now →`)}</Link><Link className={styles.secondaryAction} href="/#fortschritt">{pick("Fortschritt ansehen", "View progress")}</Link></div></section>

    <div className={styles.quickGrid}><Link href="/training/focus"><span>◎</span><strong>{pick("Lernmix", "Learning mix")}</strong><small>{pick("Fokusbereiche kombinieren", "Combine focus areas")}</small></Link><Link href="/training/brain-fit"><span>▦</span><strong>{pick("Gehirnfit", "BrainFit")}</strong><small>{pick("Rätsel & Alltag", "Puzzles & everyday skills")}</small></Link><Link href="/#training"><span>◇</span><strong>Labs</strong><small>{pick("Vertieft trainieren", "Train in depth")}</small></Link></div>
    <p className={styles.note}>{pick("Adaptive Journey V4 verwendet ausschließlich lokal gespeicherte Trainingswerte. Ohne ausreichende Evidenz priorisiert der Coach zunächst Abdeckung statt künstlich hohe Schwierigkeit.", "Adaptive Journey V4 uses only locally stored training values. Without sufficient evidence, the coach prioritizes coverage instead of artificially high difficulty.")}</p>
  </section>;
}
