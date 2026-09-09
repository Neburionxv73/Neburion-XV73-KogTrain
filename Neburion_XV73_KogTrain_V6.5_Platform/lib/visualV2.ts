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
const HISTORY_LIMIT = 176;
const ARROWS = ["↑", "→", "↓", "←"];
const DIAGONALS = ["↗", "↘", "↙", "↖"];
const SHAPES = ["●","■","▲","◆","✦","⬟","⬢","★","✚","◇","⬣","◈"];
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
  return visualTask(`v5-rotation-ccw-${start}-${turns}`,"rotation",`Wie zeigt der Pfeil nach ${turns*90}° Drehung gegen den Uhrzeigersinn?`,[ARROWS[start],"↺",`${turns*90}°`],correct,ARROWS.filter((item)=>item!==correct),"Die Drehung erfolgt diesmal gegen den Uhrzeigersinn. Jede Vierteldrehung entspricht 90 Grad.");
}

function alternatingRotation(seed:number,difficulty:Difficulty):VisualTask {
  const start=seed%4;
  const first=seed%2===0?1:3;
  const second=difficulty===1?1:difficulty===2?2:3;
  const final=(start+first+second)%4;
  return visualTask(`v6-rotation-alt-${start}-${first}-${second}`,"rotation","Welche Richtung entsteht nach zwei aufeinanderfolgenden Drehungen?",[ARROWS[start],first===1?"↻":"↺","90°",second===1?"↻":"↺",`${second*90}°`,"?"],ARROWS[final],ARROWS.filter((item)=>item!==ARROWS[final]),"Beide Drehungen werden nacheinander auf dieselbe Ausgangsrichtung angewendet.");
}

function doubleMirror(seed:number,difficulty:Difficulty):VisualTask {
  const base=DIAGONALS[seed%DIAGONALS.length];
  const horizontal:Record<string,string>={"↗":"↖","↖":"↗","↘":"↙","↙":"↘"};
  const vertical:Record<string,string>={"↗":"↘","↘":"↗","↖":"↙","↙":"↖"};
  const first=horizontal[base];
  const correct=difficulty===1?first:vertical[first];
  return visualTask(`v5-mirror-double-${base}-${difficulty}`,"mirror",difficulty===1?"Welche Form entsteht nach horizontaler Spiegelung?":"Welche Form entsteht nach horizontaler und danach vertikaler Spiegelung?",difficulty===1?[base,"│","?"]:[base,"│","→","─","→","?"],correct,DIAGONALS.filter((item)=>item!==correct),difficulty===1?"Links und rechts werden gespiegelt.":"Zwei Spiegelungen werden nacheinander ausgeführt; die zweite arbeitet mit dem bereits gespiegelten Ergebnis.");
}

function mirrorThenRotate(seed:number,difficulty:Difficulty):VisualTask {
  const base=DIAGONALS[seed%DIAGONALS.length];
  const horizontal:Record<string,string>={"↗":"↖","↖":"↗","↘":"↙","↙":"↘"};
  const rotated:Record<string,string>={"↗":"↘","↘":"↙","↙":"↖","↖":"↗"};
  const mirrored=horizontal[base];
  let correct=mirrored;
  const turns=difficulty===1?1:difficulty===2?2:3;
  for(let i=0;i<turns;i+=1) correct=rotated[correct];
  return visualTask(`v6-mirror-rotate-${base}-${turns}`,"mirror",`Welche Form entsteht nach Spiegelung und anschließender ${turns*90}°-Drehung?`,[base,"│","→",mirrored,"↻",`${turns*90}°`,"→","?"],correct,DIAGONALS.filter((item)=>item!==correct),"Zuerst wird gespiegelt, danach das bereits gespiegelte Ergebnis gedreht.");
}

