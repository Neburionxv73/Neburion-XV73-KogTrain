import { test, expect } from "@playwright/test";

test("Progress Insights feed the adaptive coach plan", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("neburion-v65-memory-progress", JSON.stringify({ completedSessions: 8, bestScore: 7 }));
    localStorage.setItem("neburion-v65-attention-stats", JSON.stringify({ sessions: 4, bestAccuracy: 58 }));
    localStorage.setItem("neburion-v65-logic-stats-v3", JSON.stringify({ sessions: 1, bestScore: 7 }));
    localStorage.setItem("neburion-v65-language-stats-v3", JSON.stringify({ sessions: 6, bestScore: 7 }));
    localStorage.setItem("neburion-v65-visual-stats", JSON.stringify({ sessions: 0, bestScore: 0 }));
    localStorage.setItem("neburion-v65-brain-fit-v372", JSON.stringify({ sessions: 5, totalScore: 390 }));
  });

  await page.goto("/", { waitUntil: "networkidle" });
  const heading = page.getByRole("heading", { name: "Dein nächster Trainingsschwerpunkt." });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
  await expect(page.getByText("Adaptive Coach · Progress Link V4", { exact: true })).toBeVisible();
  await expect(page.getByText("3 Prioritäten", { exact: true })).toBeVisible();

  const cards = page.locator("article[data-strategy]");
  await expect(cards).toHaveCount(3);
  await expect(page.getByText("Evidenz mittel", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Niveau [123] · (Basis|Aufbau|Challenge)/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Diesen Bereich trainieren →" }).first()).toBeVisible();
});

test("Adaptive progress coach stays portrait-safe", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const heading = page.getByRole("heading", { name: "Dein nächster Trainingsschwerpunkt." });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
});
