"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

const exact: Record<string, string> = {
  "Dein Training passt sich jetzt wirklich an.": "Your training now truly adapts to you.",
  "KogTrain bewertet Trefferquote, Trainingsmenge, Unterthemen, letzte Session und – bei Reaktionsaufgaben – deine Reaktionszeit. Daraus entsteht ein erklärbarer nächster Trainingsreiz statt einer Black-Box-Empfehlung.": "KogTrain evaluates accuracy, training volume, subtopics, your latest session and — for reaction tasks — your reaction time. This creates an explainable next training stimulus instead of a black-box recommendation.",
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
  "Adaptiven Lernpfad starten": "Start adaptive learning path",
  "Meinen Lernpfad starten": "Start my learning path",
  "Adaptive Session starten": "Start adaptive session",
  "Tages-Challenge · 8 Aufgaben": "Daily Challenge · 8 tasks",
  "Leicht": "Easy",
  "Standard": "Standard",
  "Challenge": "Challenge",
  "Kurz": "Short",
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
  "Plus, Minus, Mal, Division und Kopfrechnen in wechselnden Schwierigkeitsstufen.": "Addition, subtraction, multiplication, division and mental arithmetic at changing difficulty levels.",
  "Wörter finden, Buchstaben ordnen, Bedeutungen erkennen und Wortschatz erweitern.": "Find words, arrange letters, identify meanings and expand vocabulary.",
  "Alltagswortschatz in beide Richtungen trainieren und sicherer abrufen.": "Train everyday vocabulary in both directions and recall it more reliably.",
  "Zielreize zwischen Ablenkungen finden, zählen und unterscheiden.": "Find, count and distinguish target stimuli among distractions.",
  "Unter Zeitdruck die passende Regel erkennen und möglichst schnell reagieren.": "Identify the correct rule under time pressure and react as quickly as possible.",
  "Wörter, Symbole und kurze Reihen einprägen und gezielt wiedergeben.": "Memorize words, symbols and short sequences and recall them precisely.",
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
  "Noch offen": "Not started",
  "Stärkster Trainingswert": "Strongest training value",
  "Entwicklungspotenzial": "Development potential",
  "Erfolge freigeschaltet": "Milestones unlocked",
  "Meilensteine": "Milestones",
  "Dein erster Erfolg wartet nach der ersten Session.": "Your first milestone unlocks after your first session.",
  "Noch keine belastbare Vergleichsbasis.": "There is not enough reliable data for comparison yet.",
  "Nach den ersten Sessions wird deine Stärke hier sichtbar.": "Your strongest area will become visible after the first sessions.",
  "Noch untrainiert": "Not trained yet",
  "Aufgabe": "Task",
  "Aufgaben": "tasks",
  "ausgewertete Aufgaben": "evaluated tasks",
  "Auswertung": "Results",
  "Präge dir die Folge ein.": "Memorize the sequence.",
  "Gleich wird die Folge ausgeblendet.": "The sequence will disappear in a moment.",
  "Tastatur: 1–4": "Keyboard: 1–4",
  "Richtig ✓": "Correct ✓",
  "Fast – weiter geht’s": "Almost — keep going",
  "Sauber gelöst.": "Solved correctly.",
  "Nächste Aufgabe": "Next task",
  "Session abschließen": "Finish session",
  "Neue Session": "New session",
  "Heute geschafft 🎉": "Completed today 🎉",
  "Erste Session ✓": "First session ✓",
  "Perfekte Session ✓": "Perfect session ✓",
  "3-Tage-Serie ✓": "3-day streak ✓",
  "Wochenziel ✓": "Weekly goal ✓",
  "80%-Marke ✓": "80% milestone ✓",
  "5 Sessions ✓": "5 sessions ✓",
  "20 Sessions ✓": "20 sessions ✓",
  "Plus": "Addition",
  "Minus": "Subtraction",
  "Mal": "Multiplication",
  "Division": "Division",
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
  "Kopfrechnen": "Mental arithmetic",
  "Synonym": "Synonym",
  "Antonym": "Antonym",
  "Wortbildung": "Word formation",
  "Rechne möglichst ohne Hilfsmittel.": "Calculate without aids if possible.",
  "Erkenne die Regel und setze sie fort.": "Identify the rule and continue it.",
  "Berechne den Prozentwert.": "Calculate the percentage value.",
  "Bestimme zuerst einen Anteil, dann den Zähler.": "Determine one share first, then the numerator.",
  "Rechne über den Preis für 1 Stück.": "Calculate via the price for 1 item.",
  "Prüfe Rechenweg und Größenordnung kurz gegeneinander.": "Briefly check the calculation path and magnitude against each other.",
  "Wähle die passendste Bedeutung.": "Choose the best matching meaning.",
  "Suche den Bedeutungsgegensatz.": "Find the opposite meaning.",
  "Welche Schreibweise ist richtig?": "Which spelling is correct?",
  "Achte auf jeden Buchstaben.": "Pay attention to every letter.",
  "Verbinde beide Wortteile sinnvoll.": "Combine both word parts meaningfully.",
  "Welches Wort steckt in diesen Buchstaben?": "Which word is hidden in these letters?",
  "Ordne die Buchstaben zu einem sinnvollen Wort.": "Arrange the letters into a meaningful word.",
  "Suche genau nach der Buchstabenfolge.": "Look carefully for the exact letter sequence.",
  "Wähle die passendste Übersetzung.": "Choose the best translation.",
  "Welches Symbol weicht ab?": "Which symbol is different?",
  "Ein einzelner Reiz unterscheidet sich vom Rest.": "One stimulus differs from the rest.",
  "Zähle nur den Zielbuchstaben.": "Count only the target letter.",
  "Blende Distraktoren aus und zähle nur den Zielreiz.": "Ignore distractors and count only the target stimulus.",
  "Was zählt?": "What counts?",
  "Was stand an Position": "What was at position",
  "Die aktive Regel lautet FARBE.": "The active rule is COLOR.",
  "Die aktive Regel lautet FORM.": "The active rule is SHAPE.",
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
  "Orange": "Orange",
  "Violett": "Purple",
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
  [/(\d+) von (\d+) Aufgaben richtig/g, "$1 of $2 tasks correct"],
  [/von (\d+) Aufgaben richtig/g, "of $1 tasks correct"],
  [/Ø Reaktionszeit/g, "Avg. reaction time"],
  [/Trefferquote/g, "Accuracy"],
  [/Bestwert einer Session:/g, "Best session score:"],
  [/Bestwert/g, "Best score"],
  [/Wochenziel/g, "Weekly goal"],
  [/Sessions heute/g, "Sessions today"],
  [/(\d+) heute/g, "$1 today"],
  [/(\d+)\/(\d+) diese Woche/g, "$1/$2 this week"],
  [/(\d+) Trainingstag in Serie\./g, "$1 training day in a row."],
  [/(\d+) Trainingstage in Serie\./g, "$1 training days in a row."],
  [/(\d+) XP gesamt/g, "$1 XP total"],
  [/(\d+)\/500 XP bis zum nächsten Level\./g, "$1/500 XP to the next level."],
  [/(\d+) ausgewertete Aufgaben/g, "$1 evaluated tasks"],
  [/(\d+)% aus (\d+) Aufgaben/g, "$1% across $2 tasks"],
  [/(\d+)% im Bereich /g, "$1% in "],
  [/(\d+)% – fließt stärker in den adaptiven Themenmix ein\./g, "$1% — receives more weight in the adaptive topic mix."],
  [/(\d+)% – hier lohnt sich die nächste Wiederholung\./g, "$1% — this area is worth repeating next."],
  [/Regel: FARBE\. Was zählt\?/g, "Rule: COLOR. What counts?"],
  [/Regel: FORM\. Was zählt\?/g, "Rule: SHAPE. What counts?"],
  [/Wie oft erscheint ([A-ZÄÖÜ●▲■◆★✦⬟◇○△□✚✖⬢]+)\?/g, "How often does $1 appear?"],
  [/Welches Wort enthält „([^”]+)“\?/g, "Which word contains “$1”?"],
  [/Welches Wort bedeutet ungefähr dasselbe wie „([^”]+)“\?/g, "Which word means roughly the same as “$1”?"],
  [/Was ist das Gegenteil von „([^”]+)“\?/g, "What is the opposite of “$1”?"],
  [/Welches zusammengesetzte Wort entsteht aus „([^”]+)“ \+ „([^”]+)“\?/g, "Which compound word is formed from “$1” + “$2”?"],
  [/Wie übersetzt du „([^”]+)“\?/g, "How do you translate “$1”?"],
  [/„([^”]+)“ bedeutet „([^”]+)“\./g, "“$1” means “$2”."],
  [/„([^”]+)“ bedeutet auf Englisch „([^”]+)“\./g, "“$1” means “$2” in English."],
  [/Richtig ist „([^”]+)“\./g, "The correct spelling is “$1”."],
  [/Zusammen ergibt sich „([^”]+)“\./g, "Together they form “$1”."],
  [/([A-ZÄÖÜ]+) enthält ([A-ZÄÖÜ]+)\./g, "$1 contains $2."],
  [/Was stand an Position (\d+)\?/g, "What was at position $1?"],
  [/Welches Symbol stand an Position (\d+)\?/g, "Which symbol was at position $1?"],
  [/An Position (\d+) stand (.+)\./g, "At position $1 there was $2."],
  [/([0-9]+) Stück kosten ([0-9]+) €\. Was kosten ([0-9]+) Stück\?/g, "$1 items cost €$2. What do $3 items cost?"],
  [/([0-9]+) % von ([0-9]+) = \?/g, "$1% of $2 = ?"],
  [/([0-9]+)\/([0-9]+) von ([0-9]+) = \?/g, "$1/$2 of $3 = ?"],
  [/FARBE/g, "COLOR"],
  [/FORM/g, "SHAPE"],
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