function positionRelation(seed:number,difficulty:Difficulty):VisualTask {
  const start=seed%9; const row=Math.floor(start/3),col=start%3;
  const candidates=[{label:"rechts daneben",dr:0,dc:1},{label:"links daneben",dr:0,dc:-1},{label:"direkt darunter",dr:1,dc:0},{label:"direkt darüber",dr:-1,dc:0}].filter((move)=>row+move.dr>=0&&row+move.dr<3&&col+move.dc>=0&&col+move.dc<3);
  const move=candidates[(seed+difficulty)%candidates.length];
  const target=(row+move.dr)*3+(col+move.dc);
  const visual=Array.from({length:9},(_,index)=>index===start?"●":"·");
  return visualTask(`v5-position-relation-${start}-${target}`,"position",`Welches Feld liegt ${move.label} vom markierten Punkt?`,visual,POSITION_LABELS[target],shuffled(POSITION_LABELS.filter((_,index)=>index!==target)).slice(0,3),"Die Lösung entsteht aus der räumlichen Beziehung zum Ausgangsfeld, nicht aus einer Bewegungsfolge.");
}

function diagonalRelation(seed:number,difficulty:Difficulty):VisualTask {
  const starts=[0,2,6,8,4]; const start=starts[seed%starts.length]; const row=Math.floor(start/3),col=start%3;
  const moves=[{label:"diagonal rechts unten",dr:1,dc:1},{label:"diagonal links unten",dr:1,dc:-1},{label:"diagonal rechts oben",dr:-1,dc:1},{label:"diagonal links oben",dr:-1,dc:-1}].filter((move)=>row+move.dr>=0&&row+move.dr<3&&col+move.dc>=0&&col+move.dc<3);
  const move=moves[(seed+difficulty)%moves.length]; const target=(row+move.dr)*3+(col+move.dc);
  const visual=Array.from({length:9},(_,index)=>index===start?"●":"·");
  return visualTask(`v6-position-diagonal-${start}-${target}`,"position",`Welches Feld liegt ${move.label} vom markierten Punkt?`,visual,POSITION_LABELS[target],shuffled(POSITION_LABELS.filter((_,index)=>index!==target)).slice(0,3),"Die gesuchte Position liegt diagonal zum markierten Ausgangsfeld.");
}

function visualAlternation(seed:number,difficulty:Difficulty):VisualTask {
  const [a,b,c]=shuffled(SHAPES).slice(0,3);
  const visual=difficulty===1?[a,b,a,b,a,"?"]:difficulty===2?[a,b,c,a,b,c,a,"?"]:[a,b,a,c,a,b,a,c,a,"?"];
  const correct=b;
  return visualTask(`v6-pattern-alt-${difficulty}-${a}${b}${c}`,"pattern","Welches Zeichen setzt das Wechselmuster fort?",visual,correct,shuffled(SHAPES.filter((item)=>item!==correct)).slice(0,3),difficulty===3?"Zwei verschachtelte Wechselmuster laufen parallel.":"Die sichtbaren Formen folgen einem wiederkehrenden Wechselmuster.");
}

function matrixShift(seed:number,difficulty:Difficulty):VisualTask {
  const [a,b,c,d]=shuffled(SHAPES).slice(0,4);
  if(difficulty===1) return visualTask(`v6-matrix-pair-${a}${b}`,"matrix","Welches Zeichen ergänzt die Matrix?",[a,b,b,a,a,b,b,"?"],a,shuffled(SHAPES.filter((x)=>x!==a)).slice(0,3),"Jede Zweiergruppe tauscht ihre Reihenfolge.");
  if(difficulty===2) return visualTask(`v6-matrix-shift-${a}${b}${c}`,"matrix","Welche Form fehlt in der verschobenen Matrix?",[a,b,c,b,c,a,c,a,"?"],b,shuffled(SHAPES.filter((x)=>x!==b)).slice(0,3),"Jede Zeile verschiebt die Dreierfolge um eine Position.");
  return visualTask(`v6-matrix-four-${a}${b}${c}${d}`,"matrix","Welche Form schließt die Vierer-Matrix?",[a,b,c,d,b,c,d,a,c,d,a,"?"],b,shuffled(SHAPES.filter((x)=>x!==b)).slice(0,3),"Vier Formen rotieren zyklisch über die Zeilen.");
}

