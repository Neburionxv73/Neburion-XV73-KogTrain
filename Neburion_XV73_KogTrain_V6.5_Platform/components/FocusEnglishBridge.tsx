"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

const exact: Record<string, string> = {
  "Dein Training passt sich jetzt wirklich an.": "Your training now truly adapts to you.",
  "Adaptive Empfehlung": "Adaptive recommendation",
  "Heute auf einen Blick": "Today at a glance",
  "Stärken & Entwicklung": "Strengths & development",
  "Skill-Profil": "Skill profile",
  "Lernziel wählen": "Choose a learning goal",
  "Wochenrhythmus": "Weekly rhythm",
  "Letzte Sessions": "Recent sessions",
  "Gezielte Übungen": "Targeted exercises",
  "Session-Länge": "Session length",
  "Grundniveau": "Base level",
  "Adaptive Engine aktivieren": "Enable Adaptive Engine",
  "Adaptive Session starten": "Start adaptive session",
  "Adaptiven Lernpfad starten": "Start adaptive learning path",
  "Meinen Lernpfad starten": "Start my learning path",
  "Tages-Challenge · 8 Aufgaben": "Daily Challenge · 8 tasks",
  "Tages-Challenge": "Daily Challenge",
  "Tagesmix": "Daily mix",
  "Tages-Mix": "Daily mix",
  "Persönlicher Lernmix": "Personal learning mix",
  "Persönlicher Plan": "Personal plan",
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
  "Leicht": "Easy",
  "Kurz": "Short",
  "Standard": "Standard",
  "Challenge": "Challenge",
  "Mathematik": "Mathematics",
  "Wort & Sprache": "Words & language",
  "Deutsch ↔ Englisch": "German ↔ English",
  "Selektive Aufmerksamkeit": "Selective attention",
  "Aufmerksamkeit": "Attention",
  "Reaktion": "Reaction",
  "Merkfähigkeit": "Memory",
  "Grundrechnungsarten": "Basic arithmetic",
  "Wortsuche und Verständnis": "Word search and comprehension",
  "Übersetzen": "Translation",
  "Fokus & Reizfilter": "Focus & distraction filter",
  "Schnell & korrekt": "Fast & accurate",
  "Kurzzeitgedächtnis": "Short-term memory",
  "Kopfrechnen verbessern": "Improve mental arithmetic",
  "Wort & Sprache stärken": "Strengthen words & language",
  "Englisch erweitern": "Improve English",
  "Konzentration steigern": "Improve concentration",
  "Reaktion verbessern": "Improve reaction speed",
  "Merkfähigkeit trainieren": "Train memory",
  "Noch offen": "Not started",
  "Noch untrainiert": "Not trained yet",
  "Stärkster Trainingswert": "Strongest training value",
  "Entwicklungspotenzial": "Development potential",
  "Erfolge freigeschaltet": "Milestones unlocked",
  "Meilensteine": "Milestones",
  "Erfolge": "Achievements",
  "Dein erster Erfolg wartet nach der ersten Session.": "Your first milestone unlocks after your first session.",
  "Erste Session ✓": "First session ✓",
  "5 Sessions ✓": "5 sessions ✓",
  "20 Sessions ✓": "20 sessions ✓",
  "80%-Marke ✓": "80% milestone ✓",
  "Perfekte Session ✓": "Perfect session ✓",
  "3-Tage-Serie ✓": "3-day streak ✓",
  "Wochenziel ✓": "Weekly goal ✓",
  "Aufgabe": "Task",
  "Aufgaben": "tasks",
  "Auswertung": "Results",
  "Heute geschafft 🎉": "Completed today 🎉",
  "Präge dir die Folge ein.": "Memorize the sequence.",
  "Gleich wird die Folge ausgeblendet.": "The sequence will disappear in a moment.",
  "Tastatur: 1–4": "Keyboard: 1–4",
  "Richtig ✓": "Correct ✓",
  "Fast – weiter geht’s": "Almost — keep going",
  "Sauber gelöst.": "Solved correctly.",
  "Nächste Aufgabe": "Next task",
  "Neue Session": "New session",
  "Kopfrechnen": "Mental arithmetic",
  "Zahlenfolgen": "Number sequences",
  "Prozent": "Percentages",
  "Brüche": "Fractions",
  "Dreisatz": "Rule of three",
  "Wortsuche": "Word search",
  "Buchstabensalat": "Letter scramble",
  "Synonyme": "Synonyms",
  "Antonyme": "Antonyms",
  "Rechtschreibung": "Spelling",
  "Wortbildung": "Word formation",
  "Alltag": "Everyday life",
  "Arbeit": "Work",
  "Natur": "Nature",
  "Essen": "Food",
  "Reisen": "Travel",
  "Zielreiz zählen": "Count target stimulus",
  "Abweichung finden": "Find the odd one out",
  "Buchstabenfilter": "Letter filter",
  "Farbe": "Color",
  "Form": "Shape",
  "Regelwechsel": "Rule switch",
  "Symbole": "Symbols",
  "Wörter": "Words",
  "Zahlen": "Numbers",
  "Kreis": "Circle",
  "Dreieck": "Triangle",
  "Quadrat": "Square",
  "Stern": "Star",
  "Raute": "Diamond",
  "Sechseck": "Hexagon",
  "Blau": "Blue",
  "Grün": "Green",
  "Rot": "Red",
  "Gelb": "Yellow",
  "Violett": "Purple",
  "Orange": "Orange",
};

