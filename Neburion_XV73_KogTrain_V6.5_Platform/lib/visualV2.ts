import {
  createVisualSession as createBaseVisualSession,
  VISUAL_SESSION_LENGTH,
  VISUAL_STORAGE_KEY,
  type VisualMode,
  type VisualSession,
  type VisualTask,
} from "@/lib/visual";
import { difficultyFromEvidence, finalizeSessionTasks, type Difficulty } from "@/lib/dynamicTraining";

export { VISUAL_SESSION_LENGTH, VISUAL_STORAGE_KEY };
export type { VisualMode, VisualSession, VisualTask };

const HISTORY_SCOPE = "visual-v2";

function scoreForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 1) return 0;
  if (difficulty === 2) return 5;
  return 7;
}

export function createVisualSession(bestScore: number, completedSessions = 0): VisualSession {
  const percent = Math.round((bestScore / VISUAL_SESSION_LENGTH) * 100);
  const difficulty = difficultyFromEvidence({
    percent,
    attempts: completedSessions * VISUAL_SESSION_LENGTH,
  });

  const base = createBaseVisualSession(scoreForDifficulty(difficulty));
  const tasks = finalizeSessionTasks(HISTORY_SCOPE, base.tasks, 48);
  return { difficulty, tasks };
}
