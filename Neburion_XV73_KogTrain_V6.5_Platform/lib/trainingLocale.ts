import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";

const exact: Record<string,string> = {
  "Zahlen":"Numbers","Rückwärts":"Reverse","Wörter":"Words","Symbole":"Symbols","Positionen":"Positions","Erkennen":"Recognition",
  "Zahlenfolge":"Number sequence","Rückwärtsfolge":"Reverse sequence","Fehlende Ziffer":"Missing digit","Wortgedächtnis":"Word memory","Wortreihenfolge":"Word order","Symbolgedächtnis":"Symbol memory","Symbolposition":"Symbol position","Positionsgedächtnis":"Position memory","Wiedererkennung":"Recognition",
  "Regel":"Rule","Analogie":"Analogy","Schlussfolgerung":"Deduction","Operator":"Operator","Ausschluss":"Exclusion","Räumliche Logik":"Spatial logic",
  "Spiegelung":"Reflection","Musterreihe":"Pattern sequence","Positionswechsel":"Position shift","Visuelle Suche":"Visual search","Formvergleich":"Shape comparison","Kurzzeitgedächtnis":"Short-term memory",
  "Go / No-Go":"Go / No-Go","Einzelgänger-Suche":"Odd-one-out search","Regelwechsel":"Rule switching","Merkmalswechsel":"Feature switching","Reaktionshemmung":"Response inhibition","Geteilte Aufmerksamkeit":"Divided attention","Doppelmerkmal-Zählung":"Dual-feature counting","Tempo":"Speed","Störreiz":"Interference","Richtungs-Interferenz":"Direction interference",
  "Kategorien":"Categories","Reihen & Folgen":"Sequences & patterns","Alltagsrechnen":"Everyday math","Zeit & Reihenfolge":"Time & order",
  "Reagieren":"Respond","Ignorieren":"Ignore","Ja":"Yes","Nein":"No","ROT":"RED","BLAU":"BLUE","GRÜN":"GREEN","GELB":"YELLOW","LINKS":"LEFT","RECHTS":"RIGHT","OBEN":"UP","UNTEN":"DOWN",
  "GEFÜLLT":"FILLED","KONTUR":"OUTLINE",
  "Welche Zahl folgt?":"Which number comes next?","Welche Zahl fehlt innerhalb der Folge?":"Which number is missing from the sequence?","Setze die Folge mit wachsenden Abständen fort.":"Continue the sequence with increasing intervals.","Welche Zahl folgt in der rekursiven Reihe?":"Which number comes next in the recursive sequence?","Welche Zahl folgt beim Wechselmuster?":"Which number comes next in the alternating pattern?","Welche Zahl setzt das Mehrschritt-Muster fort?":"Which number continues the multi-step pattern?",
  "Welche Ausgabe ist korrekt?":"Which output is correct?","Erkenne die Regel.":"Identify the rule.","Welche Ausgabe folgt?":"Which output comes next?","Welche Ausgabe passt zum Muster?":"Which output fits the pattern?","Welche Ausgabe passt?":"Which output fits?","Welche Ausgabe folgt aus der zusammengesetzten Regel?":"Which output follows from the combined rule?","Welche Aussage folgt sicher?":"Which statement follows with certainty?","Ergänze die Analogie.":"Complete the analogy.","Welche Zahl passt nicht?":"Which number does not belong?","Berechne mit der neuen Operatorregel.":"Calculate using the new operator rule.","Welche Form fehlt?":"Which shape is missing?","Welches Symbol ergänzt die Matrix?":"Which symbol completes the matrix?","Ergänze die Rotationsmatrix.":"Complete the rotation matrix.","Welche Form schließt die Doppelrotation?":"Which shape completes the double rotation?",
  "Welcher Reiz kommt nur einmal vor?":"Which stimulus appears only once?","In welche Richtung zeigt der Pfeil?":"Which direction does the arrow point?","Welche Farbe zeigt der Punkt?":"Which color does the dot show?","Welche Farbe zeigt das mittlere Farbsymbol?":"Which color does the middle color symbol show?",
  "Finde den einzigen Reiz, der sich vom wiederholten Muster unterscheidet.":"Find the only stimulus that differs from the repeated pattern.","Scanne das Feld und zähle nur den Zielreiz.":"Scan the field and count only the target stimulus.","Scanne das dichte Feld. Ähnliche Formen sind absichtliche Distraktoren.":"Scan the dense field. Similar shapes are intentional distractors.","Beachte gleichzeitig Farbe und Form.":"Track color and shape at the same time.","Verfolge Farbe und Form gleichzeitig. Nur die exakte Kombination zählt.":"Track color and shape simultaneously. Only the exact combination counts.","Ignoriere das Richtungswort und antworte nur nach dem Pfeil.":"Ignore the direction word and answer only according to the arrow.","Ignoriere beide Richtungswörter und bewerte nur den mittleren Pfeil.":"Ignore both direction words and judge only the middle arrow.","Ignoriere das geschriebene Farbwort und antworte nach dem Farbsymbol.":"Ignore the written color word and answer according to the color symbol.","Ignoriere beide Wörter und antworte ausschließlich nach dem mittleren Farbsymbol.":"Ignore both words and answer only according to the middle color symbol.",
  "Richtig":"Correct","Noch nicht":"Not quite","Auswertung":"Results","Nächste Aufgabe":"Next task","Deine Antwort":"Your answer","Antwort eingeben":"Enter answer","Wörter mit Leerzeichen eingeben":"Enter words separated by spaces",
  "Nur kurz sichtbar":"Visible briefly","Präge dir die Reihenfolge ein.":"Memorize the sequence.","Danach wird nach einer Position in dieser Folge gefragt.":"You will then be asked about one position in this sequence.",
  "Reihe A":"Row A","Reihe B":"Row B","vergleichen":"compare","Bewegungsfolge":"Movement sequence","START":"START",
  "Entspannt":"Relaxed","Normal":"Normal","Herausforderung":"Challenge","Adaptiv":"Adaptive","Noch untrainiert":"Not trained yet",
  "Basis":"Basic","Aufbau":"Intermediate","Anspruchsvoll":"Advanced","Challenge":"Challenge",
  "Startniveau aus der bisherigen Trainingsevidenz.":"Starting level based on previous training evidence.",
  "Drei sichere Treffer bestätigen das höhere Niveau.":"Three reliable correct answers confirm the higher level.",
  "Zwei Fehlversuche in Folge: Das Niveau wird um genau eine Stufe stabilisiert.":"Two consecutive misses: the level is reduced by exactly one step.",
  "Treffer gespeichert. Für einen Anstieg braucht es stabile Evidenz.":"Correct answer recorded. Stable evidence is required to raise the level.",
  "Fehler gespeichert. Ein einzelner Fehler senkt das Niveau nicht.":"Error recorded. A single error does not lower the level.",
  "Regel erkannt.":"Rule identified.","Visuell korrekt erkannt.":"Visual pattern identified correctly.","Aufmerksamkeitsregel getroffen.":"Attention rule identified correctly.","Sprachliche Beziehung erkannt.":"Language relationship identified correctly.",
};

