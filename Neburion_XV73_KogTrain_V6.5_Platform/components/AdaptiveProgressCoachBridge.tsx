"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildWeeklyPlan, type AdaptiveTarget, type AdaptiveStrategy, type AdaptiveConfidence } from "@/lib/globalAdaptiveV2";
import { getProgressSnapshot, type LabProgress, type ProgressSnapshot } from "@/lib/progress";
import { usePlatformLanguage, type PlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./AdaptiveProgressCoachBridge.module.css";

const strategyLabel: Record<AdaptiveStrategy, { de: string; en: string }> = {
  coverage: { de: "Abdeckung", en: "Coverage" },
  improve: { de: "Verbessern", en: "Improve" },
  stabilize: { de: "Stabilisieren", en: "Stabilize" },
  stretch: { de: "Fordern", en: "Stretch" },
};

const confidenceLabel: Record<AdaptiveConfidence, { de: string; en: string }> = {
  low: { de: "Evidenz niedrig", en: "Low evidence" },
  medium: { de: "Evidenz mittel", en: "Medium evidence" },
  high: { de: "Evidenz hoch", en: "High evidence" },
};

const difficultyLabel: Record<1 | 2 | 3, { de: string; en: string }> = {
  1: { de: "Basis", en: "Base" },
  2: { de: "Aufbau", en: "Build" },
  3: { de: "Challenge", en: "Challenge" },
};

function toAdaptiveTarget(lab: LabProgress): AdaptiveTarget {
  return { id: `progress-${lab.id}`, label: lab.label, route: lab.href, sessions: lab.sessions, accuracy: lab.bestPercent };
}

function localLabel(item: AdaptiveTarget, language: PlatformLanguage) {
  if (language === "de") return item.label;
  const key = `${item.id} ${item.route}`.toLowerCase();
  if (key.includes("memory")) return "Memory";
  if (key.includes("attention")) return "Attention";
  if (key.includes("logic")) return "Logic";
  if (key.includes("language")) return "Language";
  if (key.includes("visual")) return "Visual";
  if (key.includes("brain")) return "BrainFit";
  return item.label;
}

function localReason(strategy: AdaptiveStrategy, confidence: AdaptiveConfidence, sessions: number, fallback: string, language: PlatformLanguage) {
  if (language === "de") return fallback;
  if (strategy === "coverage") return sessions === 0 ? "Not trained yet — build broad coverage first." : "Evidence is still limited — another run will create a more reliable baseline.";
  if (strategy === "improve") return confidence === "low" ? "Currently weaker, but evidence is still limited — check it directly and stabilize." : "Several results show the greatest development potential here.";
  if (strategy === "stabilize") return "Solid intermediate level — consolidate it with more sessions before difficulty increases.";
  return "Stable area — continue with a controlled increase in difficulty.";
}

export function AdaptiveProgressCoachBridge() {
  const { language, pick } = usePlatformLanguage();
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    const refresh = () => { try { setSnapshot(getProgressSnapshot()); } catch { setSnapshot(null); } };
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
          <h3 id="adaptive-progress-coach-title">{pick("Dein nächster Trainingsschwerpunkt.", "Your next training focus.")}</h3>
          <p>{pick("Der Coach verbindet Trainingsabdeckung, Leistungswert und Evidenz aus Progress Insights V4 direkt mit der adaptiven Planung.", "The coach connects training coverage, performance and evidence from Progress Insights V4 directly with adaptive planning.")}</p>
        </div>
        <span>{pick("3 Prioritäten", "3 priorities")}</span>
      </div>

      <div className={styles.planGrid}>
        {plan.map((item, index) => (
          <article className={styles.planCard} key={item.id} data-strategy={item.strategy}>
            <div className={styles.rank}>0{index + 1}</div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>
                <div>
                  <small>{strategyLabel[item.strategy][language]}</small>
                  <strong>{localLabel(item, language)}</strong>
                </div>
                <b aria-label={pick(`Priorität ${item.priority}`, `Priority ${item.priority}`)}>{item.priority}</b>
              </div>
              <p>{localReason(item.strategy, item.confidence, item.sessions, item.reason, language)}</p>
              <div className={styles.signals}>
                <span>{confidenceLabel[item.confidence][language]}</span>
                <span>{pick("Niveau", "Level")} {item.difficulty} · {difficultyLabel[item.difficulty][language]}</span>
                <span>{item.sessions} Sessions</span>
                <span>{item.sessions ? `${item.accuracy}% ${pick("Leistung", "performance")}` : pick("Noch untrainiert", "Not trained yet")}</span>
              </div>
              <Link href={item.route}>{pick("Diesen Bereich trainieren →", "Train this area →")}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
