import {
  createVisualSession as createBaseVisualSession,
  VISUAL_SESSION_LENGTH,
  VISUAL_STORAGE_KEY,
  type VisualMode,
  type VisualSession,
  type VisualTask,
} from "@/lib/visual";
import {
  difficultyFromEvidence,
  finalizeBalancedSessionTasks,
  readRecentTaskIds,
  shuffled,
  type Difficulty,
} from "@/lib/dynamicTraining";

export { VISUAL_SESSION_LENGTH, VISUAL_STORAGE_KEY };
export type { VisualMode, VisualSession, VisualTask };

const HISTORY_SCOPE = "visual-v4";
const HISTORY_LIMIT = 144;
const ARROWS = ["↑", "→", "↓", "←"];
const DIAGONALS = ["↗", "↘", "↙", "↖"];
const POSITION_LABELS = ["oben links", "oben Mitte", "oben rechts", "Mitte links", "Mitte", "Mitte rechts", "unten links", "unten Mitte", "unten rechts"];

function scoreForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 1) return 0;
  if (difficulty === 2) return 5;
  return 7;
}

function visualTask(id:string, mode:VisualMode, prompt:string, visual:string[], correct:string, distractors:string[], explanation:string):VisualTask {
  const options = shuffled([correct, ...distractors.filter((item) => item !== correct)]).slice(0, 4);
  return { id, mode, prompt, visual, options, answer: options.indexOf(correct), explanation };
}

function counterRotation(seed:number,difficulty:Difficulty):VisualTask {
  const start=seed%4;
  const turns=difficulty===1?1:difficulty===2?2:3;
  const correct=ARROWS[(start-turns+8)%4];
  return visualTask(
    `v5-rotation-ccw-${start}-${turns}`,
    "rotation",
    `Wie zeigt der Pfeil nach ${turns*90}° Drehung gegen den Uhrzeigersinn?`,
    [ARROWS[start],"↺",`${turns*90}°`],
    correct,
    ARROWS.filter((item)=>item!==correct),
    "Die Drehung erfolgt diesmal gegen den Uhrzeigersinn. Jede Vierteldrehung entspricht 90 Grad.",
  );
}

function doubleMirror(seed:number,difficulty:Difficulty):VisualTask {
  const base=DIAGONALS[seed%DIAGONALS.length];
  const horizontal:Record<string,string>={"↗":"↖","↖":"↗","↘":"↙","↙":"↘"};
  const vertical:Record<string,string>={"↗":"↘","↘":"↗","↖":"↙","↙":"↖"};
  const first=horizontal[base];
  const correct=difficulty===1?first:vertical[first];
  return visualTask(
    `v5-mirror-double-${base}-${difficulty}`,
    "mirror",
    difficulty===1?"Welche Form entsteht nach horizontaler Spiegelung?":"Welche Form entsteht nach horizontaler und danach vertikaler Spiegelung?",
    difficulty===1?[base,"│","?"]:[base,"│","→","─","→","?"],
    correct,
    DIAGONALS.filter((item)=>item!==correct),
    difficulty===1?"Links und rechts werden gespiegelt.":"Zwei Spiegelungen werden nacheinander ausgeführt; die zweite arbeitet mit dem bereits gespiegelten Ergebnis.",
  );
}

function positionRelation(seed:number,difficulty:Difficulty):VisualTask {
  const start=seed%9;
  const row=Math.floor(start/3),col=start%3;
  const candidates=[
    {label:"rechts daneben",dr:0,dc:1},
    {label:"links daneben",dr:0,dc:-1},
    {label:"direkt darunter",dr:1,dc:0},
    {label:"direkt darüber",dr:-1,dc:0},
  ].filter((move)=>row+move.dr>=0&&row+move.dr<3&&col+move.dc>=0&&col+move.dc<3);
  const move=candidates[(seed+difficulty)%candidates.length];
  const target=(row+move.dr)*3+(col+move.dc);
  const visual=Array.from({length:9},(_,index)=>index===start?"●":"·");
  return visualTask(
    `v5-position-relation-${start}-${target}`,
    "position",
    `Welches Feld liegt ${move.label} vom markierten Punkt?`,
    visual,
    POSITION_LABELS[target],
    shuffled(POSITION_LABELS.filter((_,index)=>index!==target)).slice(0,3),
    "Die Lösung entsteht aus der räumlichen Beziehung zum Ausgangsfeld, nicht aus einer Bewegungsfolge.",
  );
}

export function createVisualSession(
  bestScore: number,
  completedSessions = 0,
  forcedDifficulty?: Difficulty,
): VisualSession {
  const percent = Math.round((bestScore / VISUAL_SESSION_LENGTH) * 100);
  const difficulty = forcedDifficulty ?? difficultyFromEvidence({
    percent,
    attempts: completedSessions * VISUAL_SESSION_LENGTH,
  });

  const recent = new Set(readRecentTaskIds(HISTORY_SCOPE, HISTORY_LIMIT));
  const candidates: VisualTask[] = [];

  // Generate several independent sessions so every visual mode gets a much
  // larger candidate pool before the final experience-level recipe is made.
  for (let round = 0; round < 7; round += 1) {
    const session = createBaseVisualSession(scoreForDifficulty(difficulty));
    candidates.push(...session.tasks);
    const seed = round * 17 + completedSessions * 11 + bestScore;
    candidates.push(counterRotation(seed,difficulty),doubleMirror(seed+5,difficulty),positionRelation(seed+9,difficulty));
  }

  const unique = [...new Map(candidates.map((item) => [item.id, item])).values()];
  const fresh = unique.filter((item) => !recent.has(item.id));
  const source = fresh.length >= VISUAL_SESSION_LENGTH ? fresh : unique;
  const tasks = finalizeBalancedSessionTasks(HISTORY_SCOPE, source, VISUAL_SESSION_LENGTH, HISTORY_LIMIT);

  return { difficulty, tasks };
}
