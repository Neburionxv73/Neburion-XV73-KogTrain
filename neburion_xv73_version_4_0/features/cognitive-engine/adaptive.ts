import type { Difficulty, TrainingResult } from "./types";

const order: Difficulty[] = ["einstieg", "leicht", "mittel", "schwer", "profi"];

export function nextDifficulty(current: Difficulty, score: number): Difficulty {
  const i = order.indexOf(current);
  if (score >= 88) return order[Math.min(i + 1, order.length - 1)];
  if (score < 55) return order[Math.max(i - 1, 0)];
  return current;
}

export function weakestDomain(results: TrainingResult[]) {
  const groups = new Map<string, number[]>();
  results.forEach((r) => groups.set(r.domain, [...(groups.get(r.domain) || []), r.score]));
  return [...groups.entries()].sort(
    (a, b) => a[1].reduce((x, y) => x + y, 0) / a[1].length - b[1].reduce((x, y) => x + y, 0) / b[1].length
  )[0]?.[0] || "gedaechtnis";
}
