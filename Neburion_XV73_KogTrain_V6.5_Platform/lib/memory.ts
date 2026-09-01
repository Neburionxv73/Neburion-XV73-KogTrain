import { createSessionSeed, difficultyFromPercent, finalizeBalancedSessionTasks, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type MemoryMode = "digits" | "reverse" | "words" | "symbols" | "positions" | "recognition" | "nback1" | "nback2";
export type MemoryTask = {
  id: string;
  mode: MemoryMode;
  label: string;
  prompt: string;
  instruction: string;
  display: string[];
  answerType: "text" | "choice";
  expected: string;
  options?: string[];
  explanation: string;
  grid?: boolean;
};
export type MemorySession = { difficulty: Difficulty; showMs: number; tasks: MemoryTask[] };

export const MEMORY_STORAGE_KEY = "neburion-v65-memory-progress";
export const MEMORY_SESSION_LENGTH = 8;

const WORDS = [
  "Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Schlüssel","Wald","Fenster","Fluss","Stern","Berg","Feder","Tasse","Blatt","Turm","Regen","Klang","Stein","Pfad","Lampe","Kreis","Nebel","Garten",
  "Anker","Brot","Insel","Jacke","Karte","Leiter","Mühle","Orange","Pinsel","Quelle","Ring","Schale","Trommel","Ufer","Vogel","Wiese","Zweig","Messer","Kissen","Schnee","Hafen","Seil","Birne","Komet",
  "Kompass","Laterne","Muschel","Rucksack","Zeder","Felsen","Segel","Tunnel","Kranich","Würfel","Atlas","Brunnen","Kiesel","Wimpel","Schmiede","Kuppel",
  "Balkon","Glocke","Kanu","Marmor","Palme","Rakete","Sattel","Teich","Uhr","Vase","Werkbank","Zelt","Linse","Mosaik","Besen","Korken","Schirm","Truhe","Pyramide","Karton","Aster","Kessel","Fackel","Höhle"
];
const SYMBOLS = ["◆","●","▲","■","✦","⬟","★","◇","⬢","✚","⬣","◈","○","□","△","⬡"];

const normalizeWords = (values: string[]) => values.map((value) => value.toLocaleLowerCase("de-AT")).join("|");
const digits = (length: number) => Array.from({ length }, () => String(randomInt(0, 9)));
const stableId = (mode: MemoryMode, content: string) => `${mode}:${content}`;

function uniqueOptions(correct: string, factory: () => string): string[] {
  const values = new Set<string>([correct]);
  let guard = 0;
  while (values.size < 4 && guard < 50) { values.add(factory()); guard += 1; }
  return shuffled([...values]);
}

function sequenceTask(mode: "digits" | "reverse", difficulty: Difficulty, seed: number): MemoryTask {
  const length = (difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4) + (seed % 2);
  const sequence = digits(length);
  const raw = sequence.join("");
  const expected = (mode === "reverse" ? [...sequence].reverse() : sequence).join("");
  const promptVariants = mode === "reverse"
    ? ["Gib die Folge rückwärts ein.", "Welche Zahlenfolge entsteht von hinten nach vorne?"]
    : ["Gib die Folge in gleicher Reihenfolge ein.", "Rekonstruiere die Zahlenfolge exakt."];
  return { id:stableId(mode, raw), mode, label:mode === "reverse" ? "Rückwärtsfolge" : "Zahlenfolge", prompt:promptVariants[seed % promptVariants.length], instruction:"Präge dir die Zahlen ein.", display:sequence, answerType:"text", expected, explanation:mode === "reverse" ? "Die ursprüngliche Folge wird von hinten nach vorne abgerufen." : "Die Reihenfolge bleibt unverändert." };
}

function wordTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4;
  const list = shuffled(WORDS).slice(0, count);
  const signature = list.map((word) => word.toLowerCase()).join("-");
  return { id:stableId("words", signature), mode:"words", label:"Wortgedächtnis", prompt:seed % 2 ? "Gib die Wörter in derselben Reihenfolge ein." : "Welche Wortfolge wurde gezeigt?", instruction:"Merke dir Reihenfolge und Wörter.", display:list, answerType:"text", expected:normalizeWords(list), explanation:"Reihenfolge und Wortlaut müssen zusammen erinnert werden." };
}

function symbolTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4;
  const list = Array.from({ length: count }, () => SYMBOLS[randomInt(0, SYMBOLS.length - 1)]);
  const correct = list.join(" ");
  const options = uniqueOptions(correct, () => Array.from({ length: count }, () => SYMBOLS[randomInt(0, SYMBOLS.length - 1)]).join(" "));
  return { id:stableId("symbols", correct), mode:"symbols", label:"Symbolgedächtnis", prompt:seed % 2 ? "Welche Symbolfolge hast du gesehen?" : "Wähle die exakt gezeigte Symbolreihe.", instruction:"Merke dir die Symbolfolge.", display:list, answerType:"choice", expected:correct, options, explanation:"Gesucht ist exakt die gezeigte Symbolreihenfolge." };
}

function positionTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 4 : difficulty === 2 ? 3 : 2;
  const positions = shuffled([0,1,2,3,4,5,6,7,8]).slice(0, count).sort((a,b)=>a-b);
  const correct = `pos:${positions.join(",")}`;
  const options = uniqueOptions(correct, () => `pos:${shuffled([0,1,2,3,4,5,6,7,8]).slice(0,count).sort((a,b)=>a-b).join(",")}`);
  const display = Array.from({ length: 9 }, (_, index) => positions.includes(index) ? "●" : "·");
  return { id:stableId("positions", positions.join("-")), mode:"positions", label:"Positionsgedächtnis", prompt:seed % 2 ? "Welche Felder waren markiert?" : "Welches räumliche Muster wurde gezeigt?", instruction:"Merke dir die Positionen im 3×3-Raster.", display, answerType:"choice", expected:correct, options, explanation:"Die markierten Felder müssen als räumliches Muster wiedererkannt werden.", grid:true };
}

function recognitionTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : 5;
  const list = shuffled(WORDS).slice(0, count);
  const correct = list.join(" · ");
  const options = uniqueOptions(correct, () => shuffled(WORDS).slice(0,count).join(" · "));
  return { id:stableId("recognition", list.map((word)=>word.toLowerCase()).join("-")), mode:"recognition", label:"Wiedererkennung", prompt:seed % 2 ? "Welche Wortgruppe wurde gezeigt?" : "Erkenne die ursprüngliche Wortgruppe wieder.", instruction:"Merke dir die gesamte Wortgruppe.", display:list, answerType:"choice", expected:correct, options, explanation:"Hier zählt Wiedererkennung statt freier Abruf." };
}

function nbackTask(n: 1 | 2, difficulty: Difficulty, seed: number): MemoryTask {
  const length = difficulty === 3 ? 7 : 6;
  const stream = Array.from({ length }, () => SYMBOLS[randomInt(0, 11)]);
  const match = Math.random() < 0.5;
  const targetIndex = length - 1;
  if (match) stream[targetIndex] = stream[targetIndex - n];
  else {
    const forbidden = stream[targetIndex - n];
    stream[targetIndex] = shuffled(SYMBOLS.filter((symbol) => symbol !== forbidden))[0];
  }
  const mode: MemoryMode = n === 1 ? "nback1" : "nback2";
  return { id:stableId(mode, stream.join("")), mode, label:`${n}-Back Light`, prompt:`War das letzte Symbol identisch mit dem Symbol ${n === 1 ? "direkt davor" : "zwei Positionen davor"}?`, instruction:`Beobachte die Folge und vergleiche das letzte Element mit ${n}-Back.`, display:stream, answerType:"choice", expected:match ? "Ja" : "Nein", options:shuffled(["Ja","Nein"]), explanation:`Beim ${n}-Back wird das aktuelle Element mit dem Element ${n} Position${n === 1 ? "" : "en"} zuvor verglichen.` };
}

export function createMemorySession(bestScore: number): MemorySession {
  const percent = Math.round((bestScore / MEMORY_SESSION_LENGTH) * 100);
  const difficulty = difficultyFromPercent(percent);
  const seed = createSessionSeed();
  const factories = Array.from({ length: 2 }, (_, round) => {
    const offset = seed + round * 20;
    return [
      () => sequenceTask("digits", difficulty, offset + 1),
      () => sequenceTask("reverse", difficulty, offset + 2),
      () => wordTask(difficulty, offset + 3),
      () => symbolTask(difficulty, offset + 4),
      () => positionTask(difficulty, offset + 5),
      () => recognitionTask(difficulty, offset + 6),
      () => nbackTask(1, difficulty, offset + 7),
      () => nbackTask(2, difficulty, offset + 8),
    ];
  }).flat();
  const candidates = factories.map((factory) => factory());
  const tasks = finalizeBalancedSessionTasks("memory-v3", candidates, MEMORY_SESSION_LENGTH, 72);
  return { difficulty, showMs: difficulty === 3 ? 3200 : difficulty === 2 ? 3800 : 4400, tasks };
}

export function normalizeMemoryInput(task: MemoryTask, value: string): string {
  if (task.mode === "digits" || task.mode === "reverse") return value.replace(/\D/g, "");
  if (task.mode === "words") return value.toLocaleLowerCase("de-AT").trim().split(/[\s,;]+/).filter(Boolean).join("|");
  return value.trim();
}
