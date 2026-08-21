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

export function CoachHeroCard() {
  const snapshot = useProgressSnapshot();
  const lab = snapshot?.recommendation;

  return (
    <aside className={styles.heroCoach} aria-label="Heutige Trainingsempfehlung">
      <p className="eyebrow">Coach 2.0 · Heute empfohlen</p>
      <strong>{lab ? `${lab.label} Lab` : "Training starten"}</strong>
      <p>{lab ? `${lab.accent} · Bestwert ${lab.bestPercent}%` : "Nach der ersten Session wird deine Empfehlung personalisiert."}</p>
      <div className={styles.heroProgress} aria-hidden="true"><span style={{ width: `${snapshot ? Math.min(100, (snapshot.todaySessions / snapshot.dailyGoal) * 100) : 0}%` }} /></div>
      <small>{snapshot ? `${snapshot.todaySessions}/${snapshot.dailyGoal} Sessions im Tagesziel · Level ${snapshot.level}` : "Lokale Trainingsdaten werden ausgewertet."}</small>
      {lab && <Link className={styles.heroLink} href={lab.href}>Empfohlenes Training öffnen →</Link>}
    </aside>
  );
}

export function ProgressCoachDashboard() {
  const snapshot = useProgressSnapshot();

  if (!snapshot) {
    return <section className={styles.dashboard} id="fortschritt"><p className="eyebrow">Progress & Coach 2.0</p><h2>Fortschritt wird geladen.</h2></section>;
  }

  const dailyPercent = Math.min(100, Math.round((snapshot.todaySessions / snapshot.dailyGoal) * 100));
  const weeklyPercent = Math.min(100, Math.round((snapshot.weekSessions / snapshot.weeklyGoal) * 100));
  const levelPercent = Math.min(100, Math.round((snapshot.xpInLevel / snapshot.xpToNextLevel) * 100));
  const maxDay = Math.max(1, ...snapshot.recentDays.map((day) => day.count));

  return (
    <section className={styles.dashboard} id="fortschritt" aria-labelledby="progress-2-title">
      <div className={styles.header}>
        <div>
          <p className="eyebrow">Progress & Coach 2.0</p>
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

      <div className={styles.metricGrid}>
        <article><span>Gesamtsessions</span><strong>{snapshot.totalSessions}</strong><small>über alle fünf Labs</small></article>
        <article><span>Ø Bestleistung</span><strong>{snapshot.averageBest}%</strong><small>aktive Trainingsbereiche</small></article>
        <article><span>Serie</span><strong>{snapshot.streak}</strong><small>{snapshot.streak === 1 ? "Trainingstag" : "Trainingstage"}</small></article>
        <article><span>Wochenziel</span><strong>{snapshot.weekSessions}/{snapshot.weeklyGoal}</strong><small>{weeklyPercent}% erreicht</small></article>
      </div>

      <div className={styles.twoColumn}>
        <div className={styles.panel}>
          <div className={styles.panelHead}><div><p className="eyebrow">Fünf-Lab-Profil</p><h3>Stärken und Entwicklung</h3></div><span>{snapshot.averageBest}% Ø</span></div>
          <div className={styles.labList}>
            {snapshot.labs.map((lab) => (
              <Link href={lab.href} className={styles.labRow} key={lab.id}>
                <div><strong>{lab.label}</strong><small>{lab.sessions} Sessions · {lab.accent}</small></div>
                <div className={styles.labValue}><span>{lab.bestPercent}%</span><div className={styles.bar}><i style={{ width: `${lab.bestPercent}%` }} /></div></div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.panel} id="coach">
          <div className={styles.panelHead}><div><p className="eyebrow">Coach Layer</p><h3>Heute sinnvoll</h3></div><span>erklärbar</span></div>
          <div className={styles.recommendation}>
            <span className={styles.recommendationLabel}>Nächster Fokus</span>
            <strong>{snapshot.recommendation.label} Lab</strong>
            <p>Dieses Lab wird empfohlen, weil sein aktueller Bestwert mit {snapshot.recommendation.bestPercent}% unter deinem stärksten Bereich {snapshot.strongest.label} ({snapshot.strongest.bestPercent}%) liegt bzw. dort bislang weniger Training vorliegt.</p>
            <Link href={snapshot.recommendation.href}>Training starten →</Link>
          </div>
          <div className={styles.goalBlock}>
            <div><span>Tagesziel</span><strong>{snapshot.todaySessions}/{snapshot.dailyGoal}</strong></div>
            <div className={styles.bar}><span style={{ width: `${dailyPercent}%` }} /></div>
            <small>{dailyPercent >= 100 ? "Tagesziel erreicht. Weitere Sessions sind optional." : "Noch eine kurze Session bringt dich dem Tagesziel näher."}</small>
          </div>
        </div>
      </div>

      <div className={styles.activityPanel}>
        <div><p className="eyebrow">Letzte 7 Tage</p><h3>Trainingsrhythmus</h3></div>
        <div className={styles.activityChart} aria-label="Sessions der letzten sieben Tage">
          {snapshot.recentDays.map((day) => (
            <div key={day.label} className={styles.dayColumn}><div className={styles.dayTrack}><span style={{ height: `${Math.max(day.count ? 18 : 4, (day.count / maxDay) * 100)}%` }} /></div><strong>{day.count}</strong><small>{day.label}</small></div>
          ))}
        </div>
      </div>

      <p className={styles.notice}>Aktivitätsserie und Tages-/Wochenverlauf werden ab Progress & Coach 2.0 lokal protokolliert. Frühere Lab-Sessions fließen in Gesamtwerte und Bestleistungen ein, erhalten aber rückwirkend kein erfundenes Datum.</p>
    </section>
  );
}
