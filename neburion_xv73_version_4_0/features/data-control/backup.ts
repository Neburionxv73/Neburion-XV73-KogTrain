"use client";

export const BACKUP_SCHEMA = "neburion-xv73-backup";
export const BACKUP_VERSION = 1;

export const NEBURION_STORAGE_KEYS = [
  "neburion.trainingResults.v2",
  "neburion.platformProfile.v1",
  "neburion.userPreferences.v1",
  "neburion.activeSession.v1",
  "neburion-reading-mode"
] as const;

export type BackupPayload = {
  schema: typeof BACKUP_SCHEMA;
  version: number;
  product: "Neburion XV73";
  createdAt: string;
  appVersion: string;
  checksum: string;
  entries: Record<string, string | null>;
};

function stableEntries(entries: Record<string, string | null>) {
  return Object.keys(entries).sort().map((key) => `${key}:${entries[key] ?? "null"}`).join("|");
}

export function checksum(entries: Record<string, string | null>) {
  const input = stableEntries(entries);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createBackup(appVersion: string): BackupPayload {
  const entries = Object.fromEntries(NEBURION_STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)]));
  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    product: "Neburion XV73",
    createdAt: new Date().toISOString(),
    appVersion,
    checksum: checksum(entries),
    entries
  };
}

export function validateBackup(value: unknown): BackupPayload {
  if (!value || typeof value !== "object") throw new Error("Die Datei enthält kein gültiges Backup-Objekt.");
  const backup = value as Partial<BackupPayload>;
  if (backup.schema !== BACKUP_SCHEMA) throw new Error("Die Datei gehört nicht zum Neburion-XV73-Backupsystem.");
  if (backup.version !== BACKUP_VERSION) throw new Error("Diese Backup-Version wird noch nicht unterstützt.");
  if (backup.product !== "Neburion XV73") throw new Error("Produktkennung des Backups ist ungültig.");
  if (!backup.entries || typeof backup.entries !== "object") throw new Error("Im Backup fehlen die gespeicherten Daten.");
  const entries = backup.entries as Record<string, string | null>;
  for (const key of Object.keys(entries)) {
    if (!NEBURION_STORAGE_KEYS.includes(key as (typeof NEBURION_STORAGE_KEYS)[number])) {
      throw new Error(`Unbekannter Speicherbereich im Backup: ${key}`);
    }
    if (entries[key] !== null && typeof entries[key] !== "string") throw new Error(`Ungültiger Wert für ${key}.`);
  }
  if (backup.checksum !== checksum(entries)) throw new Error("Die Prüfsumme stimmt nicht. Die Datei könnte beschädigt sein.");
  return backup as BackupPayload;
}

export function restoreBackup(backup: BackupPayload) {
  for (const key of NEBURION_STORAGE_KEYS) {
    const value = backup.entries[key];
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
}

export function clearNeburionData() {
  for (const key of NEBURION_STORAGE_KEYS) localStorage.removeItem(key);
}
