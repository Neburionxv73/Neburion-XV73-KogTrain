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

const legacy = getActivePlayer();
localStorage.setItem("neburion-v65-memory-progress", JSON.stringify({ completedSessions: 3, bestScore: 7 }));
snapshotActivePlayerProgress(legacy.id);

const anna = createAndActivatePlayer("Anna");
assert(anna.id !== legacy.id, "new profile must receive its own identity");
assert(localStorage.getItem("neburion-v65-memory-progress") === null, "new profile must start without legacy progress");
localStorage.setItem("neburion-v65-memory-progress", JSON.stringify({ completedSessions: 1, bestScore: 5 }));

switchActivePlayer(legacy.id);
assert(JSON.parse(localStorage.getItem("neburion-v65-memory-progress")).completedSessions === 3, "legacy player progress was not restored");

switchActivePlayer(anna.id);
assert(JSON.parse(localStorage.getItem("neburion-v65-memory-progress")).completedSessions === 1, "Anna progress was not restored");
assert(localStorage.getItem(playerStorageKey(legacy.id, "neburion-v65-memory-progress")) !== localStorage.getItem(playerStorageKey(anna.id, "neburion-v65-memory-progress")), "player save slots must remain isolated");
assert(getPlayers().length >= 2, "player registry must contain both profiles");
assert(getActivePlayer().id === anna.id, "active identity must persist after switching");

console.log("V6.7 player identity + save isolation PASS");
