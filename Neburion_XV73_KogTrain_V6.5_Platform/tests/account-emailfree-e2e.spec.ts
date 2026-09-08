import { test, expect, type BrowserContext, type Route } from "@playwright/test";

type CloudState = {
  schemaVersion: 1;
  player: { id: string; name: string; createdAt: string; schemaVersion: 1 };
  progress: Record<string, string | null>;
  exportedAt: string;
};

type SharedServer = {
  user: { id: string; loginName: string; name: string } | null;
  password: string;
  recoveryCode: string;
  cloud: CloudState | null;
  accountPosts: Record<string, unknown>[];
};

type Session = { authenticated: boolean };

const UNIFIED_KEY = "neburion-v67-unified-progress-v2";
const HISTORY_KEY = "neburion-v66-task-history:memory-v5";
const ACTIVE_PLAYER_KEY = "neburion-v67-active-player";

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function installServerMock(context: BrowserContext, server: SharedServer, session: Session) {
  await context.route("**/api/account", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      return json(route, session.authenticated && server.user
        ? { authenticated: true, cloudConfigured: true, user: server.user }
        : { authenticated: false, cloudConfigured: true });
    }

    if (request.method() === "DELETE") {
      session.authenticated = false;
      return json(route, { authenticated: false });
    }

    if (request.method() !== "POST") return json(route, { error: "unsupported" }, 405);
    const body = request.postDataJSON() as Record<string, unknown>;
    server.accountPosts.push(body);

    if (body.action === "register") {
      server.user = { id: "qa-account-user", loginName: String(body.loginName), name: String(body.name) };
      server.password = String(body.password);
      session.authenticated = true;
      return json(route, { authenticated: true, cloudConfigured: true, user: server.user, recoveryCode: server.recoveryCode });
    }

    if (body.action === "recover") {
      if (body.identifier !== server.user?.loginName || body.recoveryCode !== server.recoveryCode) {
        return json(route, { error: "Wiederherstellungscode ist ungültig." }, 401);
      }
      server.password = String(body.newPassword);
      return json(route, { recovered: true });
    }

    if (body.identifier !== server.user?.loginName || body.password !== server.password) {
      return json(route, { error: "Kontoname oder Passwort ist falsch." }, 401);
    }
    session.authenticated = true;
    return json(route, { authenticated: true, cloudConfigured: true, user: server.user });
  });

  await context.route("**/api/player-state", async (route) => {
    const request = route.request();
    if (!session.authenticated) return json(route, { error: "Nicht angemeldet." }, 401);
    if (request.method() === "GET") {
      return json(route, { state: server.cloud, updatedAt: server.cloud ? "2026-09-08T08:20:00.000Z" : null });
    }
    if (request.method() === "PUT") {
      const body = request.postDataJSON() as { state?: CloudState };
      if (!body.state) return json(route, { error: "missing state" }, 400);
      server.cloud = body.state;
      return json(route, { updatedAt: "2026-09-08T08:20:01.000Z" });
    }
    return json(route, { error: "unsupported" }, 405);
  });
}

