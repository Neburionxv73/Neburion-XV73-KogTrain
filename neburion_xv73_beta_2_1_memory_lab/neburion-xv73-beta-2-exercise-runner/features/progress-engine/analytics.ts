import type { TrainingResult } from "@/features/cognitive-engine/types";

export type ProgressRow = {
  label: string;
  sessions: number;
  average: number;
  best: number;
  totalSeconds: number;
  difficulty: string;
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
