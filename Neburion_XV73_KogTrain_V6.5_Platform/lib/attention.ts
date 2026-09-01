import { createSessionSeed, difficultyFromPercent, finalizeBalancedSessionTasks, randomInt, shuffled, type Difficulty } from "@/lib/dynamicTraining";

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

export type AttentionSession = { difficulty: Difficulty; tasks: AttentionTask[]; targetMs: number };

const symbols = ["◆", "●", "▲", "■", "✦", "⬟", "★", "✚", "◇", "⬢", "⬣", "◈", "○", "□", "△", "⬡"];
const stableId = (mode: AttentionMode, content: string) => `${mode}:${content}`;

function withAnswer(task: Omit<AttentionTask, "options" | "answer">, correct: string, distractors: string[]): AttentionTask {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { ...task, options, answer: options.indexOf(correct) };
}

function goNoGo(seed: number, difficulty: Difficulty): AttentionTask {
  const pool = difficulty === 1 ? symbols.slice(0,8) : difficulty === 2 ? symbols.slice(0,12) : symbols;
  const [target, shown] = shuffled(pool).slice(0, 2);
  const isTarget = seed % (difficulty === 3 ? 2 : 3) !== 0;
  const stimulus = isTarget ? target : shown;
  const visual = difficulty === 3 ? [stimulus, shuffled(pool.filter(item=>item!==stimulus))[0]] : [stimulus];
  return withAnswer({ id:stableId("go-no-go", `${difficulty}-${target}-${visual.join("")}`), mode:"go-no-go", label:"Go / No-Go", prompt:`Zielreiz: ${target}`, instruction:difficulty===3?"Reagiere nur, wenn der erste gezeigte Reiz dem Zielreiz entspricht. Der zweite Reiz ist Ablenkung.":"Reagiere nur, wenn der gezeigte Reiz dem Zielreiz entspricht.", visual, explanation:isTarget ? "Der entscheidende Reiz war der Zielreiz." : "Der entscheidende Reiz war ein Distraktor und sollte ignoriert werden." }, isTarget ? "Reagieren" : "Ignorieren", [isTarget ? "Ignorieren" : "Reagieren"]);
}

function visualSearch(seed: number, difficulty: Difficulty): AttentionTask {
  const target = shuffled(symbols)[0];
  const distractorPool = symbols.filter((item) => item !== target);
  const targetCount = randomInt(1, difficulty === 3 ? 6 : difficulty === 2 ? 4 : 3);
  const total = difficulty === 3 ? 24 : difficulty === 2 ? 16 : 10;
  const closeDistractors = distractorPool.filter(item=>["◆","◇","●","○","■","□","▲","△","⬢","⬡"].includes(item));
  const source = difficulty === 3 && closeDistractors.length ? closeDistractors : distractorPool;
  const visual = shuffled([...Array.from({length:targetCount},()=>target), ...Array.from({length:total-targetCount},(_,i)=>source[(i+seed)%source.length])]);
  const correct = String(targetCount);
  const distractors = shuffled(["0","1","2","3","4","5","6","7"].filter((value)=>value!==correct)).slice(0,3);
  return withAnswer({ id:stableId("visual-search", `${difficulty}-${target}-${targetCount}-${visual.join("")}`), mode:"visual-search", label:"Visuelle Suche", prompt:`Wie oft erscheint ${target}?`, instruction:difficulty===3?"Scanne das dichte Feld. Ähnliche Formen sind absichtliche Distraktoren.":"Scanne das Feld und zähle nur den Zielreiz.", visual, explanation:`${target} erscheint ${targetCount}-mal im Reizfeld.` }, correct, distractors);
}

function ruleSwitch(seed: number, difficulty: Difficulty): AttentionTask {
  const [a,b,c] = shuffled(symbols).slice(0,3);
  const ruleIndex = difficulty===3 ? seed%3 : seed%2;
  const targets = [a,b,c];
  const active = targets[ruleIndex];
  const shown = targets[(seed + (seed%2)) % targets.length];
  const correct = shown===active ? "Reagieren" : "Ignorieren";
  const ruleName = String.fromCharCode(65+ruleIndex);
  return withAnswer({ id:stableId("rule-switch", `${difficulty}-${ruleName}-${a}-${b}-${c}-${shown}`), mode:"rule-switch", label:"Regelwechsel", prompt:`Regel ${ruleName}: Reagiere auf ${active}`, instruction:difficulty===3?"Drei mögliche Regeln wechseln. Prüfe jedes Mal nur die aktuell angezeigte Regel.":"Achte auf die aktuelle Regel – nicht auf die Regel der vorherigen Aufgabe.", visual:[shown], explanation:`Für diese Aufgabe galt Regel ${ruleName} mit Zielreiz ${active}.` }, correct, [correct==="Reagieren" ? "Ignorieren" : "Reagieren"]);
}

