"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import styles from "./ProgressCoachDashboard.module.css";

function useProgressSnapshot() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const refresh = useCallback(() => {
    try { setSnapshot(getProgressSnapshot()); } catch { setSnapshot(null); }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return snapshot;
}

function ProgressAnchor() {
  return <div id="fortschritt" className={styles.progressAnchor} aria-hidden="true" />;
}

function StorageNotice({ snapshot }: { snapshot: ProgressSnapshot }) {
  if (snapshot.storageScope !== "preview") return null;
  return (
    <div className={styles.storageNotice} role="note">
      <strong>Preview-Speicher aktiv</strong>
      <p>Diese Vercel-Preview-Adresse besitzt einen eigenen Browserspeicher. Für dauerhaft sichtbare Fortschrittswerte immer dieselbe stabile KogTrain-Domain verwenden.</p>
      <small>Aktueller Speicherbereich: {snapshot.storageHost}</small>
    </div>
  );
}

function formatLastSession(value: string | null): string {
  if (!value) return "–";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? "Heute" : new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit" }).format(date);
}

export function CoachHeroCard() {
  const snapshot = useProgressSnapshot();

  if (!snapshot) {
    return (
      <aside className={styles.heroCoach} aria-label="Heutiger Trainingsstand">
        <p className="eyebrow">Heute</p>
        <strong>Fortschritt wird geladen</strong>
        <p>Lokale Trainingsdaten werden ausgewertet.</p>
      </aside>
    );
  }

  const dailyPercent = Math.min(100, Math.round((snapshot.todaySessions / snapshot.dailyGoal) * 100));

  return (
    <aside className={styles.heroCoach} aria-label="Heutiger Trainingsstand">
      <p className="eyebrow">Heute im Blick</p>
      <strong>{snapshot.todaySessions}/{snapshot.dailyGoal} Sessions</strong>
      <p>{dailyPercent >= 100 ? "Tagesziel erreicht. Weitere Einheiten sind freiwillig." : "Dein Tagesziel bleibt bewusst einfach und übersichtlich."}</p>
      <div className={styles.heroProgress} aria-hidden="true"><span style={{ width: `${dailyPercent}%` }} /></div>
      <small>Level {snapshot.level} · {snapshot.xp} XP gesamt</small>
      <Link className={styles.heroLink} href="/training/journey">Training öffnen →</Link>
    </aside>
  );
}

export function ProgressCoachDashboard() {
  const snapshot = useProgressSnapshot();

  if (!snapshot) {
    return (
      <>
        <ProgressAnchor />
        <section className={styles.dashboard}>
          <p className="eyebrow">Fortschritt</p>
          <h2>Fortschritt wird geladen.</h2>
        </section>
      </>
    );
  }

  const dailyPercent = Math.min(100, Math.round((snapshot.todaySessions / snapshot.dailyGoal) * 100));
  const weeklyPercent = Math.min(100, Math.round((snapshot.weekSessions / snapshot.weeklyGoal) * 100));
  const levelPercent = Math.min(100, Math.round((snapshot.xpInLevel / snapshot.xpToNextLevel) * 100));
  const maxDay = Math.max(1, ...snapshot.recentDays.map((day) => day.count));

  return (
    <>
      <ProgressAnchor />
      <section className={styles.dashboard} aria-labelledby="progress-2-title">
        <div className={styles.header}>
          <div>
            <p className="eyebrow">Fortschritt & Übersicht</p>
            <h2 id="progress-2-title">Dein Training klar im Blick.</h2>
            <p>Hier siehst du deine tatsächlich gespeicherten Trainingswerte aus Spezial-Labs und Gehirnfit & Alltag. Ohne Bewertung und ohne automatische Empfehlungen.</p>
          </div>
          <div className={styles.levelCard}>
            <span>Level {snapshot.level}</span>
            <strong>{snapshot.xp} XP</strong>
            <div className={styles.bar}><span style={{ width: `${levelPercent}%` }} /></div>
            <small>{snapshot.xpInLevel}/{snapshot.xpToNextLevel} XP bis zum nächsten Level</small>
          </div>
        </div>

        <StorageNotice snapshot={snapshot} />

        <div className={styles.metricGrid}>
          <article><span>Gesamtsessions</span><strong>{snapshot.totalSessions}</strong><small>Labs + Gehirnfit</small></article>
          <article><span>Trainierte Bereiche</span><strong>{snapshot.trainedAreas}/6</strong><small>mit gespeicherten Sessions</small></article>
          <article><span>Ø Leistungswert</span><strong>{snapshot.hasTrainingData ? `${snapshot.averageBest}%` : "–"}</strong><small>{snapshot.hasTrainingData ? "aktive Trainingsbereiche" : "noch keine Trainingsbasis"}</small></article>
          <article><span>Aktive Tage</span><strong>{snapshot.activeDays7}/7</strong><small>in den letzten 7 Tagen</small></article>
          <article><span>Serie</span><strong>{snapshot.streak}</strong><small>{snapshot.streak === 1 ? "Trainingstag" : "Trainingstage"}</small></article>
          <article><span>Letzte Session</span><strong>{formatLastSession(snapshot.lastSessionAt)}</strong><small>{snapshot.averageSessionsPerActiveDay ? `Ø ${snapshot.averageSessionsPerActiveDay} Sessions je aktivem Tag` : "noch keine Aktivität"}</small></article>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.panel}>
            <div className={styles.panelHead}><div><p className="eyebrow">Gesamtprofil</p><h3>Bereiche und Entwicklung</h3></div><span>{snapshot.hasTrainingData ? `${snapshot.averageBest}% Ø` : "noch offen"}</span></div>
            <div className={styles.labList}>
              {snapshot.labs.map((item) => (
                <Link href={item.href} className={styles.labRow} key={item.id}>
                  <div><strong>{item.label}</strong><small>{item.sessions} Sessions · {item.accent}</small></div>
                  <div className={styles.labValue}><span>{item.sessions ? `${item.bestPercent}%` : "–"}</span><div className={styles.bar}><i style={{ width: `${item.sessions ? item.bestPercent : 0}%` }} /></div></div>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.panel} id="coach">
            <div className={styles.panelHead}><div><p className="eyebrow">Trainingsziele</p><h3>Heute und diese Woche</h3></div><span>übersichtlich</span></div>
            <div className={styles.goalBlock}>
              <div><span>Tagesziel</span><strong>{snapshot.todaySessions}/{snapshot.dailyGoal}</strong></div>
              <div className={styles.bar}><span style={{ width: `${dailyPercent}%` }} /></div>
              <small>{dailyPercent >= 100 ? "Tagesziel erreicht. Weitere Sessions sind optional." : "Noch eine kurze Session bringt dich dem Tagesziel näher."}</small>
            </div>
            <div className={styles.goalBlock}>
              <div><span>Wochenziel</span><strong>{snapshot.weekSessions}/{snapshot.weeklyGoal}</strong></div>
              <div className={styles.bar}><span style={{ width: `${weeklyPercent}%` }} /></div>
              <small>{weeklyPercent >= 100 ? "Wochenziel erreicht." : `${weeklyPercent}% des Wochenziels sind geschafft.`}</small>
            </div>
            <Link className={styles.heroLink} href="/training/journey">Training starten →</Link>
          </div>
        </div>

        <div className={styles.activityPanel}>
          <div><p className="eyebrow">Letzte 7 Tage</p><h3>Trainingsrhythmus</h3></div>
          {snapshot.activityCount > 0 ? (
            <div className={styles.activityChart} aria-label="Sessions der letzten sieben Tage">
              {snapshot.recentDays.map((day) => (
                <div key={day.label} className={styles.dayColumn}><div className={styles.dayTrack}><span style={{ height: `${Math.max(day.count ? 18 : 4, (day.count / maxDay) * 100)}%` }} /></div><strong>{day.count}</strong><small>{day.label}</small></div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyActivity}>
              <strong>Noch keine datierte Aktivität</strong>
              <p>Der 7-Tage-Verlauf beginnt mit der ersten Session, die auf diesem Speicherbereich abgeschlossen wird.</p>
            </div>
          )}
        </div>

        <p className={styles.notice}>Aktivitätsserie und Tages-/Wochenverlauf werden lokal pro Browser-Domain gespeichert. Vercel-Preview-URLs besitzen technisch getrennte Speicherbereiche; deshalb für dauerhafte Fortschrittswerte dieselbe stabile KogTrain-Adresse verwenden.</p>
      </section>
    </>
  );
}
