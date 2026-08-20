"use client";

import { useEffect, useRef, useState } from "react";
import { createAttentionSession, type AttentionSession } from "@/lib/attention";

type Result = { hits: number; falseAlarms: number; misses: number; avgReaction: number; accuracy: number };
const STORAGE_KEY = "neburion-v65-attention-stats";

export function AttentionTraining() {
  const [session, setSession] = useState<AttentionSession | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "show" | "gap" | "done">("intro");
  const [hits, setHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [responded, setResponded] = useState(false);
  const [stats, setStats] = useState({ sessions: 0, bestAccuracy: 0, bestReaction: 0 });
  const shownAt = useRef(0);

  useEffect(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setStats(JSON.parse(raw)); } catch {} }, []);

  useEffect(() => {
    if (phase !== "show" || !session) return;
    shownAt.current = performance.now();
    setResponded(false);
    const timer = window.setTimeout(() => {
      const current = session.stimuli[index];
      if (current.isTarget && !responded) setMisses((value) => value + 1);
      setPhase("gap");
    }, session.displayMs);
    return () => window.clearTimeout(timer);
  }, [phase, index, session, responded]);

  useEffect(() => {
    if (phase !== "gap" || !session) return;
    const timer = window.setTimeout(() => {
      if (index >= session.stimuli.length - 1) finishSession(session);
      else { setIndex((value) => value + 1); setPhase("show"); }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [phase, index, session]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.code === "Space" || event.code === "Enter") && phase === "show") { event.preventDefault(); reactToStimulus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function reactToStimulus() {
    if (phase !== "show" || responded || !session) return;
    setResponded(true);
    const current = session.stimuli[index];
    if (current.isTarget) { setHits((value) => value + 1); setReactionTimes((values) => [...values, Math.round(performance.now() - shownAt.current)]); }
    else setFalseAlarms((value) => value + 1);
  }

  function result(active: AttentionSession | null): Result {
    if (!active) return { hits, falseAlarms, misses, avgReaction: 0, accuracy: 0 };
    const totalTargets = active.stimuli.filter((item) => item.isTarget).length;
    const correctRejections = active.stimuli.length - totalTargets - falseAlarms;
    const avgReaction = reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
    return { hits, falseAlarms, misses, avgReaction, accuracy: Math.round(((hits + Math.max(0, correctRejections)) / active.stimuli.length) * 100) };
  }

  function finishSession(active: AttentionSession) {
    const current = result(active);
    const next = { sessions: stats.sessions + 1, bestAccuracy: Math.max(stats.bestAccuracy, current.accuracy), bestReaction: current.avgReaction && (!stats.bestReaction || current.avgReaction < stats.bestReaction) ? current.avgReaction : stats.bestReaction };
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setPhase("done");
  }

  function start() {
    setSession(createAttentionSession(stats.bestAccuracy));
    setIndex(0); setHits(0); setFalseAlarms(0); setMisses(0); setReactionTimes([]); setResponded(false); setPhase("show");
  }

  const currentResult = result(session);

  return (
    <section className="attentionTrainer" aria-live="polite">
      <div className="trainingStats"><span>Sessions {stats.sessions}</span><span>Bester Wert {stats.bestAccuracy}%</span><span>Beste Reaktion {stats.bestReaction ? `${stats.bestReaction} ms` : "–"}</span></div>
      {phase === "intro" && <div className="trainingStage"><p className="eyebrow">Dynamische Regel</p><h2>Jede Session hat ein neues Zielzeichen.</h2><p>Reizfolge, Distraktoren und Tempo werden bei jedem Start neu zusammengestellt und passen sich deiner bisherigen Genauigkeit an.</p><button className="primary trainingButton" type="button" onClick={start}>Neue Session starten</button></div>}
      {phase === "show" && session && <div className="trainingStage"><p className="roundLabel">Reiz {index + 1} / {session.stimuli.length}</p><div className="targetSymbol" aria-label={`Zielzeichen ${session.targetSymbol}`}>{session.targetSymbol}</div><button className="stimulusButton" type="button" onClick={reactToStimulus} aria-label="Auf aktuellen Reiz reagieren">{session.stimuli[index].symbol}</button><p className="trainingHint">Reagiere nur auf {session.targetSymbol}</p></div>}
      {phase === "gap" && <div className="trainingStage quietStage" aria-hidden="true"><span>•</span></div>}
      {phase === "done" && <div className="trainingStage resultStage"><p className="eyebrow">Session abgeschlossen</p><h2>{currentResult.accuracy}% Genauigkeit</h2><div className="resultGrid"><div><span>Treffer</span><strong>{currentResult.hits}</strong></div><div><span>Fehlalarme</span><strong>{currentResult.falseAlarms}</strong></div><div><span>Verpasst</span><strong>{currentResult.misses}</strong></div><div><span>Ø Reaktion</span><strong>{currentResult.avgReaction ? `${currentResult.avgReaction} ms` : "–"}</strong></div></div><button className="primary trainingButton" type="button" onClick={start}>Neue Regel generieren</button></div>}
    </section>
  );
}
