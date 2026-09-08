"use client";

import { useEffect, useState } from "react";
import { adaptiveDifficulty, scoreForDifficulty } from "@/lib/adaptiveDifficulty";
import { createLogicSession, LOGIC_SESSION_LENGTH, LOGIC_STORAGE_KEY, type LogicMode, type LogicSession } from "@/lib/logic";
import type { Difficulty } from "@/lib/dynamicTraining";
import styles from "./LogicTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type LogicStats = { sessions: number; bestScore: number; modeStats: Partial<Record<LogicMode, ModeStat>>; recentPercents: number[]; adaptiveLevel: Difficulty };
type Outcome = { mode: LogicMode; correct: boolean };
type Phase = "intro" | "question" | "feedback" | "done";

const initialStats: LogicStats = { sessions: 0, bestScore: 0, modeStats: {}, recentPercents: [], adaptiveLevel: 1 };
const labels: Record<LogicMode, string> = { sequence:"Zahlenfolge", rule:"Regel", analogy:"Analogie", deduction:"Schlussfolgerung", matrix:"Matrix", operator:"Operator", exclusion:"Ausschluss", spatial:"Räumliche Logik" };

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
      setStats({ sessions:saved.sessions ?? 0, bestScore:saved.bestScore ?? 0, modeStats:saved.modeStats ?? {}, recentPercents:saved.recentPercents ?? [], adaptiveLevel:saved.adaptiveLevel ?? 1 });
    } catch { setStats(initialStats); }
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

  function decisionFor(recentPercents = stats.recentPercents, modeStats = stats.modeStats, currentLevel = stats.adaptiveLevel) {
    const modePercents = Object.values(modeStats).filter((value): value is ModeStat => Boolean(value?.attempts)).map((value)=>Math.round(value.correct/value.attempts*100));
    return adaptiveDifficulty({ recentPercents, modePercents, currentLevel });
  }

  function start() {
    const decision = decisionFor();
    setSession(createLogicSession(scoreForDifficulty(decision.level, LOGIC_SESSION_LENGTH)));
    setIndex(0); setSelected(null); setOutcomes([]); setPhase("question");
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
    if (index < session.tasks.length - 1) { setIndex((value)=>value+1); setSelected(null); setPhase("question"); return; }
    const score = outcomes.filter((item)=>item.correct).length;
    const percent = Math.round(score/session.tasks.length*100);
    const modeStats = { ...stats.modeStats };
    outcomes.forEach((item)=>{ const previous = modeStats[item.mode] ?? {attempts:0,correct:0}; modeStats[item.mode] = {attempts:previous.attempts+1, correct:previous.correct+(item.correct?1:0)}; });
    const recentPercents = [...stats.recentPercents,percent].slice(-6);
    const decision = decisionFor(recentPercents,modeStats,stats.adaptiveLevel);
    const nextStats: LogicStats = { sessions:stats.sessions+1, bestScore:Math.max(stats.bestScore,score), modeStats, recentPercents, adaptiveLevel:decision.level };
    setStats(nextStats);
    try { localStorage.setItem(LOGIC_STORAGE_KEY, JSON.stringify(nextStats)); } catch {}
    setPhase("done");
  }

  const score = outcomes.filter((item)=>item.correct).length;
  const percent = session ? Math.round(score/session.tasks.length*100) : 0;
  const decision = decisionFor();

  return (
    <section className={styles.logicTrainer} aria-live="polite">
      <div className="trainingStats"><span>Sessions {stats.sessions}</span><span>Bestwert {stats.bestScore} / {LOGIC_SESSION_LENGTH}</span><span>Adaptiv Level {decision.level}</span></div>
      {phase === "intro" && <div className="trainingStage"><p className="eyebrow">8 generative Logikmodi</p><h2>Regeln erkennen. Schlüsse ziehen. Muster weiterdenken.</h2><p>Adaptive Difficulty 2.0 bewertet deine letzten Sessions sowie die Trefferquote pro Logikmodus. Die Schwierigkeit steigt oder fällt nur bei einem stabilen Leistungstrend.</p><button className="primary trainingButton" type="button" onClick={start}>Logic Session starten</button></div>}
      {phase === "question" && current && session && <div className={`trainingStage ${styles.logicStage}`}><p className="eyebrow">{labels[current.mode]} · Aufgabe {index+1}/{session.tasks.length} · Level {session.difficulty}</p><h2>{current.prompt}</h2><div className={styles.logicPattern}>{current.detail}</div><div className={styles.logicOptions}>{current.options.map((option,optionIndex)=><button key={`${current.id}-${optionIndex}`} type="button" onClick={()=>answer(optionIndex)}>{option}</button>)}</div></div>}
      {phase === "feedback" && current && selected !== null && <div className={`trainingStage ${styles.logicStage}`}><p className={`feedbackBadge ${selected===current.answer ? "correct" : "incorrect"}`}>{selected===current.answer ? "Richtig" : "Noch nicht"}</p><h2>{selected===current.answer ? "Regel erkannt." : `Richtig wäre: ${current.options[current.answer]}`}</h2><p>{current.explanation}</p><button className="primary trainingButton" type="button" onClick={next}>{session && index===session.tasks.length-1 ? "Auswertung" : "Nächste Aufgabe"}</button></div>}
      {phase === "done" && session && <div className="trainingStage resultStage"><p className="eyebrow">Session abgeschlossen</p><h2>{percent}% richtig</h2><div className="finalScore"><strong>{score}</strong><span>/ {session.tasks.length}</span></div><div className={styles.logicOptions}>{(Object.entries(stats.modeStats) as [LogicMode,ModeStat][]).map(([mode,value])=><div key={mode}><span>{labels[mode]}</span> <strong>{value.attempts ? Math.round(value.correct/value.attempts*100) : 0}%</strong></div>)}</div><p>Nächstes adaptives Level: {decision.level}. Trend: {decision.trend === "up" ? "steigend" : decision.trend === "down" ? "fallend" : "stabil"}.</p><button className="primary trainingButton" type="button" onClick={start}>Neue Logic Session</button></div>}
    </section>
  );
}