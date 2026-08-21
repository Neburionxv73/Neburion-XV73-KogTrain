import { difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type VisualQuestion = {
  id: string;
  category: string;
  prompt: string;
  visual: string[];
  options: string[];
  answer: number;
  explanation: string;
};

export type VisualSession = {
  difficulty: Difficulty;
  questions: VisualQuestion[];
};

const arrows = ["↑", "→", "↓", "←"];
const diagonals = ["↗", "↘", "↙", "↖"];
const shapes = ["●", "■", "▲", "◆", "✦", "⬟"];

function withAnswer(id: string, category: string, prompt: string, visual: string[], correct: string, distractors: string[], explanation: string): VisualQuestion {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { id, category, prompt, visual, options, answer: options.indexOf(correct), explanation };
}

function patternQuestion(seed: number, difficulty: Difficulty): VisualQuestion {
  const picked = shuffled(shapes).slice(0, difficulty === 1 ? 2 : 3);
  const length = difficulty === 3 ? 7 : 6;
  const visual = Array.from({ length }, (_, index) => picked[index % picked.length]);
  const correct = picked[length % picked.length];
  return withAnswer(`pattern-${seed}`, "Muster", "Welches Zeichen setzt die Reihe fort?", [...visual, "?"], correct, shuffled(shapes.filter((item) => item !== correct)).slice(0, 3), "Die Formen wiederholen sich nach einer festen Reihenfolge.");
}

function rotationQuestion(seed: number, difficulty: Difficulty): VisualQuestion {
  const baseIndex = randomInt(0, arrows.length - 1);
  const turns = difficulty === 1 ? 1 : randomInt(1, difficulty === 2 ? 2 : 3);
  const correct = arrows[(baseIndex + turns) % arrows.length];
  return withAnswer(`rotation-${seed}`, "Rotation", `Wie sieht der Pfeil nach ${turns * 90}° Drehung im Uhrzeigersinn aus?`, [arrows[baseIndex], "↻", `${turns * 90}°`], correct, arrows.filter((item) => item !== correct), "Eine Vierteldrehung entspricht 90 Grad im Uhrzeigersinn.");
}

function mirrorQuestion(seed: number): VisualQuestion {
  const index = randomInt(0, diagonals.length - 1);
  const mirrorMap: Record<string, string> = { "↗": "↖", "↖": "↗", "↘": "↙", "↙": "↘" };
  const base = diagonals[index];
  const correct = mirrorMap[base];
  return withAnswer(`mirror-${seed}`, "Spiegelung", "Welcher Pfeil ist die horizontale Spiegelung?", [base, "│", "?"], correct, diagonals.filter((item) => item !== correct), "Bei einer horizontalen Spiegelung tauschen links und rechts die Seite.");
}

function oddQuestion(seed: number, difficulty: Difficulty): VisualQuestion {
  const base = shuffled(shapes)[0];
  const odd = shuffled(shapes.filter((item) => item !== base))[0];
  const count = difficulty === 3 ? 8 : 6;
  const oddIndex = randomInt(0, count - 1);
  const visual = Array.from({ length: count }, (_, index) => index === oddIndex ? odd : base);
  const correct = String(oddIndex + 1);
  const positions = shuffled(Array.from({ length: count }, (_, index) => String(index + 1)).filter((item) => item !== correct)).slice(0, 3);
  return withAnswer(`odd-${seed}`, "Abweichung", "An welcher Position unterscheidet sich das Zeichen?", visual, correct, positions, "Genau ein Element weicht in seiner Form von den übrigen ab.");
}

function positionQuestion(seed: number, difficulty: Difficulty): VisualQuestion {
  const positions = [
    { label: "oben links", index: 0 }, { label: "oben rechts", index: 2 },
    { label: "unten links", index: 6 }, { label: "unten rechts", index: 8 },
  ];
  const selected = shuffled(positions)[0];
  const marker = difficulty === 3 ? "◆" : "●";
  const visual = Array.from({ length: 9 }, (_, index) => index === selected.index ? marker : "·");
  return withAnswer(`position-${seed}`, "Raumlage", "Wo befindet sich das markierte Zeichen im Raster?", visual, selected.label, positions.filter((item) => item.label !== selected.label).map((item) => item.label), "Die Position wird relativ zum 3×3-Raster bestimmt.");
}

function countQuestion(seed: number, difficulty: Difficulty): VisualQuestion {
  const target = shuffled(shapes)[0];
  const other = shuffled(shapes.filter((item) => item !== target))[0];
  const total = difficulty === 1 ? 7 : difficulty === 2 ? 9 : 11;
  const targetCount = randomInt(2, Math.max(2, total - 3));
  const visual = shuffled([...Array(targetCount).fill(target), ...Array(total - targetCount).fill(other)]);
  const correct = String(targetCount);
  const distractors = [targetCount - 1, targetCount + 1, targetCount + 2].filter((value) => value > 0).map(String);
  return withAnswer(`count-${seed}`, "Formvergleich", `Wie oft kommt ${target} vor?`, visual, correct, distractors, "Zähle ausschließlich das angegebene Zielzeichen.");
}

export function createVisualSession(bestPercent: number): VisualSession {
  const difficulty = difficultyFromPercent(bestPercent);
  const generators = [
    () => patternQuestion(1, difficulty),
    () => rotationQuestion(2, difficulty),
    () => mirrorQuestion(3),
    () => oddQuestion(4, difficulty),
    () => positionQuestion(5, difficulty),
    () => countQuestion(6, difficulty),
    () => patternQuestion(7, difficulty),
    () => rotationQuestion(8, difficulty),
  ];
  return { difficulty, questions: shuffled(generators.map((create) => create())) };
}