const phraseRules: Array<[RegExp,string]> = [
  [/Wie oft erscheint exakt (.+)\?/g,"How often does exactly $1 appear?"],
  [/Wie oft erscheint (.+)\?/g,"How often does $1 appear?"],
  [/Zielreiz: (.+)/g,"Target stimulus: $1"],
  [/Aktive Regel: GEFÜLLT/g,"Active rule: FILLED"],[/Aktive Regel: KONTUR/g,"Active rule: OUTLINE"],
  [/Regel ([A-C]): Reagiere auf (.+)/g,"Rule $1: respond to $2"],
  [/Reagiere nur auf die gefüllte Form (.+)/g,"Respond only to the filled shape $1"],
  [/Bewerte nur die erste Form: Reagiere auf (.+)/g,"Judge only the first shape: respond to $1"],
  [/Finde die Kombination (.+)/g,"Find the combination $1"],
  [/Ist der Reiz (.+)\?/g,"Is the stimulus $1?"],
  [/Antworte möglichst schnell und trotzdem korrekt\. Zielzeit: (\d+) ms\./g,"Answer as quickly as possible while staying correct. Target time: $1 ms."],
  [/Der entscheidende Reiz war der Zielreiz\./g,"The decisive stimulus was the target stimulus."],
  [/Der entscheidende Reiz war ein Distraktor und sollte ignoriert werden\./g,"The decisive stimulus was a distractor and should have been ignored."],
  [/(.+) erscheint (\d+)-mal im Reizfeld\./g,"$1 appears $2 times in the stimulus field."],
  [/(.+) erscheint (\d+)-mal\./g,"$1 appears $2 times."],
  [/(.+) war der einzige abweichende Reiz\./g,"$1 was the only different stimulus."],
  [/Die aktive Regel war (GEFÜLLT|KONTUR); entscheidend war (.+)\./g,"The active rule was $1; the decisive stimulus was $2."],
  [/Die entscheidende Form war gefüllt: reagieren\./g,"The decisive shape was filled: respond."],[/Die entscheidende Form war ungefüllt: Reaktion hemmen\./g,"The decisive shape was unfilled: inhibit the response."],
  [/Gesucht war genau die Kombination (.+)\./g,"The exact target combination was $1."],
  [/Der Reiz stimmte mit dem Ziel überein\./g,"The stimulus matched the target."],[/Der Reiz war ein anderer\./g,"The stimulus was different."],
  [/Entscheidend war das Farbsymbol (.+), nicht das geschriebene Farbwort\./g,"The decisive cue was the color symbol $1, not the written color word."],
  [/Der Pfeil zeigt nach links\./gi,"The arrow points left."],[/Der Pfeil zeigt nach rechts\./gi,"The arrow points right."],[/Der Pfeil zeigt nach oben\./gi,"The arrow points up."],[/Der Pfeil zeigt nach unten\./gi,"The arrow points down."],
  [/Welche Ziffer fehlte in (.+)\?/g,"Which digit was missing from $1?"],[/An Position (\d+) stand die Ziffer (.+)\./g,"The digit at position $1 was $2."],[/An Position (\d+) stand (.+)\./g,"At position $1 was $2."],
  [/Präge dir (\d+) Ziffern und ihre Reihenfolge ein\./g,"Memorize $1 digits and their order."],[/Merke dir (\d+) Ziffern\. Danach fehlt genau eine Position\./g,"Memorize $1 digits. Afterwards exactly one position will be missing."],
  [/Welche Zahlenfolge entsteht von hinten nach vorne\?/g,"What number sequence results when read backwards?"],[/Gib die Folge rückwärts ein\./g,"Enter the sequence in reverse order."],[/Rekonstruiere die Zahlenfolge exakt\./g,"Reconstruct the number sequence exactly."],[/Gib die Folge in gleicher Reihenfolge ein\./g,"Enter the sequence in the same order."],
  [/Welche Reihenfolge wurde exakt gezeigt\?/g,"Which exact order was shown?"],[/Welche Wortfolge wurde gezeigt\?/g,"Which word sequence was shown?"],[/Gib die Wörter in derselben Reihenfolge ein\./g,"Enter the words in the same order."],
  [/Merke dir (\d+) Wörter und ihre genaue Reihenfolge\./g,"Memorize $1 words and their exact order."],[/Merke dir (\d+) Wörter und besonders ihre Positionen\./g,"Memorize $1 words and especially their positions."],
  [/Welche Symbolfolge hast du gesehen\?/g,"Which symbol sequence did you see?"],[/Wähle die exakt gezeigte Symbolreihe\./g,"Choose the exact symbol sequence that was shown."],[/Welches Symbol stand an Position (\d+)\?/g,"Which symbol was at position $1?"],
  [/Merke dir (\d+) Symbole\. Ähnliche Formen können später als Ablenkung erscheinen\./g,"Memorize $1 symbols. Similar shapes may appear later as distractors."],[/Merke dir (\d+) Symbole und ihre genaue Position\./g,"Memorize $1 symbols and their exact positions."],
  [/Welche Felder waren markiert\?/g,"Which cells were marked?"],[/Welches räumliche Muster wurde gezeigt\?/g,"Which spatial pattern was shown?"],[/Merke dir (\d+) Positionen im 3×3-Raster\./g,"Memorize $1 positions in the 3×3 grid."],
  [/Welche Wortgruppe wurde gezeigt\?/g,"Which word group was shown?"],[/Erkenne die ursprüngliche Wortgruppe wieder\./g,"Recognize the original word group."],[/Merke dir (\d+) Wörter\. Die Antwortmöglichkeiten unterscheiden sich nur in kleinen Details\./g,"Memorize $1 words. The answer choices differ only in small details."],
  [/War das letzte Symbol identisch mit dem Symbol direkt davor\?/g,"Was the last symbol identical to the symbol immediately before it?"],[/War das letzte Symbol identisch mit dem Symbol zwei Positionen davor\?/g,"Was the last symbol identical to the symbol two positions earlier?"],
  [/Beobachte (\d+) Symbole und halte die letzten Positionen aktiv im Arbeitsgedächtnis\./g,"Observe $1 symbols and keep the latest positions active in working memory."],
  [/Beim (\d)-Back wird das letzte Element exakt mit dem Element (\d) Positionen? zuvor verglichen\./g,"In $1-Back, the last element is compared exactly with the element $2 position(s) earlier."],
  [/Freier Abruf: Wortlaut und Reihenfolge müssen zusammen stimmen\./g,"Free recall: both the words and their order must match."],[/Hier zählt nicht nur, welche Wörter vorkamen, sondern ihre exakte Reihenfolge\./g,"This task tests not only which words appeared, but their exact order."],[/Entscheidend sind Symbolidentität und Position in der Reihe\./g,"Both symbol identity and position in the sequence matter."],[/Wiedererkannt werden muss die vollständige räumliche Anordnung\./g,"The complete spatial arrangement must be recognized."],[/Bei höherer Schwierigkeit sind die falschen Gruppen gezielte Near-Misses statt völlig andere Listen\./g,"At higher difficulty, incorrect groups are deliberate near-misses rather than completely different lists."],
  [/Aufgabe (\d+)\/(\d+)/g,"Task $1/$2"],[/Aufgabe (\d+)/g,"Task $1"],[/Dynamik/g,"Dynamic"],[/Bestwert/g,"Best score"],[/Endniveau/g,"Final level"],[/Session abgeschlossen/g,"Session complete"],[/Gesuchte Antwort/g,"Expected answer"],[/Trefferquote/g,"accuracy"],[/Reaktionszeit/g,"Reaction time"],[/Zieltempo/g,"Target pace"],
  [/Konstanter Abstand/g,"Constant interval"],[/Abstände:/g,"Intervals:"],[/Zuerst/g,"First"],[/danach/g,"then"],[/Welche Zahl folgt innerhalb/g,"Which number follows within"],
  [/Jede Zahl ist die Summe der beiden vorherigen\./g,"Each number is the sum of the previous two."],[/Die Operationen wechseln:/g,"The operations alternate:"],[/Nach dem Start wechseln strukturierte Multiplikations- und Additionsschritte\./g,"After the start, structured multiplication and addition steps alternate."],
  [/Zahl quadrieren und (\d+) addieren\./g,"Square the number and add $1."],[/Eine Zahl wird mit ihrem direkten Nachfolger multipliziert\./g,"A number is multiplied by its immediate successor."],[/Regel:/g,"Rule:"],
  [/Wenn a ★ b = (.+), was ist (.+) ★ (.+)\?/g,"If a ★ b = $1, what is $2 ★ $3?"],
  [/Summe verdoppeln/g,"double the sum"],[/a quadrieren, b abziehen/g,"square a, subtract b"],[/Produkt \+ a − b/g,"product + a − b"],[/Summe mal Differenz/g,"sum times difference"],
  [/Alle anderen sind durch (\d+) teilbar\./g,"All other numbers are divisible by $1."],[/Alle anderen sind Primzahlen\./g,"All other numbers are prime."],[/Alle anderen sind Quadratzahlen\./g,"All other numbers are square numbers."],[/Alle anderen sind Kubikzahlen\./g,"All other numbers are cube numbers."],
  [/Die Paare tauschen ihre Positionen\./g,"The pairs swap positions."],[/Jede Gruppe rotiert um eine Position\./g,"Each group rotates by one position."],[/Das Endsymbol einer Gruppe startet die nächste Gruppe doppelt\./g,"The ending symbol of one group starts the next group twice."],[/Vier Symbole rotieren zyklisch nach links\./g,"Four symbols rotate cyclically to the left."],
  [/Drei sichere Treffer/g,"Three reliable correct answers"],[/zwei Fehler in Folge/g,"two consecutive errors"],[/Einzelne Fehler oder Glückstreffer/g,"Single errors or lucky guesses"],
  [/Richtig wäre:/g,"Correct answer:"],
];

