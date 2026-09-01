export type AdaptiveTarget = {
  id: string;
  label: string;
  route: string;
  sessions: number;
  accuracy: number;
  weight?: number;
};

export type AdaptiveStrategy = "coverage" | "improve" | "stabilize" | "stretch";
export type AdaptiveConfidence = "low" | "medium" | "high";

export type PlannedTarget = AdaptiveTarget & {
  priority: number;
  reason: string;
  difficulty: 1 | 2 | 3;
  confidence: AdaptiveConfidence;
  strategy: AdaptiveStrategy;
};

export type UnifiedProgress = {
  xp: number;
  level: number;
  sessions: number;
  average: number;
  trainedAreas: number;
  updatedAt: number;
};

export const UNIFIED_PROGRESS_KEY = "neburion-v67-unified-progress-v2";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function evidenceConfidence(target: AdaptiveTarget): AdaptiveConfidence {
  if (target.sessions >= 8) return "high";
  if (target.sessions >= 3) return "medium";
  return "low";
}

export function adaptiveStrategy(target: AdaptiveTarget): AdaptiveStrategy {
  if (target.sessions <= 1) return "coverage";
  if (target.accuracy < 65) return "improve";
  if (target.sessions < 5) return "stabilize";
  return "stretch";
}

export function adaptiveDifficulty(target: AdaptiveTarget): 1 | 2 | 3 {
  // Difficulty only rises when enough evidence exists. A single very good
  // session must never jump straight to challenge level.
  if (target.sessions < 3) return 1;
  if (target.sessions >= 6 && target.accuracy >= 86) return 3;
  if (target.accuracy >= 65) return 2;
  return 1;
}

function priorityForTarget(target: AdaptiveTarget) {
  const sessions = Math.max(0, target.sessions);
  const accuracy = clamp(target.accuracy, 0, 100);
  const confidenceFactor = sessions >= 8 ? 1 : sessions >= 3 ? 0.75 : sessions >= 2 ? 0.5 : 0.25;

  // Coverage gets a strong but finite boost so new areas are explored without
  // allowing several untrained subareas from the same lab to consume the plan.
  const coverage = sessions === 0 ? 50 : sessions === 1 ? 30 : sessions === 2 ? 14 : 0;
  const weakness = sessions >= 2 ? clamp(78 - accuracy, 0, 52) * confidenceFactor : 0;
  const stabilization = sessions >= 2 && sessions < 5 && accuracy >= 65 ? 10 : 0;
  const stretch = sessions >= 5 && accuracy >= 86 ? 8 : 0;
  const repetitionPenalty = Math.max(0, sessions - 8) * 2;
  const priority = coverage + weakness + stabilization + stretch + (target.weight ?? 0) - repetitionPenalty;

  return Math.round(clamp(priority, 0, 100));
}

function reasonForTarget(target: AdaptiveTarget, strategy: AdaptiveStrategy, confidence: AdaptiveConfidence) {
  if (strategy === "coverage") {
    return target.sessions === 0
      ? "Noch untrainiert – zuerst breite Abdeckung aufbauen."
      : "Erst wenig Evidenz – ein weiterer Durchlauf schafft eine belastbarere Basis.";
  }
  if (strategy === "improve") {
    return confidence === "low"
      ? "Aktuell schwächer, aber noch mit wenig Evidenz – gezielt prüfen und stabilisieren."
      : "Mehrere Ergebnisse zeigen hier das größte Entwicklungspotenzial.";
  }
  if (strategy === "stabilize") {
    return "Solider Zwischenstand – mit weiteren Sessions festigen, bevor das Niveau steigt.";
  }
  return "Stabiler Bereich – mit höherer Schwierigkeit gezielt weiterfordern.";
}

export function rankAdaptiveTargets(targets: AdaptiveTarget[]): PlannedTarget[] {
  return targets
    .map((target) => {
      const confidence = evidenceConfidence(target);
      const strategy = adaptiveStrategy(target);
      return {
        ...target,
        priority: priorityForTarget(target),
        reason: reasonForTarget(target, strategy, confidence),
        difficulty: adaptiveDifficulty(target),
        confidence,
        strategy,
      };
    })
    .sort((a, b) =>
      b.priority - a.priority ||
      a.sessions - b.sessions ||
      a.accuracy - b.accuracy ||
      a.label.localeCompare(b.label, "de")
    );
}

function pickFirst(
  ranked: PlannedTarget[],
  selected: PlannedTarget[],
  predicate: (target: PlannedTarget) => boolean,
  preferNewRoute = true,
) {
  const selectedIds = new Set(selected.map((item) => item.id));
  const selectedRoutes = new Set(selected.map((item) => item.route));
  const candidates = ranked.filter((item) => !selectedIds.has(item.id) && predicate(item));
  if (!candidates.length) return undefined;
  if (preferNewRoute) return candidates.find((item) => !selectedRoutes.has(item.route)) ?? candidates[0];
  return candidates[0];
}

export function buildWeeklyPlan(targets: AdaptiveTarget[], slots = 3): PlannedTarget[] {
  const limit = Math.max(1, slots);
  const ranked = rankAdaptiveTargets(targets);
  if (ranked.length <= limit) return ranked;

  const selected: PlannedTarget[] = [];

  // V4 plan architecture: one evidence-backed weakness, one exploration slot
  // and one stabilization/stretch slot where available. Duplicate lab routes
  // are avoided while alternatives exist (important for BrainFit subareas).
  const improve = pickFirst(ranked, selected, (item) => item.strategy === "improve", false);
  if (improve) selected.push(improve);

  if (selected.length < limit) {
    const coverage = pickFirst(ranked, selected, (item) => item.strategy === "coverage", true);
    if (coverage) selected.push(coverage);
  }

  if (selected.length < limit) {
    const consolidate = pickFirst(
      ranked,
      selected,
      (item) => item.strategy === "stabilize" || item.strategy === "stretch",
      true,
    );
    if (consolidate) selected.push(consolidate);
  }

  while (selected.length < limit) {
    const next = pickFirst(ranked, selected, () => true, true) ?? pickFirst(ranked, selected, () => true, false);
    if (!next) break;
    selected.push(next);
  }

  return selected.slice(0, limit);
}

export function deriveUnifiedProgress(targets: AdaptiveTarget[]): UnifiedProgress {
  const sessions = targets.reduce((sum, target) => sum + Math.max(0, target.sessions), 0);
  const trained = targets.filter((target) => target.sessions > 0);

  // Cap per-area influence so one heavily trained lab cannot drown out the
  // rest of the platform in the unified average.
  const weightedAttempts = trained.reduce((sum, target) => sum + Math.min(8, Math.max(1, target.sessions)), 0);
  const average = weightedAttempts
    ? Math.round(
        trained.reduce(
          (sum, target) => sum + clamp(target.accuracy, 0, 100) * Math.min(8, Math.max(1, target.sessions)),
          0,
        ) / weightedAttempts,
      )
    : 0;

  const xp = targets.reduce((sum, target) => {
    if (!target.sessions) return sum;
    const quality = Math.round(clamp(target.accuracy, 0, 100) * 0.6);
    return sum + target.sessions * 35 + quality;
  }, 0);

  return {
    xp,
    level: Math.floor(xp / 500) + 1,
    sessions,
    average,
    trainedAreas: trained.length,
    updatedAt: Date.now(),
  };
}
