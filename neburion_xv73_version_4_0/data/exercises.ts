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
  ,{
    id: "logic-pattern-03", type: "single-choice", domain: "logik", difficulty: "einstieg", category: "Muster",
    title: "Formenpuls", prompt: "Welche Form setzt die Folge fort? Kreis · Quadrat · Kreis · Quadrat · ?",
    options: ["Kreis", "Dreieck", "Raute", "Stern"], answer: "Kreis",
    explanation: "Kreis und Quadrat wechseln sich regelmäßig ab.", strategy: "Suche zuerst nach einem wiederkehrenden Takt.", estimatedSeconds: 25
  },
  {
    id: "logic-number-04", type: "single-choice", domain: "logik", difficulty: "leicht", category: "Zahlenreihen",
    title: "Wachsende Schritte", prompt: "Welche Zahl folgt? 1 · 3 · 6 · 10 · ?",
    options: ["13", "14", "15", "16"], answer: "15",
    explanation: "Die Abstände wachsen: +2, +3, +4, danach +5.", strategy: "Notiere die Abstände zwischen den Zahlen.", estimatedSeconds: 35
  },
  {
    id: "logic-rule-05", type: "single-choice", domain: "logik", difficulty: "mittel", category: "Regelwechsel",
    title: "Zwei Rechenspuren", prompt: "Welche Zahl folgt? 10 · 12 · 9 · 11 · 8 · ?",
    options: ["9", "10", "11", "12"], answer: "10",
    explanation: "Die Regel wechselt zwischen +2 und −3.", strategy: "Prüfe, ob zwei Operationen abwechselnd verwendet werden.", estimatedSeconds: 45
  },
  {
    id: "logic-deduction-06", type: "single-choice", domain: "logik", difficulty: "schwer", category: "Schlussfolgern",
    title: "Sicherer Ausschluss", prompt: "Alle Lyras sind blau. Kein blaues Objekt ist warm. Objekt K ist ein Lyra. Was folgt sicher?",
    options: ["K ist nicht warm.", "K ist rund.", "K ist leicht.", "K ist aus Metall."], answer: "K ist nicht warm.",
    explanation: "K ist als Lyra blau; blaue Objekte sind laut Vorgabe niemals warm.", strategy: "Verbinde nur Aussagen, die zwingend gelten.", estimatedSeconds: 55
  },
  {
    id: "logic-sequence-07", type: "sequence", domain: "logik", difficulty: "mittel", category: "Reihenfolge",
    title: "Planungskette", prompt: "Ordne die Schritte logisch.",
    items: ["Ergebnis prüfen", "Ziel festlegen", "Plan ausführen", "Vorgehen wählen"],
    answer: ["Ziel festlegen", "Vorgehen wählen", "Plan ausführen", "Ergebnis prüfen"],
    explanation: "Ein sinnvoller Prozess beginnt mit dem Ziel und endet mit der Kontrolle.", strategy: "Frage bei jedem Schritt: Was muss davor bereits feststehen?", estimatedSeconds: 55
  },
  {
    id: "logic-pro-08", type: "single-choice", domain: "logik", difficulty: "profi", category: "Mehrfachregel",
    title: "Verschachtelte Folge", prompt: "Welche Zahl folgt? 2 · 6 · 5 · 15 · 14 · 42 · ?",
    options: ["40", "41", "43", "126"], answer: "41",
    explanation: "Die Operationen wechseln zwischen ×3 und −1.", strategy: "Trenne die Folge in wiederkehrende Operationspaare.", estimatedSeconds: 65
  },
  {
    id: "language-synonym-02", type: "single-choice", domain: "sprache", difficulty: "einstieg", category: "Synonyme",
    title: "Wortnähe", prompt: "Welches Wort bedeutet fast dasselbe wie ruhig?",
    options: ["gelassen", "hastig", "laut", "kantig"], answer: "gelassen",
    explanation: "Gelassen beschreibt eine ruhige, ausgeglichene Haltung.", strategy: "Setze beide Wörter probeweise in denselben Satz.", estimatedSeconds: 25
  },
  {
    id: "language-category-03", type: "multi-choice", domain: "sprache", difficulty: "leicht", category: "Kategorien",
    title: "Naturgruppe", prompt: "Welche Begriffe gehören zur Kategorie Gewässer?",
    options: ["Fluss", "See", "Wiese", "Bach", "Felsen"], answers: ["Fluss", "See", "Bach"],
    explanation: "Fluss, See und Bach sind Gewässer.", strategy: "Prüfe jeden Begriff einzeln auf das gemeinsame Merkmal.", estimatedSeconds: 35
  },
  {
    id: "language-sentence-04", type: "sequence", domain: "sprache", difficulty: "mittel", category: "Satzbau",
    title: "Klarer Satz", prompt: "Bringe die Satzteile in eine sinnvolle Reihenfolge.",
    items: ["am Abend", "ein Buch", "liest", "Mara"], answer: ["Mara", "liest", "am Abend", "ein Buch"],
    explanation: "Subjekt und Verb bilden den Kern; Zeitangabe und Objekt ergänzen ihn.", strategy: "Finde zuerst, wer handelt und welches Verb dazugehört.", estimatedSeconds: 45
  },
  {
    id: "language-meaning-05", type: "single-choice", domain: "sprache", difficulty: "schwer", category: "Bedeutung",
    title: "Präziser Begriff", prompt: "Welches Wort passt? Eine Aussage, die mehrere Deutungen zulässt, ist …",
    options: ["mehrdeutig", "chronologisch", "wortgetreu", "einstimmig"], answer: "mehrdeutig",
    explanation: "Mehrdeutig bedeutet, dass mehrere Interpretationen möglich sind.", strategy: "Achte auf die genaue Definition statt nur auf einen ähnlichen Klang.", estimatedSeconds: 45
  },
  {
    id: "language-antonym-06", type: "single-choice", domain: "sprache", difficulty: "mittel", category: "Gegensätze",
    title: "Gegenpol", prompt: "Welches Wort ist das Gegenteil von großzügig?",
    options: ["geizig", "freundlich", "geduldig", "vorsichtig"], answer: "geizig",
    explanation: "Geizig bezeichnet das Gegenstück zu großzügig.", strategy: "Formuliere einen kurzen Gegensatzsatz mit beiden Wörtern.", estimatedSeconds: 35
  },
  {
    id: "language-pro-07", type: "single-choice", domain: "sprache", difficulty: "profi", category: "Sprachlogik",
    title: "Feine Schlussfolgerung", prompt: "Welche Aussage folgt aus: Obwohl der Weg länger war, erreichte Lina das Ziel früher?",
    options: ["Lina war wahrscheinlich schneller unterwegs.", "Der Weg war kürzer.", "Lina startete später.", "Das Ziel wurde verlegt."], answer: "Lina war wahrscheinlich schneller unterwegs.",
    explanation: "Das frühere Ankommen trotz längerer Strecke spricht am ehesten für ein höheres Tempo.", strategy: "Trenne ausdrücklich Gesagtes von der plausibelsten Folgerung.", estimatedSeconds: 55
  },
  {
    id: "visual-rotation-01", type: "single-choice", domain: "visuell", difficulty: "einstieg", category: "Rotation",
    title: "Vierteldrehung", prompt: "Ein Pfeil zeigt nach oben. Wohin zeigt er nach 90° im Uhrzeigersinn?",
    options: ["rechts", "links", "unten", "oben"], answer: "rechts",
    explanation: "Eine Vierteldrehung im Uhrzeigersinn führt von oben nach rechts.", strategy: "Drehe die Form gedanklich in einem einzigen Schritt.", estimatedSeconds: 25
  },
  {
    id: "visual-mirror-02", type: "single-choice", domain: "visuell", difficulty: "leicht", category: "Spiegelung",
    title: "Seitentausch", prompt: "Welche Richtung ist die vertikale Spiegelung von ↗?",
    options: ["↖", "↘", "↙", "↗"], answer: "↖",
    explanation: "Bei vertikaler Spiegelung wechseln links und rechts, oben bleibt oben.", strategy: "Behalte Höhe und Neigung bei, tausche nur die Seite.", estimatedSeconds: 30
  },
  {
    id: "visual-position-03", type: "single-choice", domain: "visuell", difficulty: "mittel", category: "Position",
    title: "Raumbeziehung", prompt: "A liegt über B. B liegt links von C. Wo liegt A relativ zu C?",
    options: ["oben links", "oben rechts", "unten links", "unten rechts"], answer: "oben links",
    explanation: "A liegt über dem links von C gelegenen B und damit oben links von C.", strategy: "Zeichne die Beziehungen gedanklich nacheinander ein.", estimatedSeconds: 40
  },
  {
    id: "visual-pattern-04", type: "single-choice", domain: "visuell", difficulty: "schwer", category: "Formenfolge",
    title: "Dreifacher Rhythmus", prompt: "Welche Form folgt? ○ · □ · △ · ○ · □ · ?",
    options: ["△", "○", "◇", "□"], answer: "△",
    explanation: "Die drei Formen wiederholen sich in gleicher Reihenfolge.", strategy: "Suche nach der kleinsten vollständig wiederkehrenden Einheit.", estimatedSeconds: 40
  },
  {
    id: "visual-orientation-05", type: "single-choice", domain: "visuell", difficulty: "profi", category: "Orientierung",
    title: "Drehkomposition", prompt: "Ein Pfeil zeigt nach links. Er wird 270° im Uhrzeigersinn gedreht. Wohin zeigt er?",
    options: ["unten", "oben", "rechts", "links"], answer: "unten",
    explanation: "270° im Uhrzeigersinn entsprechen 90° gegen den Uhrzeigersinn: links wird unten.", strategy: "Vereinfache große Drehwinkel auf eine kürzere Gegenrichtung.", estimatedSeconds: 50
  },
  {
    id: "visual-sequence-06", type: "sequence", domain: "visuell", difficulty: "mittel", category: "Orientierungsfolge",
    title: "Pfeilkreis", prompt: "Ordne die Richtungen im Uhrzeigersinn, beginnend oben.",
    items: ["links", "unten", "oben", "rechts"], answer: ["oben", "rechts", "unten", "links"],
    explanation: "Im Uhrzeigersinn folgen oben, rechts, unten und links.", strategy: "Stelle dir die vier Positionen auf einer Uhr vor.", estimatedSeconds: 45
  },
  {
    id: "attention-target-02", type: "multi-choice", domain: "aufmerksamkeit", difficulty: "einstieg", category: "Zielsuche",
    title: "Klare Zielzeichen", prompt: "Wähle alle Dreiecke.",
    options: ["▲", "●", "△", "■", "◆"], answers: ["▲", "△"],
    explanation: "▲ und △ besitzen beide die Form eines Dreiecks.", strategy: "Achte auf die Form, nicht auf die Füllung.", estimatedSeconds: 25
  },
  {
    id: "attention-filter-03", type: "multi-choice", domain: "aufmerksamkeit", difficulty: "leicht", category: "Merkmalsfilter",
    title: "Gerade Zahlen", prompt: "Markiere alle geraden Zahlen.",
    options: ["3", "8", "11", "14", "17", "20"], answers: ["8", "14", "20"],
    explanation: "Gerade Zahlen sind ohne Rest durch 2 teilbar.", strategy: "Prüfe die Endziffer jeder Zahl.", estimatedSeconds: 35
  },
  {
    id: "attention-dual-04", type: "multi-choice", domain: "aufmerksamkeit", difficulty: "mittel", category: "Doppelregel",
    title: "Zwei Bedingungen", prompt: "Wähle alle Zahlen, die gerade und größer als 10 sind.",
    options: ["8", "11", "12", "15", "18", "21"], answers: ["12", "18"],
    explanation: "12 und 18 erfüllen beide Bedingungen.", strategy: "Filtere zuerst nach einer Regel und prüfe danach die zweite.", estimatedSeconds: 45
  },
  {
    id: "attention-conflict-05", type: "single-choice", domain: "aufmerksamkeit", difficulty: "schwer", category: "Konfliktkontrolle",
    title: "Bedeutung oder Zeichen", prompt: "Das Wort LINKS wird mit einem Pfeil nach rechts gezeigt. Welche Richtung zeigt der Pfeil?",
    options: ["rechts", "links", "oben", "unten"], answer: "rechts",
    explanation: "Gefragt ist die sichtbare Pfeilrichtung, nicht die Bedeutung des Wortes.", strategy: "Halte kurz inne und beantworte nur das ausdrücklich gefragte Merkmal.", estimatedSeconds: 35
  },
  {
    id: "attention-pro-06", type: "multi-choice", domain: "aufmerksamkeit", difficulty: "profi", category: "Mehrfachfilter",
    title: "Dreifachfilter", prompt: "Wähle Zahlen, die gerade, größer als 20 und kleiner als 40 sind.",
    options: ["18", "22", "27", "34", "40", "42"], answers: ["22", "34"],
    explanation: "Nur 22 und 34 erfüllen alle drei Bedingungen.", strategy: "Arbeite die Bedingungen nacheinander ab, statt sie gleichzeitig zu prüfen.", estimatedSeconds: 50
  },
  {
    id: "math-pattern-02", type: "single-choice", domain: "mathematik", difficulty: "leicht", category: "Alltagsmathematik",
    title: "Preisvergleich", prompt: "Drei Hefte kosten jeweils 2 €. Wie viel kosten sie zusammen?",
    options: ["4 €", "5 €", "6 €", "8 €"], answer: "6 €",
    explanation: "3 × 2 € ergeben 6 €.", strategy: "Übersetze den Alltagssatz zuerst in eine einfache Rechnung.", estimatedSeconds: 25
  },
  {
    id: "math-percent-03", type: "single-choice", domain: "mathematik", difficulty: "schwer", category: "Prozent",
    title: "Rabattstufe", prompt: "Ein Preis von 80 € wird um 15 % reduziert. Wie hoch ist der neue Preis?",
    options: ["65 €", "68 €", "70 €", "72 €"], answer: "68 €",
    explanation: "15 % von 80 € sind 12 €. 80 € − 12 € = 68 €.", strategy: "Berechne zuerst 10 % und 5 %, dann addiere die Rabattbeträge.", estimatedSeconds: 55
  }

];
