import type { Difficulty, TrainingDomain } from "@/features/cognitive-engine/types";

export type ExerciseType =
  | "single-choice"
  | "multi-choice"
  | "sequence"
  | "memory-choice"
  | "memory-recall"
  | "memory-sequence";

export type BaseExercise = {
  id: string;
  type: ExerciseType;
  domain: TrainingDomain;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  explanation: string;
  strategy: string;
  estimatedSeconds: number;
  category?: string;
};

export type SingleChoiceExercise = BaseExercise & {
  type: "single-choice";
  options: string[];
  answer: string;
};

export type MultiChoiceExercise = BaseExercise & {
  type: "multi-choice";
  options: string[];
  answers: string[];
};

export type SequenceExercise = BaseExercise & {
  type: "sequence";
  items: string[];
  answer: string[];
};

export type MemoryChoiceExercise = BaseExercise & {
  type: "memory-choice";
  studyItems: string[];
  studySeconds: number;
  options: string[];
  answer: string;
};

export type MemoryRecallExercise = BaseExercise & {
  type: "memory-recall";
  studyItems: string[];
  studySeconds: number;
  answers: string[];
  recallHint?: string;
};

export type MemorySequenceExercise = BaseExercise & {
  type: "memory-sequence";
  studyItems: string[];
  studySeconds: number;
  items: string[];
  answer: string[];
};

export type Exercise =
  | SingleChoiceExercise
  | MultiChoiceExercise
  | SequenceExercise
  | MemoryChoiceExercise
  | MemoryRecallExercise
  | MemorySequenceExercise;

export type ExerciseAttempt = {
  exerciseId: string;
  correct: boolean;
  score: number;
  durationSeconds: number;
  selected: string[];
};

export function isMemoryExercise(exercise: Exercise) {
  return exercise.type.startsWith("memory-");
}
