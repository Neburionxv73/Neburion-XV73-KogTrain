import { createSessionSeed, difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";
import { LOGIC_SESSION_LENGTH, LOGIC_STORAGE_KEY, type LogicMode, type LogicSession, type LogicTask } from "@/lib/logic";

export { LOGIC_SESSION_LENGTH, LOGIC_STORAGE_KEY };
export type { LogicMode, LogicSession, LogicTask };

function makeTask(id: string, mode: LogicMode, prompt: string, detail: string, correct: string, distractors: string[], explanation: string): LogicTask {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { id, mode, prompt, detail, options, answer: options.indexOf(correct), explanation };
}

function sequence(seed: number, difficulty: Difficulty): LogicTask {
  const variant = seed % 4;
  if (variant === 0) {
    const start = randomInt(2, 9), step = randomInt(2, 7);
    const values = [0,1,2,3,4].map((i) => start + i * step);
    const correct = String(start + 5 * step);
    return makeTask(`v2-seq-a-${seed}`, "sequence", "Welche Zahl folgt?", `${values.join(" · ")} · ?`, correct, [String(+correct + step), String(+correct - 1), String(+correct + 1)], `Jeder Schritt erhöht die Zahl um ${step}.`);
  }
  if (variant === 1) {
    const start = randomInt(25, 50), step = randomInt(2, 6);
    const values = [0,1,2,3,4].map((i) => start - i * step);
    const correct = String(start - 5 * step);
    return makeTask(`v2-seq-b-${seed}`, "sequence", "Welche Zahl setzt die fallende Folge fort?", `${values.join(" · ")} · ?`, correct, [String(+correct + step), String(+correct - step), String(+correct + 1)], `Die Folge sinkt jeweils um ${step}.`);
  }
  if (variant === 2 || difficulty >= 2) {
    const start = randomInt(1, 5), base = randomInt(2, 4);
    const values = [start, start + base, start + base * 3, start + base * 6, start + base * 10];
    const correct = String(start + base * 15);
    return makeTask(`v2-seq-c-${seed}`, "sequence", "Welche Zahl folgt bei wachsenden Abständen?", `${values.join(" · ")} · ?`, correct, [String(+correct - base), String(+correct + base), String(+correct - 1)], `Die Abstände wachsen als +${base}, +${base*2}, +${base*3}, +${base*4}, +${base*5}.`);
  }
  const a = randomInt(2, 5), b = randomInt(2, 6);
  const values = [a, b, a+b, a+2*b, 2*a+3*b];
  const correct = String(3*a + 5*b);
  return makeTask(`v2-seq-d-${seed}`, "sequence", "Welche Zahl folgt in der rekursiven Reihe?", `${values.join(" · ")} · ?`, correct, [String(+correct - 1), String(+correct + 1), String(+correct + a)], "Jede Zahl ist die Summe der beiden vorherigen.");
}

function rule(seed: number, difficulty: Difficulty): LogicTask {
  const variant = seed % 4;
  const input = randomInt(3, 9);
  if (variant === 0) {
    const mul = difficulty === 1 ? 2 : randomInt(2, 5), add = difficulty === 1 ? 1 : randomInt(1, 6);
    const correct = input * mul + add;
    return makeTask(`v2-rule-a-${seed}`, "rule", "Welche Ausgabe ist korrekt?", `2 → ${2*mul+add} · 4 → ${4*mul+add} · ${input} → ?`, String(correct), [String(input*mul), String(correct+mul), String(correct-1)], `Regel: ×${mul}, danach +${add}.`);
  }
  if (variant === 1) {
    const mul = randomInt(2, 4), sub = randomInt(1, 5);
    const correct = input * mul - sub;
    return makeTask(`v2-rule-b-${seed}`, "rule", "Welche Ausgabe folgt aus der Regel?", `3 → ${3*mul-sub} · 5 → ${5*mul-sub} · ${input} → ?`, String(correct), [String(input*mul), String(correct+sub), String(correct-1)], `Regel: ×${mul}, danach −${sub}.`);
  }
  if (variant === 2 && difficulty >= 2) {
    const add = randomInt(2, 6), mul = randomInt(2, 3);
    const correct = (input + add) * mul;
    return makeTask(`v2-rule-c-${seed}`, "rule", "Erkenne die zweistufige Regel.", `2 → ${(2+add)*mul} · 4 → ${(4+add)*mul} · ${input} → ?`, String(correct), [String(input*mul+add), String(correct+mul), String(correct-add)], `Regel: zuerst +${add}, danach ×${mul}.`);
  }
  const squareInput = randomInt(2, 7), correct = squareInput * squareInput + 1;
  return makeTask(`v2-rule-d-${seed}`, "rule", "Welche Ausgabe passt zum Muster?", `2 → 5 · 3 → 10 · ${squareInput} → ?`, String(correct), [String(squareInput*squareInput), String(correct+squareInput), String(correct-1)], "Regel: Zahl quadrieren und anschließend 1 addieren.");
}

function analogy(seed: number): LogicTask {
  const variants = [
    ["Auge : sehen = Ohr : ?", "hören", ["laufen","greifen","riechen"], "Sinnesorgan und Funktion."],
    ["Schlüssel : Schloss = Passwort : ?", "Konto", ["Tisch","Fenster","Stift"], "Mittel und geschützter Zugang."],
    ["Kapitel : Buch = Szene : ?", "Film", ["Karte","Stuhl","Wolke"], "Bestandteil und Ganzes."],
    ["Thermometer : Temperatur = Uhr : ?", "Zeit", ["Gewicht","Länge","Lautstärke"], "Messgerät und Messgröße."],
    ["Frage : Antwort = Problem : ?", "Lösung", ["Pause","Farbe","Geräusch"], "Ausgangslage und passende Auflösung."],
    ["Samen : Pflanze = Ei : ?", "Tier", ["Stein","Wasser","Metall"], "Ausgangsform und Entwicklung."],
    ["Autor : Buch = Komponist : ?", "Musikstück", ["Gebäude","Landkarte","Werkzeug"], "Urheber und Werk."],
    ["Ziegel : Mauer = Wort : ?", "Satz", ["Ton","Zahl","Farbe"], "Element und daraus gebildete Struktur."]
  ] as const;
  const v = variants[seed % variants.length];
  return makeTask(`v2-ana-${seed}`, "analogy", "Ergänze die Analogie.", v[0], v[1], [...v[2]], v[3]);
}

function deduction(seed: number, difficulty: Difficulty): LogicTask {
  const pools = [
    ["Alle Neri sind Luma. Taro ist ein Neri.", "Taro ist ein Luma", ["Taro ist kein Luma","Alle Luma sind Neri","Nichts folgt"], "Taro gehört zu einer vollständig beschriebenen Untergruppe."],
    ["Kein Selo ist schwer. Mira ist ein Selo.", "Mira ist nicht schwer", ["Mira ist schwer","Alles Leichte ist Selo","Mira ist rot"], "Für jedes Selo ist 'schwer' ausgeschlossen."],
    ["Alle Karo sind schnell. Kein schnelles Wesen ist träge. Ria ist ein Karo.", "Ria ist nicht träge", ["Ria ist träge","Ria ist langsam","Alle Nicht-Trägen sind Karo"], "Karo impliziert schnell; schnell schließt träge aus."],
    ["Einige Varo sind Musiker. Alle Musiker üben.", "Einige Varo üben", ["Alle Varo üben","Kein Varo übt","Alle Übenden sind Musiker"], "Die existierende Musiker-Teilgruppe übt."],
    ["Alle P sind Q. Kein Q ist R. X ist P.", "X ist nicht R", ["X ist R","Alle R sind P","Kein P ist Q"], "P führt zu Q und Q schließt R aus."],
    ["Einige D sind E. Alle E sind F.", "Einige D sind F", ["Alle D sind F","Kein D ist F","Alle F sind E"], "Mindestens die D, die E sind, gehören auch zu F."]
  ] as const;
  const start = difficulty === 1 ? 0 : difficulty === 2 ? 2 : 4;
  const span = difficulty === 1 ? 2 : 2;
  const v = pools[start + (seed % span)];
  return makeTask(`v2-ded-${seed}`, "deduction", "Welche Aussage folgt sicher?", v[0], v[1], [...v[2]], v[3]);
}

function matrix(seed: number, difficulty: Difficulty): LogicTask {
  const shapes = ["●","▲","■","◆","✦","⬟"];
  const [a,b,c] = shuffled(shapes).slice(0,3);
  const variant = seed % 3;
  if (variant === 0) return makeTask(`v2-mat-a-${seed}`, "matrix", "Welches Symbol ergänzt die Matrix?", `${a} ${b} | ${b} ${a} | ${a} ?`, b, shapes.filter((s)=>s!==b).slice(0,3), "Die Paare wechseln ihre Reihenfolge.");
  if (variant === 1 || difficulty >= 2) return makeTask(`v2-mat-b-${seed}`, "matrix", "Welches Symbol ergänzt die Rotationsmatrix?", `${a} ${b} ${c} | ${b} ${c} ${a} | ${c} ${a} ?`, b, shapes.filter((s)=>s!==b).slice(0,3), "Jede Zeile verschiebt die Drei-Symbol-Folge um eine Position.");
  return makeTask(`v2-mat-c-${seed}`, "matrix", "Welche Form fehlt im Wechselmuster?", `${a} ${a} ${b} | ${b} ${b} ${c} | ${c} ${c} ?`, a, shapes.filter((s)=>s!==a).slice(0,3), "Die dritte Form jeder Gruppe wird zur doppelten Form der nächsten Gruppe.");
}

function operator(seed: number, difficulty: Difficulty): LogicTask {
  const x = randomInt(2, 8), y = randomInt(2, 7), variant = seed % 5;
  const formulas = [
    { value:x+y*2, text:`a + 2b`, exp:"a + 2×b" },
    { value:x*y+y, text:`a×b + b`, exp:"a×b + b" },
    { value:x*2+y, text:`2a + b`, exp:"2×a + b" },
    { value:(x+y)*2, text:`2(a+b)`, exp:"Summe bilden und verdoppeln" },
    { value:x*x-y, text:`a² − b`, exp:"a quadrieren und b abziehen" }
  ];
  const f = formulas[difficulty === 1 ? variant % 3 : variant];
  return makeTask(`v2-op-${seed}`, "operator", "Berechne mit der neuen Operatorregel.", `Wenn a ★ b = ${f.text}, was ist ${x} ★ ${y}?`, String(f.value), [String(f.value+1), String(f.value-1), String(x*y)], `Regel: ${f.exp}.`);
}

function exclusion(seed: number, difficulty: Difficulty): LogicTask {
  const pools = [
    {values:["5","10","15","22","25"],correct:"22",reason:"Alle anderen sind durch 5 teilbar."},
    {values:["8","16","24","31","40"],correct:"31",reason:"Alle anderen sind durch 8 teilbar."},
    {values:["2","3","5","7","9","11"],correct:"9",reason:"Alle anderen sind Primzahlen."},
    {values:["12","18","24","30","35"],correct:"35",reason:"Alle anderen sind durch 6 teilbar."},
    {values:["9","16","25","36","45","49"],correct:"45",reason:"Alle anderen sind Quadratzahlen."},
    {values:["8","27","64","81","125"],correct:"81",reason:"Alle anderen sind Kubikzahlen."}
  ];
  const range = difficulty === 1 ? pools.slice(0,2) : difficulty === 2 ? pools.slice(2,4) : pools.slice(4);
  const v = range[seed % range.length];
  return makeTask(`v2-exc-${seed}`, "exclusion", "Welche Zahl passt nicht?", v.values.join(" · "), v.correct, v.values.filter((x)=>x!==v.correct).slice(0,3), v.reason);
}

function spatial(seed: number, difficulty: Difficulty): LogicTask {
  const dirs = ["Norden","Osten","Süden","Westen"];
  const start = seed % 4;
  const moveCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;
  let pos = start;
  const moves: string[] = [];
  for (let i=0;i<moveCount;i+=1) {
    const right = (seed + i) % 3 !== 0;
    pos = (pos + (right ? 1 : 3)) % 4;
    moves.push(right ? "rechts" : "links");
  }
  return makeTask(`v2-spa-${seed}-${moves.join("-")}`, "spatial", "Wohin blickst du am Ende?", `Start: ${dirs[start]}. Drehungen: ${moves.join(" → ")}.`, dirs[pos], dirs.filter((d)=>d!==dirs[pos]), "Führe jede 90°-Drehung nacheinander aus.");
}

export function createLogicSession(bestScore: number): LogicSession {
  const difficulty = difficultyFromPercent((bestScore / LOGIC_SESSION_LENGTH) * 100);
  const seed = createSessionSeed();
  const tasks = [
    sequence(seed, difficulty),
    rule(seed + 11, difficulty),
    analogy(seed + 23),
    deduction(seed + 37, difficulty),
    matrix(seed + 41, difficulty),
    operator(seed + 53, difficulty),
    exclusion(seed + 67, difficulty),
    spatial(seed + 79, difficulty),
  ];
  return { difficulty, tasks: shuffled(tasks) };
}
