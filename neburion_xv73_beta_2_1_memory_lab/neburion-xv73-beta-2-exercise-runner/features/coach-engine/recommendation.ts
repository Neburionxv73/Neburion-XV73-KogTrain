import type { TrainingResult } from "@/features/cognitive-engine/types";
import { weakestDomain } from "@/features/cognitive-engine/adaptive";
import { averageScore, groupProgress, recentWindow } from "@/features/progress-engine/analytics";

const labels = {
  gedaechtnis: "Gedächtnis",
  aufmerksamkeit: "Aufmerksamkeit",
  mathematik: "Mathematik",
  sprache: "Sprache",
  logik: "Logik"
};

const strategies: Record<string, string> = {
  gedaechtnis: "Nutze Gruppierung, innere Bilder und kurze Wiederholungen. Bei ähnlichen Begriffen helfen bewusst getrennte Kategorien.",
  aufmerksamkeit: "Arbeite systematisch von links nach rechts und kontrolliere erst, bevor du bestätigst.",
  mathematik: "Zerlege Aufgaben in kleine Rechenschritte und kontrolliere Zwischenergebnisse.",
  sprache: "Arbeite mit Kategorien, Oberbegriffen und konkreten Beispielen.",
  logik: "Suche zuerst nach Veränderungen zwischen benachbarten Elementen und prüfe dann Wechselregeln."
};

export function coachRecommendation(results: TrainingResult[]) {
  if (!results.length) {
    return {
      title: "Ruhiger Einstieg",
      text: "Beginne mit einer kurzen Memory-Lab-Runde auf leichter Stufe. So erhält die App erste Ergebnisse für spätere Empfehlungen.",
      domain: "gedaechtnis",
      strategy: strategies.gedaechtnis,
      reason: "Noch liegen keine gespeicherten Trainingsergebnisse vor."
    };
  }

  const domain = weakestDomain(results) as keyof typeof labels;
  const week = recentWindow(results, 7);
  const domainItems = results.filter((item) => item.domain === domain);
  const domainAverage = averageScore(domainItems);
  const weekAverage = averageScore(week);
  const categoryRows = groupProgress(results.filter((item) => item.domain === "gedaechtnis"), "category");
  const weakestMemoryCategory = categoryRows.length ? [...categoryRows].sort((a, b) => a.average - b.average)[0] : null;

  return {
    title: `Heute im Fokus: ${labels[domain]}`,
    text: `Dein Durchschnitt in diesem Bereich liegt aktuell bei ${domainAverage}%. Eine kurze Festigungsrunde ist sinnvoll, bevor die Schwierigkeit weiter steigt.`,
    domain,
    strategy: strategies[domain],
    reason: `Die Empfehlung basiert auf ${results.length} gespeicherten Ergebnissen. Dein 7-Tage-Durchschnitt liegt bei ${weekAverage}%.${weakestMemoryCategory ? ` Im Memory Lab zeigt ${weakestMemoryCategory.label} aktuell den größten Übungsbedarf.` : ""}`
  };
}
