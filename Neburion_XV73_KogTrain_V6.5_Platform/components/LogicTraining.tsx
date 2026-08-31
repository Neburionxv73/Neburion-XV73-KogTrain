"use client";

import { useEffect, useState } from "react";
import { createLogicSession, LOGIC_SESSION_LENGTH, LOGIC_STORAGE_KEY, type LogicMode, type LogicSession } from "@/lib/logicV2";
import styles from "./LogicTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type LogicStats = { sessions: number; bestScore: number; modeStats: Partial<Record<LogicMode, ModeStat>> };
type Outcome = { mode: LogicMode; correct: boolean };
type Phase = "intro" | "question" | "feedback" | "done";

const initialStats: LogicStats = { sessions: 0, bestScore: 0, modeStats: {} };
const labels: Record<LogicMode, string> = {
  sequence: "Zahlenfolge",
  rule: "Regel",
  analogy: "Analogie",
  deduction: "Schlussfolgerung",
  matrix: "Matrix",
  operator: "Operator",
  exclusion: "Ausschluss",
  spatial: "Räumliche Logik",
};

export function LogicTraining() {
  const [session, setSession] = useState<LogicSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<LogicStats>(initialStats);
  const current = session?.tasks[index];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOGIC_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<LogicStats>;
      setStats({
        sessions: saved.sessions ?? 0,
        bestScore: saved.bestScore ?? 0,
        modeStats: saved.modeStats ?? {},
      });
    } catch {
      setStats(initialStats);
    }
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase !== "question" || !current) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < current.options.length) answer(optionIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function start() {
    setSession(createLogicSession(stats.bestScore));
    setIndex(0);
    setSelected(null);
    setOutcomes([]);
    setPhase("question");
  }

  function answer(optionIndex: number) {
    if (!current || phase !== "question") return;
    const correct = optionIndex === current.answer;
    setSelected(optionIndex);
    setOutcomes((values) => [...values, { mode: current.mode, correct }]);
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
      const previous = modeStats[item.mode] ?? { attempts: 0, correct: 0 };
      modeStats[item.mode] = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (item.correct ? 1 : 0),
      };
    });
    const nextStats: LogicStats = {
      sessions: stats.sessions + 1,
      bestScore: Math.max(stats.bestScore, score),
      modeStats,
    };
    setStats(nextStats);
    try { localStorage.setItem(LOGIC_STORAGE_KEY, JSON.stringify(nextStats)); } catch {}
    setPhase("done");
  }

  const score = outcomes.filter((item) => item.correct).length;
  const percent = session ? Math.round((score / session.tasks.length) * 100) : 0;

  return (
    <section className={styles.logicTrainer} aria-live="polite">
      <div className="trainingStats">
        <span>Sessions {stats.sessions}</span>
        <span>Bestwert {stats.bestScore} / {LOGIC_SESSION_LENGTH}</span>
        <span>{session ? `Level ${session.difficulty}` : "Logic Lab 2.2 · Dynamic V2"}</span>
      </div>

      {phase === "intro" && (
        <div className="trainingStage">
          <p className="eyebrow">8 dynamische Logikmodi · V2</p>
          <h2>Regeln erkennen. Schlüsse ziehen. Muster weiterdenken.</h2>
          <p>Dynamic Engine V2 erzeugt deutlich mehr Varianten pro Modus: steigende und fallende Folgen, mehrstufige Regeln, wechselnde Analogien, Deduktionen, Matrizen, Operatoren, Ausschlussmuster und mehrstufige Raumdrehungen. Die Schwierigkeit passt sich deinem bisherigen Bestwert an.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Logic Session starten</button>
        </div>
      )}

      {phase === "question" && current && session && (
        <div className={`trainingStage ${styles.logicStage}`}>
          <p className="eyebrow">{labels[current.mode]} · Aufgabe {index + 1}/{session.tasks.length}</p>
          <h2>{current.prompt}</h2>
          <div className={styles.logicPattern}>{current.detail}</div>
          <div className={styles.logicOptions}>
            {current.options.map((option, optionIndex) => (
              <button key={`${current.id}-${optionIndex}`} type="button" onClick={() => answer(optionIndex)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && current && selected !== null && (
        <div className={`trainingStage ${styles.logicStage}`}>
          <p className={`feedbackBadge ${selected === current.answer ? "correct" : "incorrect"}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Regel erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <button className="primary trainingButton" type="button" onClick={next}>{session && index === session.tasks.length - 1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && session && (
        <div className="trainingStage resultStage">
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{percent}% richtig</h2>
          <div className="finalScore"><strong>{score}</strong><span>/ {session.tasks.length}</span></div>
          <div className={styles.logicOptions}>
            {(Object.entries(stats.modeStats) as [LogicMode, ModeStat][]).map(([mode, value]) => (
              <div key={mode}><span>{labels[mode]}</span> <strong>{value.attempts ? Math.round((value.correct / value.attempts) * 100) : 0}%</strong></div>
            ))}
          </div>
          <p>Die nächste Session erzeugt neue Varianten und passt die Schwierigkeit erneut an.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Logic Session</button>
        </div>
      )}
    </section>
  );
}