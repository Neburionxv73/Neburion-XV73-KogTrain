import type { Difficulty } from "@/lib/dynamicTraining";

export type AdaptiveSignal = {
  recentPercents?: readonly number[];
  modePercents?: readonly number[];
  currentLevel?: Difficulty;
  averageReactionMs?: number;
  targetReactionMs?: number;
};

export type AdaptiveDecision = {
  level: Difficulty;
  performance: number;
  trend: "up" | "stable" | "down";
  confidence: "low" | "medium" | "high";
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const average = (values: readonly number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function adaptiveDifficulty(signal: AdaptiveSignal): AdaptiveDecision {
  const recent = (signal.recentPercents ?? []).slice(-6).map((value) => clamp(value));
  const modes = (signal.modePercents ?? []).filter(Number.isFinite).map((value) => clamp(value));
  const currentLevel = signal.currentLevel ?? 1;

  const recentAverage = recent.length ? average(recent) : 50;
  const modeAverage = modes.length ? average(modes) : recentAverage;
  let performance = recentAverage * 0.72 + modeAverage * 0.28;

  if (signal.averageReactionMs && signal.targetReactionMs && signal.targetReactionMs > 0) {
    const ratio = signal.averageReactionMs / signal.targetReactionMs;
    if (ratio <= 0.9) performance += 5;
    else if (ratio <= 1.05) performance += 2;
    else if (ratio >= 1.45) performance -= 7;
    else if (ratio >= 1.2) performance -= 4;
  }
  performance = clamp(performance);

  const half = Math.max(1, Math.floor(recent.length / 2));
  const older = recent.slice(0, half);
  const newer = recent.slice(half);
  const delta = older.length && newer.length ? average(newer) - average(older) : 0;
  const trend: AdaptiveDecision["trend"] = delta >= 8 ? "up" : delta <= -8 ? "down" : "stable";

  const confidence: AdaptiveDecision["confidence"] = recent.length >= 5 ? "high" : recent.length >= 3 ? "medium" : "low";
  let level = currentLevel;

  // Hysteresis: one exceptional session never changes the level by itself.
  if (recent.length >= 2) {
    if (currentLevel === 1 && performance >= 72 && trend !== "down") level = 2;
    else if (currentLevel === 2 && performance >= 86 && trend !== "down") level = 3;
    else if (currentLevel === 3 && performance <= 67 && trend !== "up") level = 2;
    else if (currentLevel === 2 && performance <= 48 && trend !== "up") level = 1;
  }

  return { level, performance: Math.round(performance), trend, confidence };
}

export function percentForDifficulty(level: Difficulty): number {
  if (level === 3) return 90;
  if (level === 2) return 70;
  return 40;
}

export function scoreForDifficulty(level: Difficulty, sessionLength: number): number {
  return (percentForDifficulty(level) / 100) * sessionLength;
}
