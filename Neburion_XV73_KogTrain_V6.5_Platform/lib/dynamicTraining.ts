export type Difficulty = 1 | 2 | 3;

export type TrainingEvidence = {
  percent: number;
  attempts?: number;
  recentPercent?: number;
};

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

/**
 * Dynamic Training Engine V2: difficulty only rises when enough evidence exists.
 * A single strong session must not immediately force the hardest level.
 */
export function difficultyFromEvidence({ percent, attempts = 0, recentPercent }: TrainingEvidence): Difficulty {
  const stablePercent = Number.isFinite(recentPercent) && attempts >= 3
    ? Math.round(percent * 0.65 + (recentPercent as number) * 0.35)
    : percent;
  const raw = difficultyFromPercent(stablePercent);
  if (attempts < 2) return 1;
  if (attempts < 5 && raw === 3) return 2;
  return raw;
}

export function shuffleOptions<T extends { options: string[]; answer: number }>(question: T): T {
  const correct = question.options[question.answer];
  const options = shuffled(question.options);
  return { ...question, options, answer: options.indexOf(correct) };
}

const HISTORY_PREFIX = "neburion-v66-task-history:";

export function readRecentTaskIds(scope: string, max = 32): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${HISTORY_PREFIX}${scope}`) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(-max) : [];
  } catch {
    return [];
  }
}

export function rememberTaskIds(scope: string, ids: readonly string[], max = 32): void {
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

/**
 * Reorders a generated session so unseen tasks come first and persists the
 * delivered IDs. Generated domains can use this without changing their UI.
 */
export function finalizeSessionTasks<T extends { id: string }>(scope: string, tasks: readonly T[], maxHistory = 32): T[] {
  const recentIds = readRecentTaskIds(scope, maxHistory);
  const recent = new Set(recentIds);
  const fresh = shuffled(tasks.filter((task) => !recent.has(task.id)));
  const repeated = shuffled(tasks.filter((task) => recent.has(task.id)));
  const result = [...fresh, ...repeated];
  rememberTaskIds(scope, result.map((task) => task.id), maxHistory);
  return result;
}

/** Keeps mode coverage broad instead of allowing one task type to dominate. */
export function balancedByMode<T extends { mode: string }>(items: readonly T[], count: number): T[] {
  const groups = new Map<string, T[]>();
  shuffled(items).forEach((item) => groups.set(item.mode, [...(groups.get(item.mode) ?? []), item]));
  const modes = shuffled([...groups.keys()]);
  const result: T[] = [];
  let cursor = 0;
  while (result.length < Math.min(count, items.length) && modes.length) {
    const mode = modes[cursor % modes.length];
    const group = groups.get(mode) ?? [];
    const next = group.shift();
    if (next) result.push(next);
    if (!group.length) {
      groups.delete(mode);
      const index = modes.indexOf(mode);
      modes.splice(index, 1);
      if (!modes.length) break;
      cursor %= modes.length;
    } else {
      cursor += 1;
    }
  }
  return result;
}

export function createSessionSeed(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % 1_000_000_000;
  }
  return (Date.now() + Math.floor(Math.random() * 1_000_000)) % 1_000_000_000;
}
