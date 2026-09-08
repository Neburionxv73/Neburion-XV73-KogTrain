"use client";

import { useEffect, useRef, useState } from "react";
import { adaptiveDifficulty, percentForDifficulty } from "@/lib/adaptiveDifficulty";
import { createAttentionSession, type AttentionMode, type AttentionSession } from "@/lib/attention";
import type { Difficulty } from "@/lib/dynamicTraining";
import styles from "./AttentionTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type Stats = { sessions: number; bestAccuracy: number; bestReaction: number; modeStats: Partial<Record<AttentionMode, ModeStat>>; recentPercents: number[]; recentReactions: number[]; adaptiveLevel: Difficulty };
type Outcome = { mode: AttentionMode; correct: boolean; reaction: number };
type Phase = "intro" | "question" | "feedback" | "done";

const STORAGE_KEY = "neburion-v65-attention-stats";
const initialStats: Stats = { sessions: 0, bestAccuracy: 0, bestReaction: 0, modeStats: {}, recentPercents: [], recentReactions: [], adaptiveLevel: 1 };

export function AttentionTraining() {
  const [session, setSession] = useState<AttentionSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<Stats>(initialStats);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const shownAt = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setStats({ sessions: saved.sessions ?? 0, bestAccuracy: saved.bestAccuracy ?? 0, bestReaction: saved.bestReaction ?? 0, modeStats: saved.modeStats ?? {}, recentPercents: saved.recentPercents ?? [], recentReactions: saved.recentReactions ?? [], adaptiveLevel: saved.adaptiveLevel ?? 1 });
    } catch { setStats(initialStats); }
  }, []);

  useEffect(() => {
    if (phase === "question") shownAt.current = performance.now();
  }, [phase, index]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase !== "question" || !session) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < session.tasks[index].options.length) answer(optionIndex);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function decisionFor(recentPercents = stats.recentPercents, recentReactions = stats.recentReactions, modeStats = stats.modeStats, currentLevel = stats.adaptiveLevel) {
    const modePercents = Object.values(modeStats).filter((value): value is ModeStat => Boolean(value?.attempts)).map((value) => Math.round(value.correct / value.attempts * 100));
    const averageReactionMs = recentReactions.length ? Math.round(recentReactions.reduce((sum,value)=>sum+value,0)/recentReactions.length) : undefined;
    const targetReactionMs = currentLevel === 3 ? 650 : currentLevel === 2 ? 800 : 950;
    return adaptiveDifficulty({ recentPercents, modePercents, currentLevel, averageReactionMs, targetReactionMs });
  }

  function start() {
    const decision = decisionFor();
    setSession(createAttentionSession(percentForDifficulty(decision.level)));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setOutcomes([]);
    setPhase("question");
  }

  function answer(optionIndex: number) {
    if (!session || phase !== "question") return;
    const task = session.tasks[index];
    const correct = optionIndex === task.answer;
    const reaction = Math.round(performance.now() - shownAt.current);
    setSelected(optionIndex);
    if (correct) setScore((value) => value + 1);
    setOutcomes((values) => [...values, { mode: task.mode, correct, reaction }]);
    setPhase("feedback");
  }

  function finish(active: AttentionSession) {
    const accuracy = Math.round((score / active.tasks.length) * 100);
    const reactions = outcomes.map((item) => item.reaction).filter((value) => value > 0);
    const avgReaction = reactions.length ? Math.round(reactions.reduce((a,b)=>a+b,0)/reactions.length) : 0;
    const modeStats = { ...stats.modeStats };
    outcomes.forEach((item) => {
      const previous = modeStats[item.mode] ?? { attempts: 0, correct: 0 };
      modeStats[item.mode] = { attempts: previous.attempts + 1, correct: previous.correct + (item.correct ? 1 : 0) };
    });
    const recentPercents = [...stats.recentPercents, accuracy].slice(-6);
    const recentReactions = avgReaction ? [...stats.recentReactions, avgReaction].slice(-6) : stats.recentReactions;
    const decision = decisionFor(recentPercents, recentReactions, modeStats, stats.adaptiveLevel);
    const next: Stats = {
      sessions: stats.sessions + 1,
      bestAccuracy: Math.max(stats.bestAccuracy, accuracy),
      bestReaction: avgReaction && (!stats.bestReaction || avgReaction < stats.bestReaction) ? avgReaction : stats.bestReaction,
      modeStats,
      recentPercents,
      recentReactions,
      adaptiveLevel: decision.level,
    };
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setPhase("done");
  }

  function next() {
    if (!session) return;
    if (index >= session.tasks.length - 1) { finish(session); return; }
    setIndex((value) => value + 1);
    setSelected(null);
    setPhase("question");
  }

  const current = session?.tasks[index];
  const accuracy = session ? Math.round((score / session.tasks.length) * 100) : 0;
  const averageReaction = outcomes.length ? Math.round(outcomes.reduce((sum,item)=>sum+item.reaction,0)/outcomes.length) : 0;
  const decision = decisionFor();

  return (
    <section className={styles.trainer} aria-live="polite">
      <div className={styles.stats}>
        <span>Sessions <strong>{stats.sessions}</strong></span>
        <span>Bestwert <strong>{stats.bestAccuracy}%</strong></span>
        <span>Beste Ø-Reaktion <strong>{stats.bestReaction ? `${stats.bestReaction} ms` : "–"}</strong></span>
        <span>Adaptiv <strong>Level {decision.level}</strong></span>
      </div>

      {phase === "intro" && (
        <div className={styles.stage}>
          <p className="eyebrow">Attention Lab 2.0</p>
          <h2>Fokus wechseln. Störreize hemmen. Tempo halten.</h2>
          <p>Acht dynamische Aufgaben mischen Go/No-Go, visuelle Suche, Regelwechsel, Reaktionshemmung, geteilte Aufmerksamkeit, Tempo und Interferenz. Adaptive Difficulty 2.0 bewertet Genauigkeit, Reaktionszeit und den Verlauf der letzten Sessions.</p>
          <div className={styles.modeStrip} aria-label="Trainingsmodi"><span>Go/No-Go</span><span>Suche</span><span>Regelwechsel</span><span>Hemmung</span><span>Geteilt</span><span>Tempo</span><span>Störreiz</span></div>
          <button className="primary trainingButton" type="button" onClick={start}>Attention Session starten</button>
        </div>
      )}

      {phase === "question" && current && session && (
        <div className={styles.stage}>
          <div className={styles.taskMeta}><span>{current.label}</span><span>Aufgabe {index + 1}/{session.tasks.length}</span><span>Zieltempo {session.targetMs} ms</span></div>
          <h2>{current.prompt}</h2>
          <p className={styles.instruction}>{current.instruction}</p>
          <div className={`${styles.visualField} ${current.visual.length > 6 ? styles.denseField : ""}`} aria-label={current.visual.join(" ")}>
            {current.visual.map((item,itemIndex)=><span key={`${item}-${itemIndex}`}>{item}</span>)}
          </div>
          <div className={styles.options}>
            {current.options.map((option,optionIndex)=><button key={`${option}-${optionIndex}`} type="button" onClick={()=>answer(optionIndex)}><kbd>{optionIndex+1}</kbd>{option}</button>)}
          </div>
        </div>
      )}

      {phase === "feedback" && current && selected !== null && (
        <div className={styles.stage}>
          <p className={`${styles.feedbackBadge} ${selected===current.answer ? styles.correct : styles.incorrect}`}>{selected===current.answer ? "Richtig" : "Noch nicht"}</p>
          <h2>{selected===current.answer ? "Aufmerksamkeitsregel getroffen." : `Richtig wäre: ${current.options[current.answer]}`}</h2>
          <p>{current.explanation}</p>
          <p className={styles.reaction}>Reaktionszeit: <strong>{outcomes.at(-1)?.reaction ?? 0} ms</strong></p>
          <button className="primary trainingButton" type="button" onClick={next}>{session && index===session.tasks.length-1 ? "Auswertung" : "Nächste Aufgabe"}</button>
        </div>
      )}

      {phase === "done" && session && (
        <div className={styles.stage}>
          <p className="eyebrow">Session abgeschlossen</p>
          <h2>{accuracy}% Genauigkeit</h2>
          <div className={styles.score}><strong>{score}</strong><span>/ {session.tasks.length}</span></div>
          <div className={styles.summary}><span>Ø Reaktion <strong>{averageReaction} ms</strong></span><span>Nächstes Level <strong>{decision.level}</strong></span><span>Trend <strong>{decision.trend === "up" ? "↑" : decision.trend === "down" ? "↓" : "→"}</strong></span></div>
          <p>Das adaptive System kombiniert Genauigkeit und Tempo. Eine einzelne starke oder schwache Runde reicht nicht für einen abrupten Levelwechsel.</p>
          <button className="primary trainingButton" type="button" onClick={start}>Neue Attention Session</button>
        </div>
      )}
    </section>
  );
}