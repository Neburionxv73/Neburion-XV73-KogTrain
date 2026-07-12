import type { Exercise } from "@/features/exercise-runner/types";

export const exerciseLibrary: Exercise[] = [
  {
    id: "logik-reihe-01",
    type: "single-choice",
    domain: "logik",
    difficulty: "leicht",
    title: "Zahlenmuster",
    prompt: "Welche Zahl setzt die Reihe fort? 4 · 8 · 12 · 16 · ?",
    options: ["18", "20", "22", "24"],
    answer: "20",
    explanation: "Die Reihe wächst immer um 4.",
    strategy: "Vergleiche zuerst jeweils zwei benachbarte Werte.",
    estimatedSeconds: 25
  },
  {
    id: "sprache-kategorie-01",
    type: "multi-choice",
    domain: "sprache",
    difficulty: "mittel",
    title: "Begriffe zuordnen",
    prompt: "Welche Begriffe gehören zur Kategorie Obst?",
    options: ["Apfel", "Birne", "Karotte", "Pflaume", "Kartoffel"],
    answers: ["Apfel", "Birne", "Pflaume"],
    explanation: "Apfel, Birne und Pflaume sind Obstsorten.",
    strategy: "Prüfe jeden Begriff einzeln, statt die Liste als Ganzes zu überblicken.",
    estimatedSeconds: 35
  },
  {
    id: "mathe-alltag-01",
    type: "single-choice",
    domain: "mathematik",
    difficulty: "mittel",
    title: "Alltagsrechnen",
    prompt: "Ein Artikel kostet 40 €. Er wird um 25 % reduziert. Wie viel kostet er danach?",
    options: ["10 €", "20 €", "30 €", "35 €"],
    answer: "30 €",
    explanation: "25 % von 40 € sind 10 €. 40 € minus 10 € ergibt 30 €.",
    strategy: "Berechne zuerst den Rabattbetrag und ziehe ihn dann vom Ausgangspreis ab.",
    estimatedSeconds: 45
  },
  {
    id: "aufmerksamkeit-signal-01",
    type: "multi-choice",
    domain: "aufmerksamkeit",
    difficulty: "mittel",
    title: "Zielreize erkennen",
    prompt: "Wähle alle Zeichen, die genau zweimal vorkommen.",
    options: ["◆", "●", "▲", "■", "★"],
    answers: ["◆", "▲"],
    explanation: "Im dargestellten Muster wären ◆ und ▲ die Zielreize mit genau zwei Vorkommen.",
    strategy: "Arbeite systematisch von links nach rechts und zähle jedes Symbol separat.",
    estimatedSeconds: 40
  },
  {
    id: "gedaechtnis-ablauf-01",
    type: "sequence",
    domain: "gedaechtnis",
    difficulty: "mittel",
    title: "Handlungsfolge",
    prompt: "Bringe den Ablauf für eine Tasse Tee in die richtige Reihenfolge.",
    items: ["Wasser eingießen", "Wasser erhitzen", "Teebeutel einsetzen", "Ziehzeit abwarten"],
    answer: ["Wasser erhitzen", "Teebeutel einsetzen", "Wasser eingießen", "Ziehzeit abwarten"],
    explanation: "Zuerst wird das Wasser erhitzt, dann der Teebeutel eingesetzt, anschließend aufgegossen und die Ziehzeit abgewartet.",
    strategy: "Stelle dir die Handlung bildlich vor und gehe sie Schritt für Schritt durch.",
    estimatedSeconds: 50
  },
  {
    id: "logik-reihe-02",
    type: "single-choice",
    domain: "logik",
    difficulty: "schwer",
    title: "Wechselnde Regel",
    prompt: "Welche Zahl folgt? 3 · 6 · 5 · 10 · 9 · ?",
    options: ["12", "14", "18", "20"],
    answer: "18",
    explanation: "Die Regel wechselt zwischen ×2 und −1.",
    strategy: "Prüfe, ob sich zwei Rechenregeln abwechseln.",
    estimatedSeconds: 50
  }
];
