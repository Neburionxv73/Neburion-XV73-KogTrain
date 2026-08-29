export type PlayerIdentity = {
  id: string;
  name: string;
  createdAt: string;
  schemaVersion: 1;
};

const ACTIVE_PLAYER_KEY = "neburion-v67-active-player";
const LEGACY_PLAYER_ID = "legacy-primary";

function safeId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function getActivePlayer(): PlayerIdentity {
  if (typeof window === "undefined") {
    return { id: LEGACY_PLAYER_ID, name: "Spieler", createdAt: new Date(0).toISOString(), schemaVersion: 1 };
  }
  try {
    const raw = localStorage.getItem(ACTIVE_PLAYER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerIdentity>;
      if (parsed.id && parsed.name) return { id: safeId(parsed.id), name: parsed.name, createdAt: parsed.createdAt ?? new Date().toISOString(), schemaVersion: 1 };
    }
  } catch {}
  const identity: PlayerIdentity = { id: LEGACY_PLAYER_ID, name: "Spieler 1", createdAt: new Date().toISOString(), schemaVersion: 1 };
  try { localStorage.setItem(ACTIVE_PLAYER_KEY, JSON.stringify(identity)); } catch {}
  return identity;
}

export function setActivePlayer(id: string, name: string): PlayerIdentity {
  const identity: PlayerIdentity = { id: safeId(id) || `player-${Date.now()}`, name: name.trim() || "Spieler", createdAt: new Date().toISOString(), schemaVersion: 1 };
  localStorage.setItem(ACTIVE_PLAYER_KEY, JSON.stringify(identity));
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

export function migrateLegacyPlayerKeys(playerId: string, keys: string[]): void {
  if (typeof window === "undefined") return;
  keys.forEach((key) => {
    const scoped = playerStorageKey(playerId, key);
    if (localStorage.getItem(scoped) !== null) return;
    const legacy = localStorage.getItem(key);
    if (legacy !== null) localStorage.setItem(scoped, legacy);
  });
}
