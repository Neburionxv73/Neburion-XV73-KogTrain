import { test, expect } from "@playwright/test";

const devices = [
  { name: "iPhone portrait", viewport: { width: 390, height: 844 } },
  { name: "Samsung portrait", viewport: { width: 412, height: 915 } },
];

for (const device of devices) {
  test.describe(`global adaptive v4 · ${device.name}`, () => {
    test.use({ viewport: device.viewport });

    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("neburion-v65-personal-stats-v31", JSON.stringify({
          sessions: 4,
          skillStats: {
            math: { attempts: 10, correct: 8 },
            words: { attempts: 10, correct: 5 },
            translation: { attempts: 0, correct: 0 },
            attention: { attempts: 10, correct: 7 },
            reaction: { attempts: 0, correct: 0 },
            memory: { attempts: 10, correct: 9 },
          },
        }));
        localStorage.setItem("neburion-v65-brain-fit-v372", JSON.stringify({
          sessions: 3,
          totalScore: 240,
          updatedAt: Date.now(),
          areaStats: {
            sudoku: { sessions: 1, totalScore: 100, bestScore: 100 },
            words: { sessions: 1, totalScore: 80, bestScore: 80 },
            crossword: { sessions: 1, totalScore: 60, bestScore: 60 },
            memory: { sessions: 0, totalScore: 0, bestScore: 0 },
            categories: { sessions: 0, totalScore: 0, bestScore: 0 },
            sequence: { sessions: 0, totalScore: 0, bestScore: 0 },
            everydayMath: { sessions: 0, totalScore: 0, bestScore: 0 },
            timeOrder: { sessions: 0, totalScore: 0, bestScore: 0 },
          },
        }));
      });
    });

    test("focus shows an evidence-aware personal plan with unified XP", async ({ page }) => {
      await page.goto("/training/focus", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Dein nächster Trainingsplan." })).toBeVisible();
      await expect(page.getByText("XP gesamt", { exact: true })).toBeVisible();
      await expect(page.getByText(/Priorität 1 · Score/)).toBeVisible();
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("neburion-v67-unified-progress-v2") ?? "null"));
      expect(stored).not.toBeNull();
      expect(stored.xp).toBeGreaterThan(0);
      expect(stored.level).toBeGreaterThanOrEqual(1);
      const planLinks = page.getByRole("link", { name: "Training öffnen →" });
      expect(await planLinks.count()).toBe(3);
      const hrefs = await planLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")).filter(Boolean));
      expect(new Set(hrefs).size).toBeGreaterThanOrEqual(2);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test("BrainFit is connected to the same diverse global plan", async ({ page }) => {
      await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Dein nächster Trainingsplan." })).toBeVisible();
      await expect(page.getByText("Dynamic Training Engine V2 · Global Adaptive", { exact: true })).toBeVisible();
      const links = page.getByRole("link", { name: "Training öffnen →" });
      expect(await links.count()).toBe(3);
      const hrefs = await links.evaluateAll((items) => items.map((item) => item.getAttribute("href")).filter(Boolean));
      expect(new Set(hrefs).size).toBeGreaterThanOrEqual(2);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