test("email-free account lifecycle: register, recovery, login and second-device restore", async ({ browser }) => {
  const server: SharedServer = {
    user: null,
    password: "",
    recoveryCode: "ABCD-EFGH-IJKL",
    cloud: null,
    accountPosts: [],
  };

  const deviceA = await browser.newContext();
  const sessionA = { authenticated: false };
  await installServerMock(deviceA, server, sessionA);
  const pageA = await deviceA.newPage();
  await pageA.goto("/account", { waitUntil: "domcontentloaded" });

  await pageA.getByRole("button", { name: "Cloud-Konto erstellen" }).first().click();
  await pageA.getByLabel("Spielername").fill("QA Spieler");
  await pageA.getByLabel("Kontoname").fill("qa-spieler");
  await pageA.getByLabel("Passwort").fill("StartPasswort88!");
  await pageA.getByRole("button", { name: "Cloud-Konto erstellen" }).last().click();

  await expect(pageA.getByText("Wiederherstellungscode jetzt sichern")).toBeVisible();
  await expect(pageA.getByText(server.recoveryCode)).toBeVisible();
  expect(server.accountPosts[0]).toMatchObject({ action: "register", name: "QA Spieler", loginName: "qa-spieler", password: "StartPasswort88!" });
  expect(Object.keys(server.accountPosts[0]).some((key) => /email/i.test(key))).toBeFalsy();

  const player = { id: "qa-player", name: "QA Spieler", createdAt: "2026-09-08T08:00:00.000Z", schemaVersion: 1 as const };
  const unifiedA = JSON.stringify({ xp: 780, level: 6, sessions: 14, average: 91, trainedAreas: ["memory", "logic"] });
  const historyA = JSON.stringify([{ id: "memory-v5-1", score: 93 }]);
  await pageA.evaluate(({ activeKey, unifiedKey, historyKey, playerValue, unifiedValue, historyValue }) => {
    localStorage.setItem(activeKey, JSON.stringify(playerValue));
    localStorage.setItem(unifiedKey, unifiedValue);
    localStorage.setItem(historyKey, historyValue);
  }, { activeKey: ACTIVE_PLAYER_KEY, unifiedKey: UNIFIED_KEY, historyKey: HISTORY_KEY, playerValue: player, unifiedValue: unifiedA, historyValue: historyA });

  await pageA.getByRole("button", { name: /Code sicher gespeichert/ }).click();
  await expect.poll(() => server.cloud?.progress[UNIFIED_KEY]).toBe(unifiedA);
  expect(server.cloud?.progress[HISTORY_KEY]).toBe(historyA);

  await pageA.getByRole("button", { name: "Abmelden" }).click();
  await expect(pageA.getByRole("button", { name: "Anmelden" }).first()).toBeVisible();

  await pageA.getByRole("button", { name: "Passwort vergessen" }).click();
  await pageA.getByLabel("Kontoname").fill("qa-spieler");
  await pageA.getByLabel("Wiederherstellungscode").fill(server.recoveryCode);
  await pageA.getByLabel("Neues Passwort").fill("NeuesPasswort99!");
  await pageA.getByRole("button", { name: "Passwort zurücksetzen" }).click();
  await expect(pageA.getByText(/Passwort geändert/)).toBeVisible();

  await pageA.getByLabel("Kontoname").fill("qa-spieler");
  await pageA.getByLabel("Passwort").fill("NeuesPasswort99!");
  await pageA.getByRole("button", { name: "Anmelden" }).last().click();
  await expect.poll(() => sessionA.authenticated).toBeTruthy();

  const deviceB = await browser.newContext();
  const sessionB = { authenticated: false };
  await installServerMock(deviceB, server, sessionB);
  const pageB = await deviceB.newPage();
  await pageB.goto("/account", { waitUntil: "domcontentloaded" });
  await pageB.getByRole("button", { name: "Anmelden" }).first().click();
  await pageB.getByLabel("Kontoname").fill("qa-spieler");
  await pageB.getByLabel("Passwort").fill("NeuesPasswort99!");
  await pageB.getByRole("button", { name: "Anmelden" }).last().click();

  await expect.poll(async () => pageB.evaluate((key) => localStorage.getItem(key), UNIFIED_KEY)).toBe(unifiedA);
  expect(await pageB.evaluate((key) => localStorage.getItem(key), HISTORY_KEY)).toBe(historyA);
  expect(JSON.parse((await pageB.evaluate((key) => localStorage.getItem(key), ACTIVE_PLAYER_KEY)) ?? "{}").id).toBe(player.id);

  expect(server.accountPosts.every((post) => !Object.keys(post).some((key) => /email/i.test(key)))).toBeTruthy();

  await deviceB.close();
  await deviceA.close();
});
