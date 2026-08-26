export type Difficulty = 1 | 2 | 3;

export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffled(items).slice(0, Math.min(count, items.length));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function difficultyFromPercent(percent: number): Difficulty {
  if (percent >= 85) return 3;
  if (percent >= 60) return 2;
  return 1;
}

export function shuffleOptions<T extends { options: string[]; answer: number }>(question: T): T {
  const correct = question.options[question.answer];
  const options = shuffled(question.options);
  return { ...question, options, answer: options.indexOf(correct) };
}

const HISTORY_PREFIX = "neburion-v66-task-history:";

export function readRecentTaskIds(scope: string, max = 24): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${HISTORY_PREFIX}${scope}`) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(-max) : [];
  } catch {
    return [];
  }
}

export function rememberTaskIds(scope: string, ids: readonly string[], max = 24): void {
  if (typeof window === "undefined") return;
  try {
    const previous = readRecentTaskIds(scope, max);
    const merged = [...previous, ...ids].filter((id, index, all) => all.lastIndexOf(id) === index).slice(-max);
    window.localStorage.setItem(`${HISTORY_PREFIX}${scope}`, JSON.stringify(merged));
  } catch {
    // Training remains usable when browser storage is unavailable.
  }
}

export function chooseFresh<T extends { id: string }>(items: readonly T[], count: number, recentIds: readonly string[] = []): T[] {
  const recent = new Set(recentIds);
  const fresh = shuffled(items.filter((item) => !recent.has(item.id)));
  const fallback = shuffled(items.filter((item) => recent.has(item.id)));
  return [...fresh, ...fallback].slice(0, Math.min(count, items.length));
}

export function createSessionSeed(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % 1_000_000_000;
  }
  return (Date.now() + Math.floor(Math.random() * 1_000_000)) % 1_000_000_000;
}
