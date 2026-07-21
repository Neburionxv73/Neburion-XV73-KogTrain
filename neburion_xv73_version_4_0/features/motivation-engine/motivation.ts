"use client";

import type { TrainingResult, TrainingDomain } from "@/features/cognitive-engine/types";

export type Milestone = {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  tone: "warm" | "focus" | "growth" | "mastery";
};

export type WeeklyGoal = {
  id: string;
  label: string;
  detail: string;
  current: number;
  target: number;
  unit: string;
};

const domainLabels: Record<TrainingDomain, string> = {
  gedaechtnis: "Memory",
  aufmerksamkeit: "Attention",
  mathematik: "Mathematik",
  sprache: "Language",
  logik: "Logic",
  visuell: "Visual"
};

function startOfWeek(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - day + 1);
  return next;
}

export function weeklyResults(results: TrainingResult[]) {
  const start = startOfWeek().getTime();
  return results.filter((result) => new Date(result.createdAt).getTime() >= start);
}

export function buildWeeklyGoals(results: TrainingResult[]): WeeklyGoal[] {
  const week = weeklyResults(results);
  const minutes = Math.round(week.reduce((sum, item) => sum + item.durationSeconds, 0) / 60);
  const activeDomains = new Set(week.map((item) => item.domain)).size;
  const quality = week.filter((item) => item.score >= 75).length;
  return [
    { id: "sessions", label: "Trainingsrhythmus", detail: "Kurze, regelmäßige Einheiten", current: week.length, target: 8, unit: "Aufgaben" },
    { id: "time", label: "Fokuszeit", detail: "Bewusst investierte Trainingszeit", current: minutes, target: 35, unit: "Minuten" },
    { id: "variety", label: "Abwechslung", detail: "Verschiedene Denkbereiche aktivieren", current: activeDomains, target: 5, unit: "Welten" },
    { id: "quality", label: "Sichere Treffer", detail: "Mindestens 75 % erreichen", current: quality, target: 5, unit: "Erfolge" }
  ];
}

export function buildMilestones(results: TrainingResult[]): Milestone[] {
  const totalMinutes = Math.round(results.reduce((sum, item) => sum + item.durationSeconds, 0) / 60);
  const strongResults = results.filter((item) => item.score >= 85).length;
  const domains = new Set(results.map((item) => item.domain));
  const balanced = ["gedaechtnis", "aufmerksamkeit", "logik", "sprache", "visuell"].filter((domain) => domains.has(domain as TrainingDomain)).length;
  return [
    { id: "first-step", title: "Erster Impuls", description: "Die erste Aufgabe bewusst abgeschlossen.", icon: "✦", progress: Math.min(results.length, 1), target: 1, unlocked: results.length >= 1, tone: "warm" },
    { id: "rhythm", title: "Eigener Rhythmus", description: "Zehn Aufgaben bilden eine stabile Basis.", icon: "◌", progress: Math.min(results.length, 10), target: 10, unlocked: results.length >= 10, tone: "growth" },
    { id: "five-worlds", title: "Fünf Welten", description: "Alle zentralen Trainingsbereiche erkundet.", icon: "◇", progress: balanced, target: 5, unlocked: balanced >= 5, tone: "focus" },
    { id: "quality", title: "Klare Linie", description: "Zehn Ergebnisse mit mindestens 85 %.", icon: "⌁", progress: Math.min(strongResults, 10), target: 10, unlocked: strongResults >= 10, tone: "mastery" },
    { id: "time", title: "Tiefe Präsenz", description: "Insgesamt 120 Minuten konzentriert trainiert.", icon: "◎", progress: Math.min(totalMinutes, 120), target: 120, unlocked: totalMinutes >= 120, tone: "focus" },
    { id: "continuity", title: "Beständige Entwicklung", description: "Fünfzig Aufgaben ohne Leistungsdruck gesammelt.", icon: "↗", progress: Math.min(results.length, 50), target: 50, unlocked: results.length >= 50, tone: "growth" }
  ];
}

export function strongestDomain(results: TrainingResult[]) {
  const grouped = new Map<TrainingDomain, number[]>();
  for (const result of results) grouped.set(result.domain, [...(grouped.get(result.domain) || []), result.score]);
  let best: { domain: TrainingDomain; average: number } | null = null;
  for (const [domain, scores] of grouped) {
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    if (!best || average > best.average) best = { domain, average };
  }
  return best ? { ...best, label: domainLabels[best.domain] } : null;
}
