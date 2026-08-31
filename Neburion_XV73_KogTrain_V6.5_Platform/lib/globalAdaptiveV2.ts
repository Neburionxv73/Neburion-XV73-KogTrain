export type AdaptiveTarget = {
  id: string;
  label: string;
  route: string;
  sessions: number;
  accuracy: number;
  weight?: number;
};

export type PlannedTarget = AdaptiveTarget & {
  priority: number;
  reason: string;
  difficulty: 1 | 2 | 3;
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

export function adaptiveDifficulty(target: AdaptiveTarget): 1 | 2 | 3 {
  if (target.sessions < 2) return 1;
  if (target.sessions < 5) return target.accuracy >= 65 ? 2 : 1;
  if (target.accuracy >= 86) return 3;
  if (target.accuracy >= 62) return 2;
  return 1;
}

export function rankAdaptiveTargets(targets: AdaptiveTarget[]): PlannedTarget[] {
  return targets
    .map((target) => {
      const coverage = target.sessions === 0 ? 52 : target.sessions === 1 ? 30 : Math.max(0, 16 - target.sessions * 2);
      const weakness = target.sessions === 0 ? 0 : clamp(82 - target.accuracy, 0, 55);
      const confidence = Math.min(target.sessions, 8) * 2;
      const priority = Math.round(clamp(coverage + weakness + confidence + (target.weight ?? 0), 0, 100));
      const reason = target.sessions === 0
        ? "Noch untrainiert – zuerst breite Abdeckung aufbauen."
        : target.accuracy < 62
          ? "Aktuell größtes Entwicklungspotenzial."
          : target.sessions < 3
            ? "Noch wenig Evidenz – weiter stabilisieren."
            : "Für abwechslungsreiche Wiederholung einplanen.";
      return { ...target, priority, reason, difficulty: adaptiveDifficulty(target) };
    })
    .sort((a, b) => b.priority - a.priority || a.sessions - b.sessions || a.accuracy - b.accuracy);
}

export function buildWeeklyPlan(targets: AdaptiveTarget[], slots = 3): PlannedTarget[] {
  return rankAdaptiveTargets(targets).slice(0, Math.max(1, slots));
}

export function deriveUnifiedProgress(targets: AdaptiveTarget[]): UnifiedProgress {
  const sessions = targets.reduce((sum, target) => sum + Math.max(0, target.sessions), 0);
  const trained = targets.filter((target) => target.sessions > 0);
  const weightedAttempts = trained.reduce((sum, target) => sum + Math.max(1, target.sessions), 0);
  const average = weightedAttempts
    ? Math.round(trained.reduce((sum, target) => sum + target.accuracy * Math.max(1, target.sessions), 0) / weightedAttempts)
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
