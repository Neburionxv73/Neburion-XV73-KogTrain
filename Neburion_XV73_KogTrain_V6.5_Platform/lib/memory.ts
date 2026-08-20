export type MemoryRound = {
  id: number;
  sequence: string[];
};

export const memoryRounds: MemoryRound[] = [
  { id: 1, sequence: ["7", "2", "9"] },
  { id: 2, sequence: ["4", "8", "1", "6"] },
  { id: 3, sequence: ["3", "5", "9", "2", "7"] },
  { id: 4, sequence: ["8", "1", "4", "6", "3", "9"] },
  { id: 5, sequence: ["2", "7", "5", "1", "8", "4", "6"] },
];

export const MEMORY_STORAGE_KEY = "neburion-v65-memory-progress";
