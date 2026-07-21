export type MissionDomain = "gedaechtnis" | "aufmerksamkeit" | "logik";

export type DailyMission = {
  id: string;
  title: string;
  description: string;
  domain: MissionDomain;
  href: string;
  xp: number;
  completed: boolean;
};

export type PlatformProfile = {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  completedMissionIds: string[];
};
