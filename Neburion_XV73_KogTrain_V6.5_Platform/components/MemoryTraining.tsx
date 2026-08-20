"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MEMORY_STORAGE_KEY, memoryRounds } from "@/lib/memory";

type Phase = "intro" | "memorize" | "recall" | "feedback" | "complete";

type SavedProgress = {
  bestScore: number;
  completedSessions: number;
  lastScore: number;
};

const initialProgress: SavedProgress = { bestScore: 0, completedSessions: 0, lastScore: 0 };

export function MemoryTraining() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<SavedProgress>(initialProgress);

  const round = memoryRounds[roundIndex];
  const expected = useMemo(() => round?.sequence.join("") ?? "", [round]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (stored) setProgress(JSON.parse(stored));
    } catch {
      setProgress(initialProgress);
    }
  }, []);

  useEffect(() => {
    if (phase !== "memorize") return;
    const timer = window.setTimeout(() => setPhase("recall"), 4000);
    return () => window.clearTimeout(timer);
  }, [phase, roundIndex]);

  function startTraining() {
    setRoundIndex(0);
    setScore(0);
    setAnswer("");
    setWasCorrect(null);
    setPhase("memorize");
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = answer.replace(/\s+/g, "");
    const correct = normalized === expected;
    setWasCorrect(correct);
    if (correct) setScore((current) => current + 1);
    setPhase("feedback");
  }

  function nextRound() {
    if (roundIndex >= memoryRounds.length - 1) {
      const finalScore = score;
      const nextProgress: SavedProgress = {
        bestScore: Math.max(progress.bestScore, finalScore),
        completedSessions: progress.completedSessions + 1,
        lastScore: finalScore,
      };
      setProgress(nextProgress);
      try {
        localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(nextProgress));
      } catch {
        // Local persistence is optional; the session remains usable without it.
      }
      setScore(finalScore);
      setPhase("complete");
      return;
    }

    setRoundIndex((current) => current + 1);
    setAnswer("");
    setWasCorrect(null);
    setPhase("memorize");
  }

  return (
    <section className="trainingShell" aria-labelledby="memory-title">
      <div className="trainingHeader">
        <div>
          <p className="eyebrow">Memory Lab · Sequenztraining</p>
          <h1 id="memory-title">Merken. Abrufen. Steigern.</h1>
          <p className="trainingLead">Präge dir die Zahlenfolge ein. Nach vier Sekunden verschwindet sie. Gib sie anschließend in derselben Reihenfolge ein.</p>
        </div>
        <div className="sessionMeta" aria-label="Trainingsfortschritt">
          <span>Bestwert <strong>{progress.bestScore}/{memoryRounds.length}</strong></span>
          <span>Sessions <strong>{progress.completedSessions}</strong></span>
        </div>
      </div>

      <div className="trainingStage" aria-live="polite">
        {phase === "intro" && (
          <div className="stageCentered">
            <p className="eyebrow">Bereit?</p>
            <h2>5 Runden · steigende Schwierigkeit</h2>
            <p>Du kannst jederzeit neu starten. Deine bisherigen Bestwerte bleiben lokal in diesem Browser gespeichert.</p>
            <button className="primaryButton" type="button" onClick={startTraining}>Training starten</button>
          </div>
        )}

        {phase === "memorize" && round && (
          <div className="stageCentered">
            <p className="roundLabel">Runde {roundIndex + 1} von {memoryRounds.length}</p>
            <p className="instruction">Präge dir diese Folge ein</p>
            <div className="memorySequence" aria-label={`Zahlenfolge ${round.sequence.join(" ")}`}>{round.sequence.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
            <p className="countdownHint">Die Folge verschwindet nach 4 Sekunden.</p>
          </div>
        )}

        {phase === "recall" && round && (
          <form className="stageCentered recallForm" onSubmit={submitAnswer}>
            <p className="roundLabel">Runde {roundIndex + 1} von {memoryRounds.length}</p>
            <h2>Welche Folge hast du gesehen?</h2>
            <label htmlFor="memory-answer">Zahlenfolge eingeben</label>
            <input
              id="memory-answer"
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              onChange={(event) => setAnswer(event.target.value.replace(/[^0-9 ]/g, ""))}
              placeholder="z. B. 729"
              autoFocus
            />
            <button className="primaryButton" type="submit" disabled={!answer.trim()}>Antwort prüfen</button>
          </form>
        )}

        {phase === "feedback" && round && (
          <div className="stageCentered">
            <p className={`feedbackBadge ${wasCorrect ? "correct" : "incorrect"}`}>{wasCorrect ? "Richtig" : "Noch nicht"}</p>
            <h2>{wasCorrect ? "Sauber erinnert." : "Die Reihenfolge war anders."}</h2>
            <p>Richtige Folge: <strong>{round.sequence.join(" ")}</strong></p>
            <button className="primaryButton" type="button" onClick={nextRound}>{roundIndex === memoryRounds.length - 1 ? "Ergebnis ansehen" : "Nächste Runde"}</button>
          </div>
        )}

        {phase === "complete" && (
          <div className="stageCentered">
            <p className="eyebrow">Session abgeschlossen</p>
            <div className="finalScore"><strong>{score}</strong><span>/ {memoryRounds.length}</span></div>
            <h2>Training gespeichert.</h2>
            <p>Bestwert: {progress.bestScore}/{memoryRounds.length} · Abgeschlossene Sessions: {progress.completedSessions}</p>
            <button className="primaryButton" type="button" onClick={startTraining}>Noch einmal trainieren</button>
          </div>
        )}
      </div>

      <div className="trainingNotice">
        <strong>Trainingshinweis</strong>
        <p>Dieses Modul trainiert Merk- und Abrufprozesse. Es liefert keine medizinische Diagnose oder Leistungsbewertung.</p>
      </div>
    </section>
  );
}
