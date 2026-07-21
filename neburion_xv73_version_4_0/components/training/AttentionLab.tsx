"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { attentionCategories, attentionLevels, attentionPresets, type AttentionCategory } from "@/data/attention-exercises";
import type { Difficulty, TrainingResult } from "@/features/cognitive-engine/types";
import { saveResult } from "@/features/progress-engine/storage";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `attention-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shuffle<T>(items: T[]) {
  return [...items]
    .map((value) => ({ value, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.value);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scoreFromSelection(selected: Set<number>, targets: Set<number>) {
  let correctHits = 0;
  let falseHits = 0;
  targets.forEach((target) => { if (selected.has(target)) correctHits += 1; });
  selected.forEach((index) => { if (!targets.has(index)) falseHits += 1; });
  const misses = Math.max(0, targets.size - correctHits);
  const raw = targets.size ? ((correctHits - falseHits * 0.65) / targets.size) * 100 : 0;
  return { score: Math.max(0, Math.min(100, Math.round(raw))), correctHits, falseHits, misses };
}

type SessionAttempt = { category: AttentionCategory; score: number; reactionMs?: number; falseStarts?: number; misses?: number; falseHits?: number };

type VisualTask = { cells: string[]; targets: Set<number>; targetLabel: string };
type DualCard = { shape: string; color: string; number: number; label: string };

const symbolSets = [
  ["●", "○", "◉", "◎", "◌", "◍"],
  ["▲", "△", "▴", "▵", "◆", "◇"],
  ["★", "☆", "✦", "✧", "✶", "✹"]
];
const colors = [
  { name: "Rot", value: "#d94f46" },
  { name: "Blau", value: "#3277b8" },
  { name: "Grün", value: "#2f8f68" },
  { name: "Orange", value: "#e88b32" },
  { name: "Violett", value: "#8052a3" }
];
const shapes = ["Kreis", "Dreieck", "Quadrat", "Raute"];
const shapeGlyph: Record<string, string> = { Kreis: "●", Dreieck: "▲", Quadrat: "■", Raute: "◆" };

function generateVisualTask(difficulty: Difficulty): VisualTask {
  const preset = attentionPresets[difficulty];
  const set = symbolSets[randomInt(0, Math.min(symbolSets.length - 1, preset.distractorSimilarity > 3 ? 2 : 1))];
  const target = set[0];
  const cells = Array.from({ length: preset.gridSize }, () => set[randomInt(1, Math.min(set.length - 1, 1 + preset.distractorSimilarity))]);
  const indices = shuffle(Array.from({ length: preset.gridSize }, (_, index) => index)).slice(0, preset.targetCount);
  indices.forEach((index) => { cells[index] = target; });
  return { cells, targets: new Set(indices), targetLabel: target };
}

function generateNumberTask(difficulty: Difficulty): VisualTask {
  const preset = attentionPresets[difficulty];
  const target = String(randomInt(difficulty === "profi" ? 10 : 1, difficulty === "profi" ? 99 : 9));
  const near = Number(target);
  const pool = difficulty === "profi"
    ? [near - 1, near + 1, near - 10, near + 10, near + 9, near - 9].map((v) => String(Math.max(0, Math.min(99, v))))
    : Array.from({ length: 9 }, (_, i) => String(i + 1)).filter((v) => v !== target);
  const cells = Array.from({ length: preset.gridSize }, () => pool[randomInt(0, pool.length - 1)]);
  const indices = shuffle(Array.from({ length: preset.gridSize }, (_, index) => index)).slice(0, preset.targetCount);
  indices.forEach((index) => { cells[index] = target; });
  return { cells, targets: new Set(indices), targetLabel: target };
}

function generateColorTask(difficulty: Difficulty) {
  const available = difficulty === "einstieg" ? colors.slice(0, 3) : difficulty === "leicht" ? colors.slice(0, 4) : colors;
  const ink = available[randomInt(0, available.length - 1)];
  let word = available[randomInt(0, available.length - 1)];
  if (difficulty !== "einstieg") {
    while (word.name === ink.name) word = available[randomInt(0, available.length - 1)];
  }
  return { ink, word, options: shuffle(available) };
}

function generateDualTask(difficulty: Difficulty) {
  const count = attentionPresets[difficulty].gridSize > 50 ? 18 : attentionPresets[difficulty].gridSize > 30 ? 14 : 10;
  const targetColor = colors[randomInt(0, Math.min(colors.length - 1, difficulty === "einstieg" ? 2 : 4))];
  const targetShape = shapes[randomInt(0, shapes.length - 1)];
  const parity = difficulty === "profi" ? (Math.random() > .5 ? "gerade" : "ungerade") : null;
  const cards: DualCard[] = Array.from({ length: count }, (_, index) => {
    const color = colors[randomInt(0, Math.min(colors.length - 1, difficulty === "einstieg" ? 2 : 4))];
    const shape = shapes[randomInt(0, shapes.length - 1)];
    const number = randomInt(1, 9);
    return { shape, color: color.name, number, label: `${shape}-${color.name}-${number}-${index}` };
  });
  const matches = new Set<number>();
  cards.forEach((card, index) => {
    const baseMatch = card.color === targetColor.name && card.shape === targetShape;
    const parityMatch = !parity || (parity === "gerade" ? card.number % 2 === 0 : card.number % 2 !== 0);
    if (baseMatch && parityMatch) matches.add(index);
  });
  if (!matches.size) {
    cards[0] = { shape: targetShape, color: targetColor.name, number: parity === "gerade" ? 4 : parity === "ungerade" ? 5 : 3, label: `forced-${Date.now()}` };
    matches.add(0);
  }
  return { cards, matches, targetColor, targetShape, parity };
}

export function AttentionLab() {
  const [difficulty, setDifficulty] = useState<Difficulty>("leicht");
  const [category, setCategory] = useState<AttentionCategory>("Visuelle Suche");
  const [round, setRound] = useState(0);
  const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
  const [finished, setFinished] = useState(false);
  const sessionSize = 5;

  function record(result: Omit<TrainingResult, "id" | "createdAt" | "domain" | "difficulty"> & { score: number }, attempt: SessionAttempt) {
    saveResult({ id: makeId(), domain: "aufmerksamkeit", difficulty, createdAt: new Date().toISOString(), ...result });
    setAttempts((current) => [...current, attempt]);
  }

  function next() {
    if (round >= sessionSize - 1) setFinished(true);
    else setRound((value) => value + 1);
  }

  function restart() {
    setRound(0);
    setAttempts([]);
    setFinished(false);
  }

  const total = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0;

  return <>
    <div className="panel attention-control-panel">
      <span className="eyebrow">Attention Lab konfigurieren</span>
      <div className="difficulty-grid">
        {attentionLevels.map((level) => <button key={level.value} className={`difficulty-card ${difficulty === level.value ? "is-active" : ""}`} onClick={() => { setDifficulty(level.value); restart(); }}>
          <strong>{level.label}</strong><span>{level.description}</span>
        </button>)}
      </div>
      <div className="attention-category-grid">
        {attentionCategories.map((item) => <button key={item.key} className={`attention-category-card ${category === item.key ? "is-active" : ""}`} onClick={() => { setCategory(item.key); restart(); }}>
          <span className="attention-category-icon">{item.icon}</span><strong>{item.title}</strong><span>{item.description}</span>
        </button>)}
      </div>
    </div>

    {finished ? <AttentionSummary attempts={attempts} difficulty={difficulty} restart={restart} /> : <div className="attention-session-shell">
      <div className="panel attention-session-head">
        <div><span className="eyebrow">{category} · {difficulty}</span><h2>Aufgabe {round + 1} von {sessionSize}</h2></div>
        <div className="runner-counter">{round + 1} / {sessionSize}</div>
      </div>
      <div className="progress runner-progress"><span style={{ width: `${((round + attempts.length % sessionSize) / sessionSize) * 100}%` }} /></div>
      {category === "Visuelle Suche" && <SelectionTask key={`${category}-${difficulty}-${round}`} difficulty={difficulty} mode="visual" onComplete={(result, attempt) => { record(result, attempt); }} onNext={next} />}
      {category === "Zahlensuche" && <SelectionTask key={`${category}-${difficulty}-${round}`} difficulty={difficulty} mode="number" onComplete={(result, attempt) => { record(result, attempt); }} onNext={next} />}
      {category === "Farbkonflikt" && <ColorConflictTask key={`${category}-${difficulty}-${round}`} difficulty={difficulty} onComplete={(result, attempt) => record(result, attempt)} onNext={next} />}
      {category === "Reaktion" && <ReactionTask key={`${category}-${difficulty}-${round}`} difficulty={difficulty} onComplete={(result, attempt) => record(result, attempt)} onNext={next} />}
      {category === "Doppelaufgabe" && <DualTask key={`${category}-${difficulty}-${round}`} difficulty={difficulty} onComplete={(result, attempt) => record(result, attempt)} onNext={next} />}
    </div>}
  </>;
}

function SelectionTask({ difficulty, mode, onComplete, onNext }: { difficulty: Difficulty; mode: "visual" | "number"; onComplete: (result: Omit<TrainingResult, "id" | "createdAt" | "domain" | "difficulty">, attempt: SessionAttempt) => void; onNext: () => void }) {
  const task = useMemo(() => mode === "visual" ? generateVisualTask(difficulty) : generateNumberTask(difficulty), [difficulty, mode]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof scoreFromSelection> | null>(null);
  const started = useRef(Date.now());
  const category: AttentionCategory = mode === "visual" ? "Visuelle Suche" : "Zahlensuche";

  function toggle(index: number) {
    if (checked) return;
    setSelected((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  }

  function check() {
    if (checked || !selected.size) return;
    const value = scoreFromSelection(selected, task.targets);
    const durationSeconds = Math.max(1, Math.round((Date.now() - started.current) / 1000));
    setEvaluation(value); setChecked(true);
    onComplete({ score: value.score, durationSeconds, exerciseId: `${mode}-${difficulty}`, exerciseType: mode === "visual" ? "visual-search" : "target-detection", category, misses: value.misses, falseHits: value.falseHits, correctHits: value.correctHits }, { category, score: value.score, misses: value.misses, falseHits: value.falseHits });
  }

  return <div className="panel attention-task">
    <span className="eyebrow">{category}</span>
    <h2>Markiere alle Felder mit <span className="target-token">{task.targetLabel}</span></h2>
    <p className="lead">Arbeite systematisch. Qualität zählt vor Geschwindigkeit.</p>
    <div className={`attention-grid ${difficulty === "profi" ? "is-dense" : ""}`}>
      {task.cells.map((cell, index) => <button key={`${cell}-${index}`} className={`attention-cell ${selected.has(index) ? "is-selected" : ""} ${checked && task.targets.has(index) ? "is-target" : ""} ${checked && selected.has(index) && !task.targets.has(index) ? "is-wrong" : ""}`} onClick={() => toggle(index)} disabled={checked}>{cell}</button>)}
    </div>
    {!checked ? <button className="btn btn-primary runner-action" onClick={check} disabled={!selected.size}>Auswahl prüfen</button> : evaluation && <>
      <div className={`feedback ${evaluation.score >= 70 ? "success" : "error"}`}><strong>{evaluation.score}% erreicht.</strong><span>{evaluation.correctHits} Treffer · {evaluation.misses} ausgelassen · {evaluation.falseHits} Fehlmarkierungen.</span></div>
      <div className="strategy-card"><strong>Strategie:</strong> Scanne Zeile für Zeile von links nach rechts und kontrolliere erst am Ende, statt zwischen Bereichen zu springen.</div>
      <button className="btn btn-primary runner-action" onClick={onNext}>Nächste Aufgabe</button>
    </>}
  </div>;
}

function ColorConflictTask({ difficulty, onComplete, onNext }: { difficulty: Difficulty; onComplete: (result: Omit<TrainingResult, "id" | "createdAt" | "domain" | "difficulty">, attempt: SessionAttempt) => void; onNext: () => void }) {
  const task = useMemo(() => generateColorTask(difficulty), [difficulty]);
  const [checked, setChecked] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const started = useRef(Date.now());

  function choose(name: string) {
    if (checked) return;
    const correct = name === task.ink.name;
    const durationSeconds = Math.max(1, Math.round((Date.now() - started.current) / 1000));
    setAnswer(name); setChecked(true);
    onComplete({ score: correct ? 100 : 0, durationSeconds, exerciseId: `color-${difficulty}`, exerciseType: "color-conflict", category: "Farbkonflikt" }, { category: "Farbkonflikt", score: correct ? 100 : 0 });
  }

  return <div className="panel attention-task color-task">
    <span className="eyebrow">Farbkonflikt</span>
    <h2>Welche Farbe siehst du tatsächlich?</h2>
    <div className="stroop-word" style={{ color: task.ink.value }}>{task.word.name.toUpperCase()}</div>
    <div className="color-options">{task.options.map((option) => <button key={option.name} className={`color-answer ${answer === option.name ? "is-selected" : ""}`} onClick={() => choose(option.name)} disabled={checked}><span style={{ background: option.value }} />{option.name}</button>)}</div>
    {checked && <>
      <div className={`feedback ${answer === task.ink.name ? "success" : "error"}`}><strong>{answer === task.ink.name ? "Richtig erkannt." : `Die sichtbare Farbe war ${task.ink.name}.`}</strong><span>Entscheidend ist die Schriftfarbe, nicht das gelesene Wort.</span></div>
      <div className="strategy-card"><strong>Strategie:</strong> Fokussiere zuerst nur die Farbfläche der Buchstaben und sprich den Farbnamen innerlich aus, bevor du antwortest.</div>
      <button className="btn btn-primary runner-action" onClick={onNext}>Nächste Aufgabe</button>
    </>}
  </div>;
}

function ReactionTask({ difficulty, onComplete, onNext }: { difficulty: Difficulty; onComplete: (result: Omit<TrainingResult, "id" | "createdAt" | "domain" | "difficulty">, attempt: SessionAttempt) => void; onNext: () => void }) {
  const preset = attentionPresets[difficulty];
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"idle" | "waiting" | "go" | "done">("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  const timer = useRef<number | null>(null);
  const signalAt = useRef(0);
  const startedAt = useRef(Date.now());

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function arm() {
    if (phase === "waiting") return;
    setPhase("waiting");
    timer.current = window.setTimeout(() => { signalAt.current = performance.now(); setPhase("go"); }, randomInt(preset.minDelay, preset.maxDelay));
  }

  function tap() {
    if (phase === "waiting") {
      if (timer.current) window.clearTimeout(timer.current);
      setFalseStarts((value) => value + 1);
      setPhase("idle");
      return;
    }
    if (phase !== "go") return;
    const reaction = Math.round(performance.now() - signalAt.current);
    const nextTimes = [...times, reaction];
    setTimes(nextTimes);
    const nextRound = round + 1;
    setRound(nextRound);
    if (nextRound >= preset.reactionRounds) {
      const avg = Math.round(nextTimes.reduce((sum, value) => sum + value, 0) / nextTimes.length);
      const best = Math.min(...nextTimes);
      const target = difficulty === "profi" ? 420 : difficulty === "schwer" ? 500 : difficulty === "mittel" ? 600 : difficulty === "leicht" ? 750 : 900;
      const penalty = falseStarts * 8;
      const score = Math.max(0, Math.min(100, Math.round((target / Math.max(target, avg)) * 100) - penalty));
      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      setPhase("done");
      onComplete({ score, durationSeconds, exerciseId: `reaction-${difficulty}`, exerciseType: "reaction", category: "Reaktion", reactionMs: avg, bestReactionMs: best, falseStarts }, { category: "Reaktion", score, reactionMs: avg, falseStarts });
    } else {
      setPhase("idle");
    }
  }

  const avg = times.length ? Math.round(times.reduce((sum, value) => sum + value, 0) / times.length) : 0;
  return <div className="panel attention-task reaction-task">
    <span className="eyebrow">Reaktionskontrolle</span>
    <h2>Warte auf Grün. Klicke erst beim echten Zielsignal.</h2>
    <p className="lead">Runde {Math.min(round + 1, preset.reactionRounds)} von {preset.reactionRounds} · Fehlstarts: {falseStarts}</p>
    <button className={`reaction-zone phase-${phase}`} onClick={phase === "idle" ? arm : tap} disabled={phase === "done"}>
      {phase === "idle" && "Runde starten"}
      {phase === "waiting" && "Warten …"}
      {phase === "go" && "JETZT!"}
      {phase === "done" && "Einheit abgeschlossen"}
    </button>
    {!!times.length && <div className="reaction-readout"><strong>{avg} ms</strong><span>aktueller Durchschnitt</span></div>}
    {phase === "done" && <>
      <div className="feedback success"><strong>{avg} ms Durchschnitt · {Math.min(...times)} ms Bestzeit.</strong><span>{falseStarts} Fehlstarts wurden berücksichtigt.</span></div>
      <div className="strategy-card"><strong>Strategie:</strong> Ein schneller Start ist weniger wichtig als eine saubere Reaktion auf das echte Signal. Ruhe reduziert Fehlstarts.</div>
      <button className="btn btn-primary runner-action" onClick={onNext}>Nächste Aufgabe</button>
    </>}
  </div>;
}

function DualTask({ difficulty, onComplete, onNext }: { difficulty: Difficulty; onComplete: (result: Omit<TrainingResult, "id" | "createdAt" | "domain" | "difficulty">, attempt: SessionAttempt) => void; onNext: () => void }) {
  const task = useMemo(() => generateDualTask(difficulty), [difficulty]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [evaluation, setEvaluation] = useState<ReturnType<typeof scoreFromSelection> | null>(null);
  const started = useRef(Date.now());

  function toggle(index: number) {
    if (checked) return;
    setSelected((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; });
  }
  function check() {
    if (checked || !selected.size) return;
    const value = scoreFromSelection(selected, task.matches);
    const durationSeconds = Math.max(1, Math.round((Date.now() - started.current) / 1000));
    setEvaluation(value); setChecked(true);
    onComplete({ score: value.score, durationSeconds, exerciseId: `dual-${difficulty}`, exerciseType: "dual-task", category: "Doppelaufgabe", misses: value.misses, falseHits: value.falseHits, correctHits: value.correctHits }, { category: "Doppelaufgabe", score: value.score, misses: value.misses, falseHits: value.falseHits });
  }

  return <div className="panel attention-task dual-task">
    <span className="eyebrow">Doppelaufgabe</span>
    <h2>Markiere nur: {task.targetShape} + {task.targetColor.name}{task.parity ? ` + ${task.parity} Zahl` : ""}</h2>
    <div className="dual-grid">{task.cards.map((card, index) => {
      const color = colors.find((item) => item.name === card.color)?.value || "#555";
      return <button key={card.label} className={`dual-card ${selected.has(index) ? "is-selected" : ""} ${checked && task.matches.has(index) ? "is-target" : ""} ${checked && selected.has(index) && !task.matches.has(index) ? "is-wrong" : ""}`} onClick={() => toggle(index)} disabled={checked}>
        <span className="dual-glyph" style={{ color }}>{shapeGlyph[card.shape]}</span><strong>{card.number}</strong><small>{card.color}</small>
      </button>;
    })}</div>
    {!checked ? <button className="btn btn-primary runner-action" onClick={check} disabled={!selected.size}>Regel prüfen</button> : evaluation && <>
      <div className={`feedback ${evaluation.score >= 70 ? "success" : "error"}`}><strong>{evaluation.score}% erreicht.</strong><span>{evaluation.correctHits} richtig · {evaluation.misses} ausgelassen · {evaluation.falseHits} Fehlmarkierungen.</span></div>
      <div className="strategy-card"><strong>Strategie:</strong> Prüfe zuerst Merkmal 1, dann Merkmal 2. Bei Profi-Aufgaben erst danach die Zusatzregel zur Zahl.</div>
      <button className="btn btn-primary runner-action" onClick={onNext}>Nächste Aufgabe</button>
    </>}
  </div>;
}

function AttentionSummary({ attempts, difficulty, restart }: { attempts: SessionAttempt[]; difficulty: Difficulty; restart: () => void }) {
  const average = attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length) : 0;
  const avgReaction = attempts.filter((item) => item.reactionMs).length ? Math.round(attempts.filter((item) => item.reactionMs).reduce((sum, item) => sum + (item.reactionMs || 0), 0) / attempts.filter((item) => item.reactionMs).length) : 0;
  const errors = attempts.reduce((sum, item) => sum + (item.falseStarts || 0) + (item.falseHits || 0) + (item.misses || 0), 0);
  return <div className="panel runner-complete attention-summary">
    <span className="eyebrow">Attention Lab abgeschlossen</span>
    <h2>{average}% Gesamtleistung</h2>
    <div className="stat-grid runner-stats">
      <div className="stat"><strong>{attempts.length}</strong><span>Aufgaben</span></div>
      <div className="stat"><strong>{average}%</strong><span>Durchschnitt</span></div>
      <div className="stat"><strong>{avgReaction ? `${avgReaction} ms` : "–"}</strong><span>Reaktion</span></div>
      <div className="stat"><strong>{errors}</strong><span>Fehlerindikatoren</span></div>
    </div>
    <div className="completion-table-wrap"><table className="progress-table"><thead><tr><th>Kategorie</th><th>Ergebnis</th><th>Reaktion</th><th>Fehler</th></tr></thead><tbody>{attempts.map((item, index) => <tr key={`${item.category}-${index}`}><td>{item.category}</td><td>{item.score}%</td><td>{item.reactionMs ? `${item.reactionMs} ms` : "–"}</td><td>{(item.falseStarts || 0) + (item.falseHits || 0) + (item.misses || 0)}</td></tr>)}</tbody></table></div>
    <div className="feedback success">Die Ergebnisse wurden lokal gespeichert und fließen in Progress Engine und Coach Engine ein.</div>
    <button className="btn btn-primary" onClick={restart}>Neue Attention-Runde</button>
  </div>;
}
