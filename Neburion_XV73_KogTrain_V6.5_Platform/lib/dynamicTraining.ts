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
    // Keep chronological occurrences instead of de-duplicating them. Repeated
    // appearances therefore carry a stronger penalty in future sessions.
    const merged = [...previous, ...ids].slice(-max);
    window.localStorage.setItem(`${HISTORY_PREFIX}${scope}`, JSON.stringify(merged));
  } catch {
    // Training remains usable when browser storage is unavailable.
  }
}

export function recencyPenalty(id: string, recentIds: readonly string[]): number {
  let penalty = 0;
  recentIds.forEach((recentId, index) => {
    if (recentId !== id) return;
    const age = recentIds.length - index;
    penalty += Math.max(1, 18 - Math.min(age, 17));
  });
  return penalty;
}

export function chooseFresh<T extends { id: string }>(items: readonly T[], count: number, recentIds: readonly string[] = []): T[] {
  return shuffled(items)
    .map((item) => ({ item, penalty: recencyPenalty(item.id, recentIds), tie: Math.random() }))
    .sort((a, b) => a.penalty - b.penalty || a.tie - b.tie)
    .slice(0, Math.min(count, items.length))
    .map(({ item }) => item);
}

/**
 * Reorders a generated session so unseen tasks come first and persists only
 * tasks that are actually delivered. This prevents hidden candidates from
 * polluting the anti-repeat history.
 */
export function finalizeSessionTasks<T extends { id: string }>(scope: string, tasks: readonly T[], maxHistory = 32, count = tasks.length): T[] {
  const recentIds = readRecentTaskIds(scope, maxHistory);
  const result = chooseFresh(tasks, Math.min(count, tasks.length), recentIds);
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

/**
 * Session Recipe Engine: each round activates only a subset of available modes.
 * This changes the macro-rhythm of the session instead of merely shuffling the
 * same one-of-each-mode sequence. A mode may appear at most twice by default.
 */
export function selectSessionRecipe<T extends { id: string; mode: string }>(
  items: readonly T[],
  count: number,
  recentIds: readonly string[] = [],
  minActiveModes = 5,
  maxActiveModes = 6,
  maxPerMode = 2,
): T[] {
  if (count <= 0 || items.length === 0) return [];

  const allModes = [...new Set(items.map((item) => item.mode))];
  if (!allModes.length) return [];

  const safeMaxPerMode = Math.max(1, maxPerMode);
  const minimumModesNeeded = Math.max(1, Math.ceil(Math.min(count, items.length) / safeMaxPerMode));
  const lower = Math.min(allModes.length, Math.max(minimumModesNeeded, minActiveModes));
  const upper = Math.min(allModes.length, Math.max(lower, maxActiveModes), Math.min(count, allModes.length));
  const activeCount = lower === upper ? lower : randomInt(lower, upper);
  const activeModes = shuffled(allModes).slice(0, activeCount);

  const groups = new Map<string, T[]>();
  activeModes.forEach((mode) => {
    const ranked = shuffled(items.filter((item) => item.mode === mode))
      .map((item) => ({ item, penalty: recencyPenalty(item.id, recentIds), tie: Math.random() }))
      .sort((a, b) => a.penalty - b.penalty || a.tie - b.tie)
      .map(({ item }) => item);
    groups.set(mode, ranked);
  });

  const target = Math.min(count, items.length);
  const desired = new Map(activeModes.map((mode) => [mode, 1]));
  let remaining = Math.max(0, target - activeModes.length);

  while (remaining > 0) {
    const eligible = shuffled(activeModes.filter((mode) => {
      const wanted = desired.get(mode) ?? 0;
      const available = groups.get(mode)?.length ?? 0;
      return wanted < safeMaxPerMode && wanted < available;
    }));
    if (!eligible.length) break;
    for (const mode of eligible) {
      if (remaining <= 0) break;
      desired.set(mode, (desired.get(mode) ?? 0) + 1);
      remaining -= 1;
    }
  }

  const selected: T[] = [];
  activeModes.forEach((mode) => {
    const wanted = desired.get(mode) ?? 0;
    selected.push(...(groups.get(mode) ?? []).slice(0, wanted));
  });

  if (selected.length < target) {
    const selectedSet = new Set(selected);
    const fallback = chooseFresh(items.filter((item) => !selectedSet.has(item)), target - selected.length, recentIds);
    selected.push(...fallback);
  }

  return shuffled(selected).slice(0, target);
}

/**
 * Anti-repeat selector for generated pools plus experience-level recipe diversity.
 * Typical 8-task sessions now use 5–6 active modes with at most two tasks per mode.
 */
export function finalizeBalancedSessionTasks<T extends { id: string; mode: string }>(scope: string, tasks: readonly T[], count: number, maxHistory = 48): T[] {
  const recentIds = readRecentTaskIds(scope, maxHistory);
  const availableModes = new Set(tasks.map((task) => task.mode)).size;
  const maxPerMode = 2;
  const minimumModesNeeded = Math.ceil(Math.min(count, tasks.length) / maxPerMode);
  const minActiveModes = Math.min(availableModes, Math.max(minimumModesNeeded, Math.min(5, availableModes)));
  const maxActiveModes = Math.min(availableModes, Math.max(minActiveModes, Math.min(6, availableModes)));
  const result = selectSessionRecipe(tasks, count, recentIds, minActiveModes, maxActiveModes, maxPerMode);
  rememberTaskIds(scope, result.map((task) => task.id), maxHistory);
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
