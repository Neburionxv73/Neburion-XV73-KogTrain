import { createSessionSeed, difficultyFromPercent, finalizeSessionTasks, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

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
  "Kompass","Laterne","Muschel","Rucksack","Zeder","Felsen","Segel","Tunnel","Kranich","Würfel","Atlas","Brunnen","Kiesel","Wimpel","Schmiede","Kuppel"
];
const SYMBOLS = ["◆","●","▲","■","✦","⬟","★","◇","⬢","✚","⬣","◈"];

const normalizeWords = (values: string[]) => values.map((value) => value.toLocaleLowerCase("de-AT")).join("|");
const digits = (length: number) => Array.from({ length }, () => String(randomInt(0, 9)));

function uniqueOptions(correct: string, factory: () => string): string[] {
  const values = new Set<string>([correct]);
  let guard = 0;
  while (values.size < 4 && guard < 40) { values.add(factory()); guard += 1; }
  return shuffled([...values]);
}

function sequenceTask(mode: "digits" | "reverse", difficulty: Difficulty, seed: number): MemoryTask {
  const length = (difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4) + (seed % 2);
  const sequence = digits(length);
  const expected = (mode === "reverse" ? [...sequence].reverse() : sequence).join("");
  return { id:`${mode}-${seed}-${sequence.join("")}`, mode, label:mode === "reverse" ? "Rückwärtsfolge" : "Zahlenfolge", prompt:mode === "reverse" ? "Gib die Folge rückwärts ein." : "Gib die Folge in gleicher Reihenfolge ein.", instruction:"Präge dir die Zahlen ein.", display:sequence, answerType:"text", expected, explanation:mode === "reverse" ? "Die ursprüngliche Folge wird von hinten nach vorne abgerufen." : "Die Reihenfolge bleibt unverändert." };
}

function wordTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4;
  const list = shuffled(WORDS).slice(0, count);
  return { id:`words-${seed}-${list.join("-")}`, mode:"words", label:"Wortgedächtnis", prompt:"Gib die Wörter in derselben Reihenfolge ein.", instruction:"Merke dir Reihenfolge und Wörter.", display:list, answerType:"text", expected:normalizeWords(list), explanation:"Reihenfolge und Wortlaut müssen zusammen erinnert werden." };
}

function symbolTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : difficulty === 2 ? 5 : 4;
  const list = Array.from({ length: count }, () => SYMBOLS[randomInt(0, SYMBOLS.length - 1)]);
  const correct = list.join(" ");
  const options = uniqueOptions(correct, () => Array.from({ length: count }, () => SYMBOLS[randomInt(0, SYMBOLS.length - 1)]).join(" "));
  return { id:`symbols-${seed}-${correct}`, mode:"symbols", label:"Symbolgedächtnis", prompt:"Welche Symbolfolge hast du gesehen?", instruction:"Merke dir die Symbolfolge.", display:list, answerType:"choice", expected:correct, options, explanation:"Gesucht ist exakt die gezeigte Symbolreihenfolge." };
}

function positionTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 4 : difficulty === 2 ? 3 : 2;
  const positions = shuffled([0,1,2,3,4,5,6,7,8]).slice(0, count).sort((a,b)=>a-b);
  const correct = `pos:${positions.join(",")}`;
  const options = uniqueOptions(correct, () => `pos:${shuffled([0,1,2,3,4,5,6,7,8]).slice(0,count).sort((a,b)=>a-b).join(",")}`);
  const display = Array.from({ length: 9 }, (_, index) => positions.includes(index) ? "●" : "·");
  return { id:`positions-${seed}-${positions.join("-")}`, mode:"positions", label:"Positionsgedächtnis", prompt:"Welche Felder waren markiert?", instruction:"Merke dir die Positionen im 3×3-Raster.", display, answerType:"choice", expected:correct, options, explanation:"Die markierten Felder müssen als räumliches Muster wiedererkannt werden.", grid:true };
}

function recognitionTask(difficulty: Difficulty, seed: number): MemoryTask {
  const count = difficulty === 3 ? 6 : 5;
  const list = shuffled(WORDS).slice(0, count);
  const correct = list.join(" · ");
  const options = uniqueOptions(correct, () => shuffled(WORDS).slice(0,count).join(" · "));
  return { id:`recognition-${seed}-${list.join("-")}`, mode:"recognition", label:"Wiedererkennung", prompt:"Welche Wortgruppe wurde gezeigt?", instruction:"Merke dir die gesamte Wortgruppe.", display:list, answerType:"choice", expected:correct, options, explanation:"Hier zählt Wiedererkennung statt freier Abruf." };
}

function nbackTask(n: 1 | 2, difficulty: Difficulty, seed: number): MemoryTask {
  const length = difficulty === 3 ? 7 : 6;
  const stream = Array.from({ length }, () => SYMBOLS[randomInt(0, 7)]);
  const match = Math.random() < 0.5;
  const targetIndex = length - 1;
  if (match) stream[targetIndex] = stream[targetIndex - n];
  else {
    const forbidden = stream[targetIndex - n];
    stream[targetIndex] = shuffled(SYMBOLS.filter((symbol) => symbol !== forbidden))[0];
  }
  return { id:`nback${n}-${seed}-${stream.join("")}`, mode:n === 1 ? "nback1" : "nback2", label:`${n}-Back Light`, prompt:`War das letzte Symbol identisch mit dem Symbol ${n === 1 ? "direkt davor" : "zwei Positionen davor"}?`, instruction:`Beobachte die Folge und vergleiche das letzte Element mit ${n}-Back.`, display:stream, answerType:"choice", expected:match ? "Ja" : "Nein", options:shuffled(["Ja","Nein"]), explanation:`Beim ${n}-Back wird das aktuelle Element mit dem Element ${n} Position${n === 1 ? "" : "en"} zuvor verglichen.` };
}

export function createMemorySession(bestScore: number): MemorySession {
  const percent = Math.round((bestScore / MEMORY_SESSION_LENGTH) * 100);
  const difficulty = difficultyFromPercent(percent);
  const seed = createSessionSeed();
  const factories = [
    () => sequenceTask("digits", difficulty, seed + 1),
    () => sequenceTask("reverse", difficulty, seed + 2),
    () => wordTask(difficulty, seed + 3),
    () => symbolTask(difficulty, seed + 4),
    () => positionTask(difficulty, seed + 5),
    () => recognitionTask(difficulty, seed + 6),
    () => nbackTask(1, difficulty, seed + 7),
    () => nbackTask(2, difficulty, seed + 8),
  ];
  const tasks = finalizeSessionTasks("memory-v2", shuffled(factories).map((factory) => factory()), 48);
  return { difficulty, showMs: difficulty === 3 ? 3200 : difficulty === 2 ? 3800 : 4400, tasks };
}

export function normalizeMemoryInput(task: MemoryTask, value: string): string {
  if (task.mode === "digits" || task.mode === "reverse") return value.replace(/\D/g, "");
  if (task.mode === "words") return value.toLocaleLowerCase("de-AT").trim().split(/[\s,;]+/).filter(Boolean).join("|");
  return value.trim();
}
