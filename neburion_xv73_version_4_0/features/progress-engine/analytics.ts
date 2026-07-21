import type { TrainingResult } from "@/features/cognitive-engine/types";

export type ProgressRow = {
  label: string;
  sessions: number;
  average: number;
  best: number;
  totalSeconds: number;
  difficulty: string;
};

export type DailyProgress = {
  key: string;
  label: string;
  shortLabel: string;
  sessions: number;
  average: number;
  minutes: number;
};

export type PersonalRecord = {
  title: string;
  value: string;
  detail: string;
};

export function averageScore(items: TrainingResult[]) {
  return items.length ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length) : 0;
}

export function groupProgress(results: TrainingResult[], key: "domain" | "category"): ProgressRow[] {
  const groups = new Map<string, TrainingResult[]>();
  results.forEach((result) => {
    const label = key === "domain" ? result.domain : result.category || result.domain;
    groups.set(label, [...(groups.get(label) || []), result]);
  });

  return [...groups.entries()]
    .map(([label, items]) => ({
      label,
      sessions: items.length,
      average: averageScore(items),
      best: Math.max(...items.map((item) => item.score)),
      totalSeconds: items.reduce((sum, item) => sum + item.durationSeconds, 0),
      difficulty: items[0]?.difficulty || "-"
    }))
    .sort((a, b) => b.sessions - a.sessions || b.average - a.average);
}

export function recentWindow(results: TrainingResult[], days = 7) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return results.filter((result) => new Date(result.createdAt).getTime() >= threshold);
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dailyProgress(results: TrainingResult[], days = 7): DailyProgress[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    const key = dayKey(date);
    const items = results.filter((item) => dayKey(new Date(item.createdAt)) === key);
    return {
      key,
      label: date.toLocaleDateString("de-AT", { weekday: "long", day: "2-digit", month: "2-digit" }),
      shortLabel: date.toLocaleDateString("de-AT", { weekday: "short" }).replace(".", ""),
      sessions: items.length,
      average: averageScore(items),
      minutes: Math.round(items.reduce((sum, item) => sum + item.durationSeconds, 0) / 60)
    };
  });
}

export function activityCalendar(results: TrainingResult[], days = 28) {
  return dailyProgress(results, days).map((day) => ({ ...day, intensity: Math.min(4, day.sessions) }));
}

export function currentStreak(results: TrainingResult[]) {
  const active = new Set(results.map((item) => dayKey(new Date(item.createdAt))));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!active.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function scoreTrend(results: TrainingResult[]) {
  const current = averageScore(recentWindow(results, 7));
  const currentThreshold = Date.now() - 7 * 86400000;
  const previousThreshold = Date.now() - 14 * 86400000;
  const previous = averageScore(results.filter((item) => {
    const time = new Date(item.createdAt).getTime();
    return time >= previousThreshold && time < currentThreshold;
  }));
  if (!previous) return { value: 0, direction: "neutral" as const };
  const value = current - previous;
  return { value, direction: value > 0 ? "up" as const : value < 0 ? "down" as const : "neutral" as const };
}

export function personalRecords(results: TrainingResult[]): PersonalRecord[] {
  if (!results.length) return [];
  const best = [...results].sort((a, b) => b.score - a.score)[0];
  const longest = [...results].sort((a, b) => b.durationSeconds - a.durationSeconds)[0];
  const reactionItems = results.filter((item) => typeof item.bestReactionMs === "number" || typeof item.reactionMs === "number");
  const fastest = reactionItems.length
    ? Math.min(...reactionItems.map((item) => item.bestReactionMs ?? item.reactionMs ?? Infinity))
    : null;
  const domain = groupProgress(results, "domain").sort((a, b) => b.average - a.average)[0];

  return [
    { title: "Bester Trainingswert", value: `${best.score}%`, detail: best.category || best.domain },
    { title: "Stärkster Bereich", value: domain ? `${domain.average}%` : "–", detail: domain?.label || "Noch offen" },
    { title: "Längste Fokusrunde", value: `${Math.max(1, Math.round(longest.durationSeconds / 60))} Min.`, detail: longest.category || longest.domain },
    ...(fastest && Number.isFinite(fastest) ? [{ title: "Beste Reaktion", value: `${fastest} ms`, detail: "Attention Lab" }] : [])
  ].slice(0, 4);
}
