"use client";

import { useEffect, useState } from "react";
import { createVisualSession, type VisualSession } from "@/lib/visual";
import styles from "./VisualTraining.module.css";

const STORAGE_KEY = "neburion-v65-visual-stats";

type VisualStats = { sessions: number; bestScore: number };

type Phase = "intro" | "question" | "feedback" | "done";

export function VisualTraining() {
  const [session, setSession] = useState<VisualSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<VisualStats>({ sessions: 0, bestScore: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  function start() {
    const bestPercent = stats.bestScore ? Math.round((stats.bestScore / 8) * 100) : 0;
    setSession(createVisualSession(bestPercent));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPhase("question");
  }

  function answer(optionIndex: number) {
    if (!session || phase !== "question") return;
    setSelected(optionIndex);
    if (optionIndex === session.questions[index].answer) setScore((value) => value + 1);
    setPhase("feedback");
  }

  function next() {
    if (!session) return;
    if (index >= session.questions.length - 1) {
      const nextStats = { sessions: stats.sessions + 1, bestScore: Math.max(stats.bestScore, score) };
      setStats(nextStats);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats)); } catch {}
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setPhase("question");
  }

  const current = session?.questions[index];
  const percent = session ? Math.round((score / session.questions.length) * 100) : 0;

  return (
    <section className={styles.trainer} aria-live="polite">
      <div className={styles.stats}>
        <span>Sessions {stats.sessions}</span>
        <span>Bestwert {stats.bestScore}/8</span>
        <span>{session ? `Level ${session.difficulty}` : "Visual Lab"}</span>
      </div>

      {phase === "intro" && (
        <div className={styles.stage}>
          <p className="eyebrow">Dynamische visuelle Session</p>
          <h2>Muster sehen. Raumlage verstehen.</h2>
          <p>Acht wechselnde Aufgaben kombinieren Musterfortsetzung, Rotation, Spiegelung, Abweichungen, Raumlage und Formvergleich.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Visual Session starten</button>
        </div>
      )}

      {phase === "question" && current && session && (
        <div className={styles.stage}>
          <p className="eyebrow">{current.category} · Aufgabe {index + 1}/{session.questions.length}</p>
          <h2>{current.prompt}</h2>
          <div className={`${styles.visualBoard} ${current.visual.length === 9 ? styles.gridBoard : ""}`} aria-label={current.visual.join(" ")}>
            {current.visual.map((item, itemIndex) => <span key={`${item}-${itemIndex}`}>{item}</span>)}
          </div>
          <div className={styles.options}>
            {current.options.map((option, optionIndex) => (
              <button key={`${option}-${optionIndex}`} type="button" onClick={() => answer(optionIndex)}>{option}</button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && current && selected !== null && (
        <div className={styles.stage}>
          <p className={`${styles.feedbackBadge} ${selected === current.answer ? styles.correct : styles.incorrect}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Visuelles Muster erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <button className="primary trainingButton" type="button" onClick={next}>{session && index === session.questions.length - 1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && session && (
        <div className={styles.stage}>
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{percent}% richtig</h2>
          <div className={styles.score}><strong>{score}</strong><span>/ {session.questions.length}</span></div>
          <p>Neue Sessions werden jedes Mal neu generiert und passen die Schwierigkeit anhand deines Bestwerts an. Das Ergebnis ist ein Trainingswert und keine medizinische Diagnose.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Visual Session</button>
        </div>
      )}
    </section>
  );
}
