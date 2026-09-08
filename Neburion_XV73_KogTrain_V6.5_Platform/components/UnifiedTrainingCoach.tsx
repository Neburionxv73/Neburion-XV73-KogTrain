"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { usePlatformLanguage, type PlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./UnifiedTrainingCoach.module.css";

type PersonalStatsShape = {
  skillStats?: Record<string, { attempts?: number; correct?: number }>;
  sessions?: number;
};

const focusLabels = {
  math: { de: "Mathematik", en: "Mathematics", route: "/training/focus" },
  words: { de: "Wort & Sprache", en: "Words & language", route: "/training/language" },
  translation: { de: "Deutsch ↔ Englisch", en: "German ↔ English", route: "/training/focus" },
  attention: { de: "Aufmerksamkeit", en: "Attention", route: "/training/attention" },
  reaction: { de: "Reaktion", en: "Reaction", route: "/training/focus" },
  memory: { de: "Merkfähigkeit", en: "Memory", route: "/training/memory" },
} as const;

const brainFitLabels: Record<string, { de: string; en: string }> = {
  categories: { de: "Kategorien", en: "Categories" },
  sequence: { de: "Reihen & Folgen", en: "Sequences & patterns" },
  everydayMath: { de: "Alltagsrechnen", en: "Everyday math" },
  timeOrder: { de: "Zeit & Reihenfolge", en: "Time & order" },
};

const strategyLabels: Record<AdaptiveStrategy, { de: string; en: string; deDetail: string; enDetail: string }> = {
  coverage: { de: "Abdeckung", en: "Coverage", deDetail: "Datenbasis aufbauen", enDetail: "Build a reliable data base" },
  improve: { de: "Verbessern", en: "Improve", deDetail: "Schwachstelle gezielt trainieren", enDetail: "Train the weak point directly" },
  stabilize: { de: "Stabilisieren", en: "Stabilize", deDetail: "Leistung festigen", enDetail: "Consolidate performance" },
  stretch: { de: "Fordern", en: "Stretch", deDetail: "Niveau kontrolliert erhöhen", enDetail: "Increase difficulty in a controlled way" },
};

const confidenceLabels: Record<AdaptiveConfidence, { de: string; en: string }> = {
  low: { de: "Evidenz niedrig", en: "Low evidence" },
  medium: { de: "Evidenz mittel", en: "Medium evidence" },
  high: { de: "Evidenz hoch", en: "High evidence" },
};

const difficultyLabels: Record<1 | 2 | 3, { de: string; en: string }> = {
  1: { de: "Basis", en: "Base" },
  2: { de: "Aufbau", en: "Build" },
  3: { de: "Challenge", en: "Challenge" },
};

function reasonFor(strategy: AdaptiveStrategy, confidence: AdaptiveConfidence, sessions: number, language: PlatformLanguage) {
  if (language === "de") {
    if (strategy === "coverage") return sessions === 0 ? "Noch untrainiert – zuerst breite Abdeckung aufbauen." : "Erst wenig Evidenz – ein weiterer Durchlauf schafft eine belastbarere Basis.";
    if (strategy === "improve") return confidence === "low" ? "Aktuell schwächer, aber noch mit wenig Evidenz – gezielt prüfen und stabilisieren." : "Mehrere Ergebnisse zeigen hier das größte Entwicklungspotenzial.";
    if (strategy === "stabilize") return "Solider Zwischenstand – mit weiteren Sessions festigen, bevor das Niveau steigt.";
    return "Stabiler Bereich – mit höherer Schwierigkeit gezielt weiterfordern.";
  }
  if (strategy === "coverage") return sessions === 0 ? "Not trained yet — build broad coverage first." : "Evidence is still limited — another run will create a more reliable baseline.";
  if (strategy === "improve") return confidence === "low" ? "Currently weaker, but evidence is still limited — check it directly and stabilize." : "Several results show the greatest development potential here.";
  if (strategy === "stabilize") return "Solid intermediate level — consolidate it with more sessions before difficulty increases.";
  return "Stable area — continue with a controlled increase in difficulty.";
}

