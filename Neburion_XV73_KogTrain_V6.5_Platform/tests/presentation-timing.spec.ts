import { expect, test, type Locator, type Page } from "@playwright/test";
import { taskPreviewDurationMs } from "../lib/trainingTiming";

const NEXT = /^(Next task|Results|Nächste Aufgabe|Auswertung)$/i;
const CLOCK_START = new Date("2026-01-01T08:00:00Z");
const CLOCK_PAUSE = new Date("2026-01-01T09:00:00Z");

async function prepare(
  page: Page,
  language: "de" | "en",
  route: string,
  key: string,
  value: Record<string, unknown>,
) {
  await page.clock.install({ time: CLOCK_START });
  await page.addInitScript((lang) => {
    localStorage.setItem("neburion-kogtrain-language", lang);
  }, language);
  await page.goto(route, { waitUntil: "networkidle" });
  // Write through the mounted player-storage bridge so the active profile is used.
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key, value });
  await page.reload({ waitUntil: "networkidle" });
  await page.clock.pauseAt(CLOCK_PAUSE);
}

async function assertFullPreview(
  page: Page,
  trainer: Locator,
  before: "memorize" | "preview",
  after: "recall" | "question",
) {
  await expect(trainer).toHaveAttribute("data-training-phase", before);
  await expect(trainer).toHaveAttribute("data-preview-duration-ms", "13000");
  await expect(trainer.locator("button:visible, input:visible")).toHaveCount(0);
  // Keyboard shortcuts must not bypass the preview either.
  await page.keyboard.press("1");
  await page.clock.runFor(12_999);
  await expect(trainer).toHaveAttribute("data-training-phase", before);
  await expect(trainer.locator("button:visible, input:visible")).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(trainer).toHaveAttribute("data-training-phase", after);
  await expect(trainer.locator("button:visible, input:visible").first()).toBeVisible();
}

test("preview duration keeps a 13-second floor and preserves longer values", () => {
  for (const requested of [undefined, NaN, Infinity, -Infinity, -1, 0, 2_100, 3_000, 3_800, 4_600, 12_999, 13_000]) {
    expect(taskPreviewDurationMs(requested)).toBe(13_000);
  }
  expect(taskPreviewDurationMs(18_000)).toBe(18_000);
  expect(taskPreviewDurationMs(13_000.1)).toBe(13_001);
  expect(taskPreviewDurationMs(Number.MAX_VALUE)).toBe(2_147_483_647);
});

for (const language of ["de", "en"] as const) {
  for (const [level, bestScore] of [[1, 0], [2, 5], [3, 7]] as const) {
    test(`Memory ${language} level ${level}: every task gets the full 13 seconds`, async ({ page }) => {
      test.setTimeout(60_000);
      await prepare(page, language, "/training/memory", "neburion-v65-memory-progress", {
        bestScore, completedSessions: 10, lastScore: bestScore,
      });
      const trainer = page.locator('[data-training-lab="memory"]');
      await trainer.getByRole("button", { name: /Start Memory Lab V5|Memory Lab V5 starten/i }).click();
      await expect(trainer).toHaveAttribute("data-adaptive-level", String(level));
      await assertFullPreview(page, trainer, "memorize", "recall");
      const input = trainer.locator("#memory-answer");
      if (await input.count()) {
        await input.fill("0");
        await trainer.getByRole("button", { name: /Check answer|Antwort prüfen/i }).click();
      } else {
        await trainer.locator("button:visible").first().click();
      }
      await expect(trainer).toHaveAttribute("data-training-phase", "feedback");
      await trainer.getByRole("button", { name: NEXT }).click();
      await assertFullPreview(page, trainer, "memorize", "recall");
    });

    test(`Focus ${language} level ${level}: memory previews keep 13 seconds`, async ({ page }) => {
      test.setTimeout(60_000);
      await prepare(page, language, "/training/focus", "neburion-v65-personal-plan-v31", {
        areas: ["memory"], topics: ["zahlen"], difficulty: level,
        adaptive: false, mode: "short", weeklyTarget: 3,
      });
      const trainer = page.locator('[data-training-lab="focus"]');
      await trainer.locator("button.primaryButton").last().click();
      await assertFullPreview(page, trainer, "preview", "question");
    });
  }

  test(`Visual ${language}: a generated memory task keeps 13 seconds`, async ({ page }) => {
    test.setTimeout(120_000);
    await prepare(page, language, "/training/visual", "neburion-v65-visual-stats", {
      bestScore: 7, sessions: 10, modeStats: {},
    });
    const trainer = page.locator('[data-training-lab="visual"]');
    await trainer.getByRole("button", { name: /Start Visual session|Visual Session starten/i }).click();
    // Recipes may omit memory. Walk real generated tasks; never silently skip the check.
    for (let step = 0; step < 64; step += 1) {
      const phase = await trainer.getAttribute("data-training-phase");
      if (phase === "preview") {
        await assertFullPreview(page, trainer, "preview", "question");
        return;
      }
      if (phase === "question") {
        await trainer.locator("button:visible").first().click();
        await expect(trainer).toHaveAttribute("data-training-phase", "feedback");
      } else if (phase === "feedback") {
        await trainer.getByRole("button", { name: NEXT }).click();
      } else if (phase === "done") {
        await trainer.getByRole("button", { name: /New Visual session|Neue Visual Session/i }).click();
      } else {
        throw new Error(`Unexpected visual phase: ${phase}`);
      }
    }
    throw new Error("No visual memory preview was exercised within 64 transitions.");
  });
}
