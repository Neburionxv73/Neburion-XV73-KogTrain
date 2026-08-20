import { difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type MemoryMode = "forward" | "reverse";
export type MemoryRound = {
  id: number;
  sequence: string[];
  mode: MemoryMode;
};

export const MEMORY_STORAGE_KEY = "neburion-v65-memory-progress";
export const MEMORY_SESSION_LENGTH = 8;

function createDigits(length: number): string[] {
  return Array.from({ length }, () => String(randomInt(0, 9)));
}

export function createMemorySession(bestScore: number): MemoryRound[] {
  const percent = (bestScore / MEMORY_SESSION_LENGTH) * 100;
  const difficulty: Difficulty = difficultyFromPercent(percent);
  const baseLength = difficulty === 3 ? 5 : difficulty === 2 ? 4 : 3;
  const modes: MemoryMode[] = difficulty === 1
    ? ["forward", "forward", "forward", "reverse"]
    : ["forward", "forward", "reverse", "reverse"];

  return Array.from({ length: MEMORY_SESSION_LENGTH }, (_, index) => ({
    id: Date.now() + index,
    sequence: createDigits(baseLength + Math.floor(index / 2)),
    mode: shuffled(modes)[0],
  }));
}

export function expectedMemoryAnswer(round: MemoryRound): string {
  const values = round.mode === "reverse" ? [...round.sequence].reverse() : round.sequence;
  return values.join("");
}
