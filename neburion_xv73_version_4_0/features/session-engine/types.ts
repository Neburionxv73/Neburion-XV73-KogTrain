import type { Difficulty, TrainingDomain } from "@/features/cognitive-engine/types";

export type TrainingGoal = "alltag" | "fokus" | "gedaechtnis" | "ausgewogen";
export type SessionDuration = 5 | 10 | 15;
export type SessionMode = "quick" | "daily" | "focus" | "balanced" | "coach";

export type UserPreferences = {
  name: string;
  goal: TrainingGoal;
  duration: SessionDuration;
  domains: TrainingDomain[];
  difficulty: Difficulty;
  focusMode: boolean;
  completedAt: string;
};

export type ActiveSession = {
  id: string;
  mode: SessionMode;
  exerciseIds: string[];
  startedAt: string;
  updatedAt: string;
};
