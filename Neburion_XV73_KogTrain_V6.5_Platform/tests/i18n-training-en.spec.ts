import { expect, test, type Page } from "@playwright/test";

const routes = [
  ["/training/memory", "Remember. Connect. Recall."],
  ["/training/attention", "Maintain focus. Switch rules. Control distractions."],
  ["/training/logic", "Identify rules. Draw conclusions. Solve problems."],
  ["/training/language", "Understand words. Identify relations. Interpret context."],
  ["/training/visual", "See. Compare. Remember. Think spatially."],
  ["/training/brain-fit", "BrainFit & everyday skills"],
] as const;

const germanSessionPatterns = /\b(Aufgabe|Welche|Welcher|Welches|Wie oft|Scanne|Merke|Präge|Ziffer|Wörter|Richtig wäre|Nächste Aufgabe|Auswertung|Dynamik|Bestwert|Reaktionszeit|Zieltempo|Trainingshinweis|Noch nicht|Regel erkannt|Schlüsse ziehen|Räumlich denken|identisch|umgekehrte Reihenfolge|eine Position anders|nur die Größe ist anders|Neue Variante|Neue Einheit)\b/i;

async function english(page: Page) {
  await page.addInitScript(() => localStorage.setItem("neburion-kogtrain-language", "en"));
}

async function assertSessionEnglish(page: Page) {
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(germanSessionPatterns);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
}

async function advanceChoiceSession(page: Page, rounds = 3) {
  for (let round = 0; round < rounds; round += 1) {
    await assertSessionEnglish(page);
    const option = page.locator("main button:visible").filter({ has: page.locator("kbd") }).first();
    if (!(await option.count())) break;
    await option.click();
    await page.waitForTimeout(80);
    await assertSessionEnglish(page);
    const next = page.getByRole("button", { name: /Next task|Results/i }).first();
    if (!(await next.count())) break;
    await next.click();
    await page.waitForTimeout(80);
  }
}

test.describe("English training mode", () => {
  for (const [route, expected] of routes) {
    test(`${route} renders English shell`, async ({ page }) => {
      await english(page);
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByText(expected, { exact: false }).first()).toBeVisible();
    });
  }

  test("Memory session uses English through memorize and recall", async ({ page }) => {
    await english(page); await page.goto("/training/memory");
    await page.getByRole("button", { name: /Start Memory Lab V5/i }).click();
    await assertSessionEnglish(page);
    await page.waitForTimeout(4800);
    await assertSessionEnglish(page);
    await expect(page.locator("main")).not.toContainText("Wörter mit Leerzeichen eingeben");
    await expect(page.locator("main")).not.toContainText("Antwort prüfen");
  });

  test("Attention session stays English across multiple generated tasks", async ({ page }) => {
    await english(page); await page.goto("/training/attention");
    await page.getByRole("button", { name: /Start Attention session/i }).click();
    await advanceChoiceSession(page, 4);
    await expect(page.locator("main")).not.toContainText("Wie oft erscheint");
    await expect(page.locator("main")).not.toContainText("Scanne das Feld");
  });

  test("Logic session stays English across multiple generated tasks", async ({ page }) => {
    await english(page); await page.goto("/training/logic");
    await page.getByRole("button", { name: /Start Logic session/i }).click();
    await advanceChoiceSession(page, 4);
    await expect(page.locator("main")).not.toContainText("Welche Zahl fehlt innerhalb der Folge?");
    await expect(page.locator("main")).not.toContainText("Welche Ausgabe ist korrekt?");
  });

  test("Language session uses native English tasks across multiple rounds", async ({ page }) => {
    await english(page); await page.goto("/training/language");
    await page.getByRole("button", { name: /Start Language session/i }).click();
    await advanceChoiceSession(page, 4);
    await expect(page.locator("main")).not.toContainText("Welches Wort");
    await expect(page.locator("main")).not.toContainText("Welche Fortsetzung");
  });

  test("Visual session localizes prompts and answer buttons", async ({ page }) => {
    await english(page); await page.goto("/training/visual");
    await page.getByRole("button", { name: /Start Visual session/i }).click();
    await page.waitForTimeout(3400);
    await assertSessionEnglish(page);
    await advanceChoiceSession(page, 4);
    await expect(page.locator("main")).not.toContainText("Präge dir die Reihenfolge ein.");
    await expect(page.locator("main")).not.toContainText("identisch");
    await expect(page.locator("main")).not.toContainText("umgekehrte Reihenfolge");
    await expect(page.locator("main")).not.toContainText("eine Position anders");
  });

  test("BrainFit word search uses native English grid data and English actions", async ({ page }) => {
    await english(page); await page.goto("/training/brain-fit");
    await expect(page.getByRole("button", { name: "Relaxed", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: /Word search/i }).click();
    await expect(page.getByText("Words to find", { exact: true })).toBeVisible();
    const mainText = await page.locator("main").innerText();
    expect(mainText).toMatch(/APPLE|FOREST|MOON|CAT|TREE|BREAD|TRAIN|WINTER|PLANET|HARBOR/);
    expect(mainText).not.toMatch(/APFEL|WALD|MOND|KATZE|BAUM|BROT|ZUG|WINTER\b.*SCHNEE|HAFEN/);
    await expect(page.getByRole("button", { name: /Check selection/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /New variant/i })).toBeVisible();
    await assertSessionEnglish(page);
  });

  test("BrainFit dynamic controls and task areas remain English", async ({ page }) => {
    await english(page); await page.goto("/training/brain-fit");
    await expect(page.getByRole("button", { name: "Relaxed", exact: true })).toBeVisible();
    await assertSessionEnglish(page);
    await expect(page.locator("main")).not.toContainText("Fortschritt ohne Leistungsdruck.");
    await expect(page.locator("main")).not.toContainText("Tier-Sudoku");
    await expect(page.locator("main")).not.toContainText("Noch untrainiert");
  });
});
