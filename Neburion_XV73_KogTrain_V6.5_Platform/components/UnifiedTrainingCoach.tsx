"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAIN_FIT_AREAS, BRAIN_FIT_STORAGE_KEY, areaAverage, mergeBrainFitStats } from "@/lib/brainFit";
import { PERSONAL_STATS_KEY } from "@/lib/personalTraining";
import {
  buildWeeklyPlan,
  deriveUnifiedProgress,
  UNIFIED_PROGRESS_KEY,
  type AdaptiveConfidence,
  type AdaptiveStrategy,
  type AdaptiveTarget,
  type UnifiedProgress,
} from "@/lib/globalAdaptiveV2";
import styles from "./UnifiedTrainingCoach.module.css";

type PersonalStatsShape = {
  skillStats?: Record<string, { attempts?: number; correct?: number }>;
  sessions?: number;
};

const focusLabels: Record<string, { label: string; route: string }> = {
  math: { label: "Mathematik", route: "/training/focus" },
  words: { label: "Wort & Sprache", route: "/training/language" },
  translation: { label: "Deutsch ↔ Englisch", route: "/training/focus" },
  attention: { label: "Aufmerksamkeit", route: "/training/attention" },
  reaction: { label: "Reaktion", route: "/training/focus" },
  memory: { label: "Merkfähigkeit", route: "/training/memory" },
};

const strategyLabels: Record<AdaptiveStrategy, { title: string; detail: string }> = {
  coverage: { title: "Abdeckung", detail: "Datenbasis aufbauen" },
  improve: { title: "Verbessern", detail: "Schwachstelle gezielt trainieren" },
  stabilize: { title: "Stabilisieren", detail: "Leistung festigen" },
  stretch: { title: "Fordern", detail: "Niveau kontrolliert erhöhen" },
};

const confidenceLabels: Record<AdaptiveConfidence, string> = {
  low: "Evidenz niedrig",
  medium: "Evidenz mittel",
  high: "Evidenz hoch",
};

const difficultyLabels: Record<1 | 2 | 3, string> = {
  1: "Basis",
  2: "Aufbau",
  3: "Challenge",
};

function loadTargets(): AdaptiveTarget[] {
  const targets: AdaptiveTarget[] = [];
  try {
    const raw = localStorage.getItem(PERSONAL_STATS_KEY);
    const personal = raw ? JSON.parse(raw) as PersonalStatsShape : {};
    Object.entries(focusLabels).forEach(([id, info]) => {
      const stat = personal.skillStats?.[id];
      const attempts = stat?.attempts ?? 0;
      const correct = stat?.correct ?? 0;
      targets.push({
        id: `focus:${id}`,
        label: info.label,
        route: info.route,
        sessions: attempts ? Math.max(1, Math.ceil(attempts / 10)) : 0,
        accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
        weight: 4,
      });
    });
  } catch {}

  try {
    const raw = localStorage.getItem(BRAIN_FIT_STORAGE_KEY);
    const stats = mergeBrainFitStats(raw ? JSON.parse(raw) : null);
    BRAIN_FIT_AREAS.forEach((area) => {
      const stat = stats.areaStats[area.id];
      targets.push({
        id: `brainfit:${area.id}`,
        label: area.title,
        route: "/training/brain-fit",
        sessions: stat.sessions,
        accuracy: areaAverage(stat),
      });
    });
  } catch {}

  return targets;
}

export function UnifiedTrainingCoach() {
  const [targets, setTargets] = useState<AdaptiveTarget[]>([]);
  const [progress, setProgress] = useState<UnifiedProgress | null>(null);

  useEffect(() => {
    const refresh = () => {
      const nextTargets = loadTargets();
      const nextProgress = deriveUnifiedProgress(nextTargets);
      setTargets(nextTargets);
      setProgress(nextProgress);
      try { localStorage.setItem(UNIFIED_PROGRESS_KEY, JSON.stringify(nextProgress)); } catch {}
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const plan = buildWeeklyPlan(targets, 3);

  return (
    <section className={styles.wrap} aria-labelledby="unified-coach-title">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Dynamic Training Engine V2 · Global Adaptive</p>
          <h2 id="unified-coach-title">Dein nächster Trainingsplan.</h2>
          <p>Der Coach zeigt jetzt transparent, warum jeder Bereich empfohlen wird. Strategie, Evidenz und Schwierigkeitsniveau basieren gemeinsam auf deiner bisherigen Trainingsmenge und Trefferquote.</p>
        </div>
        <div className={styles.metrics} aria-label="Gesamtfortschritt">
          <div><span>Level</span><strong>{progress?.level ?? 1}</strong></div>
          <div><span>XP gesamt</span><strong>{progress?.xp ?? 0}</strong></div>
          <div><span>Sessions</span><strong>{progress?.sessions ?? 0}</strong></div>
          <div><span>Ø Ergebnis</span><strong>{progress?.sessions ? `${progress.average}%` : "–"}</strong></div>
        </div>
      </div>

      {plan.length ? (
        <div className={styles.plan}>
          {plan.map((item, index) => {
            const strategy = strategyLabels[item.strategy];
            return (
              <article className={styles.card} key={item.id}>
                <span className={styles.rank}>Priorität {index + 1} · Score {item.priority}/100</span>
                <h3>{item.label}</h3>

                <div className={styles.why} aria-label={`Begründung für ${item.label}`}>
                  <strong>Warum diese Empfehlung?</strong>
                  <p>{item.reason}</p>
                  <div className={styles.signals} aria-label="Coach-Signale">
                    <span><b>Ziel</b>{strategy.title}</span>
                    <span><b>Evidenz</b>{confidenceLabels[item.confidence].replace("Evidenz ", "")}</span>
                    <span><b>Niveau</b>{item.difficulty} · {difficultyLabels[item.difficulty]}</span>
                  </div>
                  <small>{strategy.detail}</small>
                </div>

                <div className={styles.meta} aria-label="Trainingsdaten">
                  <span>{item.sessions} Sessions</span>
                  <span>{item.sessions ? `${item.accuracy}% Trefferquote` : "Noch keine Trefferquote"}</span>
                  <span>{confidenceLabels[item.confidence]}</span>
                </div>
                <Link href={item.route}>Training öffnen →</Link>
              </article>
            );
          })}
        </div>
      ) : <div className={styles.empty}>Noch keine lokalen Trainingsdaten vorhanden. Starte eine erste Einheit, damit der adaptive Plan Evidenz aufbauen kann.</div>}
    </section>
  );
}
