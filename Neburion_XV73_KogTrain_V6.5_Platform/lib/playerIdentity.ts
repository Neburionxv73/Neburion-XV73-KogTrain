export type PlayerIdentity = {
  id: string;
  name: string;
  createdAt: string;
  schemaVersion: 1;
};

const ACTIVE_PLAYER_KEY = "neburion-v67-active-player";
const PLAYER_LIST_KEY = "neburion-v67-player-list";
const LEGACY_PLAYER_ID = "legacy-primary";

export const MANAGED_PROGRESS_KEYS = [
  "neburion-v65-progress-events",
  "neburion-v65-progress-baseline",
  "neburion-v65-memory-progress",
  "neburion-v65-attention-stats",
  "neburion-v65-logic-stats-v3",
  "neburion-v65-logic-stats-v2",
  "neburion-v65-language-stats-v3",
  "neburion-v65-language-stats-v2",
  "neburion-v65-visual-stats",
  "neburion-v65-brain-fit-v372",
  "neburion-v65-brain-fit-completion-v376",
] as const;

function safeId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function writePlayerList(players: PlayerIdentity[]): void {
  try { localStorage.setItem(PLAYER_LIST_KEY, JSON.stringify(players)); } catch {}
}

export function getPlayers(): PlayerIdentity[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(PLAYER_LIST_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is PlayerIdentity => Boolean(item?.id && item?.name)) : [];
  } catch { return []; }
}

function registerPlayer(identity: PlayerIdentity): void {
  const players = getPlayers();
  const next = [...players.filter((player) => player.id !== identity.id), identity];
  writePlayerList(next);
}

export function getActivePlayer(): PlayerIdentity {
  if (typeof window === "undefined") {
    return { id: LEGACY_PLAYER_ID, name: "Spieler", createdAt: new Date(0).toISOString(), schemaVersion: 1 };
  }
  try {
    const raw = localStorage.getItem(ACTIVE_PLAYER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerIdentity>;
      if (parsed.id && parsed.name) {
        const identity: PlayerIdentity = { id: safeId(parsed.id), name: parsed.name, createdAt: parsed.createdAt ?? new Date().toISOString(), schemaVersion: 1 };
        registerPlayer(identity);
        return identity;
      }
    }
  } catch {}
  const identity: PlayerIdentity = { id: LEGACY_PLAYER_ID, name: "Spieler 1", createdAt: new Date().toISOString(), schemaVersion: 1 };
  try { localStorage.setItem(ACTIVE_PLAYER_KEY, JSON.stringify(identity)); } catch {}
  registerPlayer(identity);
  return identity;
}

export function setActivePlayer(id: string, name: string): PlayerIdentity {
  const identity: PlayerIdentity = { id: safeId(id) || `player-${Date.now()}`, name: name.trim() || "Spieler", createdAt: new Date().toISOString(), schemaVersion: 1 };
  localStorage.setItem(ACTIVE_PLAYER_KEY, JSON.stringify(identity));
  registerPlayer(identity);
  return identity;
}

export function playerStorageKey(playerId: string, key: string): string {
  return `neburion-v67-player:${safeId(playerId)}:${key}`;
}

export function readPlayerJson(playerId: string, key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(playerStorageKey(playerId, key));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function writePlayerJson(playerId: string, key: string, value: unknown): void {
  try { localStorage.setItem(playerStorageKey(playerId, key), JSON.stringify(value)); } catch {}
}

export function migrateLegacyPlayerKeys(playerId: string, keys: readonly string[] = MANAGED_PROGRESS_KEYS): void {
  if (typeof window === "undefined") return;
  keys.forEach((key) => {
    const scoped = playerStorageKey(playerId, key);
    if (localStorage.getItem(scoped) !== null) return;
    const legacy = localStorage.getItem(key);
    if (legacy !== null) localStorage.setItem(scoped, legacy);
  });
}

export function snapshotActivePlayerProgress(playerId = getActivePlayer().id): void {
  if (typeof window === "undefined") return;
  MANAGED_PROGRESS_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    const scoped = playerStorageKey(playerId, key);
    if (value === null) localStorage.removeItem(scoped);
    else localStorage.setItem(scoped, value);
  });
}

export function restorePlayerProgress(playerId: string): void {
  if (typeof window === "undefined") return;
  MANAGED_PROGRESS_KEYS.forEach((key) => {
    const value = localStorage.getItem(playerStorageKey(playerId, key));
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  });
}

export function switchActivePlayer(playerId: string): PlayerIdentity {
  const current = getActivePlayer();
  snapshotActivePlayerProgress(current.id);
  const target = getPlayers().find((player) => player.id === safeId(playerId));
  if (!target) throw new Error("Spielerprofil nicht gefunden");
  localStorage.setItem(ACTIVE_PLAYER_KEY, JSON.stringify(target));
  restorePlayerProgress(target.id);
  return target;
}

export function createAndActivatePlayer(name: string): PlayerIdentity {
  const current = getActivePlayer();
  snapshotActivePlayerProgress(current.id);
  const cleanName = name.trim() || "Spieler";
  const id = `${safeId(cleanName) || "player"}-${Date.now().toString(36)}`;
  const identity = setActivePlayer(id, cleanName);
  MANAGED_PROGRESS_KEYS.forEach((key) => localStorage.removeItem(key));
  return identity;
}
