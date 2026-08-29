import { getActivePlayer, playerStorageKey, setActivePlayer } from "../lib/playerIdentity";

function assert(condition, message) { if (!condition) throw new Error(message); }
const original = globalThis.localStorage;
const map = new Map();
globalThis.localStorage = { getItem:k=>map.has(k)?map.get(k):null, setItem:(k,v)=>map.set(k,String(v)), removeItem:k=>map.delete(k), clear:()=>map.clear(), key:i=>[...map.keys()][i]??null, get length(){return map.size;} };

try {
  const a = setActivePlayer("alice", "Alice");
  localStorage.setItem(playerStorageKey(a.id, "xp"), "120");
  const b = setActivePlayer("bob", "Bob");
  localStorage.setItem(playerStorageKey(b.id, "xp"), "40");
  assert(playerStorageKey(a.id, "xp") !== playerStorageKey(b.id, "xp"), "player keys must be isolated");
  assert(localStorage.getItem(playerStorageKey(a.id, "xp")) === "120", "Alice progress changed");
  assert(localStorage.getItem(playerStorageKey(b.id, "xp")) === "40", "Bob progress changed");
  assert(getActivePlayer().id === "bob", "active identity not persisted");
  console.log("V6.7 player identity isolation PASS");
} finally { if (original) globalThis.localStorage = original; }
