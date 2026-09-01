"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildWeeklyPlan, type AdaptiveTarget, type AdaptiveStrategy, type AdaptiveConfidence } from "@/lib/globalAdaptiveV2";
import { getProgressSnapshot, type LabProgress, type ProgressSnapshot } from "@/lib/progress";
import styles from "./AdaptiveProgressCoachBridge.module.css";

const strategyLabel: Record<AdaptiveStrategy, string> = {
  coverage: "Abdeckung",
  improve: "Verbessern",
  stabilize: "Stabilisieren",
  stretch: "Fordern",
};

const confidenceLabel: Record<AdaptiveConfidence, string> = {
  low: "Evidenz niedrig",
  medium: "Evidenz mittel",
  high: "Evidenz hoch",
};

const difficultyLabel: Record<1 | 2 | 3, string> = {
  1: "Basis",
  2: "Aufbau",
  3: "Challenge",
};

function toAdaptiveTarget(lab: LabProgress): AdaptiveTarget {
  return {
    id: `progress-${lab.id}`,
    label: lab.label,
    route: lab.href,
    sessions: lab.sessions,
    accuracy: lab.bestPercent,
  };
}

export function AdaptiveProgressCoachBridge() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    const refresh = () => {
      try { setSnapshot(getProgressSnapshot()); } catch { setSnapshot(null); }
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  if (!snapshot) return null;

  const plan = buildWeeklyPlan(snapshot.labs.map(toAdaptiveTarget), 3);

  return (
    <section className={styles.bridge} aria-labelledby="adaptive-progress-coach-title">
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Adaptive Coach · Progress Link V4</p>
          <h3 id="adaptive-progress-coach-title">Dein nächster Trainingsschwerpunkt.</h3>
          <p>Der Coach verbindet Trainingsabdeckung, Leistungswert und Evidenz aus Progress Insights V4 direkt mit der adaptiven Planung.</p>
        </div>
        <span>3 Prioritäten</span>
      </div>

      <div className={styles.planGrid}>
        {plan.map((item, index) => (
          <article className={styles.planCard} key={item.id} data-strategy={item.strategy}>
            <div className={styles.rank}>0{index + 1}</div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>
                <div>
                  <small>{strategyLabel[item.strategy]}</small>
                  <strong>{item.label}</strong>
                </div>
                <b aria-label={`Priorität ${item.priority}`}>{item.priority}</b>
              </div>
              <p>{item.reason}</p>
              <div className={styles.signals}>
                <span>{confidenceLabel[item.confidence]}</span>
                <span>Niveau {item.difficulty} · {difficultyLabel[item.difficulty]}</span>
                <span>{item.sessions} Sessions</span>
                <span>{item.sessions ? `${item.accuracy}% Leistung` : "Noch untrainiert"}</span>
              </div>
              <Link href={item.route}>Diesen Bereich trainieren →</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
