"use client";

import { useEffect, useMemo, useState } from "react";
import { exerciseLibrary } from "@/data/exercises";
import { evaluateExercise } from "@/features/exercise-runner/engine";
import type { Exercise } from "@/features/exercise-runner/types";
import { isMemoryExercise } from "@/features/exercise-runner/types";
import { saveResult } from "@/features/progress-engine/storage";
import { nextDifficulty } from "@/features/cognitive-engine/adaptive";

function shuffled<T>(values: T[]) {
  return [...values]
    .map((value) => ({ value, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.value);
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `result-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type Attempt = {
  score: number;
  correct: boolean;
  category: string;
};

type ExerciseRunnerProps = {
  exercises?: Exercise[];
  sessionSize?: number;
  sessionLabel?: string;
};

export function ExerciseRunner({
  exercises = exerciseLibrary,
  sessionSize = 5,
  sessionLabel = "Exercise Runner 2.0"
}: ExerciseRunnerProps) {
  const session = useMemo(() => shuffled(exercises).slice(0, Math.min(sessionSize, exercises.length)), [exercises, sessionSize]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; score: number } | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const exercise = (session[index] ?? exerciseLibrary[0]) as Exercise;
  const memory = exercise ? isMemoryExercise(exercise) : false;
  const initialStudySeconds = memory && "studySeconds" in exercise ? exercise.studySeconds : 0;
  const [phase, setPhase] = useState<"study" | "answer">(memory ? "study" : "answer");
  const [studyRemaining, setStudyRemaining] = useState(initialStudySeconds);

  useEffect(() => {
    if (!exercise) return;
    const nextMemory = isMemoryExercise(exercise);
    setPhase(nextMemory ? "study" : "answer");
    setStudyRemaining(nextMemory && "studySeconds" in exercise ? exercise.studySeconds : 0);
    setSelected([]);
    setFreeText("");
    setChecked(false);
    setResult(null);
    setStartedAt(Date.now());
  }, [exercise?.id]);

  useEffect(() => {
    if (!exercise || phase !== "study") return;
    if (studyRemaining <= 0) {
      setPhase("answer");
      setStartedAt(Date.now());
      return;
    }
    const timer = window.setTimeout(() => setStudyRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [exercise, phase, studyRemaining]);

  if (!session.length) {
    return <div className="panel"><h2>Keine Übungen verfügbar.</h2><p>Für diese Auswahl sind noch keine Aufgaben hinterlegt.</p></div>;
  }

  const totalScore = attempts.reduce((sum, item) => sum + item.score, 0);
  const average = attempts.length ? Math.round(totalScore / attempts.length) : 0;

  function choose(value: string) {
    if (checked || phase !== "answer") return;
    if (exercise.type === "single-choice" || exercise.type === "memory-choice") {
      setSelected([value]);
      return;
    }
    if (exercise.type === "multi-choice") {
      setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
      return;
    }
    setSelected((current) => current.includes(value) ? current : [...current, value]);
  }

  function undoSequence() {
    if (!checked) setSelected((current) => current.slice(0, -1));
  }

  function getAnswerValues() {
    if (exercise.type !== "memory-recall") return selected;
    if (exercise.answers.length === 1) return [freeText.trim()];
    return freeText.split(/[,;\n]+/).map((value) => value.trim()).filter(Boolean);
  }

  function checkAnswer() {
    const answerValues = getAnswerValues();
    if (!answerValues.length || checked || phase !== "answer") return;
    const evaluation = evaluateExercise(exercise, answerValues);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setResult(evaluation);
    setChecked(true);
    setAttempts((current) => [...current, { ...evaluation, category: exercise.category || exercise.domain }]);
    saveResult({
      id: makeId(),
      domain: exercise.domain,
      difficulty: exercise.difficulty,
      score: evaluation.score,
      durationSeconds,
      createdAt: new Date().toISOString(),
      exerciseId: exercise.id,
      exerciseType: exercise.type,
      category: exercise.category || exercise.domain
    });
  }

  function nextTask() {
    if (index >= session.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
  }

  function restart() {
    window.location.reload();
  }

  if (finished) {
    const finalAverage = Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / Math.max(1, attempts.length));
    const currentDifficulty = session[0]?.difficulty || "leicht";
    const next = nextDifficulty(currentDifficulty, finalAverage);
    const categories = [...new Set(attempts.map((attempt) => attempt.category))];
    return <div className="panel runner-complete">
      <span className="eyebrow">Training abgeschlossen</span>
      <h2>{finalAverage}% Gesamtleistung</h2>
      <div className="stat-grid runner-stats">
        <div className="stat"><strong>{attempts.length}</strong><span>Aufgaben</span></div>
        <div className="stat"><strong>{attempts.filter((item) => item.correct).length}</strong><span>vollständig richtig</span></div>
        <div className="stat"><strong>{finalAverage}%</strong><span>Durchschnitt</span></div>
        <div className="stat"><strong>{next}</strong><span>empfohlene Stufe</span></div>
      </div>
      <div className="completion-table-wrap">
        <table className="progress-table">
          <thead><tr><th>Kategorie</th><th>Aufgaben</th><th>Durchschnitt</th></tr></thead>
          <tbody>{categories.map((category) => {
            const values = attempts.filter((attempt) => attempt.category === category);
            const categoryAverage = Math.round(values.reduce((sum, item) => sum + item.score, 0) / values.length);
            return <tr key={category}><td>{category}</td><td>{values.length}</td><td>{categoryAverage}%</td></tr>;
          })}</tbody>
        </table>
      </div>
      <div className="feedback success">Deine Ergebnisse wurden lokal in der Progress Engine gespeichert.</div>
      <button className="btn btn-primary" onClick={restart}>Neue Trainingsserie</button>
    </div>;
  }

  return <section className="panel exercise-runner" aria-live="polite">
    <div className="runner-topline">
      <div>
        <span className="eyebrow">{sessionLabel} · {exercise.domain} · {exercise.difficulty}</span>
        <h2>{exercise.title}</h2>
      </div>
      <div className="runner-counter">{index + 1} / {session.length}</div>
    </div>

    <div className="progress runner-progress"><span style={{ width: `${((index + (checked ? 1 : 0)) / session.length) * 100}%` }} /></div>

    {phase === "study" && memory && "studyItems" in exercise ? <div className="memory-study" role="status">
      <div className="memory-study-head">
        <div><span className="eyebrow">Merkphase</span><h3>Präge dir diese Informationen bewusst ein.</h3></div>
        <div className="memory-countdown">{studyRemaining}</div>
      </div>
      <div className="memory-study-items">{exercise.studyItems.map((item, itemIndex) => <div className="memory-study-item" key={`${item}-${itemIndex}`}>{item}</div>)}</div>
      <p>Nach Ablauf des Countdowns verschwindet der gesamte Merkinhalt.</p>
    </div> : <>
      {memory && <div className="memory-hidden-notice"><strong>Merkphase beendet.</strong><span>Der Lerninhalt ist vollständig ausgeblendet. Antworte jetzt nur aus dem Gedächtnis.</span></div>}
      <p className="runner-prompt">{exercise.prompt}</p>

      {(exercise.type === "sequence" || exercise.type === "memory-sequence") && <div className="sequence-answer">
        <strong>Deine Reihenfolge:</strong>
        <div>{selected.length ? selected.map((item, position) => <span key={`${item}-${position}`}>{position + 1}. {item}</span>) : <span>Noch keine Auswahl</span>}</div>
        <button className="sequence-undo" onClick={undoSequence} disabled={!selected.length || checked}>Letzten Schritt entfernen</button>
      </div>}

      {exercise.type === "memory-recall" ? <div className="memory-recall-field">
        <label htmlFor={`recall-${exercise.id}`}>Deine Antwort</label>
        <textarea
          id={`recall-${exercise.id}`}
          value={freeText}
          onChange={(event) => setFreeText(event.target.value)}
          disabled={checked}
          placeholder={exercise.recallHint || "Begriffe durch Kommas trennen"}
          rows={4}
        />
      </div> : <div className="runner-options">
        {(exercise.type === "sequence" || exercise.type === "memory-sequence" ? exercise.items : exercise.options).map((option) => {
          const active = selected.includes(option);
          return <button
            className={`choice runner-choice ${active ? "is-selected" : ""}`}
            onClick={() => choose(option)}
            disabled={checked || ((exercise.type === "sequence" || exercise.type === "memory-sequence") && active)}
            key={option}
          >
            {(exercise.type === "sequence" || exercise.type === "memory-sequence") && active ? `${selected.indexOf(option) + 1}. ` : ""}{option}
          </button>;
        })}
      </div>}

      {!checked && <button className="btn btn-primary runner-action" disabled={exercise.type === "memory-recall" ? !freeText.trim() : !selected.length} onClick={checkAnswer}>Antwort prüfen</button>}

      {checked && result && <>
        <div className={`feedback ${result.correct ? "success" : "error"}`}>
          <strong>{result.correct ? "Richtig gelöst." : result.score > 0 ? `Teilweise richtig: ${result.score}%.` : "Noch nicht richtig."}</strong>
          <span>{exercise.explanation}</span>
        </div>
        <div className="strategy-card"><strong>Strategie:</strong> {exercise.strategy}</div>
        <button className="btn btn-primary runner-action" onClick={nextTask}>{index === session.length - 1 ? "Auswertung öffnen" : "Nächste Aufgabe"}</button>
      </>}
    </>}

    <div className="runner-session-meta">Aktueller Rundenschnitt: {average}% · Richtwert: {exercise.estimatedSeconds} Sek.</div>
  </section>;
}
