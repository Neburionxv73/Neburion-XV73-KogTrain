import { expect, test } from "@playwright/test";

const routes = [
  ["/training/memory", "Remember. Connect. Recall."],
  ["/training/attention", "Maintain focus. Switch rules. Control distractions."],
  ["/training/logic", "Identify rules. Draw conclusions. Solve problems."],
  ["/training/language", "Understand words. Identify relations. Interpret context."],
  ["/training/visual", "See. Compare. Remember. Think spatially."],
  ["/training/brain-fit", "BrainFit & everyday skills"],
] as const;

async function english(page: import("@playwright/test").Page) {
  await page.addInitScript(() => localStorage.setItem("neburion-kogtrain-language", "en"));
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

  test("Memory started task remains English", async ({ page }) => {
    await english(page); await page.goto("/training/memory");
    await page.getByRole("button", { name: /Start Memory Lab V5/i }).click();
    await expect(page.getByText(/Task 1\//i)).toBeVisible();
    await expect(page.getByText(/Aufgabe 1\//i)).toHaveCount(0);
  });

  test("Attention started task remains English", async ({ page }) => {
    await english(page); await page.goto("/training/attention");
    await page.getByRole("button", { name: /Start Attention session/i }).click();
    await expect(page.getByText(/Task 1\//i)).toBeVisible();
    await expect(page.getByText(/Aufgabe 1\//i)).toHaveCount(0);
  });

  test("Logic started task uses English prompt", async ({ page }) => {
    await english(page); await page.goto("/training/logic");
    await page.getByRole("button", { name: /Start Logic session/i }).click();
    await expect(page.getByText(/Task 1\//i)).toBeVisible();
    await expect(page.getByText("Welche Ausgabe ist korrekt?", { exact: true })).toHaveCount(0);
  });

  test("Language started task uses native English bank", async ({ page }) => {
    await english(page); await page.goto("/training/language");
    await page.getByRole("button", { name: /Start Language session/i }).click();
    await expect(page.getByText(/Task 1\//i)).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Welches Wort");
    await expect(page.locator("main")).not.toContainText("Welche Fortsetzung");
  });

  test("Visual intro and started memory preview are localized", async ({ page }) => {
    await english(page); await page.goto("/training/visual");
    await page.getByRole("button", { name: /Start Visual session/i }).click();
    await expect(page.locator("main")).not.toContainText("Aufgabe 1/");
    await expect(page.locator("main")).not.toContainText("Präge dir die Reihenfolge ein.");
  });

  test("BrainFit core controls are English", async ({ page }) => {
    await english(page); await page.goto("/training/brain-fit");
    await expect(page.getByRole("button", { name: "Relaxed", exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Fortschritt ohne Leistungsdruck.");
    await expect(page.locator("main")).not.toContainText("Tier-Sudoku");
  });
});
