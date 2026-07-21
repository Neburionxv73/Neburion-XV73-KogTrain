"use client";
import type { ActiveSession, UserPreferences } from "@/features/session-engine/types";

const PREFS_KEY = "neburion.userPreferences.v1";
const SESSION_KEY = "neburion.activeSession.v1";

export function loadPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "null"); } catch { return null; }
}
export function savePreferences(value: UserPreferences) { localStorage.setItem(PREFS_KEY, JSON.stringify(value)); }
export function loadActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
export function saveActiveSession(value: ActiveSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(value)); }
export function clearActiveSession() { localStorage.removeItem(SESSION_KEY); }
