import { test, expect } from "@playwright/test";

const devices = [
  { name: "iPhone portrait", viewport: { width: 390, height: 844 } },
  { name: "Samsung portrait", viewport: { width: 412, height: 915 } },
];

for (const device of devices) {
  test.describe(`progress insights v4 · ${device.name}`, () => {
    test.use({ viewport: device.viewport });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("neburion-v65-memory-progress", JSON.stringify({ completedSessions: 8, bestScore: 7 }));
        localStorage.setItem("neburion-v65-attention-stats", JSON.stringify({ sessions: 6, bestAccuracy: 82 }));
        localStorage.setItem("neburion-v65-logic-stats-v3", JSON.stringify({ sessions: 4, bestScore: 6 }));
        localStorage.setItem("neburion-v65-language-stats-v3", JSON.stringify({ sessions: 2, bestScore: 5 }));
        localStorage.setItem("neburion-v65-visual-stats", JSON.stringify({ sessions: 0, bestScore: 0 }));
        localStorage.setItem("neburion-v65-brain-fit-v372", JSON.stringify({ sessions: 3, totalScore: 210, areaStats: {} }));
      });
    });

    test("shows evidence, coverage and performance signals without overflow", async ({ page }) => {
      await page.goto("/#fortschritt", { waitUntil: "networkidle" });
      await page.locator("#fortschritt").scrollIntoViewIfNeeded();

      await expect(page.getByRole("heading", { name: "Leistung mit Evidenz einordnen." })).toBeVisible();
      await expect(page.getByText("Progress Insights V4", { exact: true })).toBeVisible();
      await expect(page.getByText("Trainingsabdeckung", { exact: true })).toBeVisible();
      await expect(page.getByText("83%", { exact: true })).toBeVisible();
      await expect(page.getByText("Belastbare Evidenz", { exact: true })).toBeVisible();
      await expect(page.getByText("33%", { exact: true })).toBeVisible();
      await expect(page.getByText("Evidenz hoch", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("Noch offen", { exact: true }).first()).toBeVisible();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
