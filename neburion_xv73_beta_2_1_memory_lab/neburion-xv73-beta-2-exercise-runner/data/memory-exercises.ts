import type { Exercise } from "@/features/exercise-runner/types";

export const memoryExerciseLibrary: Exercise[] = [
  {
    id: "mem-word-entry-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "einstieg", category: "Wörter",
    title: "Drei Alltagswörter", prompt: "Welche Wörter hast du gesehen? Gib sie durch Kommas getrennt ein.",
    studyItems: ["Apfel", "Lampe", "Brücke"], studySeconds: 8, answers: ["Apfel", "Lampe", "Brücke"],
    explanation: "Die drei Wörter waren Apfel, Lampe und Brücke.", strategy: "Bilde aus den Wörtern ein kleines inneres Bild.", estimatedSeconds: 35
  },
  {
    id: "mem-number-entry-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "einstieg", category: "Zahlen",
    title: "Kurze Zahlenfolge", prompt: "Welche Zahlenfolge hast du gesehen?",
    studyItems: ["5 7 2"], studySeconds: 7, answers: ["5 7 2"], recallHint: "Beispiel: 5 7 2",
    explanation: "Die Folge lautete 5 7 2.", strategy: "Sprich die Zahlen innerlich rhythmisch mit.", estimatedSeconds: 30
  },
  {
    id: "mem-symbol-entry-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "einstieg", category: "Symbole",
    title: "Symbol erkennen", prompt: "Welches Symbol war in der Merkphase zu sehen?",
    studyItems: ["◆"], studySeconds: 5, options: ["●", "◆", "▲", "★"], answer: "◆",
    explanation: "Das gezeigte Symbol war die Raute ◆.", strategy: "Achte auf Kontur und Eckenzahl.", estimatedSeconds: 25
  },
  {
    id: "mem-sequence-entry-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "einstieg", category: "Reihenfolgen",
    title: "Drei Schritte merken", prompt: "Bringe die Begriffe wieder in die ursprüngliche Reihenfolge.",
    studyItems: ["1. Tür", "2. Tisch", "3. Fenster"], studySeconds: 8,
    items: ["Fenster", "Tür", "Tisch"], answer: ["Tür", "Tisch", "Fenster"],
    explanation: "Die Reihenfolge war Tür, Tisch, Fenster.", strategy: "Gehe die Folge gedanklich wie einen Weg ab.", estimatedSeconds: 40
  },
  {
    id: "mem-story-entry-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "einstieg", category: "Geschichten",
    title: "Mini-Geschichte", prompt: "Was kaufte Lena?",
    studyItems: ["Lena ging am Morgen zum Markt und kaufte zwei rote Äpfel."], studySeconds: 10,
    options: ["Brot", "Zwei rote Äpfel", "Milch", "Blumen"], answer: "Zwei rote Äpfel",
    explanation: "Lena kaufte zwei rote Äpfel.", strategy: "Stelle dir die Szene wie einen kurzen Film vor.", estimatedSeconds: 35
  },

  {
    id: "mem-word-light-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "leicht", category: "Wörter",
    title: "Fünf Begriffe", prompt: "Gib alle erinnerten Wörter durch Kommas getrennt ein.",
    studyItems: ["Sonne", "Schlüssel", "Katze", "Berg", "Tasse"], studySeconds: 10,
    answers: ["Sonne", "Schlüssel", "Katze", "Berg", "Tasse"],
    explanation: "Gesucht waren Sonne, Schlüssel, Katze, Berg und Tasse.", strategy: "Gruppiere die Wörter in zwei kleine Bilder oder Mini-Geschichten.", estimatedSeconds: 50
  },
  {
    id: "mem-number-light-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "leicht", category: "Zahlen",
    title: "Fünf Ziffern", prompt: "Welche Zahlenfolge wurde gezeigt?",
    studyItems: ["8 1 4 9 3"], studySeconds: 8, answers: ["8 1 4 9 3"], recallHint: "Beispiel: 8 1 4 9 3",
    explanation: "Die Folge war 8 1 4 9 3.", strategy: "Teile die Folge in 81 und 493 oder in 8-14-93.", estimatedSeconds: 35
  },
  {
    id: "mem-symbol-light-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "leicht", category: "Symbole",
    title: "Vier Symbole", prompt: "Welche Symbole hast du gesehen? Trenne sie durch Kommas.",
    studyItems: ["★", "▲", "●", "◆"], studySeconds: 8, answers: ["★", "▲", "●", "◆"],
    explanation: "Gezeigt wurden ★, ▲, ● und ◆.", strategy: "Merke dir die Formen als kleine visuelle Gruppe.", estimatedSeconds: 40
  },
  {
    id: "mem-sequence-light-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "leicht", category: "Reihenfolgen",
    title: "Vier Orte", prompt: "Stelle die Orte in die ursprüngliche Reihenfolge.",
    studyItems: ["1. Bahnhof", "2. Park", "3. Bäckerei", "4. Bibliothek"], studySeconds: 10,
    items: ["Bibliothek", "Park", "Bahnhof", "Bäckerei"], answer: ["Bahnhof", "Park", "Bäckerei", "Bibliothek"],
    explanation: "Die Route lautete Bahnhof, Park, Bäckerei, Bibliothek.", strategy: "Verknüpfe die Orte zu einem inneren Spaziergang.", estimatedSeconds: 55
  },
  {
    id: "mem-story-light-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "leicht", category: "Geschichten",
    title: "Kurze Alltagsszene", prompt: "Um welche Uhrzeit traf Markus seine Schwester?",
    studyItems: ["Markus verließ um 14 Uhr das Büro. Um 15:30 Uhr traf er seine Schwester im Café am Fluss."], studySeconds: 12,
    options: ["14:00", "14:30", "15:30", "16:00"], answer: "15:30",
    explanation: "Markus traf seine Schwester um 15:30 Uhr.", strategy: "Achte bei Geschichten gezielt auf Zeit, Ort und Person.", estimatedSeconds: 45
  },

  {
    id: "mem-word-medium-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "mittel", category: "Wörter",
    title: "Acht gemischte Begriffe", prompt: "Gib möglichst viele der gezeigten Wörter ein.",
    studyItems: ["Kompass", "Zitrone", "Fenster", "Drache", "Kerze", "Hammer", "Wolke", "Violine"], studySeconds: 12,
    answers: ["Kompass", "Zitrone", "Fenster", "Drache", "Kerze", "Hammer", "Wolke", "Violine"],
    explanation: "Die Liste bestand aus acht unterschiedlichen Begriffen.", strategy: "Ordne die Wörter in mentale Gruppen: Gegenstände, Natur, Fantasie und Musik.", estimatedSeconds: 70
  },
  {
    id: "mem-number-medium-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "mittel", category: "Zahlen",
    title: "Sieben Ziffern", prompt: "Rekonstruiere die vollständige Zahlenfolge.",
    studyItems: ["7 3 9 1 6 4 8"], studySeconds: 9, answers: ["7 3 9 1 6 4 8"], recallHint: "Alle Ziffern in richtiger Reihenfolge",
    explanation: "Die Zahlenfolge lautete 7 3 9 1 6 4 8.", strategy: "Nutze Chunking, zum Beispiel 739 · 16 · 48.", estimatedSeconds: 45
  },
  {
    id: "mem-symbol-medium-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "mittel", category: "Symbole",
    title: "Symbolfolge", prompt: "Stelle die Symbole in der gezeigten Reihenfolge wieder her.",
    studyItems: ["★", "●", "▲", "◆", "■"], studySeconds: 9,
    items: ["◆", "★", "■", "●", "▲"], answer: ["★", "●", "▲", "◆", "■"],
    explanation: "Die Folge war ★, ●, ▲, ◆, ■.", strategy: "Erzeuge eine rhythmische oder räumliche Folge im Kopf.", estimatedSeconds: 55
  },
  {
    id: "mem-sequence-medium-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "mittel", category: "Reihenfolgen",
    title: "Morgenroutine", prompt: "Ordne die Schritte so, wie sie gezeigt wurden.",
    studyItems: ["1. Fenster öffnen", "2. Wasser trinken", "3. Tasche packen", "4. Schlüssel prüfen", "5. Haustür schließen"], studySeconds: 12,
    items: ["Schlüssel prüfen", "Fenster öffnen", "Haustür schließen", "Tasche packen", "Wasser trinken"],
    answer: ["Fenster öffnen", "Wasser trinken", "Tasche packen", "Schlüssel prüfen", "Haustür schließen"],
    explanation: "Die fünf Schritte wurden in genau dieser Reihenfolge gezeigt.", strategy: "Spiele die Handlung als innere Filmsequenz ab.", estimatedSeconds: 65
  },
  {
    id: "mem-story-medium-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "mittel", category: "Geschichten",
    title: "Mehrere Details merken", prompt: "Was nahm Nina zusätzlich zu ihrem Regenschirm mit?",
    studyItems: ["Nina fuhr am Dienstag mit dem Bus zur Arbeit. Weil Regen angekündigt war, nahm sie einen blauen Regenschirm und eine grüne Stofftasche mit."], studySeconds: 14,
    options: ["Einen roten Schal", "Eine grüne Stofftasche", "Ein schwarzes Notizbuch", "Eine Wasserflasche"], answer: "Eine grüne Stofftasche",
    explanation: "Neben dem blauen Regenschirm nahm Nina eine grüne Stofftasche mit.", strategy: "Markiere beim Lesen mental Person, Tag, Verkehrsmittel und Gegenstände.", estimatedSeconds: 55
  },

  {
    id: "mem-word-hard-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "schwer", category: "Wörter",
    title: "Zwölf ähnliche Begriffe", prompt: "Gib so viele Wörter wie möglich wieder.",
    studyItems: ["Birke", "Buche", "Eiche", "Ahorn", "Linde", "Fichte", "Tanne", "Kiefer", "Ulme", "Esche", "Weide", "Erle"], studySeconds: 14,
    answers: ["Birke", "Buche", "Eiche", "Ahorn", "Linde", "Fichte", "Tanne", "Kiefer", "Ulme", "Esche", "Weide", "Erle"],
    explanation: "Alle Begriffe waren Baumarten und dadurch bewusst ähnlich.", strategy: "Bilde Untergruppen, zum Beispiel Nadelbäume und Laubbäume.", estimatedSeconds: 90
  },
  {
    id: "mem-number-hard-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "schwer", category: "Zahlen",
    title: "Neun Ziffern", prompt: "Welche Zahlenfolge wurde angezeigt?",
    studyItems: ["4 8 1 7 3 9 2 6 5"], studySeconds: 10, answers: ["4 8 1 7 3 9 2 6 5"], recallHint: "Neun Ziffern in richtiger Reihenfolge",
    explanation: "Die Folge lautete 4 8 1 7 3 9 2 6 5.", strategy: "Teile die Folge in drei Dreiergruppen.", estimatedSeconds: 55
  },
  {
    id: "mem-symbol-hard-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "schwer", category: "Symbole",
    title: "Sieben Symbole", prompt: "Rekonstruiere die Symbolfolge vollständig.",
    studyItems: ["★", "◆", "●", "▲", "■", "✦", "○"], studySeconds: 10,
    items: ["○", "▲", "★", "✦", "◆", "■", "●"], answer: ["★", "◆", "●", "▲", "■", "✦", "○"],
    explanation: "Die Reihenfolge war ★, ◆, ●, ▲, ■, ✦, ○.", strategy: "Merke dir die Folge als zwei Gruppen: vier und drei Symbole.", estimatedSeconds: 70
  },
  {
    id: "mem-sequence-hard-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "schwer", category: "Reihenfolgen",
    title: "Sechs Stationen", prompt: "Ordne die sechs Stationen wieder korrekt.",
    studyItems: ["1. Museum", "2. Apotheke", "3. Marktplatz", "4. Brücke", "5. Theater", "6. Hotel"], studySeconds: 13,
    items: ["Hotel", "Brücke", "Apotheke", "Theater", "Museum", "Marktplatz"], answer: ["Museum", "Apotheke", "Marktplatz", "Brücke", "Theater", "Hotel"],
    explanation: "Die Route begann beim Museum und endete beim Hotel.", strategy: "Visualisiere die Route als zusammenhängenden Weg mit markanten Orten.", estimatedSeconds: 80
  },
  {
    id: "mem-story-hard-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "schwer", category: "Geschichten",
    title: "Dichte Geschichte", prompt: "Welche Kombination ist vollständig richtig?",
    studyItems: ["Am Donnerstag um 18:20 Uhr traf Paul seine Kollegin Mira vor dem alten Kino. Sie brachte zwei Karten für einen französischen Film und eine kleine gelbe Tasche mit."], studySeconds: 15,
    options: ["Donnerstag · 18:20 · gelbe Tasche", "Freitag · 18:20 · rote Tasche", "Donnerstag · 17:20 · gelbe Tasche", "Donnerstag · 18:20 · blaue Tasche"],
    answer: "Donnerstag · 18:20 · gelbe Tasche",
    explanation: "Die korrekte Kombination lautet Donnerstag, 18:20 Uhr und gelbe Tasche.", strategy: "Speichere Zeit, Person, Ort und Objekt als vier getrennte Anker.", estimatedSeconds: 65
  },

  {
    id: "mem-word-pro-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "profi", category: "Wörter",
    title: "Sechzehn Begriffe", prompt: "Gib so viele Begriffe wie möglich wieder.",
    studyItems: ["Anker", "Feder", "Zirkel", "Laterne", "Marmor", "Komet", "Schach", "Pinsel", "Atlas", "Saphir", "Trommel", "Eule", "Rüstung", "Koralle", "Kompass", "Pergament"], studySeconds: 16,
    answers: ["Anker", "Feder", "Zirkel", "Laterne", "Marmor", "Komet", "Schach", "Pinsel", "Atlas", "Saphir", "Trommel", "Eule", "Rüstung", "Koralle", "Kompass", "Pergament"],
    explanation: "Die Liste enthielt 16 bewusst unterschiedliche Begriffe.", strategy: "Erzeuge vier Gruppen mit je vier Begriffen und verbinde jede Gruppe zu einer Szene.", estimatedSeconds: 110
  },
  {
    id: "mem-number-pro-01", type: "memory-recall", domain: "gedaechtnis", difficulty: "profi", category: "Zahlen",
    title: "Zwölf Ziffern", prompt: "Rekonstruiere die gesamte Folge.",
    studyItems: ["9 2 7 4 1 8 6 3 5 0 7 2"], studySeconds: 11, answers: ["9 2 7 4 1 8 6 3 5 0 7 2"], recallHint: "Zwölf Ziffern in richtiger Reihenfolge",
    explanation: "Die Folge lautete 9 2 7 4 1 8 6 3 5 0 7 2.", strategy: "Nutze vier Dreiergruppen und wiederhole jede Gruppe innerlich separat.", estimatedSeconds: 70
  },
  {
    id: "mem-symbol-pro-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "profi", category: "Symbole",
    title: "Neun Symbole", prompt: "Stelle die vollständige Symbolfolge wieder her.",
    studyItems: ["★", "◆", "●", "▲", "■", "✦", "○", "◇", "△"], studySeconds: 11,
    items: ["△", "■", "★", "○", "◆", "◇", "▲", "✦", "●"], answer: ["★", "◆", "●", "▲", "■", "✦", "○", "◇", "△"],
    explanation: "Die neun Symbole mussten in exakt gleicher Reihenfolge rekonstruiert werden.", strategy: "Bilde drei Dreiergruppen und verankere jede Gruppe räumlich.", estimatedSeconds: 85
  },
  {
    id: "mem-sequence-pro-01", type: "memory-sequence", domain: "gedaechtnis", difficulty: "profi", category: "Reihenfolgen",
    title: "Acht Handlungsschritte", prompt: "Ordne alle acht Schritte exakt wie zuvor.",
    studyItems: ["1. Kalender öffnen", "2. Termin prüfen", "3. Unterlagen suchen", "4. Nachricht senden", "5. Tasche packen", "6. Schlüssel nehmen", "7. Licht ausschalten", "8. Wohnung verlassen"], studySeconds: 16,
    items: ["Nachricht senden", "Wohnung verlassen", "Kalender öffnen", "Schlüssel nehmen", "Unterlagen suchen", "Licht ausschalten", "Termin prüfen", "Tasche packen"],
    answer: ["Kalender öffnen", "Termin prüfen", "Unterlagen suchen", "Nachricht senden", "Tasche packen", "Schlüssel nehmen", "Licht ausschalten", "Wohnung verlassen"],
    explanation: "Die acht Schritte bildeten eine vollständige Vorbereitungskette.", strategy: "Bilde zwei Blöcke: Vorbereitung am Schreibtisch und Verlassen der Wohnung.", estimatedSeconds: 100
  },
  {
    id: "mem-story-pro-01", type: "memory-choice", domain: "gedaechtnis", difficulty: "profi", category: "Geschichten",
    title: "Komplexe Alltagsszene", prompt: "Welche Aussage entspricht exakt der Geschichte?",
    studyItems: ["Am Samstag verließ Theresa um 09:15 Uhr ihre Wohnung, nahm die Straßenbahnlinie 4 bis zum Mirabellplatz und traf dort um 09:40 Uhr ihren Bruder Jonas. Er trug eine dunkelgrüne Jacke und brachte einen silbernen Ordner mit."], studySeconds: 18,
    options: ["Linie 4 · 09:40 · dunkelgrüne Jacke · silberner Ordner", "Linie 3 · 09:40 · dunkelgrüne Jacke · silberner Ordner", "Linie 4 · 09:30 · schwarze Jacke · silberner Ordner", "Linie 4 · 09:40 · dunkelgrüne Jacke · blauer Ordner"],
    answer: "Linie 4 · 09:40 · dunkelgrüne Jacke · silberner Ordner",
    explanation: "Alle vier Details stimmen nur in der ersten Antwort überein.", strategy: "Speichere komplexe Geschichten als geordnete Anker: Zeitpunkt, Verkehrsmittel, Person, Kleidung, Gegenstand.", estimatedSeconds: 80
  }
];
