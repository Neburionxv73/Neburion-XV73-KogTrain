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

const HISTORY_PREFIX = "neburion-v12-task-history:";

export function readRecentTaskIds(scope: string, max = 48): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${HISTORY_PREFIX}${scope}`) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(-max) : [];
  } catch {
    return [];
  }
}

export function rememberTaskIds(scope: string, ids: readonly string[], max = 48): void {
  if (typeof window === "undefined") return;
  try {
    const previous = readRecentTaskIds(scope, max);
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
    penalty += Math.max(1, 16 - Math.min(age, 15));
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

export function chooseDiverse<T>(items: readonly T[], count: number, keyOf: (item: T) => string, maxPerKey = 2): T[] {
  if (count <= 0 || items.length === 0) return [];
  const groups = new Map<string, T[]>();
  shuffled(items).forEach((item) => {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });

  const selected: T[] = [];
  const used = new Map<string, number>();
  let keys = shuffled([...groups.keys()]);

  while (selected.length < Math.min(count, items.length) && keys.length > 0) {
    const nextKeys: string[] = [];
    for (const key of keys) {
      if (selected.length >= count) break;
      const group = groups.get(key) ?? [];
      const usedForKey = used.get(key) ?? 0;
      if (group.length === 0 || usedForKey >= maxPerKey) continue;
      const item = group.shift();
      if (!item) continue;
      selected.push(item);
      used.set(key, usedForKey + 1);
      if (group.length > 0 && usedForKey + 1 < maxPerKey) nextKeys.push(key);
    }
    keys = shuffled(nextKeys);
  }

  if (selected.length < count) {
    const selectedSet = new Set(selected);
    selected.push(...shuffled(items.filter((item) => !selectedSet.has(item))).slice(0, count - selected.length));
  }
  return selected.slice(0, count);
}

export function createSessionSeed(): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % 1_000_000_000;
  }
  return (Date.now() + Math.floor(Math.random() * 1_000_000)) % 1_000_000_000;
}
