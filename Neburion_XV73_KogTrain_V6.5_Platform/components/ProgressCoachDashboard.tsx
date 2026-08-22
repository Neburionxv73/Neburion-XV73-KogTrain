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
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refresh]);

  return snapshot;
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

export function CoachHeroCard() {
  const snapshot = useProgressSnapshot();
  const lab = snapshot?.recommendation ?? null;

  if (!snapshot) {
    return (
      <aside className={styles.heroCoach} aria-label="Heutige Trainingsempfehlung">
        <p className="eyebrow">Coach 2.1</p>
        <strong>Fortschritt wird geladen</strong>
        <p>Lokale Trainingsdaten werden ausgewertet.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.heroCoach} aria-label="Heutige Trainingsempfehlung">
      <p className="eyebrow">Coach 2.1 · Heute empfohlen</p>
      <strong>{lab ? `${lab.label} Lab` : "Trainingsbasis aufbauen"}</strong>
      <p>{lab ? `${lab.accent} · Bestwert ${lab.bestPercent}%` : "Noch liegen auf dieser Domain keine abgeschlossenen Trainingsdaten vor. Starte mit einem beliebigen Lab."}</p>
      <div className={styles.heroProgress} aria-hidden="true"><span style={{ width: `${Math.min(100, (snapshot.todaySessions / snapshot.dailyGoal) * 100)}%` }} /></div>
      <small>{snapshot.todaySessions}/{snapshot.dailyGoal} Sessions im Tagesziel · Level {snapshot.level}</small>
      {lab ? <Link className={styles.heroLink} href={lab.href}>Empfohlenes Training öffnen →</Link> : <a className={styles.heroLink} href="#training">Trainingswelt wählen →</a>}
    </aside>
  );
}

export function ProgressCoachDashboard() {
  const snapshot = useProgressSnapshot();

  useEffect(() => {
    if (!snapshot || window.location.hash !== "#fortschritt") return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("fortschritt")?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [snapshot]);

  if (!snapshot) {
    return <section className={styles.dashboard} id="fortschritt"><p className="eyebrow">Progress & Coach 2.1</p><h2>Fortschritt wird geladen.</h2></section>;
  }

  const dailyPercent = Math.min(100, Math.round((snapshot.todaySessions / snapshot.dailyGoal) * 100));
  const weeklyPercent = Math.min(100, Math.round((snapshot.weekSessions / snapshot.weeklyGoal) * 100));
  const levelPercent = Math.min(100, Math.round((snapshot.xpInLevel / snapshot.xpToNextLevel) * 100));
  const maxDay = Math.max(1, ...snapshot.recentDays.map((day) => day.count));
  const lab = snapshot.recommendation;
  const strongest = snapshot.strongest;

  return (
    <section className={styles.dashboard} id="fortschritt" aria-labelledby="progress-2-title">
      <div className={styles.header}>
        <div>
          <p className="eyebrow">Progress & Coach 2.1</p>
          <h2 id="progress-2-title">Dein Training als zusammenhängendes System.</h2>
          <p>Die Auswertung verbindet alle fünf Labs, zeigt reale lokale Trainingsdaten und leitet daraus nachvollziehbare Empfehlungen ab. Keine medizinische Bewertung, keine versteckte Black-Box-Logik.</p>
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
        <article><span>Gesamtsessions</span><strong>{snapshot.totalSessions}</strong><small>über alle fünf Labs</small></article>
        <article><span>Ø Bestleistung</span><strong>{snapshot.hasTrainingData ? `${snapshot.averageBest}%` : "–"}</strong><small>{snapshot.hasTrainingData ? "aktive Trainingsbereiche" : "noch keine Trainingsbasis"}</small></article>
        <article><span>Serie</span><strong>{snapshot.streak}</strong><small>{snapshot.streak === 1 ? "Trainingstag" : "Trainingstage"}</small></article>
        <article><span>Wochenziel</span><strong>{snapshot.weekSessions}/{snapshot.weeklyGoal}</strong><small>{weeklyPercent}% erreicht</small></article>
      </div>

      <div className={styles.twoColumn}>
        <div className={styles.panel}>
          <div className={styles.panelHead}><div><p className="eyebrow">Fünf-Lab-Profil</p><h3>Stärken und Entwicklung</h3></div><span>{snapshot.hasTrainingData ? `${snapshot.averageBest}% Ø` : "noch offen"}</span></div>
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
          <div className={styles.panelHead}><div><p className="eyebrow">Coach Layer</p><h3>Heute sinnvoll</h3></div><span>erklärbar</span></div>
          <div className={styles.recommendation}>
            <span className={styles.recommendationLabel}>Nächster Fokus</span>
            {lab && strongest ? (
              <>
                <strong>{lab.label} Lab</strong>
                <p>{lab.sessions === 0
                  ? `Dieser Bereich wurde auf dieser Domain noch nicht trainiert. Dein aktuell stärkster erfasster Bereich ist ${strongest.label} mit ${strongest.bestPercent}%.`
                  : `Dieses Lab wird empfohlen, weil sein erfasster Bestwert mit ${lab.bestPercent}% aktuell unter deinem stärksten Bereich ${strongest.label} (${strongest.bestPercent}%) liegt.`}
                </p>
                <Link href={lab.href}>Training starten →</Link>
              </>
            ) : (
              <>
                <strong>Noch keine Trainingsbasis</strong>
                <p>Auf dieser Domain wurden noch keine abgeschlossenen Lab-Sessions gefunden. Wähle zuerst einen beliebigen Bereich; danach werden Coach-Empfehlungen aus echten Trainingswerten abgeleitet.</p>
                <a href="#training">Trainingswelt wählen →</a>
              </>
            )}
          </div>
          <div className={styles.goalBlock}>
            <div><span>Tagesziel</span><strong>{snapshot.todaySessions}/{snapshot.dailyGoal}</strong></div>
            <div className={styles.bar}><span style={{ width: `${dailyPercent}%` }} /></div>
            <small>{dailyPercent >= 100 ? "Tagesziel erreicht. Weitere Sessions sind optional." : snapshot.hasTrainingData ? "Noch eine kurze Session bringt dich dem Tagesziel näher." : "Deine erste Session startet die heutige Aktivitätsaufzeichnung."}</small>
          </div>
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
  );
}