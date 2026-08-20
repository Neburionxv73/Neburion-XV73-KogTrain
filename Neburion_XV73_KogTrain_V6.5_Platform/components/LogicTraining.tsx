"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./LogicTraining.module.css";

type LogicQuestion = {
  prompt: string;
  detail: string;
  options: string[];
  answer: number;
  explanation: string;
};

const STORAGE_KEY = "neburion-v65-logic-stats";

const questions: LogicQuestion[] = [
  { prompt: "Welche Zahl folgt?", detail: "2 · 4 · 8 · 16 · ?", options: ["20", "24", "32", "36"], answer: 2, explanation: "Jede Zahl wird verdoppelt." },
  { prompt: "Welche Zahl ergänzt die Reihe?", detail: "3 · 6 · 11 · 18 · ?", options: ["25", "27", "29", "31"], answer: 1, explanation: "Die Abstände steigen um 2: +3, +5, +7, dann +9." },
  { prompt: "Welches Symbol kommt als Nächstes?", detail: "●  ▲  ●  ▲  ●  ?", options: ["■", "▲", "●", "◆"], answer: 1, explanation: "Kreis und Dreieck wechseln sich ab." },
  { prompt: "Welche Aussage folgt logisch?", detail: "Alle Lumen sind Riva. Alle Riva sind Taren.", options: ["Alle Taren sind Lumen", "Kein Lumen ist Taren", "Alle Lumen sind Taren", "Nur manche Riva sind Taren"], answer: 2, explanation: "Wenn jedes Lumen ein Riva und jedes Riva ein Taren ist, ist jedes Lumen auch ein Taren." },
  { prompt: "Welche Zahl passt nicht?", detail: "4 · 8 · 12 · 15 · 20", options: ["8", "12", "15", "20"], answer: 2, explanation: "Alle anderen Zahlen sind durch 4 teilbar." },
  { prompt: "Welche Regel setzt sich fort?", detail: "1 → 3 · 2 → 6 · 4 → 12 · 7 → ?", options: ["14", "18", "21", "28"], answer: 2, explanation: "Die Eingabe wird mit 3 multipliziert." },
];

export function LogicTraining() {
  const sessionQuestions = useMemo(() => questions, []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"intro" | "question" | "feedback" | "done">("intro");
  const [stats, setStats] = useState({ sessions: 0, bestScore: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  function start() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPhase("question");
  }

  function answer(optionIndex: number) {
    if (phase !== "question") return;
    setSelected(optionIndex);
    if (optionIndex === sessionQuestions[index].answer) setScore((value) => value + 1);
    setPhase("feedback");
  }

  function next() {
    if (index >= sessionQuestions.length - 1) {
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

  const current = sessionQuestions[index];
  const percent = Math.round((score / sessionQuestions.length) * 100);

  return (
    <section className={styles.logicTrainer} aria-live="polite">
      <div className="trainingStats">
        <span>Session {stats.sessions + (phase === "done" ? 0 : 1)}</span>
        <span>Bestwert {stats.bestScore} / {sessionQuestions.length}</span>
        <span>{phase === "question" || phase === "feedback" ? `Aufgabe ${index + 1} / ${sessionQuestions.length}` : "Logic Lab"}</span>
      </div>

      {phase === "intro" && (
        <div className="trainingStage">
          <p className="eyebrow">6 Aufgaben</p>
          <h2>Finde die Regel hinter dem Muster.</h2>
          <p>Wähle jeweils eine von vier Antworten. Nach jeder Aufgabe erhältst du eine kurze Erklärung.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Training starten</button>
        </div>
      )}

      {phase === "question" && (
        <div className={`trainingStage ${styles.logicStage}`}>
          <p className="roundLabel">Aufgabe {index + 1}</p>
          <h2>{current.prompt}</h2>
          <div className={styles.logicPattern} aria-label={current.detail}>{current.detail}</div>
          <div className={styles.logicOptions}>
            {current.options.map((option, optionIndex) => (
              <button key={option} type="button" onClick={() => answer(optionIndex)}>{option}</button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && selected !== null && (
        <div className={`trainingStage ${styles.logicStage}`}>
          <p className={`feedbackBadge ${selected === current.answer ? "correct" : "incorrect"}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Regel erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <button className="primary trainingButton" type="button" onClick={next}>{index === sessionQuestions.length - 1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && (
        <div className="trainingStage resultStage">
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{percent}% richtig</h2>
          <div className="finalScore"><strong>{score}</strong><span>/ {sessionQuestions.length}</span></div>
          <p>Dein Bestwert: {stats.bestScore} von {sessionQuestions.length}. Der Wert beschreibt nur diese Trainingssession.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Session</button>
        </div>
      )}
    </section>
  );
}
