export type Difficulty = "einstieg" | "leicht" | "mittel" | "schwer" | "profi";
export type TrainingDomain = "gedaechtnis" | "aufmerksamkeit" | "mathematik" | "sprache" | "logik";

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
};
