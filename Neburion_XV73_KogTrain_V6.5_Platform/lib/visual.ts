import { difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type VisualMode = "rotation" | "mirror" | "pattern" | "matrix" | "position" | "search" | "compare" | "memory";
export type VisualTask = {
  id: string;
  mode: VisualMode;
  prompt: string;
  visual: string[];
  options: string[];
  answer: number;
  explanation: string;
  preview?: string[];
  previewMs?: number;
};
export type VisualSession = { difficulty: Difficulty; tasks: VisualTask[] };

export const VISUAL_SESSION_LENGTH = 8;
export const VISUAL_STORAGE_KEY = "neburion-v65-visual-stats";

const arrows = ["↑", "→", "↓", "←"];
const diagonals = ["↗", "↘", "↙", "↖"];
const shapes = ["●", "■", "▲", "◆", "✦", "⬟", "⬢", "★"];

function task(id: string, mode: VisualMode, prompt: string, visual: string[], correct: string, distractors: string[], explanation: string, preview?: string[], previewMs?: number): VisualTask {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { id, mode, prompt, visual, options, answer: options.indexOf(correct), explanation, preview, previewMs };
}

function rotation(seed: number, difficulty: Difficulty): VisualTask {
  const start = randomInt(0, 3);
  const turns = difficulty === 1 ? 1 : randomInt(1, difficulty === 2 ? 2 : 3);
  const correct = arrows[(start + turns) % 4];
  return task(`rotation-${seed}`, "rotation", `Wie zeigt der Pfeil nach ${turns * 90}° Drehung im Uhrzeigersinn?`, [arrows[start], "↻", `${turns * 90}°`], correct, arrows.filter((item) => item !== correct), "Jede Vierteldrehung entspricht 90 Grad im Uhrzeigersinn.");
}

function mirror(seed: number, difficulty: Difficulty): VisualTask {
  const base = diagonals[randomInt(0, diagonals.length - 1)];
  const horizontal: Record<string, string> = { "↗": "↖", "↖": "↗", "↘": "↙", "↙": "↘" };
  const vertical: Record<string, string> = { "↗": "↘", "↘": "↗", "↖": "↙", "↙": "↖" };
  const useVertical = difficulty === 3 && seed % 2 === 0;
  const correct = (useVertical ? vertical : horizontal)[base];
  return task(`mirror-${seed}`, "mirror", `Welcher Pfeil ist die ${useVertical ? "vertikale" : "horizontale"} Spiegelung?`, [base, useVertical ? "─" : "│", "?"], correct, diagonals.filter((item) => item !== correct), useVertical ? "Bei vertikaler Spiegelung tauschen oben und unten." : "Bei horizontaler Spiegelung tauschen links und rechts.");
}

function pattern(seed: number, difficulty: Difficulty): VisualTask {
  const picked = shuffled(shapes).slice(0, difficulty === 1 ? 2 : 3);
  const visible = difficulty === 3 ? 7 : 6;
  const sequence = Array.from({ length: visible }, (_, index) => picked[index % picked.length]);
  const correct = picked[visible % picked.length];
  return task(`pattern-${seed}`, "pattern", "Welches Zeichen setzt die visuelle Reihe fort?", [...sequence, "?"], correct, shuffled(shapes.filter((item) => item !== correct)).slice(0, 3), "Die Formen wiederholen sich in einer festen zyklischen Reihenfolge.");
}

function matrix(seed: number, difficulty: Difficulty): VisualTask {
  const [a, b, c] = shuffled(shapes).slice(0, 3);
  const visual = difficulty === 1
    ? [a, b, a, b, a, b, a, "?"]
    : [a, b, c, b, c, a, c, a, "?"];
  const correct = difficulty === 1 ? b : b;
  return task(`matrix-${seed}`, "matrix", "Welches Zeichen ergänzt die Matrix?", visual, correct, shapes.filter((item) => item !== correct).slice(0, 3), difficulty === 1 ? "Die beiden Formen wechseln sich regelmäßig ab." : "Jede Zeile verschiebt die Drei-Symbol-Folge um eine Position.");
}

function position(seed: number, difficulty: Difficulty): VisualTask {
  let row = randomInt(0, 2);
  let col = randomInt(0, 2);
  const start = row * 3 + col;
  const moves: string[] = [];
  const count = difficulty;
  for (let step = 0; step < count; step += 1) {
    const candidates: { symbol: string; dr: number; dc: number }[] = [];
    if (row > 0) candidates.push({ symbol: "↑", dr: -1, dc: 0 });
    if (row < 2) candidates.push({ symbol: "↓", dr: 1, dc: 0 });
    if (col > 0) candidates.push({ symbol: "←", dr: 0, dc: -1 });
    if (col < 2) candidates.push({ symbol: "→", dr: 0, dc: 1 });
    const move = candidates[randomInt(0, candidates.length - 1)];
    moves.push(move.symbol);
    row += move.dr;
    col += move.dc;
  }
  const finalIndex = row * 3 + col;
  const labels = ["oben links", "oben Mitte", "oben rechts", "Mitte links", "Mitte", "Mitte rechts", "unten links", "unten Mitte", "unten rechts"];
  const visual = Array.from({ length: 9 }, (_, index) => index === start ? "●" : "·");
  return task(`position-${seed}`, "position", `Folge den Bewegungen ${moves.join(" ")}. Wo landet der Punkt?`, visual, labels[finalIndex], shuffled(labels.filter((_, index) => index !== finalIndex)).slice(0, 3), "Die Bewegungen werden nacheinander im 3×3-Raster ausgeführt.");
}

function search(seed: number, difficulty: Difficulty): VisualTask {
  const base = shapes[randomInt(0, shapes.length - 1)];
  const target = shapes.filter((item) => item !== base)[randomInt(0, shapes.length - 2)];
  const count = difficulty === 1 ? 6 : difficulty === 2 ? 9 : 12;
  const targetIndex = randomInt(0, count - 1);
  const visual = Array.from({ length: count }, (_, index) => index === targetIndex ? target : base);
  const correct = String(targetIndex + 1);
  const distractors = shuffled(Array.from({ length: count }, (_, index) => String(index + 1)).filter((item) => item !== correct)).slice(0, 3);
  return task(`search-${seed}`, "search", `Finde ${target}. An welcher Position steht das Ziel?`, visual, correct, distractors, "Ein einzelner Zielreiz unterscheidet sich von den Distraktoren.");
}

function compare(seed: number, difficulty: Difficulty): VisualTask {
  const length = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  const left = Array.from({ length }, () => shapes[randomInt(0, shapes.length - 1)]);
  const variant = seed % 3;
  let right = [...left];
  let correct = "identisch";
  if (variant === 1) {
    const index = randomInt(0, length - 1);
    right[index] = shapes.find((item) => item !== left[index]) ?? "★";
    correct = "eine Position anders";
  } else if (variant === 2) {
    right = [...left].reverse();
    correct = "umgekehrte Reihenfolge";
  }
  return task(`compare-${seed}`, "compare", "Wie verhalten sich die beiden Formreihen zueinander?", [...left, "|", ...right], correct, ["identisch", "eine Position anders", "umgekehrte Reihenfolge", "nur die Größe ist anders"].filter((item) => item !== correct), "Vergleiche Position, Reihenfolge und Form beider Reihen systematisch.");
}

function memory(seed: number, difficulty: Difficulty): VisualTask {
  const length = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
  const preview = shuffled(shapes).slice(0, length);
  const position = randomInt(0, preview.length - 1);
  const correct = preview[position];
  const previewMs = difficulty === 3 ? 2200 : difficulty === 2 ? 2700 : 3200;
  return task(`memory-${seed}`, "memory", `Welches Symbol stand an Position ${position + 1}?`, ["Position", String(position + 1), "?"], correct, shuffled(shapes.filter((item) => item !== correct)).slice(0, 3), "Die Aufgabe prüft den kurzfristigen Abruf einer zuvor gezeigten Symbolfolge.", preview, previewMs);
}

export function createVisualSession(bestScore: number): VisualSession {
  const difficulty = difficultyFromPercent((bestScore / VISUAL_SESSION_LENGTH) * 100);
  const seed = Date.now() % 100000;
  const tasks = [
    rotation(seed, difficulty),
    mirror(seed + 1, difficulty),
    pattern(seed + 2, difficulty),
    matrix(seed + 3, difficulty),
    position(seed + 4, difficulty),
    search(seed + 5, difficulty),
    compare(seed + 6, difficulty),
    memory(seed + 7, difficulty),
  ];
  return { difficulty, tasks: shuffled(tasks) };
}
