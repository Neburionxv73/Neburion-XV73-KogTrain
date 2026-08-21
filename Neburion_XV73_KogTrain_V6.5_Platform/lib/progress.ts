export type LabId = "memory" | "attention" | "logic" | "language" | "visual";

export type LabProgress = {
  id: LabId;
  label: string;
  href: string;
  sessions: number;
  bestPercent: number;
  accent: string;
};

export type ActivityEvent = {
  id: string;
  lab: LabId;
  completedAt: string;
  bestPercent: number;
};

export type ProgressSnapshot = {
  labs: LabProgress[];
  totalSessions: number;
  averageBest: number;
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  todaySessions: number;
  dailyGoal: number;
  weekSessions: number;
  weeklyGoal: number;
  streak: number;
  recommendation: LabProgress;
  strongest: LabProgress;
  recentDays: { label: string; count: number }[];
};

const ACTIVITY_KEY = "neburion-v65-progress-events";
const BASELINE_KEY = "neburion-v65-progress-baseline";
const DAILY_GOAL = 2;
const WEEKLY_GOAL = 5;
const XP_PER_SESSION = 80;
const XP_PER_LEVEL = 500;

const configs: Array<{ id: LabId; label: string; href: string; keys: string[]; accent: string }> = [
  { id: "memory", label: "Memory", href: "/training/memory", keys: ["neburion-v65-memory-progress"], accent: "Gedächtnis" },
  { id: "attention", label: "Attention", href: "/training/attention", keys: ["neburion-v65-attention-stats"], accent: "Aufmerksamkeit" },
  { id: "logic", label: "Logic", href: "/training/logic", keys: ["neburion-v65-logic-stats-v3", "neburion-v65-logic-stats-v2"], accent: "Logik" },
  { id: "language", label: "Language", href: "/training/language", keys: ["neburion-v65-language-stats-v3", "neburion-v65-language-stats-v2"], accent: "Sprache" },
  { id: "visual", label: "Visual", href: "/training/visual", keys: ["neburion-v65-visual-stats"], accent: "Visuell" },
];

function readJson(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readLab(config: (typeof configs)[number]): LabProgress {
  const data = config.keys.map(readJson).find(Boolean) ?? {};
  let sessions = 0;
  let bestPercent = 0;

  if (config.id === "memory") {
    sessions = Number(data.completedSessions ?? 0);
    bestPercent = Math.round((Number(data.bestScore ?? 0) / 8) * 100);
  } else if (config.id === "attention") {
    sessions = Number(data.sessions ?? 0);
    bestPercent = Number(data.bestAccuracy ?? 0);
  } else {
    sessions = Number(data.sessions ?? 0);
    bestPercent = Math.round((Number(data.bestScore ?? 0) / 8) * 100);
  }

  return { ...config, sessions, bestPercent: Math.max(0, Math.min(100, bestPercent)) };
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readEvents(): ActivityEvent[] {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? "[]") as ActivityEvent[];
  } catch {
    return [];
  }
}

function syncActivity(labs: LabProgress[]): ActivityEvent[] {
  const events = readEvents();
  const baselineRaw = readJson(BASELINE_KEY);
  const current = Object.fromEntries(labs.map((lab) => [lab.id, lab.sessions])) as Record<LabId, number>;

  if (!baselineRaw) {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(current));
    return events;
  }

  const baseline = baselineRaw as Partial<Record<LabId, number>>;
  const now = new Date();
  let changed = false;

  labs.forEach((lab) => {
    const previous = Number(baseline[lab.id] ?? lab.sessions);
    const delta = Math.max(0, lab.sessions - previous);
    for (let index = 0; index < delta; index += 1) {
      events.push({
        id: `${lab.id}-${now.getTime()}-${index}`,
        lab: lab.id,
        completedAt: new Date(now.getTime() + index).toISOString(),
        bestPercent: lab.bestPercent,
      });
    }
    if (delta > 0 || previous !== lab.sessions) changed = true;
  });

  if (changed) {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(current));
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events.slice(-180)));
  }

  return events.slice(-180);
}

function calculateStreak(events: ActivityEvent[]): number {
  const activeDays = new Set(events.map((event) => dateKey(new Date(event.completedAt))));
  const cursor = new Date();
  if (!activeDays.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (activeDays.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getProgressSnapshot(): ProgressSnapshot {
  const labs = configs.map(readLab);
  const events = syncActivity(labs);
  const totalSessions = labs.reduce((sum, lab) => sum + lab.sessions, 0);
  const activeLabs = labs.filter((lab) => lab.sessions > 0);
  const averageBest = activeLabs.length ? Math.round(activeLabs.reduce((sum, lab) => sum + lab.bestPercent, 0) / activeLabs.length) : 0;
  const sorted = [...labs].sort((a, b) => a.bestPercent - b.bestPercent || a.sessions - b.sessions);
  const recommendation = activeLabs.length ? sorted[0] : labs[0];
  const strongest = [...labs].sort((a, b) => b.bestPercent - a.bestPercent || b.sessions - a.sessions)[0];

  const today = dateKey(new Date());
  const todaySessions = events.filter((event) => dateKey(new Date(event.completedAt)) === today).length;
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekSessions = events.filter((event) => new Date(event.completedAt) >= weekStart).length;
  const recentDays = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = dateKey(date);
    const label = new Intl.DateTimeFormat("de-AT", { weekday: "short" }).format(date).replace(".", "");
    return { label, count: events.filter((event) => dateKey(new Date(event.completedAt)) === key).length };
  });

  const xp = totalSessions * XP_PER_SESSION + labs.reduce((sum, lab) => sum + Math.round(lab.bestPercent / 5) * 5, 0);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  return {
    labs,
    totalSessions,
    averageBest,
    xp,
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
    todaySessions,
    dailyGoal: DAILY_GOAL,
    weekSessions,
    weeklyGoal: WEEKLY_GOAL,
    streak: calculateStreak(events),
    recommendation,
    strongest,
    recentDays,
  };
}
