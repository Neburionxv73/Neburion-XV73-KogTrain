const store = new Map();
globalThis.window = globalThis;
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
  key: (index) => [...store.keys()][index] ?? null,
  get length() { return store.size; },
};

const {
  createAndActivatePlayer,
  getActivePlayer,
  getPlayers,
  playerStorageKey,
  snapshotActivePlayerProgress,
  switchActivePlayer,
} = await import("../lib/playerIdentity.ts");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const MEMORY_KEY = "neburion-v65-memory-progress";
const STATS_KEY = "neburion-v65-personal-stats-v31";
const PLAN_KEY = "neburion-v65-personal-plan-v31";

const legacy = getActivePlayer();
localStorage.setItem(MEMORY_KEY, JSON.stringify({ completedSessions: 3, bestScore: 7 }));
localStorage.setItem(STATS_KEY, JSON.stringify({ sessions: 4, xp: 320, bestAccuracy: 90, skillStats: { math: { attempts: 20, correct: 18 } } }));
localStorage.setItem(PLAN_KEY, JSON.stringify({ areas: ["math"], difficulty: 2, adaptive: true }));
snapshotActivePlayerProgress(legacy.id);

const anna = createAndActivatePlayer("Anna");
assert(anna.id !== legacy.id, "new profile must receive its own identity");
assert(localStorage.getItem(MEMORY_KEY) === null, "new profile must start without legacy memory progress");
assert(localStorage.getItem(STATS_KEY) === null, "new profile must start without legacy XP/statistics");
assert(localStorage.getItem(PLAN_KEY) === null, "new profile must start without legacy adaptive plan");

localStorage.setItem(MEMORY_KEY, JSON.stringify({ completedSessions: 1, bestScore: 5 }));
localStorage.setItem(STATS_KEY, JSON.stringify({ sessions: 1, xp: 80, bestAccuracy: 60, skillStats: { math: { attempts: 10, correct: 6 } } }));
localStorage.setItem(PLAN_KEY, JSON.stringify({ areas: ["words"], difficulty: 1, adaptive: true }));

switchActivePlayer(legacy.id);
assert(JSON.parse(localStorage.getItem(MEMORY_KEY)).completedSessions === 3, "legacy player memory progress was not restored");
assert(JSON.parse(localStorage.getItem(STATS_KEY)).xp === 320, "legacy player XP was not restored");
assert(JSON.parse(localStorage.getItem(STATS_KEY)).sessions === 4, "legacy player session count was not restored");
assert(JSON.parse(localStorage.getItem(PLAN_KEY)).areas[0] === "math", "legacy adaptive plan was not restored");

switchActivePlayer(anna.id);
assert(JSON.parse(localStorage.getItem(MEMORY_KEY)).completedSessions === 1, "Anna memory progress was not restored");
assert(JSON.parse(localStorage.getItem(STATS_KEY)).xp === 80, "Anna XP was not restored");
assert(JSON.parse(localStorage.getItem(STATS_KEY)).sessions === 1, "Anna session count was not restored");
assert(JSON.parse(localStorage.getItem(PLAN_KEY)).areas[0] === "words", "Anna adaptive plan was not restored");

for (const key of [MEMORY_KEY, STATS_KEY, PLAN_KEY]) {
  assert(
    localStorage.getItem(playerStorageKey(legacy.id, key)) !== localStorage.getItem(playerStorageKey(anna.id, key)),
    `${key} save slots must remain isolated`,
  );
}

assert(getPlayers().length >= 2, "player registry must contain both profiles");
assert(getActivePlayer().id === anna.id, "active identity must persist after switching");

console.log("V6.7 player identity + XP + adaptive save isolation PASS");
