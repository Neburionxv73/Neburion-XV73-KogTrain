import { test, expect } from "@playwright/test";

const devices = [
  { name: "iPhone portrait", viewport: { width: 390, height: 844 } },
  { name: "Samsung portrait", viewport: { width: 412, height: 915 } },
];

const routes = [
  "/training/memory",
  "/training/attention",
  "/training/logic",
  "/training/language",
  "/training/visual",
  "/training/focus",
  "/training/brain-fit",
  "/training/journey",
];

async function expectNoPageOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

for (const device of devices) {
  test.describe(device.name, () => {
    test.use({ viewport: device.viewport });

    test("all training routes stay usable in portrait", async ({ page }) => {
      for (const route of routes) {
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page.locator("body")).toBeVisible();
        await expectNoPageOverflow(page);

        const visibleButtons = page.locator("button:visible");
        expect(await visibleButtons.count()).toBeGreaterThan(0);
      }
    });

    test("all BrainFit areas stay inside the portrait page", async ({ page }) => {
      await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
      const tabs = page.getByRole("tab");
      const count = await tabs.count();
      expect(count).toBe(8);

      for (let index = 0; index < count; index++) {
        await tabs.nth(index).click();
        await expectNoPageOverflow(page);
      }
    });

    test("crossword is reachable and playable without rotating the phone", async ({ page }) => {
      await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
      await page.getByRole("tab", { name: /Kreuz/ }).click();

      const wrap = page.locator(".bfCrosswordWrap");
      const grid = page.locator(".bfCrosswordGrid");
      const fields = grid.locator("input");

      await expect(wrap).toBeVisible();
      await expect(grid).toBeVisible();
      expect(await fields.count()).toBeGreaterThan(0);
      await expectNoPageOverflow(page);

      const dimensions = await wrap.evaluate((el) => ({
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.clientWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(500);

      const last = fields.last();
      await last.scrollIntoViewIfNeeded();
      await last.focus();
      await last.fill("A");
      await expect(last).toHaveValue("A");

      const lastBox = await last.boundingBox();
      expect(lastBox).not.toBeNull();
      if (lastBox) {
        expect(lastBox.x).toBeGreaterThanOrEqual(-1);
        expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(device.viewport.width + 1);
      }

      await page.screenshot({
        path: `test-results/visual/${device.viewport.width}px/brainfit-crossword-portrait.png`,
        fullPage: true,
      });
    });
  });
}
