import {
  createLanguageSession as createBaseLanguageSession,
  LANGUAGE_SESSION_LENGTH,
  LANGUAGE_STORAGE_KEY,
  type LanguageMode,
  type LanguageSession,
  type LanguageTask,
} from "@/lib/language";
import { difficultyFromEvidence, type Difficulty } from "@/lib/dynamicTraining";

export { LANGUAGE_SESSION_LENGTH, LANGUAGE_STORAGE_KEY };
export type { LanguageMode, LanguageSession, LanguageTask };

function scoreForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 1) return 0;
  if (difficulty === 2) return 5;
  return 7;
}

export function createLanguageSession(
  bestScore: number,
  recentIds: string[] = [],
  completedSessions = 0,
): LanguageSession {
  const percent = Math.round((bestScore / LANGUAGE_SESSION_LENGTH) * 100);
  const difficulty = difficultyFromEvidence({
    percent,
    attempts: completedSessions * LANGUAGE_SESSION_LENGTH,
  });

  const base = createBaseLanguageSession(scoreForDifficulty(difficulty), recentIds);
  return { ...base, difficulty };
}
