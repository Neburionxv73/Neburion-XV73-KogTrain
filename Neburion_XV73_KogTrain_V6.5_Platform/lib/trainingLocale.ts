import type { PlatformLanguage } from "@/components/PlatformLanguageProvider";

const exact: Record<string,string> = {
  "Zahlen":"Numbers","Rückwärts":"Reverse","Wörter":"Words","Symbole":"Symbols","Positionen":"Positions","Erkennen":"Recognition",
  "Zahlenfolge":"Number sequence","Regel":"Rule","Analogie":"Analogy","Schlussfolgerung":"Deduction","Operator":"Operator","Ausschluss":"Exclusion","Räumliche Logik":"Spatial logic",
  "Spiegelung":"Reflection","Musterreihe":"Pattern sequence","Positionswechsel":"Position shift","Visuelle Suche":"Visual search","Formvergleich":"Shape comparison","Kurzzeitgedächtnis":"Short-term memory",
  "Kategorien":"Categories","Reihen & Folgen":"Sequences & patterns","Alltagsrechnen":"Everyday math","Zeit & Reihenfolge":"Time & order",
  "Welche Zahl folgt?":"Which number comes next?","Welche Ausgabe ist korrekt?":"Which output is correct?","Erkenne die Regel.":"Identify the rule.","Welche Ausgabe folgt?":"Which output comes next?","Welche Ausgabe passt zum Muster?":"Which output fits the pattern?","Welche Ausgabe passt?":"Which output fits?","Welche Aussage folgt sicher?":"Which statement follows with certainty?","Ergänze die Analogie.":"Complete the analogy.","Welche Zahl passt nicht?":"Which number does not belong?","Berechne mit der neuen Operatorregel.":"Calculate using the new operator rule.","Welche Form fehlt?":"Which shape is missing?","Welches Symbol ergänzt die Matrix?":"Which symbol completes the matrix?","Ergänze die Rotationsmatrix.":"Complete the rotation matrix.","Welche Form schließt die Doppelrotation?":"Which shape completes the double rotation?",
  "Richtig":"Correct","Noch nicht":"Not quite","Auswertung":"Results","Nächste Aufgabe":"Next task","Deine Antwort":"Your answer","Antwort eingeben":"Enter answer","Wörter mit Leerzeichen eingeben":"Enter words separated by spaces",
  "Nur kurz sichtbar":"Visible briefly","Präge dir die Reihenfolge ein.":"Memorize the sequence.","Danach wird nach einer Position in dieser Folge gefragt.":"You will then be asked about one position in this sequence.",
  "Reihe A":"Row A","Reihe B":"Row B","vergleichen":"compare","Bewegungsfolge":"Movement sequence","START":"START",
  "Entspannt":"Relaxed","Normal":"Normal","Herausforderung":"Challenge","Adaptiv":"Adaptive","Noch untrainiert":"Not trained yet",
  "Basis":"Basic","Aufbau":"Intermediate","Anspruchsvoll":"Advanced",
};

const phraseRules: Array<[RegExp,string]> = [
  [/Aufgabe (\d+)\/(\d+)/g,"Task $1/$2"],
  [/Aufgabe (\d+)/g,"Task $1"],
  [/Dynamik/g,"Dynamic"],
  [/Bestwert/g,"Best score"],
  [/Endniveau/g,"Final level"],
  [/Session abgeschlossen/g,"Session complete"],
  [/Gesuchte Antwort/g,"Expected answer"],
  [/Trefferquote/g,"accuracy"],
  [/Reaktionszeit/g,"Reaction time"],
  [/Zieltempo/g,"Target pace"],
  [/Konstanter Abstand/g,"Constant interval"],
  [/Zuerst/g,"First"],
  [/danach/g,"then"],
  [/Jede Zahl ist die Summe der beiden vorherigen\./g,"Each number is the sum of the previous two."],
  [/Die Operationen wechseln:/g,"The operations alternate:"],
  [/Regel:/g,"Rule:"],
  [/Alle anderen sind durch (\d+) teilbar\./g,"All other numbers are divisible by $1."],
  [/Alle anderen sind Primzahlen\./g,"All other numbers are prime."],
  [/Alle anderen sind Quadratzahlen\./g,"All other numbers are square numbers."],
  [/Alle anderen sind Kubikzahlen\./g,"All other numbers are cube numbers."],
  [/Drei sichere Treffer/g,"Three reliable correct answers"],
  [/zwei Fehler in Folge/g,"two consecutive errors"],
  [/Einzelne Fehler oder Glückstreffer/g,"Single errors or lucky guesses"],
];

export function localizeTrainingText(value:string|undefined, language:PlatformLanguage):string {
  if(!value || language==="de") return value ?? "";
  let out=exact[value] ?? value;
  for(const [pattern,replacement] of phraseRules) out=out.replace(pattern,replacement);
  return out;
}

export function localizedDifficultyLabel(label:string, language:PlatformLanguage):string {
  return localizeTrainingText(label,language);
}
