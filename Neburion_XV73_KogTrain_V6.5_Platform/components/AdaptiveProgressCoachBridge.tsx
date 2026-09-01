"use client";

import Link from "next/link";
import { buildWeeklyPlan, type AdaptiveTarget, type AdaptiveStrategy, type AdaptiveConfidence } from "@/lib/globalAdaptiveV2";
import type { LabProgress } from "@/lib/progress";
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

export function AdaptiveProgressCoachBridge({ labs }: { labs: LabProgress[] }) {
  const plan = buildWeeklyPlan(labs.map(toAdaptiveTarget), 3);

  return (
    <section className={styles.bridge} aria-labelledby="adaptive-progress-coach-title">
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Adaptive Coach · Progress Link V4</p>
          <h3 id="adaptive-progress-coach-title">Dein nächster Trainingsschwerpunkt.</h3>
          <p>Der Coach verbindet jetzt Trainingsabdeckung, Leistungswert und Evidenz aus Progress Insights V4 mit der adaptiven Planung.</p>
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
                <b>{item.priority}</b>
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
