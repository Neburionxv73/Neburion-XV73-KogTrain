"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TrainingResult } from "@/features/cognitive-engine/types";
import { loadResults } from "@/features/progress-engine/storage";
import { buildMilestones, buildWeeklyGoals, strongestDomain } from "@/features/motivation-engine/motivation";

export function AchievementsStudio() {
  const [results, setResults] = useState<TrainingResult[]>([]);
  useEffect(() => setResults(loadResults()), []);
  const goals = useMemo(() => buildWeeklyGoals(results), [results]);
  const milestones = useMemo(() => buildMilestones(results), [results]);
  const strongest = useMemo(() => strongestDomain(results), [results]);
  const unlocked = milestones.filter((item) => item.unlocked).length;

  return <>
    <section className="achievement-hero panel">
      <div>
        <span className="eyebrow">Beta 3.3 · Motivation ohne Druck</span>
        <h1>Fortschritt, der sich nach dir richtet.</h1>
        <p className="lead">Wochenziele und Meilensteine machen Entwicklung sichtbar, ohne aus Lernen einen Wettbewerb zu machen.</p>
        <div className="actions"><Link className="btn btn-primary" href="/session">Nächste Session starten</Link><Link className="btn btn-secondary" href="/progress">Verlauf ansehen</Link></div>
      </div>
      <div className="achievement-orbit" aria-label={`${unlocked} von ${milestones.length} Meilensteinen erreicht`}>
        <span>MEILENSTEINE</span><strong>{unlocked}/{milestones.length}</strong><small>{strongest ? `Stärke: ${strongest.label} · ${strongest.average} %` : "Deine Entwicklung beginnt mit dem ersten Schritt."}</small>
      </div>
    </section>

    <section className="dashboard-section">
      <div className="section-title-row"><div><span className="eyebrow">Diese Woche</span><h2>Vier ruhige Ziele</h2></div><span className="motivation-note">Regelmäßigkeit vor Perfektion</span></div>
      <div className="weekly-goal-grid">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return <article className="weekly-goal" key={goal.id}>
            <div className="weekly-goal-head"><span>{goal.label}</span><strong>{goal.current}/{goal.target}</strong></div>
            <p>{goal.detail}</p><div className="weekly-track"><span style={{ width: `${percent}%` }} /></div><small>{percent}% · {goal.unit}</small>
          </article>;
        })}
      </div>
    </section>

    <section className="dashboard-section">
      <div className="section-title-row"><div><span className="eyebrow">Persönliche Entwicklung</span><h2>Meilensteine</h2></div><span className="motivation-note">Kein Zeitdruck · kein Vergleich</span></div>
      <div className="milestone-grid">
        {milestones.map((item) => {
          const percent = Math.min(100, Math.round((item.progress / item.target) * 100));
          return <article className={`milestone-card tone-${item.tone} ${item.unlocked ? "is-unlocked" : ""}`} key={item.id}>
            <div className="milestone-icon" aria-hidden="true">{item.icon}</div>
            <span className="milestone-state">{item.unlocked ? "Erreicht" : "In Entwicklung"}</span>
            <h3>{item.title}</h3><p>{item.description}</p>
            <div className="milestone-track"><span style={{ width: `${percent}%` }} /></div><small>{item.progress} von {item.target}</small>
          </article>;
        })}
      </div>
    </section>

    <section className="motivation-principle panel">
      <span className="eyebrow">Neburion-Prinzip</span><h2>Belohnung soll Orientierung geben, nicht Druck erzeugen.</h2>
      <p>Deshalb zeigen wir Fortschritt, Vielfalt und Kontinuität. Es gibt keine Rangliste, keine künstliche Verknappung und keinen Verlust bereits erreichter Meilensteine.</p>
    </section>
  </>;
}
