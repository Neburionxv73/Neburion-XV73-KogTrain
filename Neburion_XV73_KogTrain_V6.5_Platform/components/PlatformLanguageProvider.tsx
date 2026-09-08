"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./PlatformLanguageProvider.module.css";

export type PlatformLanguage = "de" | "en";

type TranslationValue = string | ((values: Record<string, string | number>) => string);
type TranslationTable = Record<string, { de: TranslationValue; en: TranslationValue }>;

const STORAGE_KEY = "neburion-kogtrain-language";

const translations: TranslationTable = {
  "language.de": { de: "Deutsch", en: "German" },
  "language.en": { de: "Englisch", en: "English" },
  "language.switch": { de: "Sprache wechseln", en: "Switch language" },
  "skip.content": { de: "Direkt zum Inhalt", en: "Skip to content" },
  "nav.main": { de: "Hauptnavigation", en: "Main navigation" },
  "nav.learningPlatform": { de: "Lern Plattform", en: "Learning Platform" },
  "nav.trainingAreas": { de: "Trainingsbereiche", en: "Training areas" },
  "nav.progress": { de: "Fortschritt", en: "Progress" },
  "nav.settings": { de: "Einstellungen", en: "Settings" },
  "nav.statistics": { de: "Statistiken", en: "Statistics" },
  "nav.achievements": { de: "Erfolge", en: "Achievements" },
  "nav.calendar": { de: "Kalender", en: "Calendar" },
  "nav.learningPath": { de: "Lernpfad", en: "Learning path" },
  "nav.profile": { de: "Profil", en: "Profile" },
  "nav.logout": { de: "Abmelden", en: "Sign out" },
  "area.memory": { de: "Gedächtnis", en: "Memory" },
  "area.attention": { de: "Aufmerksamkeit", en: "Attention" },
  "area.logic": { de: "Logik", en: "Logic" },
  "area.language": { de: "Sprache", en: "Language" },
  "area.visual": { de: "Visuell", en: "Visual" },
  "area.brainfit": { de: "Gehirnfit", en: "BrainFit" },
  "area.brainfitSub": { de: "Rätsel & Alltag", en: "Puzzles & everyday skills" },
  "dashboard.quote": { de: "Kleine Schritte. Große Entwicklung.", en: "Small steps. Big progress." },
  "dashboard.welcome": { de: "Willkommen zurück!", en: "Welcome back!" },
  "dashboard.headline": { de: "Weiter so, du machst das großartig.", en: "Keep going — you’re doing great." },
  "dashboard.tagline": { de: "Persönlich. Klar. Wiederholbar.", en: "Personal. Clear. Repeatable." },
  "dashboard.sessions": { de: "Sessions", en: "Sessions" },
  "dashboard.activeDays": { de: "aktive Tage", en: "active days" },
  "dashboard.streak": { de: "Tage in Folge", en: "day streak" },
  "dashboard.currentStreak": { de: "Aktuelle Serie", en: "Current streak" },
  "dashboard.minutes": { de: "Trainingsminuten", en: "Training minutes" },
  "dashboard.totalTime": { de: "Gesamtzeit", en: "Total time" },
  "dashboard.lastValue": { de: "Letzter Wert", en: "Latest value" },
  "dashboard.lastActivity": { de: "Letzte Aktivität", en: "Latest activity" },
  "dashboard.noData": { de: "Noch keine Daten", en: "No data yet" },
  "dashboard.totalProfile": { de: "Gesamtprofil", en: "Overall profile" },
  "dashboard.areasDevelopment": { de: "Bereiche und Entwicklung", en: "Areas and development" },
  "dashboard.showAll": { de: "Alle anzeigen", en: "Show all" },
  "dashboard.evidence": { de: "Evidenz", en: "Evidence" },
  "dashboard.high": { de: "hoch", en: "high" },
  "dashboard.medium": { de: "mittel", en: "medium" },
  "dashboard.low": { de: "niedrig", en: "low" },
  "dashboard.strong": { de: "Stark", en: "Strong" },
  "dashboard.stable": { de: "Stabil", en: "Stable" },
  "dashboard.building": { de: "Im Aufbau", en: "Building" },
  "dashboard.open": { de: "Noch offen", en: "Not started" },
  "dashboard.start": { de: "Starten", en: "Start" },
  "dashboard.moreAreas": { de: "Weitere Bereiche einblenden", en: "Show more areas" },
  "dashboard.moreAreasSub": { de: "Noch mehr Trainings, speziell für dich.", en: "More training options, tailored to you." },
  "dashboard.trainingGoals": { de: "Trainingsziele", en: "Training goals" },
  "dashboard.todayWeek": { de: "Heute und diese Woche", en: "Today and this week" },
  "dashboard.clear": { de: "Übersichtlich", en: "Clear overview" },
  "dashboard.dailyGoal": { de: "Tagesziel", en: "Daily goal" },
  "dashboard.weeklyGoal": { de: "Wochenziel", en: "Weekly goal" },
  "dashboard.dailyReached": { de: "Tagesziel erreicht.", en: "Daily goal reached." },
  "dashboard.dailyHint": { de: "Noch eine kurze Session bringt dich dem Tagesziel näher.", en: "One short session brings you closer to today’s goal." },
  "dashboard.weekDone": { de: "des Wochenziels sind geschafft.", en: "of the weekly goal completed." },
  "dashboard.startTraining": { de: "Training starten", en: "Start training" },
  "dashboard.consistency": { de: "Konstanz schlägt Intensität.", en: "Consistency beats intensity." },
  "dashboard.team": { de: "Dein KogTrain Team", en: "Your KogTrain Team" },
  "dashboard.didYouKnow": { de: "Schon gewusst?", en: "Did you know?" },
  "dashboard.tip": { de: "Regelmäßiges, kurzes Training ist effektiver als seltene, lange Einheiten.", en: "Regular short training is more effective than rare long sessions." },
  "dashboard.last7": { de: "Letzte 7 Tage", en: "Last 7 days" },
  "dashboard.rhythm": { de: "Trainingsrhythmus", en: "Training rhythm" },
  "dashboard.activityExists": { de: "Aktivität vorhanden", en: "Activity available" },
  "dashboard.noDatedActivity": { de: "Noch keine datierte Aktivität", en: "No dated activity yet" },
  "dashboard.activityText": { de: "Dein 7-Tage-Verlauf basiert auf tatsächlich gespeicherten Sessions.", en: "Your 7-day history is based on actually stored sessions." },
  "dashboard.noActivityText": { de: "Der 7-Tage-Verlauf beginnt mit der ersten Session, die auf diesem Speicherbereich abgeschlossen wird.", en: "Your 7-day history starts with the first session completed in this storage profile." },
  "dashboard.storageNotice": { de: "Aktivitätsserie und Tages-/Wochenverlauf werden lokal pro Browser-Domain gespeichert. Für dauerhaft sichtbare Fortschrittswerte dieselbe stabile KogTrain-Adresse verwenden.", en: "Activity streaks and daily/weekly history are stored locally per browser domain. Use the same stable KogTrain address to keep progress visible." },
};

type LanguageContextValue = {
  language: PlatformLanguage;
  setLanguage: (language: PlatformLanguage) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  pick: (de: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLanguage(): PlatformLanguage {
  if (typeof window === "undefined") return "de";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function PlatformLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<PlatformLanguage>("de");

  useEffect(() => {
    const initial = readInitialLanguage();
    setLanguageState(initial);
    document.documentElement.lang = initial === "en" ? "en" : "de";
  }, []);

  const setLanguage = (next: PlatformLanguage) => {
    setLanguageState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.documentElement.lang = next === "en" ? "en" : "de";
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, values = {}) => {
      const entry = translations[key];
      if (!entry) return key;
      const current = entry[language];
      return typeof current === "function" ? current(values) : current;
    },
    pick: (de, en) => language === "en" ? en : de,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      <div className={styles.languageSwitch} role="group" aria-label={value.t("language.switch")}>
        <button type="button" onClick={() => setLanguage("de")} aria-pressed={language === "de"}>DE</button>
        <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"}>EN</button>
      </div>
      {children}
    </LanguageContext.Provider>
  );
}

export function usePlatformLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("usePlatformLanguage must be used inside PlatformLanguageProvider");
  return context;
}