function loadTargets(language: PlatformLanguage): AdaptiveTarget[] {
  const targets: AdaptiveTarget[] = [];
  try {
    const raw = localStorage.getItem(PERSONAL_STATS_KEY);
    const personal = raw ? JSON.parse(raw) as PersonalStatsShape : {};
    Object.entries(focusLabels).forEach(([id, info]) => {
      const stat = personal.skillStats?.[id];
      const attempts = stat?.attempts ?? 0;
      const correct = stat?.correct ?? 0;
      targets.push({ id: `focus:${id}`, label: info[language], route: info.route, sessions: attempts ? Math.max(1, Math.ceil(attempts / 10)) : 0, accuracy: attempts ? Math.round((correct / attempts) * 100) : 0, weight: 4 });
    });
  } catch {}

  try {
    const raw = localStorage.getItem(BRAIN_FIT_STORAGE_KEY);
    const stats = mergeBrainFitStats(raw ? JSON.parse(raw) : null);
    BRAIN_FIT_AREAS.forEach((area) => {
      const stat = stats.areaStats[area.id];
      const label = brainFitLabels[area.id]?.[language] ?? area.title;
      targets.push({ id: `brainfit:${area.id}`, label, route: "/training/brain-fit", sessions: stat.sessions, accuracy: areaAverage(stat) });
    });
  } catch {}

  return targets;
}

export function UnifiedTrainingCoach() {
  const { language, pick } = usePlatformLanguage();
  const [targets, setTargets] = useState<AdaptiveTarget[]>([]);
  const [progress, setProgress] = useState<UnifiedProgress | null>(null);

  useEffect(() => {
    const refresh = () => {
      const nextTargets = loadTargets(language);
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
  }, [language]);

  const plan = useMemo(() => buildWeeklyPlan(targets, 3), [targets]);

  return (
    <section className={styles.wrap} aria-labelledby="unified-coach-title">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Dynamic Training Engine V2 · Global Adaptive</p>
          <h2 id="unified-coach-title">{pick("Dein nächster Trainingsplan.", "Your next training plan.")}</h2>
          <p>{pick("Der Coach zeigt jetzt transparent, warum jeder Bereich empfohlen wird. Strategie, Evidenz und Schwierigkeitsniveau basieren gemeinsam auf deiner bisherigen Trainingsmenge und Trefferquote.", "The coach now clearly explains why each area is recommended. Strategy, evidence and difficulty level are based on your previous training volume and accuracy.")}</p>
        </div>
        <div className={styles.metrics} aria-label={pick("Gesamtfortschritt", "Overall progress")}>
          <div><span>Level</span><strong>{progress?.level ?? 1}</strong></div>
          <div><span>{pick("XP gesamt", "Total XP")}</span><strong>{progress?.xp ?? 0}</strong></div>
          <div><span>Sessions</span><strong>{progress?.sessions ?? 0}</strong></div>
          <div><span>{pick("Ø Ergebnis", "Avg. score")}</span><strong>{progress?.sessions ? `${progress.average}%` : "–"}</strong></div>
        </div>
      </div>

      {plan.length ? (
        <div className={styles.plan}>
          {plan.map((item, index) => {
            const strategy = strategyLabels[item.strategy];
            return (
              <article className={styles.card} key={item.id}>
                <span className={styles.rank}>{pick("Priorität", "Priority")} {index + 1} · Score {item.priority}/100</span>
                <h3>{item.label}</h3>
                <div className={styles.why} aria-label={pick(`Begründung für ${item.label}`, `Reason for ${item.label}`)}>
                  <strong>{pick("Warum diese Empfehlung?", "Why this recommendation?")}</strong>
                  <p>{reasonFor(item.strategy, item.confidence, item.sessions, language)}</p>
                  <div className={styles.signals} aria-label={pick("Coach-Signale", "Coach signals")}>
                    <span><b>{pick("Ziel", "Goal")}</b>{language === "en" ? strategy.en : strategy.de}</span>
                    <span><b>{pick("Evidenz", "Evidence")}</b>{language === "en" ? confidenceLabels[item.confidence].en.replace(" evidence", "") : confidenceLabels[item.confidence].de.replace("Evidenz ", "")}</span>
                    <span><b>{pick("Niveau", "Level")}</b>{item.difficulty} · {difficultyLabels[item.difficulty][language]}</span>
                  </div>
                  <small>{language === "en" ? strategy.enDetail : strategy.deDetail}</small>
                </div>
                <div className={styles.meta} aria-label={pick("Trainingsdaten", "Training data")}>
                  <span>{item.sessions} Sessions</span>
                  <span>{item.sessions ? `${item.accuracy}% ${pick("Trefferquote", "accuracy")}` : pick("Noch keine Trefferquote", "No accuracy data yet")}</span>
                  <span>{confidenceLabels[item.confidence][language]}</span>
                </div>
                <Link href={item.route}>{pick("Training öffnen →", "Open training →")}</Link>
              </article>
            );
          })}
        </div>
      ) : <div className={styles.empty}>{pick("Noch keine lokalen Trainingsdaten vorhanden. Starte eine erste Einheit, damit der adaptive Plan Evidenz aufbauen kann.", "No local training data yet. Complete your first session so the adaptive plan can build evidence.")}</div>}
    </section>
  );
}
