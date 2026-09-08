import { test, expect, type BrowserContext } from "@playwright/test";

type CloudState = {
  schemaVersion: 1;
  player: { id: string; name: string; createdAt: string; schemaVersion: 1 };
  progress: Record<string, string | null>;
  exportedAt: string;
};

const USER = { id: "qa-cloud-user", loginName: "qa-cloud-user", name: "QA Cloud" };
const ACTIVE_PLAYER_KEY = "neburion-v67-active-player";
const UNIFIED_KEY = "neburion-v67-unified-progress-v2";
const HISTORY_KEY = "neburion-v66-task-history:visual-v4";

function json(route: Parameters<Parameters<BrowserContext["route"]>[1]>[0], body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function installCloudMock(
  context: BrowserContext,
  state: { value: CloudState | null },
  writes: CloudState[],
) {
  await context.route("**/api/account", async (route) => {
    if (route.request().method() === "GET") return json(route, { user: USER, cloudConfigured: true });
    return json(route, { error: "QA mock only supports GET" }, 405);
  });

  await context.route("**/api/player-state", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      return json(route, { state: state.value, updatedAt: state.value ? "2026-09-08T08:00:00.000Z" : null });
    }
    if (request.method() === "PUT") {
      const payload = request.postDataJSON() as { state?: CloudState };
      if (!payload.state) return json(route, { error: "missing state" }, 400);
      state.value = payload.state;
      writes.push(payload.state);
      return json(route, { updatedAt: "2026-09-08T08:00:01.000Z" });
    }
    return json(route, { error: "unsupported method" }, 405);
  });
}

async function readProgress(page: import("@playwright/test").Page) {
  return page.evaluate(({ activeKey, unifiedKey, historyKey }) => ({
    active: localStorage.getItem(activeKey),
    unified: localStorage.getItem(unifiedKey),
    history: localStorage.getItem(historyKey),
  }), { activeKey: ACTIVE_PLAYER_KEY, unifiedKey: UNIFIED_KEY, historyKey: HISTORY_KEY });
}

test("cloud state survives Device A -> Device B restore before any B save", async ({ browser }) => {
  const server = { value: null as CloudState | null };
  const deviceAWrites: CloudState[] = [];
  const deviceBWrites: CloudState[] = [];
  const deviceCWrites: CloudState[] = [];

  const player = { id: "qa-player-a", name: "QA Spieler", createdAt: "2026-09-08T07:00:00.000Z", schemaVersion: 1 as const };
  const progressA = JSON.stringify({ xp: 420, level: 4, sessions: 9, average: 86, trainedAreas: ["memory", "visual"] });
  const historyA = JSON.stringify([{ id: "visual-v4-7", score: 88 }, { id: "memory-v4-3", score: 91 }]);

  // Device A starts with a real local player state and an empty cloud account.
  const deviceA = await browser.newContext();
  await installCloudMock(deviceA, server, deviceAWrites);
  await deviceA.addInitScript(({ activeKey, unifiedKey, historyKey, playerValue, unifiedValue, historyValue }) => {
    localStorage.setItem(activeKey, JSON.stringify(playerValue));
    localStorage.setItem(unifiedKey, unifiedValue);
    localStorage.setItem(historyKey, historyValue);
  }, { activeKey: ACTIVE_PLAYER_KEY, unifiedKey: UNIFIED_KEY, historyKey: HISTORY_KEY, playerValue: player, unifiedValue: progressA, historyValue: historyA });

  const pageA = await deviceA.newPage();
  await pageA.goto("/", { waitUntil: "domcontentloaded" });
  await expect.poll(() => deviceAWrites.length, { message: "Device A should create the first cloud snapshot" }).toBeGreaterThan(0);
  expect(server.value?.progress[UNIFIED_KEY]).toBe(progressA);
  expect(server.value?.progress[HISTORY_KEY]).toBe(historyA);
  expect(server.value?.player.id).toBe(player.id);

  // Device B is a completely fresh browser context. Its first operation must be
  // remote hydration, never an empty/default PUT that could overwrite Device A.
  const deviceB = await browser.newContext();
  await installCloudMock(deviceB, server, deviceBWrites);
  const pageB = await deviceB.newPage();
  await pageB.goto("/", { waitUntil: "domcontentloaded" });

  await expect.poll(async () => (await readProgress(pageB)).unified).toBe(progressA);
  const restoredB = await readProgress(pageB);
  expect(restoredB.history).toBe(historyA);
  expect(JSON.parse(restoredB.active ?? "{}").id).toBe(player.id);
  expect(deviceBWrites, "Device B must restore before it is allowed to save").toHaveLength(0);

  // A training change on B must then become the new cloud truth.
  const progressB = JSON.stringify({ xp: 560, level: 5, sessions: 11, average: 89, trainedAreas: ["memory", "visual", "logic"] });
  const historyB = JSON.stringify([{ id: "visual-v4-7", score: 88 }, { id: "logic-v4-9", score: 94 }]);
  await pageB.evaluate(({ unifiedKey, historyKey, unifiedValue, historyValue }) => {
    localStorage.setItem(unifiedKey, unifiedValue);
    localStorage.setItem(historyKey, historyValue);
    window.dispatchEvent(new Event("online"));
  }, { unifiedKey: UNIFIED_KEY, historyKey: HISTORY_KEY, unifiedValue: progressB, historyValue: historyB });

  await expect.poll(() => server.value?.progress[UNIFIED_KEY]).toBe(progressB);
  expect(server.value?.progress[HISTORY_KEY]).toBe(historyB);
  expect(deviceBWrites.length).toBeGreaterThan(0);

  // A second fresh device/session proves that B's new XP/history can be restored too.
  const deviceC = await browser.newContext();
  await installCloudMock(deviceC, server, deviceCWrites);
  const pageC = await deviceC.newPage();
  await pageC.goto("/", { waitUntil: "domcontentloaded" });
  await expect.poll(async () => (await readProgress(pageC)).unified).toBe(progressB);
  const restoredC = await readProgress(pageC);
  expect(restoredC.history).toBe(historyB);
  expect(deviceCWrites, "Fresh device must not write before remote hydration").toHaveLength(0);

  await deviceC.close();
  await deviceB.close();
  await deviceA.close();
});
