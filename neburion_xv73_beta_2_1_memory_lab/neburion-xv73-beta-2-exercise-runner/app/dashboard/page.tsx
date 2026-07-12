"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadResults } from "@/features/progress-engine/storage";
import { coachRecommendation } from "@/features/coach-engine/recommendation";
import { averageScore, recentWindow } from "@/features/progress-engine/analytics";
import type { TrainingResult } from "@/features/cognitive-engine/types";

export default function Dashboard() {
  const [results, setResults] = useState<TrainingResult[]>([]);
  useEffect(() => setResults(loadResults()), []);
  const coach = coachRecommendation(results);
  const week = recentWindow(results, 7);
  const target = coach.domain === "gedaechtnis" ? "/memory-lab" : "/training";

  return <AppShell sidebar>
    <div className="panel dashboard-hero">
      <span className="eyebrow">Beta 2.1 · Lernsystem</span>
      <h1>Dein heutiger Trainingskern.</h1>
      <p className="lead">Starte mit einer kurzen Einheit, arbeite bewusst und nutze die Auswertung als konkrete Orientierung für den nächsten Schritt.</p>
      <div className="actions"><Link className="btn btn-primary" href="/memory-lab">Memory Lab starten</Link><Link className="btn btn-secondary" href="/training">Gemischtes Training</Link></div>
    </div>

    <div className="stat-grid">
      <div className="stat"><strong>{results.length}</strong><span>gespeicherte Aufgaben</span></div>
      <div className="stat"><strong>{averageScore(results)}%</strong><span>Gesamtdurchschnitt</span></div>
      <div className="stat"><strong>{week.length}</strong><span>Aufgaben in 7 Tagen</span></div>
      <div className="stat"><strong>25</strong><span>Memory-Lab-Übungen</span></div>
    </div>

    <div className="grid dashboard-labs">
      <Link href="/memory-lab" className="card lab-card">
        <div className="icon">🧠</div><h3>Memory Lab</h3><p>Wörter, Zahlen, Symbole, Reihenfolgen und Geschichten mit echter Ausblendphase.</p><span className="status-chip">5 Stufen · 25 Übungen</span>
      </Link>
      <Link href="/training" className="card lab-card">
        <div className="icon">⚙️</div><h3>Exercise Runner 2.0</h3><p>Gemischte Aufgaben mit einheitlicher Bewertung, Teilpunkten und Strategiehinweisen.</p><span className="status-chip">zentrale Engine</span>
      </Link>
      <Link href="/progress" className="card lab-card">
        <div className="icon">📊</div><h3>Progress Engine 2.0</h3><p>Konkrete Tabellen je Trainingsbereich und Gedächtniskategorie.</p><span className="status-chip">lokale Auswertung</span>
      </Link>
      <Link href="/coach" className="card lab-card">
        <div className="icon">🤝</div><h3>Coach Feedback 2.0</h3><p>Empfehlung, Strategie und nachvollziehbarer Grund aus deinen Ergebnissen.</p><span className="status-chip">transparent</span>
      </Link>
    </div>

    <div className="panel coach-focus-card">
      <span className="eyebrow">Coach Engine</span>
      <h2>{coach.title}</h2>
      <p>{coach.text}</p>
      <div className="strategy-card"><strong>Strategie:</strong> {coach.strategy}</div>
      <Link className="btn btn-primary" href={target}>Empfehlung starten</Link>
    </div>
  </AppShell>;
}
