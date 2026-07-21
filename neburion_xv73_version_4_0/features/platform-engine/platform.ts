"use client";

import type { TrainingResult } from "@/features/cognitive-engine/types";
import type { DailyMission, PlatformProfile } from "./types";

const PROFILE_KEY = "neburion.platformProfile.v1";

const defaultProfile: PlatformProfile = {
  xp: 0,
  level: 1,
  streak: 0,
  completedMissionIds: []
};

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function loadPlatformProfile(): PlatformProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    return parsed ? { ...defaultProfile, ...parsed } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function savePlatformProfile(profile: PlatformProfile) {
  if (typeof window !== "undefined") localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 300) + 1);
}

export function xpProgress(xp: number) {
  const currentLevelBase = (levelFromXp(xp) - 1) * 300;
  return Math.round(((xp - currentLevelBase) / 300) * 100);
}

export function updateProfileFromResults(results: TrainingResult[]): PlatformProfile {
  const stored = loadPlatformProfile();
  const earnedXp = results.reduce((sum, result) => sum + Math.max(10, Math.round(result.score / 5)), 0);
  const activeDays = [...new Set(results.map((result) => result.createdAt.slice(0, 10)))].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  for (const day of activeDays) {
    if (day === dateKey(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const yesterday = new Date(cursor);
    yesterday.setDate(yesterday.getDate() - 1);
    if (day === dateKey(yesterday)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 2);
      continue;
    }
    break;
  }
  const next = {
    ...stored,
    xp: Math.max(stored.xp, earnedXp),
    level: levelFromXp(Math.max(stored.xp, earnedXp)),
    streak,
    lastActiveDate: activeDays[0]
  };
  return savePlatformProfile(next);
}

export function buildDailyMissions(results: TrainingResult[]): DailyMission[] {
  const today = dateKey();
  const todaysResults = results.filter((result) => result.createdAt.startsWith(today));
  return [
    {
      id: `${today}-memory`,
      title: "Gedächtnis aktivieren",
      description: "Schließe eine Memory-Lab-Aufgabe ab.",
      domain: "gedaechtnis",
      href: "/memory-lab",
      xp: 40,
      completed: todaysResults.some((result) => result.domain === "gedaechtnis")
    },
    {
      id: `${today}-attention`,
      title: "Fokus stabilisieren",
      description: "Trainiere eine Attention-Lab-Aufgabe.",
      domain: "aufmerksamkeit",
      href: "/attention-lab",
      xp: 40,
      completed: todaysResults.some((result) => result.domain === "aufmerksamkeit")
    },
    {
      id: `${today}-quality`,
      title: "Qualitätsziel erreichen",
      description: "Erreiche mindestens 75 % in einer Aufgabe.",
      domain: "logik",
      href: "/training",
      xp: 60,
      completed: todaysResults.some((result) => result.score >= 75)
    }
  ];
}
