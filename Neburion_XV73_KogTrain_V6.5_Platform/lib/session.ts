export type SessionState = {
  worldId: string | null;
  startedAt: number | null;
  completedExercises: number;
  score: number;
};

export const initialSessionState: SessionState = {
  worldId: null,
  startedAt: null,
  completedExercises: 0,
  score: 0,
};

export function startSession(worldId: string): SessionState {
  return { ...initialSessionState, worldId, startedAt: Date.now() };
}

export function applyExerciseResult(state: SessionState, scoreDelta: number): SessionState {
  return {
    ...state,
    completedExercises: state.completedExercises + 1,
    score: state.score + Math.max(0, scoreDelta),
  };
}
