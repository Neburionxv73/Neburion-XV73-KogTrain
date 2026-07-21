import type { Difficulty, TrainingDomain, TrainingResult } from "@/features/cognitive-engine/types";
import type { Exercise } from "@/features/exercise-runner/types";
import type { UserPreferences } from "@/features/session-engine/types";

const difficultyOrder: Difficulty[] = ["einstieg", "leicht", "mittel", "schwer", "profi"];
const coreDomains: TrainingDomain[] = ["gedaechtnis", "aufmerksamkeit", "logik", "sprache", "visuell"];

export type AdaptiveDecision = {
  targetDomain: TrainingDomain;
  targetDifficulty: Difficulty;
  confidence: "Orientierung" | "Solide" | "Hoch";
  reason: string;
  signals: string[];
};

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

function recent(results: TrainingResult[], count = 12) {
  return [...results].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, count);
}

function chooseDomain(results: TrainingResult[], preferences: UserPreferences | null): TrainingDomain {
  const allowed = preferences?.domains?.length ? preferences.domains : coreDomains;
  const recentItems = recent(results, 16);
  const rows = allowed.map((domain) => {
    const items = results.filter((item) => item.domain === domain);
    const last = recentItems.filter((item) => item.domain === domain);
    const score = average(items.slice(0, 12).map((item) => item.score));
    const recencyPenalty = last.length * 5;
    const absenceBonus = items.length ? 0 : 25;
    const developmentNeed = items.length ? Math.max(0, 82 - score) : 15;
    return { domain, rank: absenceBonus + developmentNeed - recencyPenalty, sessions: items.length, score };
  });
  return [...rows].sort((a, b) => b.rank - a.rank || a.sessions - b.sessions)[0]?.domain ?? "gedaechtnis";
}

function chooseDifficulty(results: TrainingResult[], domain: TrainingDomain, preferences: UserPreferences | null): Difficulty {
  const domainResults = recent(results.filter((item) => item.domain === domain), 6);
  const fallback = preferences?.difficulty ?? "leicht";
  if (domainResults.length < 2) return fallback;
  const current = domainResults[0]?.difficulty ?? fallback;
  const score = average(domainResults.map((item) => item.score));
  const index = difficultyOrder.indexOf(current);
  if (score >= 88 && domainResults.filter((item) => item.score >= 80).length >= 3) return difficultyOrder[Math.min(index + 1, difficultyOrder.length - 1)];
  if (score < 55 && domainResults.filter((item) => item.score < 60).length >= 2) return difficultyOrder[Math.max(index - 1, 0)];
  return current;
}

export function buildAdaptiveDecision(results: TrainingResult[], preferences: UserPreferences | null): AdaptiveDecision {
  const targetDomain = chooseDomain(results, preferences);
  const targetDifficulty = chooseDifficulty(results, targetDomain, preferences);
  const domainResults = results.filter((item) => item.domain === targetDomain);
  const domainAverage = average(domainResults.slice(0, 8).map((item) => item.score));
  const confidence = results.length >= 20 ? "Hoch" : results.length >= 6 ? "Solide" : "Orientierung";
  const signals = [
    domainResults.length ? `${domainResults.length} Ergebnisse im Zielbereich` : "Zielbereich bisher wenig trainiert",
    domainAverage ? `Aktueller Bereichsschnitt ${domainAverage}%` : "Noch kein belastbarer Bereichsschnitt",
    `Startstufe ${preferences?.difficulty ?? "leicht"}`,
    "Wiederholungen der letzten Einheiten reduziert"
  ];
  const reason = domainResults.length
    ? `${targetDomain} bietet aktuell den sinnvollsten Mix aus Entwicklungspotenzial und Abwechslung. Die Stufe ${targetDifficulty} wird vorsichtig gewählt und nur nach mehreren stabilen Ergebnissen verändert.`
    : `${targetDomain} wurde bisher kaum trainiert. Deshalb sorgt die Auswahl für mehr Ausgewogenheit; die Stufe ${targetDifficulty} folgt deiner persönlichen Grundeinstellung.`;
  return { targetDomain, targetDifficulty, confidence, reason, signals };
}

export function selectAdaptiveExercises(
  library: Exercise[],
  results: TrainingResult[],
  preferences: UserPreferences | null,
  count: number
) {
  const decision = buildAdaptiveDecision(results, preferences);
  const recentIds = new Set(recent(results, 10).map((item) => item.exerciseId).filter(Boolean));
  const difficultyIndex = difficultyOrder.indexOf(decision.targetDifficulty);
  const allowedDifficulty = new Set([
    difficultyOrder[difficultyIndex],
    difficultyOrder[Math.max(0, difficultyIndex - 1)],
    difficultyOrder[Math.min(difficultyOrder.length - 1, difficultyIndex + 1)]
  ]);
  const scored = library.map((exercise) => {
    let score = 0;
    if (exercise.domain === decision.targetDomain) score += 60;
    if (exercise.difficulty === decision.targetDifficulty) score += 30;
    else if (allowedDifficulty.has(exercise.difficulty)) score += 12;
    if (!recentIds.has(exercise.id)) score += 25;
    if (preferences?.domains.includes(exercise.domain)) score += 10;
    score += Math.random() * 4;
    return { exercise, score };
  }).sort((a, b) => b.score - a.score);

  const chosen: Exercise[] = [];
  const categories = new Set<string>();
  for (const item of scored) {
    const category = item.exercise.category || item.exercise.domain;
    if (!categories.has(category) || chosen.length >= Math.ceil(count / 2)) {
      chosen.push(item.exercise);
      categories.add(category);
    }
    if (chosen.length >= count) break;
  }
  return { decision, exercises: chosen };
}
