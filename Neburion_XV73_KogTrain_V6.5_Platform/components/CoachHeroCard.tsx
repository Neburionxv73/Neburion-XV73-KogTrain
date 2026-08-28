"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import styles from "./ProgressCoachDashboard.module.css";

export function CoachHeroCard() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const refresh = useCallback(() => {
    try { setSnapshot(getProgressSnapshot()); } catch { setSnapshot(null); }
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

    if (idleWindow.requestIdleCallback) idleId = idleWindow.requestIdleCallback(refresh, { timeout: 500 });
    else timeoutId = window.setTimeout(refresh, 120);

    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  if (!snapshot) {
    return (
      <aside className={styles.heroCoach} aria-label="Heutiger Trainingsstand" aria-live="polite">
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
      <Link prefetch={false} className={styles.heroLink} href="/training/journey">Training öffnen →</Link>
    </aside>
  );
}
