import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/training/journey",
  "/training/focus",
  "/training/brain-fit",
  "/training/memory",
  "/training/attention",
  "/training/logic",
  "/training/language",
  "/training/visual",
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function fileSafe(route: string) {
  return route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-");
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} runtime`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of routes) {
      test(`${route} renders without horizontal page overflow`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.ok(), `${route} returned ${response?.status()}`).toBeTruthy();
        await expect(page.locator("body")).toBeVisible();

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

        await page.screenshot({
          path: `test-results/visual/${viewport.name}/${fileSafe(route)}.png`,
          fullPage: true,
        });
      });
    }
  });
}

test("Journey keeps duration and route selection coherent", async ({ page }) => {
  await page.goto("/training/journey", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^5 Minuten\b/ }).click();
  await page.getByRole("button", { name: /Gehirnfit & Alltag/ }).click();
  const start = page.getByRole("link", { name: /Jetzt 5 Minuten starten/ });
  await expect(start).toBeVisible();
  await expect(start).toHaveAttribute("href", "/training/brain-fit");
});

test("Focus can start a generated session", async ({ page }) => {
  await page.goto("/training/focus", { waitUntil: "networkidle" });
  const start = page.locator("button.primaryButton").first();
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.getByText(/Aufgabe 1\/\d+/)).toBeVisible();
});

test("Focus exposes all six adaptive skill areas", async ({ page }) => {
  await page.goto("/training/focus", { waitUntil: "networkidle" });
  for (const label of [
    "Mathematik",
    "Wort & Sprache",
    "Deutsch ↔ Englisch",
    "Selektive Aufmerksamkeit",
    "Reaktion",
    "Merkfähigkeit",
  ]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
});

test("Focus progress survives a full reload", async ({ page }) => {
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("neburion-v65-personal-stats-v31", JSON.stringify({
      sessions: 1,
      lastAccuracy: 60,
      bestAccuracy: 60,
      history: [today],
      skillStats: {
        math: { attempts: 10, correct: 6 },
        words: { attempts: 0, correct: 0 },
        translation: { attempts: 0, correct: 0 },
        attention: { attempts: 0, correct: 0 },
        reaction: { attempts: 0, correct: 0 },
        memory: { attempts: 0, correct: 0 },
      },
      topicStats: { "math:Plus": { attempts: 10, correct: 6 } },
      reactionStats: {},
      recent: [{ date: today, accuracy: 60, label: "Heute empfohlen · Plus", xp: 80 }],
      xp: 80,
    }));
  });

  await page.goto("/training/focus", { waitUntil: "networkidle" });
  await expect(page.getByText("80 XP gesamt", { exact: true })).toBeVisible();
  await expect(page.getByText("60% · 10 Aufgaben", { exact: true })).toBeVisible();
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByText("80 XP gesamt", { exact: true })).toBeVisible();
  await expect(page.getByText("60% · 10 Aufgaben", { exact: true })).toBeVisible();
});

test("Adaptive engine prioritizes the weakest skill across all six areas", async ({ page }) => {
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("neburion-v65-personal-plan-v31", JSON.stringify({
      areas: ["math", "words", "translation", "attention", "reaction", "memory"],
      topics: [],
      difficulty: 1,
      adaptive: true,
      mode: "standard",
      weeklyTarget: 3,
    }));
    localStorage.setItem("neburion-v65-personal-stats-v31", JSON.stringify({
      sessions: 6,
      lastAccuracy: 82,
      bestAccuracy: 90,
      history: [today, today, today, today, today, today],
      skillStats: {
        math: { attempts: 10, correct: 9 },
        words: { attempts: 10, correct: 9 },
        translation: { attempts: 10, correct: 9 },
        attention: { attempts: 10, correct: 9 },
        reaction: { attempts: 10, correct: 9 },
        memory: { attempts: 10, correct: 2 },
      },
      topicStats: {},
      reactionStats: {},
      recent: [],
      xp: 480,
    }));
  });

  await page.goto("/training/focus", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Symbole", exact: true })).toBeVisible();
  await expect(page.getByText(/Symbole ist in deinem gewählten Lernpfad noch kaum trainiert/)).toBeVisible();

  await page.getByRole("button", { name: "Adaptive Session starten" }).click();
  await expect(page.getByText("Heute empfohlen · Symbole", { exact: true })).toBeVisible();
  await expect(page.getByText(/Aufgabe 1\/10/)).toBeVisible();
});

test("Language lab starts a generated session", async ({ page }) => {
  await page.goto("/training/language", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Language Session starten" }).click();
  await expect(page.getByText(/Aufgabe 1\/\d+/)).toBeVisible();
});

test("Attention lab starts a generated session", async ({ page }) => {
  await page.goto("/training/attention", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Attention Session starten" }).click();
  await expect(page.getByText(/Aufgabe 1\/\d+/)).toBeVisible();
});

test("Memory lab starts its first multimodal task", async ({ page }) => {
  await page.goto("/training/memory", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Memory Lab 2.0 starten" }).click();
  await expect(page.getByText(/Aufgabe 1\/\d+/)).toBeVisible();
});

test("BrainFit can activate a quiz area", async ({ page }) => {
  await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
  const categories = page.getByRole("tab", { name: /Kategorien/ });
  await categories.click();
  await expect(categories).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("h3").filter({ hasText: /.+/ }).first()).toBeVisible();
});

test("Keyboard focus is visible on the homepage", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const focusState = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    return { tag: el.tagName, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusState).not.toBeNull();
  expect(focusState?.outlineStyle).not.toBe("none");
  expect(parseFloat(focusState?.outlineWidth || "0")).toBeGreaterThanOrEqual(2);
});

test("Reduced motion disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(behavior).toBe("auto");
});
