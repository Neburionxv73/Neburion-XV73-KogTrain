"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createAttentionSequence } from "@/lib/attention";

type Result = {
  hits: number;
  falseAlarms: number;
  misses: number;
  avgReaction: number;
  accuracy: number;
};

const STORAGE_KEY = "neburion-v65-attention-stats";

export function AttentionTraining() {
  const stimuli = useMemo(() => createAttentionSequence(), []);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "show" | "gap" | "done">("intro");
  const [hits, setHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [responded, setResponded] = useState(false);
  const [stats, setStats] = useState({ sessions: 0, bestAccuracy: 0, bestReaction: 0 });
  const shownAt = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    shownAt.current = performance.now();
    setResponded(false);
    const timer = window.setTimeout(() => {
      const current = stimuli[index];
      if (current.isTarget && !responded) setMisses((value) => value + 1);
      setPhase("gap");
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [phase, index, stimuli, responded]);

  useEffect(() => {
    if (phase !== "gap") return;
    const timer = window.setTimeout(() => {
      if (index >= stimuli.length - 1) {
        finishSession();
      } else {
        setIndex((value) => value + 1);
        setPhase("show");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [phase, index, stimuli.length]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.code === "Space" || event.code === "Enter") && phase === "show") {
        event.preventDefault();
        reactToStimulus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function reactToStimulus() {
    if (phase !== "show" || responded) return;
    setResponded(true);
    const current = stimuli[index];
    if (current.isTarget) {
      setHits((value) => value + 1);
      setReactionTimes((values) => [...values, Math.round(performance.now() - shownAt.current)]);
    } else {
      setFalseAlarms((value) => value + 1);
    }
  }

  function result(): Result {
    const totalTargets = stimuli.filter((item) => item.isTarget).length;
    const correctRejections = stimuli.length - totalTargets - falseAlarms;
    const correct = hits + Math.max(0, correctRejections);
    const avgReaction = reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
    return {
      hits,
      falseAlarms,
      misses,
      avgReaction,
      accuracy: Math.round((correct / stimuli.length) * 100),
    };
  }

  function finishSession() {
    const current = result();
    const next = {
      sessions: stats.sessions + 1,
      bestAccuracy: Math.max(stats.bestAccuracy, current.accuracy),
      bestReaction: current.avgReaction && (!stats.bestReaction || current.avgReaction < stats.bestReaction) ? current.avgReaction : stats.bestReaction,
    };
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setPhase("done");
  }

  function start() {
    setIndex(0);
    setHits(0);
    setFalseAlarms(0);
    setMisses(0);
    setReactionTimes([]);
    setResponded(false);
    setPhase("show");
  }

  const currentResult = result();

  return (
    <section className="attentionTrainer" aria-live="polite">
      <div className="trainingStats">
        <span>Session {stats.sessions + (phase === "done" ? 0 : 1)}</span>
        <span>Bester Wert {stats.bestAccuracy}%</span>
        <span>Beste Reaktion {stats.bestReaction ? `${stats.bestReaction} ms` : "–"}</span>
      </div>

      {phase === "intro" && (
        <div className="trainingStage">
          <p className="eyebrow">Regel</p>
          <div className="targetSymbol">◆</div>
          <h2>Nur bei diesem Zeichen reagieren.</h2>
          <p>12 Reize, davon 5 Zielreize. Drücke den Button, die Leertaste oder Enter.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Training starten</button>
        </div>
      )}

      {phase === "show" && (
        <div className="trainingStage">
          <p className="roundLabel">Reiz {index + 1} / {stimuli.length}</p>
          <button className="stimulusButton" type="button" onClick={reactToStimulus} aria-label="Auf aktuellen Reiz reagieren">
            {stimuli[index].symbol}
          </button>
          <p className="trainingHint">Reagiere nur auf ◆</p>
        </div>
      )}

      {phase === "gap" && (
        <div className="trainingStage quietStage" aria-hidden="true"><span>•</span></div>
      )}

      {phase === "done" && (
        <div className="trainingStage resultStage">
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{currentResult.accuracy}% Genauigkeit</h2>
          <div className="resultGrid">
            <div><span>Treffer</span><strong>{currentResult.hits}</strong></div>
            <div><span>Fehlalarme</span><strong>{currentResult.falseAlarms}</strong></div>
            <div><span>Verpasst</span><strong>{currentResult.misses}</strong></div>
            <div><span>Ø Reaktion</span><strong>{currentResult.avgReaction ? `${currentResult.avgReaction} ms` : "–"}</strong></div>
          </div>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Session</button>
        </div>
      )}
    </section>
  );
}
