import {
  createVisualSession as createBaseVisualSession,
  VISUAL_SESSION_LENGTH,
  VISUAL_STORAGE_KEY,
  type VisualMode,
  type VisualSession,
  type VisualTask,
} from "@/lib/visual";
import {
  balancedByMode,
  difficultyFromEvidence,
  finalizeSessionTasks,
  readRecentTaskIds,
  type Difficulty,
} from "@/lib/dynamicTraining";

export { VISUAL_SESSION_LENGTH, VISUAL_STORAGE_KEY };
export type { VisualMode, VisualSession, VisualTask };

const HISTORY_SCOPE = "visual-v4";
const HISTORY_LIMIT = 144;

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

  const recent = new Set(readRecentTaskIds(HISTORY_SCOPE, HISTORY_LIMIT));
  const candidates: VisualTask[] = [];

  // Generate several independent sessions so every visual mode gets a much
  // larger candidate pool before the final balanced V4 selection is made.
  for (let round = 0; round < 7; round += 1) {
    const session = createBaseVisualSession(scoreForDifficulty(difficulty));
    candidates.push(...session.tasks);
  }

  const unique = [...new Map(candidates.map((item) => [item.id, item])).values()];
  const fresh = unique.filter((item) => !recent.has(item.id));
  const source = fresh.length >= VISUAL_SESSION_LENGTH ? fresh : unique;
  const balanced = balancedByMode(source, VISUAL_SESSION_LENGTH);
  const tasks = finalizeSessionTasks(HISTORY_SCOPE, balanced, HISTORY_LIMIT);

  return { difficulty, tasks };
}
