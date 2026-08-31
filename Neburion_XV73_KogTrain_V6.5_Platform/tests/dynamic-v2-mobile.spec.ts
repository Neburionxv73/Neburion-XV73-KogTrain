import { test, expect, type Page } from "@playwright/test";

const devices = [
  { name: "iPhone portrait", viewport: { width: 390, height: 844 } },
  { name: "Samsung portrait", viewport: { width: 412, height: 915 } },
] as const;

const labs = [
  { route: "/training/memory", start: "Memory Lab 2.0 starten" },
  { route: "/training/attention", start: "Attention Session starten" },
  { route: "/training/logic", start: "Logic Session starten" },
  { route: "/training/language", start: "Language Session starten" },
  { route: "/training/visual", start: "Visual Session starten" },
] as const;

async function expectNoPageOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
}

for (const device of devices) {
  test.describe(`Dynamic Engine V2 · ${device.name}`, () => {
    test.use({ viewport: device.viewport });

    test("all dynamic labs start and remain portrait-playable", async ({ page }) => {
      for (const lab of labs) {
        const response = await page.goto(lab.route, { waitUntil: "networkidle" });
        expect(response?.ok(), `${lab.route} returned ${response?.status()}`).toBeTruthy();
        await expectNoPageOverflow(page);

        const start = page.getByRole("button", { name: lab.start });
        await expect(start).toBeVisible();
        await start.click();
        await expect(page.getByText(/Aufgabe 1\/\d+/).first()).toBeVisible();
        await expectNoPageOverflow(page);
      }
    });
  });
}
