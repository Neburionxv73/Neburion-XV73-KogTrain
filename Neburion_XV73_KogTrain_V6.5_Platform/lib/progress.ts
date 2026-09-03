export type LabId = "memory" | "attention" | "logic" | "language" | "visual" | "brainFit";
export type StorageScope = "stable" | "preview" | "unknown";

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

export type ProgressDay = {
  date: string;
  label: string;
  count: number;
  bestPercent: number | null;
};

export type ProgressTrend = {
  sessions: number;
  activeDays: number;
  firstBest: number | null;
  lastBest: number | null;
  deltaBest: number | null;
};

export type ProgressSnapshot = {
  labs: LabProgress[];
  totalSessions: number;
  trainedAreas: number;
  averageBest: number;
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  todaySessions: number;
  dailyGoal: number;
  weekSessions: number;
  weeklyGoal: number;
  activeDays7: number;
  averageSessionsPerActiveDay: number;
  lastSessionAt: string | null;
  streak: number;
  recommendation: LabProgress | null;
  strongest: LabProgress | null;
  recentDays: { label: string; count: number }[];
  recentDays30: ProgressDay[];
  trend7: ProgressTrend;
  trend30: ProgressTrend;
  hasTrainingData: boolean;
  activityCount: number;
  storageHost: string;
  storageScope: StorageScope;
};

const ACTIVITY_KEY = "neburion-v65-progress-events";
const BASELINE_KEY = "neburion-v65-progress-baseline";
const DAILY_GOAL = 2;
const WEEKLY_GOAL = 5;
const XP_PER_SESSION = 80;
const XP_PER_LEVEL = 500;
const BRAIN_FIT_COMPLETION_KEY = "neburion-v65-brain-fit-completion-v376";

const configs: Array<{ id: LabId; label: string; href: string; keys: string[]; accent: string }> = [
  { id: "memory", label: "Memory", href: "/training/memory", keys: ["neburion-v65-memory-progress"], accent: "Gedächtnis" },
  { id: "attention", label: "Attention", href: "/training/attention", keys: ["neburion-v65-attention-stats"], accent: "Aufmerksamkeit" },
  { id: "logic", label: "Logic", href: "/training/logic", keys: ["neburion-v65-logic-stats-v3", "neburion-v65-logic-stats-v2"], accent: "Logik" },
  { id: "language", label: "Language", href: "/training/language", keys: ["neburion-v65-language-stats-v3", "neburion-v65-language-stats-v2"], accent: "Sprache" },
  { id: "visual", label: "Visual", href: "/training/visual", keys: ["neburion-v65-visual-stats"], accent: "Visuell" },
  { id: "brainFit", label: "Gehirnfit", href: "/training/brain-fit", keys: ["neburion-v65-brain-fit-v372"], accent: "Rätsel & Alltag" },
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
  } else if (config.id === "brainFit") {
    const mainSessions = Number(data.sessions ?? 0);
    const mainTotal = Number(data.totalScore ?? 0);
    const completion = readJson(BRAIN_FIT_COMPLETION_KEY) ?? {};
    const completionSessions = Number(completion.sessions ?? 0);
    const completionTotal = Number(completion.totalScore ?? 0);
    sessions = mainSessions + completionSessions;
    const combinedTotal = mainTotal + completionTotal;
    bestPercent = sessions > 0 ? Math.round(combinedTotal / sessions) : 0;
  } else {
    sessions = Number(data.sessions ?? 0);
    bestPercent = Math.round((Number(data.bestScore ?? 0) / 8) * 100);
  }

  return {
    ...config,
    sessions: Math.max(0, Number.isFinite(sessions) ? sessions : 0),
    bestPercent: Math.max(0, Math.min(100, Number.isFinite(bestPercent) ? bestPercent : 0)),
  };
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readEvents(): ActivityEvent[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function syncActivity(labs: LabProgress[]): ActivityEvent[] {
  const events = readEvents();
  const baselineRaw = readJson(BASELINE_KEY);
  const current = Object.fromEntries(labs.map((lab) => [lab.id, lab.sessions])) as Record<LabId, number>;

  if (!baselineRaw) {
    try { localStorage.setItem(BASELINE_KEY, JSON.stringify(current)); } catch {}
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
    try {
      localStorage.setItem(BASELINE_KEY, JSON.stringify(current));
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events.slice(-180)));
    } catch {}
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

function getStorageContext(): { storageHost: string; storageScope: StorageScope } {
  if (typeof window === "undefined") return { storageHost: "unbekannt", storageScope: "unknown" };
  const storageHost = window.location.hostname;
  const previewPattern = /-[a-z0-9]{7,}-[^.]+\.vercel\.app$/i;
  const storageScope: StorageScope = previewPattern.test(storageHost) ? "preview" : "stable";
  return { storageHost, storageScope };
}

function buildTimeline(events: ActivityEvent[], days: number): ProgressDay[] {
  return Array.from({ length: days }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - offset));
    const key = dateKey(date);
    const dayEvents = events.filter((event) => dateKey(new Date(event.completedAt)) === key);
    const bestPercent = dayEvents.length ? Math.max(...dayEvents.map((event) => event.bestPercent)) : null;
    return {
      date: key,
      label: new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit" }).format(date),
      count: dayEvents.length,
      bestPercent,
    };
  });
}

