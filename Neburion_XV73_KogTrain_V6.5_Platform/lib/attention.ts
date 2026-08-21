import { difficultyFromPercent, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

export type AttentionMode = "go-no-go" | "visual-search" | "rule-switch" | "inhibition" | "divided" | "speed" | "interference";

export type AttentionTask = {
  id: string;
  mode: AttentionMode;
  label: string;
  prompt: string;
  instruction: string;
  visual: string[];
  options: string[];
  answer: number;
  explanation: string;
};

export type AttentionSession = {
  difficulty: Difficulty;
  tasks: AttentionTask[];
  targetMs: number;
};

const symbols = ["◆", "●", "▲", "■", "✦", "⬟", "★", "✚"];

function withAnswer(task: Omit<AttentionTask, "options" | "answer">, correct: string, distractors: string[]): AttentionTask {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { ...task, options, answer: options.indexOf(correct) };
}

function goNoGo(seed: number): AttentionTask {
  const [target, shown] = shuffled(symbols).slice(0, 2);
  const isTarget = Math.random() > 0.45;
  const stimulus = isTarget ? target : shown;
  return withAnswer({ id:`gng-${seed}`, mode:"go-no-go", label:"Go / No-Go", prompt:`Zielreiz: ${target}`, instruction:"Reagiere nur, wenn der gezeigte Reiz dem Zielreiz entspricht.", visual:[stimulus], explanation:isTarget ? "Der gezeigte Reiz war der Zielreiz." : "Der gezeigte Reiz war ein Distraktor und sollte ignoriert werden." }, isTarget ? "Reagieren" : "Ignorieren", [isTarget ? "Ignorieren" : "Reagieren"]);
}

function visualSearch(seed: number, difficulty: Difficulty): AttentionTask {
  const target = shuffled(symbols)[0];
  const distractorPool = symbols.filter((item) => item !== target);
  const targetCount = randomInt(1, difficulty === 3 ? 4 : 3);
  const total = difficulty === 3 ? 14 : difficulty === 2 ? 12 : 10;
  const visual = shuffled([
    ...Array.from({length:targetCount},()=>target),
    ...Array.from({length:total-targetCount},(_,i)=>distractorPool[i % distractorPool.length]),
  ]);
  const correct = String(targetCount);
  const distractors = shuffled(["0","1","2","3","4","5"].filter((value)=>value!==correct)).slice(0,3);
  return withAnswer({ id:`search-${seed}`, mode:"visual-search", label:"Visuelle Suche", prompt:`Wie oft erscheint ${target}?`, instruction:"Scanne das Feld und zähle nur den Zielreiz.", visual, explanation:`${target} erscheint ${targetCount}-mal im Reizfeld.` }, correct, distractors);
}

function ruleSwitch(seed: number): AttentionTask {
  const [a,b] = shuffled(symbols).slice(0,2);
  const useFirstRule = Math.random() > 0.5;
  const shown = Math.random() > 0.5 ? a : b;
  const correct = useFirstRule ? (shown===a ? "Reagieren" : "Ignorieren") : (shown===b ? "Reagieren" : "Ignorieren");
  return withAnswer({ id:`switch-${seed}`, mode:"rule-switch", label:"Regelwechsel", prompt:useFirstRule ? `Regel A: Reagiere auf ${a}` : `Regel B: Reagiere auf ${b}`, instruction:"Achte auf die aktuelle Regel – nicht auf die Regel der vorherigen Aufgabe.", visual:[shown], explanation:`Für diese Aufgabe galt ${useFirstRule ? "Regel A" : "Regel B"}.` }, correct, [correct==="Reagieren" ? "Ignorieren" : "Reagieren"]);
}

function inhibition(seed: number): AttentionTask {
  const pairs = [["◆","◇"],["●","○"],["■","□"],["▲","△"]];
  const [filled, outline] = pairs[randomInt(0,pairs.length-1)];
  const showFilled = Math.random() > 0.5;
  return withAnswer({ id:`inhibit-${seed}`, mode:"inhibition", label:"Reaktionshemmung", prompt:`Reagiere nur auf die gefüllte Form ${filled}`, instruction:"Ähnliche Konturen sind Distraktoren.", visual:[showFilled ? filled : outline], explanation:showFilled ? "Die Form war gefüllt: reagieren." : "Die Kontur war ungefüllt: Reaktion hemmen." }, showFilled ? "Reagieren" : "Ignorieren", [showFilled ? "Ignorieren" : "Reagieren"]);
}

function divided(seed: number, difficulty: Difficulty): AttentionTask {
  const set = difficulty === 1 ? ["🔴▲","🔵■","🟢●","🟡◆"] : ["🔴▲","🔴■","🔵▲","🔵■","🟢●","🟢◆"];
  const target = shuffled(set)[0];
  const color = target.slice(0,2);
  const shape = target.slice(2);
  const visual = shuffled(set).slice(0, difficulty === 3 ? 6 : 4);
  if (!visual.includes(target)) visual[0] = target;
  return withAnswer({ id:`divided-${seed}`, mode:"divided", label:"Geteilte Aufmerksamkeit", prompt:`Finde die Kombination ${target}`, instruction:"Beachte gleichzeitig Farbe und Form.", visual, explanation:`Gesucht war genau die Kombination aus ${color} und ${shape}.` }, target, shuffled(set.filter((item)=>item!==target)).slice(0,3));
}

function speed(seed: number, difficulty: Difficulty): AttentionTask {
  const [target, other] = shuffled(symbols).slice(0,2);
  const shown = Math.random() > 0.5 ? target : other;
  return withAnswer({ id:`speed-${seed}`, mode:"speed", label:"Tempo", prompt:`Ist der Reiz ${target}?`, instruction:`Antworte möglichst schnell. Zielzeit: ${difficulty===3?650:difficulty===2?800:950} ms.`, visual:[shown], explanation:shown===target ? "Der Reiz stimmte mit dem Ziel überein." : "Der Reiz war ein anderer." }, shown===target ? "Ja" : "Nein", [shown===target ? "Nein" : "Ja"]);
}

function interference(seed: number): AttentionTask {
  const labels = ["ROT","BLAU","GRÜN","GELB"];
  const colorIcons = ["🔴","🔵","🟢","🟡"];
  const index = randomInt(0,labels.length-1);
  let iconIndex = randomInt(0,colorIcons.length-1);
  if (Math.random() > 0.35 && iconIndex === index) iconIndex = (iconIndex + 1) % colorIcons.length;
  return withAnswer({ id:`interference-${seed}`, mode:"interference", label:"Störreiz", prompt:"Welche Farbe zeigt der Punkt?", instruction:"Ignoriere das geschriebene Farbwort und antworte nach dem Farbsymbol.", visual:[colorIcons[iconIndex], labels[index]], explanation:`Entscheidend war das Farbsymbol ${colorIcons[iconIndex]}, nicht das Wort ${labels[index]}.` }, labels[iconIndex], shuffled(labels.filter((item)=>item!==labels[iconIndex])).slice(0,3));
}

export function createAttentionSession(bestAccuracy: number): AttentionSession {
  const difficulty = difficultyFromPercent(bestAccuracy);
  const seed = Date.now();
  const factories = [
    ()=>goNoGo(seed+1), ()=>goNoGo(seed+2), ()=>visualSearch(seed+3,difficulty), ()=>visualSearch(seed+4,difficulty),
    ()=>ruleSwitch(seed+5), ()=>ruleSwitch(seed+6), ()=>inhibition(seed+7), ()=>divided(seed+8,difficulty),
    ()=>speed(seed+9,difficulty), ()=>speed(seed+10,difficulty), ()=>interference(seed+11), ()=>interference(seed+12),
  ];
  const tasks = shuffled(factories).slice(0,8).map((factory)=>factory());
  return { difficulty, tasks, targetMs: difficulty===3 ? 650 : difficulty===2 ? 800 : 950 };
}
