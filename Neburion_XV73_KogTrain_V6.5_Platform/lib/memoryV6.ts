import {
  createMemorySession as createBaseMemorySession,
  MEMORY_SESSION_LENGTH,
  MEMORY_STORAGE_KEY,
  normalizeMemoryInput,
  type MemoryMode,
  type MemorySession,
  type MemoryTask,
} from "./memory";
import { finalizeBalancedSessionTasks, type Difficulty } from "@/lib/dynamicTraining";
import { delayedMatch, digitPairRecall, positionMissing, symbolPairRecall, wordIntrusion } from "./memoryExpansion";

export { MEMORY_SESSION_LENGTH, MEMORY_STORAGE_KEY, normalizeMemoryInput };
export type { MemoryMode, MemorySession, MemoryTask };

const WORDS_DE=["Apfel","Mond","Brücke","Fuchs","Kerze","Wolke","Schlüssel","Wald","Fenster","Fluss","Stern","Berg","Feder","Tasse","Blatt","Turm","Regen","Klang","Stein","Pfad","Lampe","Kreis","Nebel","Garten","Anker","Brot","Insel","Jacke","Karte","Leiter","Mühle","Orange","Pinsel","Quelle","Ring","Schale","Trommel","Ufer","Vogel","Wiese"];
const WORDS_EN=["Apple","Moon","Bridge","Fox","Candle","Cloud","Key","Forest","Window","River","Star","Mountain","Feather","Cup","Leaf","Tower","Rain","Sound","Stone","Path","Lamp","Circle","Mist","Garden","Anchor","Bread","Island","Jacket","Map","Ladder","Mill","Orange","Brush","Spring","Ring","Bowl","Drum","Shore","Bird","Meadow"];

function extraTasks(difficulty:Difficulty,seed:number,language:"de"|"en"):MemoryTask[]{
  const words=language==="en"?WORDS_EN:WORDS_DE;
  return [
    digitPairRecall(difficulty,seed+3),
    wordIntrusion(difficulty,seed+7,words),
    symbolPairRecall(difficulty,seed+11),
    positionMissing(difficulty,seed+17),
    delayedMatch(difficulty,seed+23),
  ];
}

export function createMemorySession(bestScore:number,language:"de"|"en"="de"):MemorySession{
  const base=createBaseMemorySession(bestScore,language);
  const seed=(Date.now()%100000)+(bestScore*131);
  const candidates=[...base.tasks];
  for(let round=0;round<4;round+=1)candidates.push(...extraTasks(base.difficulty,seed+round*41,language));
  const tasks=finalizeBalancedSessionTasks("memory-v6",candidates,MEMORY_SESSION_LENGTH,176);
  return {...base,tasks};
}
