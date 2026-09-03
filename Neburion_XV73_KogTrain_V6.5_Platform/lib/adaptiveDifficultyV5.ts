import type { Difficulty } from "@/lib/dynamicTraining";

export type DifficultyTransition = "hold" | "up" | "down";

export type AdaptiveDifficultyState = {
  level: Difficulty;
  attempts: number;
  correct: number;
  correctStreak: number;
  wrongStreak: number;
  recent: boolean[];
  transition: DifficultyTransition;
  reason: string;
};

const MAX_RECENT = 5;

export function createAdaptiveDifficultyState(level: Difficulty): AdaptiveDifficultyState {
  return {
    level,
    attempts: 0,
    correct: 0,
    correctStreak: 0,
    wrongStreak: 0,
    recent: [],
    transition: "hold",
    reason: "Startniveau aus der bisherigen Trainingsevidenz.",
  };
}

function clampLevel(value: number): Difficulty {
  if (value <= 1) return 1;
  if (value >= 3) return 3;
  return 2;
}

/**
 * Adaptive Difficulty V5 changes difficulty conservatively inside a session.
 * - no level-up after a single result
 * - three consecutive correct answers + strong recent evidence are required to rise
 * - two consecutive misses lower only one level
 * - every transition resets the corresponding streak, preventing abrupt jumps
 */
export function applyAdaptiveDifficultyResult(
  state: AdaptiveDifficultyState,
  isCorrect: boolean,
): AdaptiveDifficultyState {
  const recent = [...state.recent, isCorrect].slice(-MAX_RECENT);
  const attempts = state.attempts + 1;
  const correct = state.correct + (isCorrect ? 1 : 0);
  const correctStreak = isCorrect ? state.correctStreak + 1 : 0;
  const wrongStreak = isCorrect ? 0 : state.wrongStreak + 1;
  const recentAccuracy = recent.length
    ? recent.filter(Boolean).length / recent.length
    : 0;

  if (
    state.level < 3 &&
    correctStreak >= 3 &&
    attempts >= 3 &&
    recentAccuracy >= 0.8
  ) {
    return {
      level: clampLevel(state.level + 1),
      attempts,
      correct,
      correctStreak: 0,
      wrongStreak,
      recent,
      transition: "up",
      reason: "Drei sichere Treffer bestätigen das höhere Niveau.",
    };
  }

  if (state.level > 1 && wrongStreak >= 2) {
    return {
      level: clampLevel(state.level - 1),
      attempts,
      correct,
      correctStreak,
      wrongStreak: 0,
      recent,
      transition: "down",
      reason: "Zwei Fehlversuche in Folge: Das Niveau wird um genau eine Stufe stabilisiert.",
    };
  }

  return {
    level: state.level,
    attempts,
    correct,
    correctStreak,
    wrongStreak,
    recent,
    transition: "hold",
    reason: isCorrect
      ? "Treffer gespeichert. Für einen Anstieg braucht es stabile Evidenz."
      : "Fehler gespeichert. Ein einzelner Fehler senkt das Niveau nicht.",
  };
}

export function scoreForDifficulty(level: Difficulty, sessionLength = 8): number {
  if (level === 1) return 0;
  if (level === 2) return Math.ceil(sessionLength * 0.6);
  return Math.ceil(sessionLength * 0.85);
}

export function difficultyLabel(level: Difficulty): string {
  return level === 1 ? "Basis" : level === 2 ? "Aufbau" : "Challenge";
}
