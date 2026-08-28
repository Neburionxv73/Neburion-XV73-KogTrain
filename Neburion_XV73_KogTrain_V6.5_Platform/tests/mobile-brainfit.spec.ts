import { test, expect } from "@playwright/test";

const iphone14 = { width: 390, height: 844 };

test.describe("BrainFit iPhone 14 viewport", () => {
  test.use({ viewport: iphone14 });

  test("word search shows the complete 10-column board without horizontal clipping", async ({ page }) => {
    await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
    const wordsTab = page.getByRole("tab", { name: /Wörter/ });
    await wordsTab.click();

    const grid = page.locator('[class*="wordGrid"]').filter({ has: page.locator('button[class*="wordCell"]') }).first();
    await expect(grid).toBeVisible();
    await expect(grid.locator('button[class*="wordCell"]')).toHaveCount(100);

    const bounds = await grid.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: window.innerWidth };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);

    const pageOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(pageOverflow.scrollWidth).toBeLessThanOrEqual(pageOverflow.clientWidth + 1);

    await page.screenshot({ path: "test-results/visual/iphone14/brainfit-word-search.png", fullPage: true });
  });

  test("BrainFit controls remain inside the iPhone viewport", async ({ page }) => {
    await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
    const interactive = page.locator("button:visible, input:visible");
    const count = await interactive.count();
    for (let index = 0; index < count; index++) {
      const rect = await interactive.nth(index).boundingBox();
      if (!rect) continue;
      expect(rect.x + rect.width).toBeLessThanOrEqual(iphone14.width + 1);
      expect(rect.x).toBeGreaterThanOrEqual(-1);
    }
  });
});