function denseSearch(seed:number,difficulty:Difficulty):VisualTask {
  const [target,base]=shuffled(SHAPES).slice(0,2); const total=difficulty===1?8:difficulty===2?14:20; const targetCount=difficulty===1?1:difficulty===2?2:3;
  const visual=shuffled([...Array.from({length:targetCount},()=>target),...Array.from({length:total-targetCount},()=>base)]);
  return visualTask(`v6-search-count-${target}-${base}-${total}-${targetCount}`,"search",`Wie oft erscheint der Zielreiz ${target}?`,visual,String(targetCount),shuffled(["0","1","2","3","4"].filter((item)=>item!==String(targetCount))).slice(0,3),"Nur der exakte Zielreiz zählt; ähnliche Wiederholungen dienen als Ablenkung.");
}

function compareNearMiss(seed:number,difficulty:Difficulty):VisualTask {
  const length=difficulty===1?4:difficulty===2?5:6; const left=shuffled(SHAPES).slice(0,length); const right=[...left]; const variant=seed%3; let correct="identisch";
  if(variant===1){const i=seed%length,j=(i+1)%length;[right[i],right[j]]=[right[j],right[i]];correct="eine Position anders";} else if(variant===2){right.reverse();correct="umgekehrte Reihenfolge";}
  return visualTask(`v6-compare-near-${left.join("")}-${variant}`,"compare","Welche Beziehung besteht zwischen den beiden Reihen?",[...left,"|",...right],correct,["identisch","eine Position anders","umgekehrte Reihenfolge","nur die Größe ist anders"].filter((item)=>item!==correct),"Vergleiche Reihenfolge und Positionen besonders genau; die Abweichung kann sehr klein sein.");
}

function visualMemoryPair(seed:number,difficulty:Difficulty):VisualTask {
  const length=difficulty===1?4:difficulty===2?6:8; const preview=shuffled(SHAPES).slice(0,length); const first=seed%length; const second=(first+(difficulty===1?1:2))%length;
  const correct=`${preview[first]} ${preview[second]}`;
  const distractors=shuffled(SHAPES.filter((item)=>!correct.includes(item))).slice(0,3).map((item,index)=>`${preview[first]} ${index===0?item:preview[(second+index)%length]}`);
  const options=shuffled([correct,...distractors]).slice(0,4);
  return {id:`v6-memory-pair-${preview.join("")}-${first}-${second}`,mode:"memory",prompt:`Welche Symbole standen an Position ${first+1} und ${second+1}?`,visual:["Position",String(first+1),"+",String(second+1),"?"],options,answer:options.indexOf(correct),explanation:"Zwei Positionen aus derselben zuvor gezeigten Symbolfolge müssen gemeinsam erinnert werden.",preview,previewMs:difficulty===3?2100:difficulty===2?2600:3200};
}

export function createVisualSession(bestScore:number,completedSessions=0,forcedDifficulty?:Difficulty):VisualSession {
  const percent=Math.round((bestScore/VISUAL_SESSION_LENGTH)*100);
  const difficulty=forcedDifficulty??difficultyFromEvidence({percent,attempts:completedSessions*VISUAL_SESSION_LENGTH});
  const recent=new Set(readRecentTaskIds(HISTORY_SCOPE,HISTORY_LIMIT));
  const candidates:VisualTask[]=[];
  for(let round=0;round<8;round+=1){
    const session=createBaseVisualSession(scoreForDifficulty(difficulty)); candidates.push(...session.tasks); const seed=round*23+completedSessions*11+bestScore;
    candidates.push(counterRotation(seed,difficulty),alternatingRotation(seed+3,difficulty),doubleMirror(seed+5,difficulty),mirrorThenRotate(seed+7,difficulty),positionRelation(seed+9,difficulty),diagonalRelation(seed+11,difficulty),visualAlternation(seed+13,difficulty),matrixShift(seed+15,difficulty),denseSearch(seed+17,difficulty),compareNearMiss(seed+19,difficulty),visualMemoryPair(seed+21,difficulty));
  }
  const unique=[...new Map(candidates.map((item)=>[item.id,item])).values()]; const fresh=unique.filter((item)=>!recent.has(item.id)); const source=fresh.length>=VISUAL_SESSION_LENGTH?fresh:unique;
  const tasks=finalizeBalancedSessionTasks(HISTORY_SCOPE,source,VISUAL_SESSION_LENGTH,HISTORY_LIMIT);
  return {difficulty,tasks};
}
