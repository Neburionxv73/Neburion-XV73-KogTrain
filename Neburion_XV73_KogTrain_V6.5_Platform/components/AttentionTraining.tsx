"use client";

import { useEffect, useRef, useState } from "react";
import { createAttentionSession, type AttentionMode, type AttentionSession } from "@/lib/attention";
import { applyAdaptiveDifficultyResult, createAdaptiveDifficultyState, difficultyLabel, type AdaptiveDifficultyState } from "@/lib/adaptiveDifficultyV5";
import { localizedDifficultyLabel } from "@/lib/trainingLocale";
import { localizeSessionText } from "@/lib/sessionLocale";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./AttentionTraining.module.css";

type ModeStat = { attempts: number; correct: number };
type Stats = { sessions: number; bestAccuracy: number; bestReaction: number; modeStats: Partial<Record<AttentionMode, ModeStat>> };
type Outcome = { mode: AttentionMode; correct: boolean; reaction: number };
type Phase = "intro" | "question" | "feedback" | "done";

const STORAGE_KEY = "neburion-v65-attention-stats";
const initialStats: Stats = { sessions: 0, bestAccuracy: 0, bestReaction: 0, modeStats: {} };
const percentForDifficulty = (level: 1 | 2 | 3) => level === 1 ? 0 : level === 2 ? 70 : 90;

