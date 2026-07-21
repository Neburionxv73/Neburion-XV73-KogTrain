"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadResults } from "@/features/progress-engine/storage";
import { loadPreferences } from "@/features/session-engine/storage";
import { buildAdaptiveDecision } from "@/features/adaptive-engine";
import type { TrainingResult } from "@/features/cognitive-engine/types";
import type { UserPreferences } from "@/features/session-engine/types";

const labels: Record<string,string> = {gedaechtnis:"Gedächtnis",aufmerksamkeit:"Aufmerksamkeit",logik:"Logik",sprache:"Sprache",visuell:"Visuelle Wahrnehmung",mathematik:"Mathematik"};

export function AdaptiveStudio(){
 const [results,setResults]=useState<TrainingResult[]>([]); const [prefs,setPrefs]=useState<UserPreferences|null>(null);
 useEffect(()=>{setResults(loadResults());setPrefs(loadPreferences())},[]);
 const decision=useMemo(()=>buildAdaptiveDecision(results,prefs),[results,prefs]);
 return <>
  <section className="adaptive-hero panel"><div><span className="eyebrow">Beta 3.6 · Adaptive Intelligence</span><h1>Nachvollziehbar angepasst. Niemals willkürlich.</h1><p className="lead">Neburion wählt Übungen und Schwierigkeit vorsichtig anhand deiner lokalen Ergebnisse, Trainingsverteilung und persönlichen Einstellungen.</p></div><Link className="btn btn-primary" href="/session">Adaptive Session starten</Link></section>
  <section className="adaptive-decision panel"><div><span className="eyebrow">Aktuelle Empfehlung · Datengrundlage {decision.confidence}</span><h2>{labels[decision.targetDomain]} · {decision.targetDifficulty}</h2><p>{decision.reason}</p></div><div className="adaptive-orbit" aria-hidden="true"><span>{Math.min(99,Math.max(18,results.length*4))}%</span></div></section>
  <section className="adaptive-grid">
   <article className="panel"><span className="eyebrow">Signale</span><h2>Warum diese Auswahl?</h2><ul className="adaptive-signal-list">{decision.signals.map(signal=><li key={signal}>{signal}</li>)}</ul></article>
   <article className="panel"><span className="eyebrow">Schutzregel</span><h2>Sanfte Anpassung</h2><p>Eine höhere Stufe folgt erst nach mehreren stabilen Ergebnissen. Bei wiederholter Überforderung wird genau eine Stufe reduziert. Du behältst jederzeit die Kontrolle.</p></article>
   <article className="panel"><span className="eyebrow">Abwechslung</span><h2>Weniger Wiederholung</h2><p>Zuletzt absolvierte Übungen erhalten eine niedrigere Priorität. Kategorien werden gemischt, damit Training frisch und motivierend bleibt.</p></article>
  </section>
  <section className="panel adaptive-transparency"><span className="eyebrow">Transparenz</span><h2>Die adaptive Logik arbeitet lokal.</h2><p>Es werden keine medizinischen Aussagen getroffen. Die Auswahl ist eine Trainingshilfe, keine Diagnose. Ergebnisse und Präferenzen bleiben im Browser und können im Profil exportiert oder gelöscht werden.</p><div className="actions"><Link className="btn btn-secondary" href="/profile">Daten kontrollieren</Link><Link className="btn btn-primary" href="/session">Training öffnen</Link></div></section>
 </>;
}
