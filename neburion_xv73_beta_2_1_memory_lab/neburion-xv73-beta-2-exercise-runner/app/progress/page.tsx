"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadResults } from "@/features/progress-engine/storage";
import { averageScore, groupProgress, recentWindow } from "@/features/progress-engine/analytics";
import type { TrainingResult } from "@/features/cognitive-engine/types";

const domainLabels: Record<string, string> = {
  gedaechtnis: "Gedächtnis",
  aufmerksamkeit: "Aufmerksamkeit",
  mathematik: "Mathematik",
  sprache: "Sprache",
  logik: "Logik"
};

export default function Progress() {
  const [items, setItems] = useState<TrainingResult[]>([]);
  useEffect(() => setItems(loadResults()), []);

  const domainRows = useMemo(() => groupProgress(items, "domain"), [items]);
  const memoryRows = useMemo(() => groupProgress(items.filter((item) => item.domain === "gedaechtnis"), "category"), [items]);
  const week = useMemo(() => recentWindow(items, 7), [items]);
  const totalSeconds = items.reduce((sum, item) => sum + item.durationSeconds, 0);

  return <AppShell sidebar>
    <div className="panel progress-hero">
      <span className="eyebrow">Progress Engine 2.0</span>
      <h1>Fortschritt wird konkret und vergleichbar.</h1>
      <p className="lead">Die App zeigt Ergebnisse nach Domäne, Gedächtniskategorie, Schwierigkeit und Zeitraum. Alle Daten bleiben lokal in diesem Browser.</p>
    </div>

    <div className="stat-grid">
      <div className="stat"><strong>{items.length}</strong><span>gespeicherte Aufgaben</span></div>
      <div className="stat"><strong>{averageScore(items)}%</strong><span>Gesamtdurchschnitt</span></div>
      <div className="stat"><strong>{averageScore(week)}%</strong><span>7-Tage-Durchschnitt</span></div>
      <div className="stat"><strong>{Math.round(totalSeconds / 60)} Min.</strong><span>Trainingszeit</span></div>
    </div>

    <div className="panel">
      <div className="section-head"><div><span className="eyebrow">Kategorien</span><h2>Fortschritt je Trainingsbereich</h2></div></div>
      {domainRows.length ? <div className="completion-table-wrap"><table className="progress-table">
        <thead><tr><th>Bereich</th><th>Aufgaben</th><th>Durchschnitt</th><th>Bestwert</th><th>Stufe</th></tr></thead>
        <tbody>{domainRows.map((row) => <tr key={row.label}><td>{domainLabels[row.label] || row.label}</td><td>{row.sessions}</td><td>{row.average}%</td><td>{row.best}%</td><td>{row.difficulty}</td></tr>)}</tbody>
      </table></div> : <p>Noch keine Ergebnisse gespeichert.</p>}
    </div>

    <div className="panel">
      <div className="section-head"><div><span className="eyebrow">Memory Lab</span><h2>Gedächtnisfortschritt nach Kategorie</h2></div></div>
      {memoryRows.length ? <div className="completion-table-wrap"><table className="progress-table">
        <thead><tr><th>Kategorie</th><th>Aufgaben</th><th>Durchschnitt</th><th>Bestwert</th><th>Trainingszeit</th></tr></thead>
        <tbody>{memoryRows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.sessions}</td><td>{row.average}%</td><td>{row.best}%</td><td>{Math.round(row.totalSeconds / 60)} Min.</td></tr>)}</tbody>
      </table></div> : <p>Starte eine Runde im Memory Lab, damit hier Wörter, Zahlen, Symbole, Reihenfolgen und Geschichten separat ausgewertet werden.</p>}
    </div>

    <div className="panel">
      <h2>Letzte Ergebnisse</h2>
      {items.length ? items.slice(0, 12).map((item) => <div className="recent-result" key={item.id}>
        <div><strong>{item.score}%</strong><span>{item.category || domainLabels[item.domain] || item.domain}</span></div>
        <small>{item.difficulty} · {new Date(item.createdAt).toLocaleString("de-AT")}</small>
      </div>) : <p>Noch keine Einheit gespeichert.</p>}
    </div>
  </AppShell>;
}
