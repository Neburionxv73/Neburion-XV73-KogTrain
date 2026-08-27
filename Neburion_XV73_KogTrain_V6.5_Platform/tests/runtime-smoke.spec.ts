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
  await page.getByRole("button", { name: "5 Minuten" }).click();
  await page.getByRole("button", { name: /Gehirnfit & Alltag/ }).click();
  const start = page.getByRole("link", { name: /Jetzt 5 Minuten starten/ });
  await expect(start).toBeVisible();
  await expect(start).toHaveAttribute("href", "/training/brain-fit");
});

test("Focus can start a generated session", async ({ page }) => {
  await page.goto("/training/focus", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Meine Session starten" }).click();
  await expect(page.getByText(/Aufgabe 1\/10/)).toBeVisible();
});

test("BrainFit can start a quiz area", async ({ page }) => {
  await page.goto("/training/brain-fit", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /Kategorien/ }).click();
  await page.getByRole("button", { name: "Einheit starten" }).click();
  await expect(page.locator("h3").filter({ hasText: /.+/ }).first()).toBeVisible();
  await expect(page.locator("button").filter({ hasText: /.+/ }).first()).toBeVisible();
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
