"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./LanguageTraining.module.css";

type LanguageQuestion = {
  category: string;
  prompt: string;
  detail: string;
  options: string[];
  answer: number;
  explanation: string;
};

const STORAGE_KEY = "neburion-v65-language-stats";

const questions: LanguageQuestion[] = [
  { category: "Synonym", prompt: "Welches Wort bedeutet fast dasselbe wie „präzise“?", detail: "Wähle die passendste Bedeutung.", options: ["genau", "laut", "schnell", "selten"], answer: 0, explanation: "„Präzise“ bedeutet genau, sorgfältig oder sehr treffend." },
  { category: "Oberbegriff", prompt: "Welcher Oberbegriff passt zu Eiche, Buche und Ahorn?", detail: "Finde die gemeinsame Kategorie.", options: ["Blumen", "Bäume", "Gräser", "Moose"], answer: 1, explanation: "Eiche, Buche und Ahorn sind Baumarten." },
  { category: "Analogie", prompt: "Hand verhält sich zu Finger wie Fuß zu …", detail: "Ergänze die Beziehung.", options: ["Knie", "Zehe", "Arm", "Schulter"], answer: 1, explanation: "Finger sind Teil der Hand; Zehen sind entsprechend Teil des Fußes." },
  { category: "Wortfeld", prompt: "Welches Wort gehört am wenigsten zum Wortfeld „sprechen“?", detail: "Drei Wörter passen semantisch zusammen.", options: ["flüstern", "erzählen", "rufen", "zeichnen"], answer: 3, explanation: "„Zeichnen“ beschreibt keine Form des Sprechens." },
  { category: "Satzlogik", prompt: "Welche Ergänzung ergibt den logischsten Satz?", detail: "Obwohl es stark regnete, …", options: ["blieb die Straße trocken", "nahm sie einen Regenschirm", "war der Himmel wolkenlos", "wurde Wasser zu Staub"], answer: 1, explanation: "Ein Regenschirm ist eine plausible Reaktion auf starken Regen." },
  { category: "Begriffsbeziehung", prompt: "Welches Paar hat dieselbe Beziehung wie „Buch : lesen“?", detail: "Gegenstand und typische Tätigkeit.", options: ["Musik : hören", "Tasse : laufen", "Fenster : essen", "Schuh : schreiben"], answer: 0, explanation: "Ein Buch wird gelesen; Musik wird typischerweise gehört." },
];

export function LanguageTraining() {
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
    <section className={styles.trainer} aria-live="polite">
      <div className={styles.stats}>
        <span>Session {stats.sessions + (phase === "done" ? 0 : 1)}</span>
        <span>Bestwert {stats.bestScore} / {sessionQuestions.length}</span>
        <span>{phase === "question" || phase === "feedback" ? `Aufgabe ${index + 1} / ${sessionQuestions.length}` : "Language Lab"}</span>
      </div>

      {phase === "intro" && (
        <div className={styles.stage}>
          <p className="eyebrow">6 Aufgaben</p>
          <h2>Begriffe verstehen. Sprache verknüpfen.</h2>
          <p>Trainiere Synonyme, Kategorien, Analogien, Wortfelder und sprachliche Beziehungen.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Training starten</button>
        </div>
      )}

      {phase === "question" && (
        <div className={styles.stage}>
          <p className="eyebrow">{current.category}</p>
          <h2>{current.prompt}</h2>
          <div className={styles.prompt}>{current.detail}</div>
          <div className={styles.options}>
            {current.options.map((option, optionIndex) => (
              <button className={styles.option} key={option} type="button" onClick={() => answer(optionIndex)}>{option}</button>
            ))}
          </div>
        </div>
      )}

      {phase === "feedback" && selected !== null && (
        <div className={`${styles.stage} ${styles.feedback}`}>
          <p className={`${styles.feedbackBadge} ${selected === current.answer ? styles.correct : styles.incorrect}`}>{selected === current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected === current.answer ? "Sprachliche Beziehung erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <button className="primary trainingButton" type="button" onClick={next}>{index === sessionQuestions.length - 1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && (
        <div className={styles.stage}>
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{percent}% richtig</h2>
          <div className={styles.score}><strong>{score}</strong><span>/ {sessionQuestions.length}</span></div>
          <p>Dein Bestwert: {stats.bestScore} von {sessionQuestions.length}. Der Wert beschreibt nur diese Trainingssession und ist keine medizinische Diagnose.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Session</button>
        </div>
      )}
    </section>
  );
}
