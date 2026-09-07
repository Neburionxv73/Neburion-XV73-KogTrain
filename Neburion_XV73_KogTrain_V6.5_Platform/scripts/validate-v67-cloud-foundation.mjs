import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));
const db = read("lib/server/db.ts");
const auth = read("lib/server/auth.ts");
const account = read("app/api/account/route.ts");
const state = read("app/api/player-state/route.ts");
const identity = read("lib/playerIdentity.ts");
const bridge = read("components/CloudPlayerBridge.tsx");
const layout = read("app/layout.tsx");
const accountPage = read("app/account/page.tsx");

const checks = [
  ["postgres dependency present", Boolean(pkg.dependencies?.postgres)],
  ["database requires DATABASE_URL", db.includes("DATABASE_URL_NOT_CONFIGURED")],
  ["schema separates users and player state", db.includes("kogtrain_users") && db.includes("kogtrain_player_state")],
  ["passwords use scrypt", auth.includes("scryptSync") && auth.includes("timingSafeEqual")],
  ["sessions require AUTH_SECRET", auth.includes("AUTH_SECRET_NOT_CONFIGURED") && auth.includes("httpOnly") === false],
  ["account endpoint supports register/login", account.includes('action === "register"') && account.includes("verifyPassword")],
  ["session cookie is httpOnly", account.includes("httpOnly: true") && account.includes('sameSite: "lax"')],
  ["cloud save endpoint is authenticated", state.includes("verifySessionToken") && state.includes("kogtrain_player_state")],
  ["cloud payload size is bounded", state.includes("750_000")],
  ["portable player state export exists", identity.includes("exportActivePlayerState") && identity.includes("importPlayerState")],
  ["unified XP and level state is cloud-managed", identity.includes('"neburion-v67-unified-progress-v2"')],
  ["dynamic training history is cloud-managed", identity.includes("DYNAMIC_HISTORY_PREFIX") && identity.includes("dynamicProgressKeys")],
  ["cloud bridge performs restore and save", bridge.includes("importPlayerState") && bridge.includes('method: "PUT"')],
  ["cloud restore happens before save enablement", bridge.indexOf("importPlayerState(data.state)") < bridge.indexOf("hydrated = true")],
  ["cloud saves are serialized", bridge.includes("saving = true") && bridge.includes("savePending = true")],
  ["cloud checkpoints on device lifecycle", bridge.includes('"pagehide"') && bridge.includes('"visibilitychange"') && bridge.includes('"online"')],
  ["cloud bridge mounted globally", layout.includes("<CloudPlayerBridge />")],
  ["account UI exists", accountPage.includes("<AccountPanel />")],
];

let failed = 0;
for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}`);
  if (!pass) failed++;
}
if (failed) process.exit(1);
console.log(`V6.7 cloud account foundation PASS (${checks.length}/${checks.length})`);
