"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadResults } from "@/features/progress-engine/storage";
import {
  activityCalendar,
  averageScore,
  currentStreak,
  dailyProgress,
  groupProgress,
  personalRecords,
  recentWindow,
  scoreTrend
} from "@/features/progress-engine/analytics";
import type { TrainingResult } from "@/features/cognitive-engine/types";

const domainLabels: Record<string, string> = {
  gedaechtnis: "Gedächtnis",
  aufmerksamkeit: "Aufmerksamkeit",
  mathematik: "Mathematik",
  sprache: "Sprache",
  logik: "Logik",
  visuell: "Visuell"
};

const domainIcons: Record<string, string> = {
  gedaechtnis: "◌",
  aufmerksamkeit: "◎",
  mathematik: "∑",
  sprache: "Aa",
  logik: "◇",
  visuell: "◈"
};

function LineChart({ values }: { values: ReturnType<typeof dailyProgress> }) {
  const width = 720;
  const height = 230;
  const padding = 28;
  const max = Math.max(100, ...values.map((item) => item.average));
  const points = values.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, values.length - 1);
    const y = height - padding - (item.average / max) * (height - padding * 2);
    return { x, y, ...item };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");

  return <div className="progress-chart-wrap" aria-label="Ergebnisverlauf der letzten sieben Tage">
    <svg className="progress-line-chart" viewBox={`0 0 ${width} ${height}`} role="img">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((value) => {
        const y = height - padding - (value / max) * (height - padding * 2);
        return <g key={value}><line x1={padding} x2={width - padding} y1={y} y2={y} className="chart-grid-line"/><text x="2" y={y + 4} className="chart-axis-label">{value}</text></g>;
      })}
      {points.length > 1 && <path d={`${path} L${points.at(-1)?.x},${height - padding} L${points[0].x},${height - padding} Z`} fill="url(#lineFill)" />}
      <path d={path} className="chart-main-line" />
      {points.map((point) => <g key={point.key}><circle cx={point.x} cy={point.y} r="6" className="chart-point"/><text x={point.x} y={height - 5} textAnchor="middle" className="chart-day-label">{point.shortLabel}</text></g>)}
    </svg>
  </div>;
}

