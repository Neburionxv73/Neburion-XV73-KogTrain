"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadResults } from "@/features/progress-engine/storage";
import { coachRecommendation } from "@/features/coach-engine/recommendation";
import type { TrainingResult } from "@/features/cognitive-engine/types";

export default function Coach() {
  const [results, setResults] = useState<TrainingResult[]>([]);
  useEffect(() => setResults(loadResults()), []);
  const recommendation = coachRecommendation(results);
  const target = recommendation.domain === "gedaechtnis" ? "/memory-lab" : "/training";

  return <AppShell sidebar>
    <div className="panel coach-hero">
      <span className="eyebrow">Coach Feedback 2.0</span>
      <h1>Empfehlungen mit sichtbarem Grund.</h1>
      <p className="lead">Der Coach nutzt ausschließlich lokal gespeicherte Trainingsergebnisse. Er erklärt, warum eine Übung empfohlen wird und welche Strategie beim nächsten Versuch helfen kann.</p>
    </div>

    <div className="panel coach-focus-card">
      <span className="eyebrow">Dein nächster sinnvoller Schritt</span>
      <h2>{recommendation.title}</h2>
      <p className="coach-text">{recommendation.text}</p>
      <div className="strategy-card"><strong>Strategie:</strong> {recommendation.strategy}</div>
      <div className="coach-reason"><strong>Warum diese Empfehlung?</strong><span>{recommendation.reason}</span></div>
      <Link className="btn btn-primary" href={target}>Empfohlenes Training starten</Link>
    </div>

    <div className="grid coach-grid">
      <div className="card"><div className="icon">1</div><h3>Ergebnisse lesen</h3><p>Trefferquote, Schwierigkeit, Kategorie und Häufigkeit bilden die Grundlage.</p></div>
      <div className="card"><div className="icon">2</div><h3>Muster erklären</h3><p>Jede Empfehlung nennt ihren konkreten Datenbezug.</p></div>
      <div className="card"><div className="icon">3</div><h3>Strategie anbieten</h3><p>Feedback soll beim nächsten Versuch praktisch nutzbar sein.</p></div>
      <div className="card"><div className="icon">4</div><h3>Nächsten Schritt wählen</h3><p>Kurze, realistische Einheiten statt unnötigem Druck.</p></div>
    </div>
  </AppShell>;
}
