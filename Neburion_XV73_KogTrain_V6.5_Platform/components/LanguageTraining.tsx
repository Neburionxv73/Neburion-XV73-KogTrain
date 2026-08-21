"use client";

import { useEffect, useState } from "react";
import { createLanguageSession, LANGUAGE_SESSION_LENGTH, LANGUAGE_STORAGE_KEY, type LanguageMode, type LanguageSession } from "@/lib/language";
import styles from "./LanguageTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type Stats = { sessions: number; bestScore: number; recentIds: string[]; modeStats: Partial<Record<LanguageMode, ModeStat>> };
type Outcome = { mode: LanguageMode; correct: boolean };
type Phase = "intro" | "question" | "feedback" | "done";

const initialStats: Stats = { sessions: 0, bestScore: 0, recentIds: [], modeStats: {} };
const labels: Record<LanguageMode, string> = {
  synonym: "Synonyme",
  antonym: "Antonyme",
  analogy: "Analogien",
  category: "Kategorien",
  wordfield: "Wortfelder",
  sentence: "Satzlogik",
  relation: "Beziehungen",
  context: "Kontext",
};

export function LanguageTraining() {
  const [session, setSession] = useState<LanguageSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Stats>;
      setStats({
        sessions: saved.sessions ?? 0,
        bestScore: saved.bestScore ?? 0,
        recentIds: saved.recentIds ?? [],
        modeStats: saved.modeStats ?? {},
      });
    } catch {
      setStats(initialStats);
    }
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase !== "question" || !session) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < session.tasks[index].options.length) answer(optionIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function start() {
    setSession(createLanguageSession(stats.bestScore, stats.recentIds));
    setIndex(0);
    setSelected(null);
    setOutcomes([]);
    setPhase("question");
  }

  function answer(optionIndex: number) {
    if (!session || phase !== "question") return;
    const current = session.tasks[index];
    setSelected(optionIndex);
    setOutcomes((values) => [...values, { mode: current.mode, correct: optionIndex === current.answer }]);
    setPhase("feedback");
  }

  function next() {
    if (!session) return;
    if (index < session.tasks.length - 1) {
      setIndex((value) => value + 1);
      setSelected(null);
      setPhase("question");
      return;
    }

    const score = outcomes.filter((item) => item.correct).length;
    const modeStats = { ...stats.modeStats };
    outcomes.forEach((item) => {
      const current = modeStats[item.mode] ?? { attempts: 0, correct: 0 };
      modeStats[item.mode] = {
        attempts: current.attempts + 1,
        correct: current.correct + (item.correct ? 1 : 0),
      };
    });
    const nextStats: Stats = {
      sessions: stats.sessions + 1,
      bestScore: Math.max(stats.bestScore, score),
      recentIds: session.tasks.map((task) => task.id),
      modeStats,
    };
    setStats(nextStats);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(nextStats)); } catch {}
    setPhase("done");
  }

  const current = session?.tasks[index];
  const score = outcomes.filter((item) => item.correct).length;
  const percent = session ? Math.round((score / session.tasks.length) * 100) : 0;

  return (
    <section className={styles.trainer} aria-live="polite">
      <div className={styles.stats}>
        <span>Sessions <strong>{stats.sessions}</strong></span>
        <span>Bestwert <strong>{stats.bestScore}/{LANGUAGE_SESSION_LENGTH}</strong></span>
        <span>{session ? `Level ${session.difficulty}` : "Language Lab 2.0"}</span>
      </div>

      {phase === "intro" && (
        <div className={styles.stage}>
          <p className="eyebrow">8 Sprachmodi</p>
          <h2>Wörter verstehen. Beziehungen erkennen. Kontext deuten.</h2>
          <p>Jede Session kombiniert acht verschiedene Sprachbereiche. Die Aufgaben variieren, zuletzt verwendete Varianten werden nach Möglichkeit vermieden und die Schwierigkeit passt sich deinem bisherigen Bestwert an.</p>
          <div className={styles.modeGrid}>{Object.values(labels).map((label) => <span key={label}>{label}</span>)}</div>
          <button className="primary trainingButton" type="button" onClick={start}>Language Session starten</button>
        </div>
      )}

      {phase === "question" && current && session && (
        <div className={styles.stage}>
          <p className="eyebrow">{labels[current.mode]} · Aufgabe {index + 1}/{session.tasks.length}</p>
          <h2>{current.prompt}</h2>
          <div className={styles.prompt}>{current.detail}</div>
          <div className={styles.options}>
            {current.options.map((option, optionIndex) => (
              <button className={styles.option} key={`${current.id}-${optionIndex}`} type="button" onClick={() => answer(optionIndex)}>
                <kbd>{optionIndex + 1}</kbd><span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && current && selected !== null && (
        <div className={`${styles.stage} ${styles.feedback}`}>
          <p className={`${styles.feedbackBadge} ${selected === current.answer ? styles.correct : styles.incorrect}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Sprachliche Beziehung erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <button className="primary trainingButton" type="button" onClick={next}>{session && index === session.tasks.length - 1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && session && (
        <div className={styles.stage}>
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{percent}% richtig</h2>
          <div className={styles.score}><strong>{score}</strong><span>/ {session.tasks.length}</span></div>
          <div className={styles.modeStats}>
            {(Object.entries(stats.modeStats) as [LanguageMode, ModeStat][]).map(([mode, value]) => (
              <div key={mode}><span>{labels[mode]}</span><strong>{value.attempts ? Math.round((value.correct / value.attempts) * 100) : 0}%</strong></div>
            ))}
          </div>
          <p>Die nächste Session bevorzugt andere Varianten und nutzt deinen Bestwert für die Schwierigkeitsstufe.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Language Session</button>
        </div>
      )}
    </section>
  );
}