function summarizeTrend(days: ProgressDay[]): ProgressTrend {
  const active = days.filter((day) => day.count > 0);
  const measured = days.filter((day) => day.bestPercent !== null);
  const firstBest = measured[0]?.bestPercent ?? null;
  const lastBest = measured.at(-1)?.bestPercent ?? null;
  return {
    sessions: days.reduce((sum, day) => sum + day.count, 0),
    activeDays: active.length,
    firstBest,
    lastBest,
    deltaBest: firstBest !== null && lastBest !== null ? lastBest - firstBest : null,
  };
}

export function getProgressSnapshot(): ProgressSnapshot {
  const labs = configs.map(readLab);
  const events = syncActivity(labs);
  const totalSessions = labs.reduce((sum, lab) => sum + lab.sessions, 0);
  const activeLabs = labs.filter((lab) => lab.sessions > 0);
  const trainedAreas = activeLabs.length;
  const hasTrainingData = trainedAreas > 0;
  const averageBest = hasTrainingData
    ? Math.round(activeLabs.reduce((sum, lab) => sum + lab.bestPercent, 0) / activeLabs.length)
    : 0;

  const untrainedLabs = labs.filter((lab) => lab.sessions === 0);
  const weakestActive = [...activeLabs].sort((a, b) => a.bestPercent - b.bestPercent || a.sessions - b.sessions)[0] ?? null;
  const recommendation = hasTrainingData ? (untrainedLabs[0] ?? weakestActive) : null;
  const strongest = hasTrainingData
    ? [...activeLabs].sort((a, b) => b.bestPercent - a.bestPercent || b.sessions - a.sessions)[0]
    : null;

  const today = dateKey(new Date());
  const todaySessions = events.filter((event) => dateKey(new Date(event.completedAt)) === today).length;
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekEvents = events.filter((event) => new Date(event.completedAt) >= weekStart);
  const weekSessions = weekEvents.length;
  const activeDays7 = new Set(weekEvents.map((event) => dateKey(new Date(event.completedAt)))).size;
  const averageSessionsPerActiveDay = activeDays7 ? Math.round((weekSessions / activeDays7) * 10) / 10 : 0;
  const lastSessionAt = events.length ? [...events].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt : null;
  const recentDays30 = buildTimeline(events, 30);
  const recentDays = recentDays30.slice(-7).map((day) => ({
    label: new Intl.DateTimeFormat("de-AT", { weekday: "short" }).format(new Date(`${day.date}T12:00:00`)).replace(".", ""),
    count: day.count,
  }));
  const trend7 = summarizeTrend(recentDays30.slice(-7));
  const trend30 = summarizeTrend(recentDays30);

  const xp = totalSessions * XP_PER_SESSION + labs.reduce((sum, lab) => sum + Math.round(lab.bestPercent / 5) * 5, 0);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const storage = getStorageContext();

  return {
    labs,
    totalSessions,
    trainedAreas,
    averageBest,
    xp,
    level,
    xpInLevel,
    xpToNextLevel: XP_PER_LEVEL,
    todaySessions,
    dailyGoal: DAILY_GOAL,
    weekSessions,
    weeklyGoal: WEEKLY_GOAL,
    activeDays7,
    averageSessionsPerActiveDay,
    lastSessionAt,
    streak: calculateStreak(events),
    recommendation,
    strongest,
    recentDays,
    recentDays30,
    trend7,
    trend30,
    hasTrainingData,
    activityCount: events.length,
    ...storage,
  };
}
