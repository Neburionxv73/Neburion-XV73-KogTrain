import { getActivePlayer, migrateLegacyPlayerKeys, readPlayerJson, writePlayerJson } from "./playerIdentity";

export type PlayerSave = {
  schemaVersion: 1;
  playerId: string;
  xp: number;
  level: number;
  sessions: number;
  updatedAt: string;
};

const SAVE_KEY = "save";
export const LEGACY_PROGRESS_KEYS = [
  "neburion-v65-progress-events", "neburion-v65-progress-baseline",
  "neburion-v65-memory-progress", "neburion-v65-attention-stats",
  "neburion-v65-logic-stats-v3", "neburion-v65-logic-stats-v2",
  "neburion-v65-language-stats-v3", "neburion-v65-language-stats-v2",
  "neburion-v65-visual-stats", "neburion-v65-brain-fit-v372",
  "neburion-v65-brain-fit-completion-v376"
];

export function initializePlayerStorage(): string {
  const player = getActivePlayer();
  migrateLegacyPlayerKeys(player.id, LEGACY_PROGRESS_KEYS);
  if (!readPlayerJson(player.id, SAVE_KEY)) {
    writePlayerJson(player.id, SAVE_KEY, { schemaVersion: 1, playerId: player.id, xp: 0, level: 1, sessions: 0, updatedAt: new Date().toISOString() } satisfies PlayerSave);
  }
  return player.id;
}

export function getPlayerSave(): PlayerSave {
  const playerId = initializePlayerStorage();
  const raw = readPlayerJson(playerId, SAVE_KEY) as Partial<PlayerSave> | null;
  return { schemaVersion: 1, playerId, xp: Number(raw?.xp ?? 0), level: Math.max(1, Number(raw?.level ?? 1)), sessions: Number(raw?.sessions ?? 0), updatedAt: String(raw?.updatedAt ?? new Date().toISOString()) };
}
