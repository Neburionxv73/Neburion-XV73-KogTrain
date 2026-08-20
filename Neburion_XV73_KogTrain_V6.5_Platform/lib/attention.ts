export type AttentionStimulus = {
  symbol: string;
  isTarget: boolean;
};

export const TARGET_SYMBOL = "◆";
export const DISTRACTORS = ["◇", "●", "▲", "■", "✦"];

export function createAttentionSequence(): AttentionStimulus[] {
  const targetSlots = new Set([1, 3, 6, 8, 10]);
  return Array.from({ length: 12 }, (_, index) => {
    const isTarget = targetSlots.has(index);
    const symbol = isTarget ? TARGET_SYMBOL : DISTRACTORS[index % DISTRACTORS.length];
    return { symbol, isTarget };
  });
}
