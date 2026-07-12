import type { Exercise } from "./types";

export function normalize(values: string[]): string[] {
  return [...values]
    .map((value) => String(value).trim().toLocaleLowerCase("de"))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "de"));
}

export function evaluateExercise(exercise: Exercise, selected: string[]) {
  if (exercise.type === "single-choice" || exercise.type === "memory-choice") {
    const correct = selected[0] === exercise.answer;
    return { correct, score: correct ? 100 : 0 };
  }

  if (exercise.type === "sequence" || exercise.type === "memory-sequence") {
    const correct =
      exercise.answer.length === selected.length &&
      exercise.answer.every((value, index) => selected[index] === value);
    if (correct) return { correct: true, score: 100 };
    const hits = selected.filter((value, index) => exercise.answer[index] === value).length;
    return { correct: false, score: Math.round((hits / exercise.answer.length) * 100) };
  }

  const expected = exercise.type === "memory-recall" ? exercise.answers : exercise.answers;
  const normalizedExpected = normalize(expected);
  const normalizedSelected = normalize(selected);
  const correct = JSON.stringify(normalizedExpected) === JSON.stringify(normalizedSelected);
  if (correct) return { correct: true, score: 100 };

  const selectedSet = new Set(normalizedSelected);
  const expectedSet = new Set(normalizedExpected);
  const hits = normalizedExpected.filter((item) => selectedSet.has(item)).length;
  const falseSelections = normalizedSelected.filter((item) => !expectedSet.has(item)).length;
  const raw = Math.max(0, (hits - falseSelections) / normalizedExpected.length);
  return { correct: false, score: Math.round(raw * 100) };
}
