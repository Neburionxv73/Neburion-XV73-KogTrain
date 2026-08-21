"use client";

import { useEffect, useState } from "react";
import { createVisualSession, VISUAL_SESSION_LENGTH, VISUAL_STORAGE_KEY, type VisualMode, type VisualSession } from "@/lib/visual";
import styles from "./VisualTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type VisualStats = { sessions: number; bestScore: number; modeStats: Partial<Record<VisualMode, ModeStat>> };
type Outcome = { mode: VisualMode; correct: boolean };
type Phase = "intro" | "preview" | "question" | "feedback" | "done";

const initialStats: VisualStats = { sessions: 0, bestScore: 0, modeStats: {} };
const labels: Record<VisualMode, string> = {
  rotation: "Rotation",
  mirror: "Spiegelung",
  pattern: "Musterreihe",
  matrix: "Matrix",
  position: "Positionswechsel",
  search: "Visuelle Suche",
  compare: "Formvergleich",
  memory: "Kurzzeitgedächtnis",
};

export function VisualTraining() {
  const [session, setSession] = useState<VisualSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<VisualStats>(initialStats);
  const current = session?.tasks[index];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISUAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<VisualStats>;
      setStats({
        sessions: parsed.sessions ?? 0,
        bestScore: parsed.bestScore ?? 0,
        modeStats: parsed.modeStats ?? {},
      });
    } catch {
      setStats(initialStats);
    }
  }, []);

  useEffect(() => {
    if (phase !== "preview" || !current?.previewMs) return;
    const timer = window.setTimeout(() => setPhase("question"), current.previewMs);
    return () => window.clearTimeout(timer);
  }, [phase, current]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase !== "question" || !current) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < current.options.length) answer(optionIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function enterTask(active: VisualSession, taskIndex: number) {
    setIndex(taskIndex);
    setSelected(null);
    setPhase(active.tasks[taskIndex].mode === "memory" ? "preview" : "question");
  }

  function start() {
    const nextSession = createVisualSession(stats.bestScore);
    setSession(nextSession);
    setOutcomes([]);
    enterTask(nextSession, 0);
  }

  function answer(optionIndex: number) {
    if (!current || phase !== "question") return;
    const correct = optionIndex === current.answer;
    setSelected(optionIndex);
    setOutcomes((value) => [...value, { mode: current.mode, correct }]);
    setPhase("feedback");
  }

  function next() {
    if (!session) return;
    if (index < session.tasks.length - 1) {
      enterTask(session, index + 1);
      return;
    }

    const score = outcomes.filter((item) => item.correct).length;
    const modeStats = { ...stats.modeStats };
    outcomes.forEach((item) => {
      const previous = modeStats[item.mode] ?? { attempts: 0, correct: 0 };
      modeStats[item.mode] = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (item.correct ? 1 : 0),
      };
    });
    const nextStats: VisualStats = {
      sessions: stats.sessions + 1,
      bestScore: Math.max(stats.bestScore, score),
      modeStats,
    };
    setStats(nextStats);
    try { localStorage.setItem(VISUAL_STORAGE_KEY, JSON.stringify(nextStats)); } catch {}
    setPhase("done");
  }

  const score = outcomes.filter((item) => item.correct).length;
  const percent = session ? Math.round((score / session.tasks.length) * 100) : 0;

  return (
    <section className={styles.trainer} aria-live="polite">
      <div className={styles.stats}>
        <span>Sessions <strong>{stats.sessions}</strong></span>
        <span>Bestwert <strong>{stats.bestScore}/{VISUAL_SESSION_LENGTH}</strong></span>
        <span>{session ? `Level ${session.difficulty}` : "Visual Lab 2.0"}</span>
      </div>

      {phase === "intro" && (
        <div className={styles.stage}>
          <p className="eyebrow">8 visuelle Trainingsmodi</p>
          <h2>Sehen. Vergleichen. Erinnern. Räumlich denken.</h2>
          <p>Jede Session kombiniert genau einmal Rotation, Spiegelung, Muster, Matrix, Positionswechsel, visuelle Suche, Formvergleich und Kurzzeitgedächtnis.</p>
          <div className={styles.modeGrid}>{Object.values(labels).map((label) => <span key={label}>{label}</span>)}</div>
          <button className="primary trainingButton" type="button" onClick={start}>Visual Session starten</button>
        </div>
      )}

      {phase === "preview" && current?.preview && (
        <div className={styles.stage}>
          <p className="eyebrow">{labels[current.mode]} · Aufgabe {index + 1}/{VISUAL_SESSION_LENGTH}</p>
          <h2>Präge dir die Reihenfolge ein.</h2>
          <div className={styles.previewBadge}>Nur kurz sichtbar</div>
          <div className={styles.visualBoard} aria-label={`Zu merkende Folge: ${current.preview.join(" ")}`}>
            {current.preview.map((item, itemIndex) => <span key={`${item}-${itemIndex}`}>{item}</span>)}
          </div>
          <p>Danach wird nach einer Position in dieser Folge gefragt.</p>
        </div>
      )}

      {phase === "question" && current && session && (
        <div className={styles.stage}>
          <p className="eyebrow">{labels[current.mode]} · Aufgabe {index + 1}/{session.tasks.length}</p>
          <h2>{current.prompt}</h2>
          <div className={`${styles.visualBoard} ${current.visual.length === 9 ? styles.gridBoard : ""}`} aria-label={current.visual.join(" ")}>
            {current.visual.map((item, itemIndex) => <span key={`${item}-${itemIndex}`}>{item}</span>)}
          </div>
          <div className={styles.options}>
            {current.options.map((option, optionIndex) => (
              <button key={`${current.id}-${optionIndex}`} type="button" onClick={() => answer(optionIndex)}>
                <kbd>{optionIndex + 1}</kbd>{option}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && current && selected !== null && (
        <div className={styles.stage}>
          <p className={`${styles.feedbackBadge} ${selected === current.answer ? styles.correct : styles.incorrect}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Visuell korrekt erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
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
            {(Object.entries(stats.modeStats) as [VisualMode, ModeStat][]).map(([mode, value]) => (
              <div key={mode}><span>{labels[mode]}</span><strong>{value.attempts ? Math.round((value.correct / value.attempts) * 100) : 0}%</strong></div>
            ))}
          </div>
          <p>Die nächste Session erzeugt neue Reize und passt die Schwierigkeit an deinen bisherigen Bestwert an.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Visual Session</button>
        </div>
      )}
    </section>
  );
}