const rules: Array<[RegExp, string]> = [
  [/KogTrain bewertet Trefferquote, Trainingsmenge, Unterthemen, letzte Session und – bei Reaktionsaufgaben – deine Reaktionszeit\. Daraus entsteht ein erklärbarer nächster Trainingsreiz statt einer Black-Box-Empfehlung\./g, "KogTrain evaluates accuracy, training volume, subtopics, your latest session and — for reaction tasks — your reaction time. This creates an explainable next training stimulus instead of a black-box recommendation."],
  [/Plus, Minus, Mal, Division und Zahlenfolgen gezielt festigen\./g, "Strengthen addition, subtraction, multiplication, division and number sequences."],
  [/Wortsuche, Rechtschreibung, Synonyme und Antonyme trainieren\./g, "Train word search, spelling, synonyms and antonyms."],
  [/Deutsch ↔ Englisch mit Alltag, Arbeit, Natur, Essen und Reisen\./g, "German ↔ English with everyday life, work, nature, food and travel."],
  [/Selektive Aufmerksamkeit und Reizfilter gezielt schärfen\./g, "Sharpen selective attention and distraction filtering."],
  [/Farbe, Form und Regelwechsel schneller erkennen\./g, "Recognize colors, shapes and rule changes faster."],
  [/Wörter, Zahlen und Symbole sicherer speichern und abrufen\./g, "Store and recall words, numbers and symbols more reliably."],
  [/Plus, Minus, Mal, Division und Kopfrechnen in wechselnden Schwierigkeitsstufen\./g, "Addition, subtraction, multiplication, division and mental arithmetic at changing difficulty levels."],
  [/Wörter finden, Buchstaben ordnen, Bedeutungen erkennen und Wortschatz erweitern\./g, "Find words, arrange letters, identify meanings and expand vocabulary."],
  [/Alltagswortschatz in beide Richtungen trainieren und sicherer abrufen\./g, "Train everyday vocabulary in both directions and recall it more reliably."],
  [/Zielreize zwischen Ablenkungen finden, zählen und unterscheiden\./g, "Find, count and distinguish target stimuli among distractions."],
  [/Unter Zeitdruck die passende Regel erkennen und möglichst schnell reagieren\./g, "Identify the correct rule under time pressure and react as quickly as possible."],
  [/Wörter, Symbole und kurze Reihen einprägen und gezielt wiedergeben\./g, "Memorize words, symbols and short sequences and recall them precisely."],
  [/Adaptive Engine · Vertrauen hoch/g, "Adaptive Engine · High confidence"],
  [/Adaptive Engine · Vertrauen mittel/g, "Adaptive Engine · Medium confidence"],
  [/Adaptive Engine · Vertrauen niedrig/g, "Adaptive Engine · Low confidence"],
  [/Nächstes Niveau:/g, "Next level:"],
  [/Priorität/g, "Priority"],
  [/Tagesmix/g, "Daily mix"],
  [/Tages-Mix/g, "Daily mix"],
  [/Meilensteine/g, "Milestones"],
  [/Erfolge freigeschaltet/g, "Milestones unlocked"],
  [/Erste Session/g, "First session"],
  [/Perfekte Session/g, "Perfect session"],
  [/3-Tage-Serie/g, "3-day streak"],
  [/80%-Marke/g, "80% milestone"],
  [/Wochenziel erreicht – stark dran geblieben\./g, "Weekly goal reached — great consistency."],
  [/Regelmäßige kurze Einheiten bauen nachhaltiger Routine auf\./g, "Regular short sessions build a more sustainable routine."],
  [/Sessions in dieser Woche\./g, "sessions this week."],
  [/diese Woche/g, "this week"],
  [/Trainingstage? in Serie\./g, "training days in a row."],
  [/XP gesamt/g, "XP total"],
  [/XP bis zum nächsten Level\./g, "XP to the next level."],
  [/ausgewertete Aufgaben/g, "evaluated tasks"],
  [/Bestwert einer Session:/g, "Best session score:"],
  [/Starke Session – Niveau halten oder steigern\./g, "Strong session — maintain or increase the level."],
  [/Solide Basis – gezielte Wiederholung lohnt sich\./g, "Solid base — targeted repetition is worthwhile."],
  [/Guter Lernreiz – dieses Thema darf wiederkommen\./g, "Good learning stimulus — this topic should return."],
  [/Nach den ersten Sessions wird deine Stärke hier sichtbar\./g, "Your strongest area will become visible after the first sessions."],
  [/Noch keine belastbare Vergleichsbasis\./g, "There is not enough reliable data for comparison yet."],
  [/fließt stärker in den adaptiven Themenmix ein\./g, "receives more weight in the adaptive topic mix."],
  [/hier lohnt sich die nächste Wiederholung\./g, "this area is worth repeating next."],
  [/Sessions \/ Woche/g, "sessions / week"],
  [/Aufgabe (\d+)\/(\d+)/g, "Task $1/$2"],
  [/Heute empfohlen ·/g, "Recommended today ·"],
  [/Richtig wäre:/g, "Correct answer:"],
  [/von (\d+) Aufgaben richtig/g, "of $1 tasks correct"],
  [/Ø Reaktionszeit/g, "Avg. reaction time"],
  [/Reaktionszeit:/g, "Reaction time:"],
  [/Wie oft erscheint ([^?]+)\?/g, "How often does $1 appear?"],
  [/Welches Symbol weicht ab\?/g, "Which symbol is different?"],
  [/Welches Wort enthält „([^”]+)“\?/g, "Which word contains “$1”?"],
  [/Welches Wort bedeutet ungefähr dasselbe wie „([^”]+)“\?/g, "Which word means roughly the same as “$1”?"],
  [/Was ist das Gegenteil von „([^”]+)“\?/g, "What is the opposite of “$1”?"],
  [/Welche Schreibweise ist richtig\?/g, "Which spelling is correct?"],
  [/Welches zusammengesetzte Wort entsteht aus „([^”]+)“ \+ „([^”]+)“\?/g, "Which compound word is formed from “$1” + “$2”?"],
  [/Welches Wort steckt in diesen Buchstaben\?/g, "Which word is hidden in these letters?"],
  [/Wie übersetzt du „([^”]+)“\?/g, "How do you translate “$1”?"],
  [/Regel: FARBE\. Was zählt\?/g, "Rule: COLOR. What counts?"],
  [/Regel: FORM\. Was zählt\?/g, "Rule: SHAPE. What counts?"],
  [/Was stand an Position (\d+)\?/g, "What was at position $1?"],
  [/Welches Symbol stand an Position (\d+)\?/g, "Which symbol was at position $1?"],
  [/An Position (\d+) stand (.+)\./g, "At position $1 there was $2."],
  [/Rechne möglichst ohne Hilfsmittel\./g, "Calculate without aids if possible."],
  [/Erkenne die Regel und setze sie fort\./g, "Identify the rule and continue it."],
  [/Berechne den Prozentwert\./g, "Calculate the percentage value."],
  [/Bestimme zuerst einen Anteil, dann den Zähler\./g, "Determine one share first, then the numerator."],
  [/Rechne über den Preis für 1 Stück\./g, "Calculate via the price for 1 item."],
  [/Wähle die passendste Bedeutung\./g, "Choose the best matching meaning."],
  [/Suche den Bedeutungsgegensatz\./g, "Find the opposite meaning."],
  [/Achte auf jeden Buchstaben\./g, "Pay attention to every letter."],
  [/Verbinde beide Wortteile sinnvoll\./g, "Combine both word parts meaningfully."],
  [/Ordne die Buchstaben zu einem sinnvollen Wort\./g, "Arrange the letters into a meaningful word."],
  [/Suche genau nach der Buchstabenfolge\./g, "Look carefully for the exact letter sequence."],
  [/Wähle die passendste Übersetzung\./g, "Choose the best translation."],
  [/Ein einzelner Reiz unterscheidet sich vom Rest\./g, "One stimulus differs from the rest."],
  [/Zähle nur den Zielbuchstaben\./g, "Count only the target letter."],
  [/Blende Distraktoren aus und zähle nur den Zielreiz\./g, "Ignore distractors and count only the target stimulus."],
  [/Die aktive Regel lautet FARBE\./g, "The active rule is COLOR."],
  [/Die aktive Regel lautet FORM\./g, "The active rule is SHAPE."],
  [/FARBE/g, "COLOR"],
  [/FORM/g, "SHAPE"],
  [/([0-9]+) Stück kosten ([0-9]+) €\. Was kosten ([0-9]+) Stück\?/g, "$1 items cost €$2. What do $3 items cost?"],
  [/([0-9]+) % von ([0-9]+) = \?/g, "$1% of $2 = ?"],
  [/([0-9]+)\/([0-9]+) von ([0-9]+) = \?/g, "$1/$2 of $3 = ?"],
];

function translate(text: string) {
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  const trimmed = text.trim();
  if (!trimmed) return text;
  let out = exact[trimmed] ?? trimmed;
  for (const [pattern, replacement] of rules) out = out.replace(pattern, replacement);
  return `${lead}${out}${trail}`;
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
        const value = node.nodeValue;
        if (!value) continue;
        const next = translate(value);
        if (next !== value) node.nodeValue = next;
      }
      root.querySelectorAll<HTMLElement>("[aria-label],[title],[placeholder]").forEach((el) => {
        for (const attr of ["aria-label", "title", "placeholder"]) {
          const value = el.getAttribute(attr);
          if (!value) continue;
          const next = translate(value);
          if (next !== value) el.setAttribute(attr, next);
        }
      });
      applying = false;
    };
    apply();
    const observer = new MutationObserver(() => queueMicrotask(apply));
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title", "placeholder"] });
    return () => observer.disconnect();
  }, [language]);

  return <div key={language} ref={ref}>{children}</div>;
}