const wordMap: Array<[RegExp,string]> = [
  [/\bAuge\b/g,"Eye"],[/\bsehen\b/g,"see"],[/\bOhr\b/g,"ear"],[/\bhören\b/g,"hear"],[/\blaufen\b/g,"run"],[/\bgreifen\b/g,"grasp"],[/\briechen\b/g,"smell"],
  [/\bSchlüssel\b/g,"key"],[/\bSchloss\b/g,"lock"],[/\bPasswort\b/g,"password"],[/\bKonto\b/g,"account"],[/\bTisch\b/g,"table"],[/\bFenster\b/g,"window"],[/\bStift\b/g,"pen"],
  [/\bKapitel\b/g,"chapter"],[/\bBuch\b/g,"book"],[/\bSzene\b/g,"scene"],[/\bFilm\b/g,"film"],[/\bKarte\b/g,"map"],[/\bStuhl\b/g,"chair"],[/\bWolke\b/g,"cloud"],
  [/\bThermometer\b/g,"thermometer"],[/\bTemperatur\b/g,"temperature"],[/\bUhr\b/g,"clock"],[/\bZeit\b/g,"time"],[/\bGewicht\b/g,"weight"],[/\bLänge\b/g,"length"],[/\bLautstärke\b/g,"volume"],
  [/\bFrage\b/g,"question"],[/\bAntwort\b/g,"answer"],[/\bProblem\b/g,"problem"],[/\bLösung\b/g,"solution"],[/\bFarbe\b/g,"color"],[/\bGeräusch\b/g,"sound"],
  [/\bAutor\b/g,"author"],[/\bKomponist\b/g,"composer"],[/\bMusikstück\b/g,"composition"],[/\bGebäude\b/g,"building"],[/\bLandkarte\b/g,"map"],[/\bWerkzeug\b/g,"tool"],
  [/\bZiegel\b/g,"brick"],[/\bMauer\b/g,"wall"],[/\bWort\b/g,"word"],[/\bSatz\b/g,"sentence"],[/\bTon\b/g,"tone"],[/\bZahl\b/g,"number"],
  [/\bKompass\b/g,"compass"],[/\bRichtung\b/g,"direction"],[/\bKalender\b/g,"calendar"],[/\bDatum\b/g,"date"],[/\bTonhöhe\b/g,"pitch"],
  [/\bUrsache\b/g,"cause"],[/\bWirkung\b/g,"effect"],[/\bFundament\b/g,"foundation"],[/\bHaus\b/g,"house"],[/\bWurzel\b/g,"root"],[/\bBaum\b/g,"tree"],[/\bStraße\b/g,"street"],
  [/\bPilot\b/g,"pilot"],[/\bFlugzeug\b/g,"aircraft"],[/\bKapitän\b/g,"captain"],[/\bSchiff\b/g,"ship"],[/\bZug\b/g,"train"],[/\bFahrrad\b/g,"bicycle"],
  [/\bLinse\b/g,"lens"],[/\bKamera\b/g,"camera"],[/\bMikrofon\b/g,"microphone"],[/\bAufnahme\b/g,"recording"],[/\bTreppe\b/g,"stairs"],
  [/\bNichts folgt\b/g,"Nothing follows"],[/\bAlle\b/g,"All"],[/\bKein\b/g,"No"],[/\bEinige\b/g,"Some"],[/\bist nicht\b/g,"is not"],[/\bsind nicht\b/g,"are not"],[/\bist ein\b/g,"is a"],[/\bsind\b/g,"are"],[/\bist\b/g,"is"],
];

export function localizeTrainingText(value:string|undefined, language:PlatformLanguage):string {
  if(!value || language==="de") return value ?? "";
  let out=exact[value] ?? value;
  for(const [pattern,replacement] of phraseRules) out=out.replace(pattern,replacement);
  for(const [pattern,replacement] of wordMap) out=out.replace(pattern,replacement);
  return out;
}

export function localizedDifficultyLabel(label:string, language:PlatformLanguage):string {
  return localizeTrainingText(label,language);
}
