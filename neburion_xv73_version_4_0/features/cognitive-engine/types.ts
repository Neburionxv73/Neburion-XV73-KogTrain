export type Difficulty = "einstieg" | "leicht" | "mittel" | "schwer" | "profi";
export type TrainingDomain = "gedaechtnis" | "aufmerksamkeit" | "mathematik" | "sprache" | "logik" | "visuell";

export type TrainingResult = {
  id: string;
  domain: TrainingDomain;
  difficulty: Difficulty;
  score: number;
  durationSeconds: number;
  createdAt: string;
  exerciseId?: string;
  exerciseType?: string;
  category?: string;
  reactionMs?: number;
  bestReactionMs?: number;
  falseStarts?: number;
  misses?: number;
  falseHits?: number;
  correctHits?: number;
};
