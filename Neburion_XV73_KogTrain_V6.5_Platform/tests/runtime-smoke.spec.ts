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
  await page.getByRole("button", { name: /^10 Minuten\b/ }).click();
  await page.getByRole("button", { name: /Gehirnfit & Alltag/ }).click();
  const start = page.getByRole("link", { name: /Jetzt 10 Minuten starten/ });
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

test("Memory exposes Adaptive Difficulty V5 inside the session", async ({ page }) => {
  await page.goto("/training/memory", { waitUntil: "networkidle" });
  const trainer = page.locator("[data-adaptive-level]");
  await expect(trainer).toHaveAttribute("data-adaptive-level", /[123]/);
  await page.getByRole("button", { name: /Memory Lab V5 starten/ }).click();
  await expect(page.getByText(/Dynamik [123]/).first()).toBeVisible();
});

test("Attention exposes Adaptive Difficulty V5 inside the session", async ({ page }) => {
  await page.goto("/training/attention", { waitUntil: "networkidle" });
  const trainer = page.locator("[data-adaptive-level]");
  await expect(trainer).toHaveAttribute("data-adaptive-level", /[123]/);
  await page.getByRole("button", { name: /Attention Session starten/ }).click();
  await expect(page.getByText(/Dynamik [123]/).first()).toBeVisible();
});

test("Logic exposes Adaptive Difficulty V5 inside the session", async ({ page }) => {
  await page.goto("/training/logic", { waitUntil: "networkidle" });
  const trainer = page.locator("[data-adaptive-level]");
  await expect(trainer).toHaveAttribute("data-adaptive-level", /[123]/);
  await page.getByRole("button", { name: /Logic Session starten/ }).click();
  await expect(page.getByText(/Dynamik [123]/).first()).toBeVisible();
});
