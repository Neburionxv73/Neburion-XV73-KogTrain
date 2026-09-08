"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

const exact: Record<string, string> = {
  "Dein Training passt sich jetzt wirklich an.": "Your training now truly adapts to you.",
  "KogTrain bewertet Trefferquote, Trainingsmenge, Unterthemen, letzte Session und – bei Reaktionsaufgaben – deine Reaktionszeit. Daraus entsteht ein erklärbarer nächster Trainingsreiz statt einer Black-Box-Empfehlung.": "KogTrain evaluates accuracy, training volume, subtopics, your latest session and — for reaction tasks — your reaction time. This creates an explainable next training stimulus instead of a black-box recommendation.",
  "Adaptive Empfehlung": "Adaptive recommendation",
  "Lernziel wählen": "Choose a learning goal",
  "Wochenrhythmus": "Weekly rhythm",
  "Letzte Sessions": "Recent sessions",
  "Gezielte Übungen": "Targeted exercises",
  "Session-Länge": "Session length",
  "Grundniveau": "Base level",
  "Adaptive Engine aktivieren": "Enable Adaptive Engine",
  "Adaptiven Lernpfad starten": "Start adaptive learning path",
  "Meinen Lernpfad starten": "Start my learning path",
  "Tages-Challenge · 8 Aufgaben": "Daily Challenge · 8 tasks",
  "Leicht": "Easy",
  "Standard": "Standard",
  "Challenge": "Challenge",
  "Kopfrechnen verbessern": "Improve mental arithmetic",
  "Plus, Minus, Mal, Division und Zahlenfolgen gezielt festigen.": "Strengthen addition, subtraction, multiplication, division and number sequences.",
  "Wort & Sprache stärken": "Strengthen words & language",
  "Wortsuche, Rechtschreibung, Synonyme und Antonyme trainieren.": "Train word search, spelling, synonyms and antonyms.",
  "Englisch erweitern": "Improve English",
  "Deutsch ↔ Englisch mit Alltag, Arbeit, Natur, Essen und Reisen.": "German ↔ English with everyday life, work, nature, food and travel.",
  "Konzentration steigern": "Improve concentration",
  "Selektive Aufmerksamkeit und Reizfilter gezielt schärfen.": "Sharpen selective attention and distraction filtering.",
  "Reaktion verbessern": "Improve reaction speed",
  "Farbe, Form und Regelwechsel schneller erkennen.": "Recognize colors, shapes and rule changes faster.",
  "Merkfähigkeit trainieren": "Train memory",
  "Wörter, Zahlen und Symbole sicherer speichern und abrufen.": "Store and recall words, numbers and symbols more reliably.",
  "Mathematik": "Mathematics",
  "Wort & Sprache": "Words & language",
  "Deutsch ↔ Englisch": "German ↔ English",
  "Aufmerksamkeit": "Attention",
  "Reaktion": "Reaction",
  "Merkfähigkeit": "Memory",
  "Persönlicher Plan": "Personal plan",
  "Tages-Challenge": "Daily Challenge",
  "Adaptiver Lernpfad": "Adaptive learning path",
  "Persönlicher Lernpfad": "Personal learning path",
  "Heute empfohlen": "Recommended today",
  "Fokus": "Focus",
  "Nächstes Niveau:": "Next level:",
  "Priorität": "Priority",
  "Vertrauen": "Confidence",
  "hoch": "high",
  "mittel": "medium",
  "niedrig": "low",
  "Aufgabe": "Task",
  "Auswertung": "Results",
  "Präge dir die Folge ein.": "Memorize the sequence.",
  "Gleich wird die Folge ausgeblendet.": "The sequence will disappear in a moment.",
  "Tastatur: 1–4": "Keyboard: 1–4",
  "Richtig ✓": "Correct ✓",
  "Nächste Aufgabe": "Next task",
  "Session abschließen": "Finish session",
  "Neue Session": "New session",
  "Erste Session ✓": "First session ✓",
  "Perfekte Session ✓": "Perfect session ✓",
  "3-Tage-Serie ✓": "3-day streak ✓",
  "Wochenziel ✓": "Weekly goal ✓",
};

const rules: Array<[RegExp, string]> = [
  [/Adaptive Engine · Vertrauen hoch/g, "Adaptive Engine · High confidence"],
  [/Adaptive Engine · Vertrauen mittel/g, "Adaptive Engine · Medium confidence"],
  [/Adaptive Engine · Vertrauen niedrig/g, "Adaptive Engine · Low confidence"],
  [/(\d+) Sessions in dieser Woche\./g, "$1 sessions this week."],
  [/Wochenziel erreicht – stark dran geblieben\./g, "Weekly goal reached — great consistency."],
  [/Regelmäßige kurze Einheiten bauen nachhaltiger Routine auf\./g, "Regular short sessions build a more sustainable routine."],
  [/(\d+) Sessions \/ Woche/g, "$1 sessions / week"],
  [/Starke Session – Niveau halten oder steigern\./g, "Strong session — maintain or increase the level."],
  [/Solide Basis – gezielte Wiederholung lohnt sich\./g, "Solid base — targeted repetition is worthwhile."],
  [/Guter Lernreiz – dieses Thema darf wiederkommen\./g, "Good learning stimulus — this topic should return."],
  [/Aufgabe (\d+)\/(\d+)/g, "Task $1/$2"],
  [/Heute empfohlen ·/g, "Recommended today ·"],
  [/Nächstes Niveau:/g, "Next level:"],
  [/Priorität (\d+)\/145/g, "Priority $1/145"],
  [/Leicht · Priorität/g, "Easy · Priority"],
  [/Standard · Priorität/g, "Standard · Priority"],
  [/Challenge · Priorität/g, "Challenge · Priority"],
  [/Richtig wäre:/g, "Correct answer:"],
  [/von (\d+) Aufgaben richtig/g, "of $1 tasks correct"],
  [/Ø Reaktionszeit/g, "Avg. reaction time"],
  [/Trefferquote/g, "Accuracy"],
  [/Bestwert/g, "Best score"],
  [/Wochenziel/g, "Weekly goal"],
  [/Sessions heute/g, "Sessions today"],
];

function translate(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  let out = exact[trimmed] ?? trimmed;
  for (const [pattern, replacement] of rules) out = out.replace(pattern, replacement);
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  return lead + out + trail;
}

export function FocusEnglishBridge({ children }: { children: ReactNode }) {
  const { language } = usePlatformLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || language !== "en") return;
    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeValue) {
          const next = translate(node.nodeValue);
          if (next !== node.nodeValue) node.nodeValue = next;
        }
      }
      root.querySelectorAll<HTMLElement>("[aria-label],[title],[placeholder]").forEach((el) => {
        for (const attr of ["aria-label", "title", "placeholder"]) {
          const value = el.getAttribute(attr);
          if (value) {
            const next = translate(value);
            if (next !== value) el.setAttribute(attr, next);
          }
        }
      });
      applying = false;
    };
    apply();
    const observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title", "placeholder"] });
    return () => observer.disconnect();
  }, [language]);

  return <div ref={ref}>{children}</div>;
}