export function AttentionTraining() {
  const {language,pick}=usePlatformLanguage(); const tr=(value:string|undefined)=>localizeSessionText(value,language); const dl=(level:1|2|3)=>localizedDifficultyLabel(difficultyLabel(level),language);
  const [session, setSession] = useState<AttentionSession | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stats, setStats] = useState<Stats>(initialStats);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [adaptive, setAdaptive] = useState<AdaptiveDifficultyState>(createAdaptiveDifficultyState(1));
  const shownAt = useRef(0);

  useEffect(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; const saved = JSON.parse(raw); setStats({ sessions: saved.sessions ?? 0, bestAccuracy: saved.bestAccuracy ?? 0, bestReaction: saved.bestReaction ?? 0, modeStats: saved.modeStats ?? {} }); } catch { setStats(initialStats); } }, []);
  useEffect(() => { if (phase === "question") shownAt.current = performance.now(); }, [phase, index]);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (phase !== "question" || !session) return; const optionIndex = Number(event.key) - 1; if (optionIndex >= 0 && optionIndex < session.tasks[index].options.length) answer(optionIndex); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); });

  function start() { const next = createAttentionSession(stats.bestAccuracy); setSession(next); setAdaptive(createAdaptiveDifficultyState(next.difficulty)); setIndex(0); setSelected(null); setScore(0); setOutcomes([]); setPhase("question"); }
  function answer(optionIndex: number) { if (!session || phase !== "question") return; const task = session.tasks[index]; const correct = optionIndex === task.answer; const reaction = Math.round(performance.now() - shownAt.current); const nextAdaptive = applyAdaptiveDifficultyResult(adaptive, correct); setSelected(optionIndex); if (correct) setScore((value) => value + 1); setOutcomes((values) => [...values, { mode: task.mode, correct, reaction }]); setAdaptive(nextAdaptive); if (nextAdaptive.transition !== "hold" && nextAdaptive.level !== session.difficulty) { const replacement = createAttentionSession(percentForDifficulty(nextAdaptive.level)); setSession({ ...replacement, difficulty: nextAdaptive.level, tasks: [...session.tasks.slice(0, index + 1), ...replacement.tasks.slice(index + 1)] }); } setPhase("feedback"); }
  function finish(active: AttentionSession) { const accuracy = Math.round((score / active.tasks.length) * 100); const reactions = outcomes.map((item) => item.reaction).filter((value) => value > 0); const avgReaction = reactions.length ? Math.round(reactions.reduce((a,b)=>a+b,0)/reactions.length) : 0; const modeStats = { ...stats.modeStats }; outcomes.forEach((item) => { const previous = modeStats[item.mode] ?? { attempts: 0, correct: 0 }; modeStats[item.mode] = { attempts: previous.attempts + 1, correct: previous.correct + (item.correct ? 1 : 0) }; }); const next: Stats = { sessions: stats.sessions + 1, bestAccuracy: Math.max(stats.bestAccuracy, accuracy), bestReaction: avgReaction && (!stats.bestReaction || avgReaction < stats.bestReaction) ? avgReaction : stats.bestReaction, modeStats }; setStats(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} setPhase("done"); }
  function next() { if (!session) return; if (index >= session.tasks.length - 1) { finish(session); return; } setIndex((value) => value + 1); setSelected(null); setPhase("question"); }

  const current = session?.tasks[index];
  const accuracy = session ? Math.round((score / session.tasks.length) * 100) : 0;
  const averageReaction = outcomes.length ? Math.round(outcomes.reduce((sum,item)=>sum+item.reaction,0)/outcomes.length) : 0;

  return <section className={styles.trainer} aria-live="polite" data-adaptive-level={adaptive.level}>
      <div className={styles.stats}><span>Sessions <strong>{stats.sessions}</strong></span><span>{pick("Bestwert","Best score")} <strong>{stats.bestAccuracy}%</strong></span><span>{pick("Beste Ø-Reaktion","Best avg. reaction")} <strong>{stats.bestReaction ? `${stats.bestReaction} ms` : "–"}</strong></span><span>{session ? `${pick("Dynamik","Dynamic")} ${adaptive.level} · ${dl(adaptive.level)}` : "Attention Lab · Adaptive Difficulty V5"}</span></div>
      {phase === "intro" && <div className={styles.stage}><p className="eyebrow">Attention Lab · Adaptive Difficulty V5</p><h2>{pick("Fokus wechseln. Störreize hemmen. Tempo halten.","Switch focus. Inhibit distractions. Maintain pace.")}</h2><p>{pick("Attention V5 passt Reizdichte, Konfliktniveau und Zieltempo jetzt auch innerhalb der laufenden Session an. Drei sichere Treffer können um genau eine Stufe erhöhen; zwei Fehler in Folge stabilisieren um genau eine Stufe. Einzelne Fehler oder Glückstreffer lösen keinen abrupten Sprung aus.","Attention V5 now adapts stimulus density, conflict level and target pace within the active session. Three reliable correct answers can raise difficulty by exactly one level; two consecutive errors reduce it by exactly one level. Single errors or lucky guesses never cause an abrupt jump.")}</p><div className={styles.modeStrip} aria-label={pick("Trainingsmodi","Training modes")}><span>Go/No-Go</span><span>{pick("Suche","Search")}</span><span>{pick("Regelwechsel","Rule switching")}</span><span>{pick("Hemmung","Inhibition")}</span><span>{pick("Geteilt","Divided")}</span><span>{pick("Tempo","Speed")}</span><span>{pick("Störreiz","Interference")}</span></div><button className="primary trainingButton" type="button" onClick={start}>{pick("Attention Session starten","Start Attention session")}</button></div>}
      {phase === "question" && current && session && <div className={styles.stage}><div className={styles.taskMeta}><span>{tr(current.label)}</span><span>{pick("Aufgabe","Task")} {index + 1}/{session.tasks.length}</span><span>{pick("Dynamik","Dynamic")} {adaptive.level} · {dl(adaptive.level)}</span><span>{pick("Zieltempo","Target pace")} {session.targetMs} ms</span></div><h2>{tr(current.prompt)}</h2><p className={styles.instruction}>{tr(current.instruction)}</p><div className={`${styles.visualField} ${current.visual.length > 6 ? styles.denseField : ""}`} aria-label={current.visual.join(" ")}>{current.visual.map((item,itemIndex)=><span key={`${item}-${itemIndex}`}>{tr(item)}</span>)}</div><div className={styles.options}>{current.options.map((option,optionIndex)=><button key={`${option}-${optionIndex}`} type="button" onClick={()=>answer(optionIndex)}><kbd>{optionIndex+1}</kbd>{tr(option)}</button>)}</div></div>}
      {phase === "feedback" && current && selected !== null && <div className={styles.stage}><p className={`${styles.feedbackBadge} ${selected===current.answer ? styles.correct : styles.incorrect}`}>{selected===current.answer ? pick("Richtig","Correct") : pick("Noch nicht","Not quite")}</p><h2>{selected===current.answer ? pick("Aufmerksamkeitsregel getroffen.","Attention rule matched.") : `${pick("Richtig wäre","Correct answer")}: ${tr(current.options[current.answer])}`}</h2><p>{tr(current.explanation)}</p><p><strong>Adaptive Difficulty V5:</strong> {tr(adaptive.reason)}</p><p className={styles.reaction}>{pick("Reaktionszeit","Reaction time")}: <strong>{outcomes.at(-1)?.reaction ?? 0} ms</strong></p><button className="primary trainingButton" type="button" onClick={next}>{session && index===session.tasks.length-1 ? pick("Auswertung","Results") : pick("Nächste Aufgabe","Next task")}</button></div>}
      {phase === "done" && session && <div className={styles.stage}><p className="eyebrow">{pick("Session abgeschlossen","Session complete")} · {pick("Endniveau","Final level")} {adaptive.level} · {dl(adaptive.level)}</p><h2>{accuracy}% {pick("Genauigkeit","accuracy")}</h2><div className={styles.score}><strong>{score}</strong><span>/ {session.tasks.length}</span></div><div className={styles.summary}><span>{pick("Ø Reaktion","Avg. reaction")} <strong>{averageReaction} ms</strong></span><span>{pick("Dynamik","Dynamic")} <strong>{adaptive.level}</strong></span><span>{pick("Modi","Modes")} <strong>{new Set(session.tasks.map((task)=>task.mode)).size}</strong></span></div><p>{pick("Die nächste Session startet wieder evidenzbasiert. Innerhalb der Einheit reagiert V5 konservativ auf stabile Treffer- und Fehlerfolgen.","The next session starts from evidence-based difficulty. Within the session, V5 responds conservatively to stable streaks of correct and incorrect answers.")}</p><button className="primary trainingButton" type="button" onClick={start}>{pick("Neue Attention Session","New Attention session")}</button></div>}
    </section>;
}