function inhibition(seed: number, difficulty: Difficulty): AttentionTask {
  const pairs = [["◆","◇"],["●","○"],["■","□"],["▲","△"],["⬢","⬡"]];
  const [filled, outline] = pairs[seed%pairs.length];
  const showFilled = seed % 2 === 0;
  const visual = difficulty===3 ? [showFilled?filled:outline, showFilled?outline:filled] : [showFilled ? filled : outline];
  return withAnswer({ id:stableId("inhibition", `${difficulty}-${filled}-${showFilled?"filled":"outline"}-${visual.join("")}`), mode:"inhibition", label:"Reaktionshemmung", prompt:difficulty===3?`Bewerte nur die erste Form: Reagiere auf ${filled}`:`Reagiere nur auf die gefüllte Form ${filled}`, instruction:difficulty===3?"Die zweite Form ist ein Konfliktreiz und darf deine Entscheidung nicht verändern.":"Ähnliche Konturen sind Distraktoren.", visual, explanation:showFilled ? "Die entscheidende Form war gefüllt: reagieren." : "Die entscheidende Form war ungefüllt: Reaktion hemmen." }, showFilled ? "Reagieren" : "Ignorieren", [showFilled ? "Ignorieren" : "Reagieren"]);
}

function divided(seed: number, difficulty: Difficulty): AttentionTask {
  const easy=["🔴▲","🔵■","🟢●","🟡◆"];
  const medium=["🔴▲","🔴■","🔵▲","🔵■","🟢●","🟢◆","🟡●","🟡◆"];
  const hard=[...medium,"🟣▲","🟣◆","🟠■","🟠●"];
  const set = difficulty === 1 ? easy : difficulty === 2 ? medium : hard;
  const target = shuffled(set)[0];
  const visual = shuffled(set).slice(0, difficulty === 3 ? 9 : difficulty === 2 ? 6 : 4);
  if (!visual.includes(target)) visual[0] = target;
  return withAnswer({ id:stableId("divided", `${difficulty}-${target}-${visual.join("")}`), mode:"divided", label:"Geteilte Aufmerksamkeit", prompt:`Finde die Kombination ${target}`, instruction:difficulty===3?"Beachte Farbe und Form gleichzeitig; ähnliche Kombinationen liegen bewusst dicht beieinander.":"Beachte gleichzeitig Farbe und Form.", visual, explanation:`Gesucht war genau die Kombination ${target}.` }, target, shuffled(set.filter((item)=>item!==target)).slice(0,3));
}

function speed(seed: number, difficulty: Difficulty): AttentionTask {
  const [target, other] = shuffled(symbols).slice(0,2);
  const shown = seed % 2 === 0 ? target : other;
  const targetMs=difficulty===3?650:difficulty===2?800:1000;
  return withAnswer({ id:stableId("speed", `${difficulty}-${target}-${shown}`), mode:"speed", label:"Tempo", prompt:`Ist der Reiz ${target}?`, instruction:`Antworte möglichst schnell und trotzdem korrekt. Zielzeit: ${targetMs} ms.`, visual:[shown], explanation:shown===target ? "Der Reiz stimmte mit dem Ziel überein." : "Der Reiz war ein anderer." }, shown===target ? "Ja" : "Nein", [shown===target ? "Nein" : "Ja"]);
}

function interference(seed: number, difficulty: Difficulty): AttentionTask {
  const labels = ["ROT","BLAU","GRÜN","GELB"];
  const colorIcons = ["🔴","🔵","🟢","🟡"];
  const index = seed % labels.length;
  let iconIndex = (seed + 1 + randomInt(0,2)) % colorIcons.length;
  if (seed % (difficulty===1?3:5) === 0) iconIndex = index;
  const visual=difficulty===3?[labels[index],colorIcons[iconIndex],labels[(index+2)%labels.length]]:[colorIcons[iconIndex],labels[index]];
  return withAnswer({ id:stableId("interference", `${difficulty}-${visual.join("-")}`), mode:"interference", label:"Störreiz", prompt:difficulty===3?"Welche Farbe zeigt das mittlere Farbsymbol?":"Welche Farbe zeigt der Punkt?", instruction:difficulty===3?"Ignoriere beide Wörter und antworte ausschließlich nach dem mittleren Farbsymbol.":"Ignoriere das geschriebene Farbwort und antworte nach dem Farbsymbol.", visual, explanation:`Entscheidend war das Farbsymbol ${colorIcons[iconIndex]}, nicht das geschriebene Farbwort.` }, labels[iconIndex], shuffled(labels.filter((item)=>item!==labels[iconIndex])).slice(0,3));
}

export function createAttentionSession(bestAccuracy: number): AttentionSession {
  const difficulty = difficultyFromPercent(bestAccuracy);
  const seed = createSessionSeed();
  const rounds=difficulty===3?5:difficulty===2?4:3;
  const candidates = Array.from({length:rounds},(_,round)=>{
    const s=seed+round*37;
    return [goNoGo(s+1,difficulty),visualSearch(s+2,difficulty),ruleSwitch(s+3,difficulty),inhibition(s+4,difficulty),divided(s+5,difficulty),speed(s+6,difficulty),interference(s+7,difficulty)];
  }).flat();
  const taskCount=difficulty===3?10:difficulty===2?9:8;
  const tasks = finalizeBalancedSessionTasks("attention-v4", candidates, taskCount, 112);
  return { difficulty, tasks, targetMs: difficulty===3 ? 650 : difficulty===2 ? 800 : 1000 };
}
