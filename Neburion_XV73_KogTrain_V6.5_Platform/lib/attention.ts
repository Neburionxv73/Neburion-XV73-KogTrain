import { difficultyFromPercent, sample, shuffled } from "@/lib/dynamicTraining";

export type AttentionStimulus = {
  symbol: string;
  isTarget: boolean;
};

export type AttentionSession = {
  targetSymbol: string;
  stimuli: AttentionStimulus[];
  displayMs: number;
};

const SYMBOLS = ["◆", "◇", "●", "▲", "■", "✦", "✚", "⬟", "★", "⬢"];

export function createAttentionSession(bestAccuracy: number): AttentionSession {
  const difficulty = difficultyFromPercent(bestAccuracy);
  const stimulusCount = difficulty === 3 ? 18 : difficulty === 2 ? 16 : 14;
  const targetCount = difficulty === 3 ? 6 : difficulty === 2 ? 6 : 5;
  const displayMs = difficulty === 3 ? 800 : difficulty === 2 ? 950 : 1100;
  const targetSymbol = sample(SYMBOLS, 1)[0];
  const distractors = SYMBOLS.filter((symbol) => symbol !== targetSymbol);
  const values: AttentionStimulus[] = [
    ...Array.from({ length: targetCount }, () => ({ symbol: targetSymbol, isTarget: true })),
    ...Array.from({ length: stimulusCount - targetCount }, (_, index) => ({
      symbol: distractors[index % distractors.length],
      isTarget: false,
    })),
  ];

  return { targetSymbol, stimuli: shuffled(values), displayMs };
}
