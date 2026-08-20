"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMemorySession, expectedMemoryAnswer, MEMORY_SESSION_LENGTH, MEMORY_STORAGE_KEY, type MemoryRound } from "@/lib/memory";

type Phase = "intro" | "memorize" | "recall" | "feedback" | "complete";
type SavedProgress = { bestScore: number; completedSessions: number; lastScore: number };
const initialProgress: SavedProgress = { bestScore: 0, completedSessions: 0, lastScore: 0 };

export function MemoryTraining() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<MemoryRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<SavedProgress>(initialProgress);
  const round = rounds[roundIndex];
  const expected = useMemo(() => round ? expectedMemoryAnswer(round) : "", [round]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (stored) setProgress(JSON.parse(stored));
    } catch { setProgress(initialProgress); }
  }, []);

  useEffect(() => {
    if (phase !== "memorize") return;
    const timer = window.setTimeout(() => setPhase("recall"), 4000);
    return () => window.clearTimeout(timer);
  }, [phase, roundIndex]);

  function startTraining() {
    setRounds(createMemorySession(progress.bestScore));
    setRoundIndex(0);
    setScore(0);
    setAnswer("");
    setWasCorrect(null);
    setPhase("memorize");
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const correct = answer.replace(/\s+/g, "") === expected;
    setWasCorrect(correct);
    if (correct) setScore((current) => current + 1);
    setPhase("feedback");
  }

  function nextRound() {
    if (roundIndex >= rounds.length - 1) {
      const finalScore = score;
      const nextProgress = { bestScore: Math.max(progress.bestScore, finalScore), completedSessions: progress.completedSessions + 1, lastScore: finalScore };
      setProgress(nextProgress);
      try { localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(nextProgress)); } catch {}
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
          <p className="eyebrow">Memory Lab · Dynamisches Sequenztraining</p>
          <h1 id="memory-title">Merken. Abrufen. Variieren.</h1>
          <p className="trainingLead">Jede Session erzeugt neue Zahlenfolgen. Je nach Leistung werden die Folgen länger und Rückwärtsrunden häufiger.</p>
        </div>
        <div className="sessionMeta" aria-label="Trainingsfortschritt">
          <span>Bestwert <strong>{progress.bestScore}/{MEMORY_SESSION_LENGTH}</strong></span>
          <span>Sessions <strong>{progress.completedSessions}</strong></span>
        </div>
      </div>

      <div className="trainingStage" aria-live="polite">
        {phase === "intro" && <div className="stageCentered"><p className="eyebrow">Dynamische Session</p><h2>{MEMORY_SESSION_LENGTH} neue Runden</h2><p>Vorwärts- und Rückwärtsabruf wechseln sich ab. Die nächste Session wird neu generiert.</p><button className="primaryButton" type="button" onClick={startTraining}>Training starten</button></div>}
        {phase === "memorize" && round && <div className="stageCentered"><p className="roundLabel">Runde {roundIndex + 1} von {rounds.length} · {round.mode === "reverse" ? "Rückwärts" : "Vorwärts"}</p><p className="instruction">Präge dir diese Folge ein</p><div className="memorySequence" aria-label={`Zahlenfolge ${round.sequence.join(" ")}`}>{round.sequence.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div><p className="countdownHint">Nach 4 Sekunden: {round.mode === "reverse" ? "rückwärts eingeben" : "gleich eingeben"}.</p></div>}
        {phase === "recall" && round && <form className="stageCentered recallForm" onSubmit={submitAnswer}><p className="roundLabel">Runde {roundIndex + 1} · {round.mode === "reverse" ? "Rückwärts" : "Vorwärts"}</p><h2>{round.mode === "reverse" ? "Gib die Folge rückwärts ein." : "Welche Folge hast du gesehen?"}</h2><label htmlFor="memory-answer">Zahlenfolge eingeben</label><input id="memory-answer" inputMode="numeric" autoComplete="off" value={answer} onChange={(event) => setAnswer(event.target.value.replace(/[^0-9 ]/g, ""))} autoFocus /><button className="primaryButton" type="submit" disabled={!answer.trim()}>Antwort prüfen</button></form>}
        {phase === "feedback" && round && <div className="stageCentered"><p className={`feedbackBadge ${wasCorrect ? "correct" : "incorrect"}`}>{wasCorrect ? "Richtig" : "Noch nicht"}</p><h2>{wasCorrect ? "Sauber erinnert." : "Die Reihenfolge war anders."}</h2><p>Gesuchte Antwort: <strong>{expected.split("").join(" ")}</strong></p><button className="primaryButton" type="button" onClick={nextRound}>{roundIndex === rounds.length - 1 ? "Ergebnis ansehen" : "Nächste Runde"}</button></div>}
        {phase === "complete" && <div className="stageCentered"><p className="eyebrow">Session abgeschlossen</p><div className="finalScore"><strong>{score}</strong><span>/ {MEMORY_SESSION_LENGTH}</span></div><h2>Nächste Session: neue Folgen.</h2><p>Bestwert: {progress.bestScore}/{MEMORY_SESSION_LENGTH} · Sessions: {progress.completedSessions}</p><button className="primaryButton" type="button" onClick={startTraining}>Neue Session generieren</button></div>}
      </div>
      <div className="trainingNotice"><strong>Trainingshinweis</strong><p>Dieses Modul trainiert Merk- und Abrufprozesse. Es liefert keine medizinische Diagnose.</p></div>
    </section>
  );
}
