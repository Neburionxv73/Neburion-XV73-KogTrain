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