export default function Progress() {
  const [items, setItems] = useState<TrainingResult[]>([]);
  useEffect(() => setItems(loadResults()), []);

  const domainRows = useMemo(() => groupProgress(items, "domain"), [items]);
  const week = useMemo(() => recentWindow(items, 7), [items]);
  const weekSeries = useMemo(() => dailyProgress(items, 7), [items]);
  const heatmap = useMemo(() => activityCalendar(items, 28), [items]);
  const records = useMemo(() => personalRecords(items), [items]);
  const trend = useMemo(() => scoreTrend(items), [items]);
  const streak = useMemo(() => currentStreak(items), [items]);
  const totalSeconds = items.reduce((sum, item) => sum + item.durationSeconds, 0);
  const bestScore = items.length ? Math.max(...items.map((item) => item.score)) : 0;
  const strongest = [...domainRows].sort((a, b) => b.average - a.average)[0];

  return <AppShell sidebar>
    <section className="panel progress3-hero">
      <div>
        <span className="eyebrow">Progress Engine 3.0</span>
        <h1>Dein Fortschritt bekommt eine klare Geschichte.</h1>
        <p className="lead">Wochenverlauf, Aktivität, persönliche Rekorde und Stärkenprofile werden ruhig, verständlich und ohne Leistungsdruck zusammengeführt.</p>
      </div>
      <div className="progress3-orbit" aria-hidden="true"><span>{averageScore(items)}%</span><small>Gesamtbalance</small></div>
    </section>

    <section className="progress3-kpis" aria-label="Wichtigste Trainingswerte">
      <article><span>Gesamt</span><strong>{items.length}</strong><small>abgeschlossene Aufgaben</small></article>
      <article><span>Diese Woche</span><strong>{week.length}</strong><small>{Math.round(week.reduce((sum, item) => sum + item.durationSeconds, 0) / 60)} Trainingsminuten</small></article>
      <article><span>Serie</span><strong>{streak} Tage</strong><small>aktive Trainingsroutine</small></article>
      <article><span>Bestwert</span><strong>{bestScore}%</strong><small>persönlicher Spitzenwert</small></article>
    </section>

    <section className="progress3-grid">
      <article className="panel progress3-chart-card">
        <div className="progress3-section-head">
          <div><span className="eyebrow">7-Tage-Verlauf</span><h2>Ergebnisbalance</h2></div>
          <div className={`trend-badge trend-${trend.direction}`}>{trend.value > 0 ? "+" : ""}{trend.value}% <span>zur Vorwoche</span></div>
        </div>
        {items.length ? <LineChart values={weekSeries} /> : <div className="progress-empty-visual"><span>⌁</span><strong>Deine Kurve entsteht mit dem ersten Training.</strong><p>Alle Labs fließen automatisch in diese Übersicht ein.</p></div>}
      </article>

      <article className="panel progress3-focus-card">
        <span className="eyebrow">Aktueller Fokus</span>
        <h2>{strongest ? domainLabels[strongest.label] || strongest.label : "Dein Profil wartet"}</h2>
        <div className="focus-score"><strong>{strongest?.average || 0}%</strong><span>stärkster Bereich</span></div>
        <p>{strongest ? `Mit ${strongest.sessions} absolvierten Aufgaben zeigt dieser Bereich aktuell deine stabilste Leistung.` : "Trainiere in einem Lab, damit Neburion dein persönliches Stärkenprofil aufbauen kann."}</p>
        <div className="focus-meter"><span style={{ width: `${strongest?.average || 0}%` }} /></div>
      </article>
    </section>

    <section className="panel progress3-domains">
      <div className="progress3-section-head"><div><span className="eyebrow">Stärkenprofil</span><h2>Alle Trainingswelten im Vergleich</h2></div><small>lokal ausgewertet</small></div>
      <div className="domain-profile-grid">
        {(domainRows.length ? domainRows : ["gedaechtnis", "aufmerksamkeit", "logik", "sprache", "visuell"].map((label) => ({ label, sessions: 0, average: 0, best: 0, totalSeconds: 0, difficulty: "–" }))).map((row) => <article className="domain-profile" key={row.label}>
          <div className="domain-profile-top"><span className="domain-symbol">{domainIcons[row.label] || "◇"}</span><small>{row.sessions} Aufgaben</small></div>
          <h3>{domainLabels[row.label] || row.label}</h3>
          <div className="domain-score"><strong>{row.average}%</strong><span>Ø Ergebnis</span></div>
          <div className="domain-bar"><span style={{ width: `${row.average}%` }} /></div>
          <footer><span>Bestwert {row.best}%</span><span>{Math.round(row.totalSeconds / 60)} Min.</span></footer>
        </article>)}
      </div>
    </section>

    <section className="progress3-grid progress3-lower">
      <article className="panel">
        <div className="progress3-section-head"><div><span className="eyebrow">Aktivitätsrhythmus</span><h2>Die letzten 28 Tage</h2></div></div>
        <div className="activity-heatmap" aria-label="Aktivität der letzten 28 Tage">
          {heatmap.map((day) => <div key={day.key} className={`activity-cell intensity-${day.intensity}`} title={`${day.label}: ${day.sessions} Aufgaben`}><span>{day.sessions || ""}</span></div>)}
        </div>
        <div className="heatmap-legend"><span>ruhig</span><i className="intensity-0"/><i className="intensity-1"/><i className="intensity-2"/><i className="intensity-3"/><i className="intensity-4"/><span>aktiv</span></div>
      </article>

      <article className="panel">
        <div className="progress3-section-head"><div><span className="eyebrow">Persönliche Rekorde</span><h2>Deine besonderen Momente</h2></div></div>
        <div className="record-stack">
          {records.length ? records.map((record, index) => <div className="record-item" key={record.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{record.value}</strong><small>{record.title} · {record.detail}</small></div></div>) : <div className="progress-empty-copy"><strong>Noch keine Rekorde gespeichert.</strong><p>Deine besten Werte erscheinen automatisch nach den ersten Übungen.</p></div>}
        </div>
      </article>
    </section>

    <section className="panel progress3-recent">
      <div className="progress3-section-head"><div><span className="eyebrow">Trainingsjournal</span><h2>Letzte Ergebnisse</h2></div><small>{Math.round(totalSeconds / 60)} Minuten gesamt</small></div>
      {items.length ? <div className="recent-timeline">{items.slice(0, 10).map((item) => <article key={item.id}>
        <div className="timeline-score">{item.score}%</div>
        <div><strong>{item.category || domainLabels[item.domain] || item.domain}</strong><span>{domainLabels[item.domain]} · {item.difficulty}</span></div>
        <time>{new Date(item.createdAt).toLocaleDateString("de-AT", { day: "2-digit", month: "short" })}</time>
      </article>)}</div> : <div className="progress-empty-copy"><strong>Dein Trainingsjournal ist noch leer.</strong><p>Nach deiner ersten Übung erscheint hier eine klare chronologische Übersicht.</p></div>}
    </section>
  </AppShell>;
}
