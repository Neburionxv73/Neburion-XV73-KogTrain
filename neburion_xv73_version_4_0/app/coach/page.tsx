"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadResults } from "@/features/progress-engine/storage";
import { coachRecommendation } from "@/features/coach-engine/recommendation";
import { averageScore, recentWindow } from "@/features/progress-engine/analytics";
import type { TrainingResult } from "@/features/cognitive-engine/types";

export default function Coach() {
  const [results, setResults] = useState<TrainingResult[]>([]);
  useEffect(() => setResults(loadResults()), []);

  const recommendation = useMemo(() => coachRecommendation(results), [results]);
  const week = recentWindow(results, 7);
  const minutes = Math.round(week.reduce((sum, item) => sum + item.durationSeconds, 0) / 60);

  return <AppShell sidebar>
    <section className={`coach3-hero panel coach-tone-${recommendation.tone}`}>
      <div className="coach3-hero-copy">
        <div className="coach3-kicker"><span className="coach3-pulse" /> Strength Coach 3.8</div>
        <span className="eyebrow">Persönlich · transparent · lokal</span>
        <h1>{recommendation.title}</h1>
        <p className="lead">{recommendation.text}</p>
        <div className="actions">
          <Link className="btn btn-primary" href={recommendation.href}>Tagesfokus starten</Link>
          <Link className="btn btn-secondary" href="/progress">Fortschritt öffnen</Link>
        </div>
      </div>
      <div className="coach3-focus-orbit" aria-label={`Tagesfokus ${recommendation.domainLabel}`}>
        <span>HEUTE</span>
        <strong>{recommendation.domainLabel}</strong>
        <small>{recommendation.confidence}</small>
      </div>
    </section>

    <section className="coach3-stats" aria-label="Wochenübersicht">
      <article><span>Diese Woche</span><strong>{week.length}</strong><small>abgeschlossene Aufgaben</small></article>
      <article><span>Durchschnitt</span><strong>{averageScore(week)}%</strong><small>über alle Bereiche</small></article>
      <article><span>Trainingszeit</span><strong>{minutes} Min.</strong><small>bewusst investierte Zeit</small></article>
    </section>

    <section className="coach3-layout">
      <article className="panel coach3-plan">
        <div className="section-title-row"><div><span className="eyebrow">7-Minuten-Plan</span><h2>Dein nächster Trainingsfluss</h2></div><span className="coach3-badge">3 Schritte</span></div>
        <div className="coach3-plan-list">
          {recommendation.plan.map((step) => <Link href={step.href} key={step.order} className="coach3-plan-step">
            <span className="coach3-step-number">{String(step.order).padStart(2, "0")}</span>
            <span><strong>{step.title}</strong><small>{step.detail}</small></span>
            <b>{step.duration}</b>
          </Link>)}
        </div>
      </article>

      <aside className="panel coach3-strategy">
        <span className="eyebrow">Strategie des Tages</span>
        <div className="coach3-strategy-mark">✦</div>
        <h2>So wird die Runde wirksamer.</h2>
        <p>{recommendation.strategy}</p>
        <div className="coach3-reason"><strong>Warum diese Empfehlung?</strong><span>{recommendation.reason}</span></div>
      </aside>
    </section>

    <section className="dashboard-section">
      <div className="section-title-row"><div><span className="eyebrow">Stärken sichtbar machen</span><h2>Deine aktuellen Coach-Impulse</h2></div></div>
      <div className="coach3-insight-grid">
        {recommendation.insights.map((insight) => <article key={insight.title} className={`coach3-insight is-${insight.state}`}>
          <span className="coach3-insight-dot" />
          <h3>{insight.title}</h3>
          <p>{insight.text}</p>
        </article>)}
      </div>
    </section>

    <section className="panel coach3-week">
      <div><span className="eyebrow">Wochenrückblick</span><h2>Fortschritt würdigen und weiterbauen.</h2></div>
      <p>{recommendation.weekSummary}</p>
    </section>

    <section className="coach3-principles">
      <article><span>01</span><h3>Lokal ausgewertet</h3><p>Deine Ergebnisse bleiben im Browser und werden nicht als Diagnose interpretiert.</p></article>
      <article><span>02</span><h3>Nachvollziehbar</h3><p>Jeder Vorschlag zeigt, worauf er aufbaut und lässt dir die Entscheidung über Tempo und nächsten Schritt.</p></article>
      <article><span>03</span><h3>Abwechslungsreich</h3><p>Der Coach verbindet vertraute Stärken mit neuen, gut dosierten Entwicklungsimpulsen.</p></article>
    </section>
  </AppShell>;
}
