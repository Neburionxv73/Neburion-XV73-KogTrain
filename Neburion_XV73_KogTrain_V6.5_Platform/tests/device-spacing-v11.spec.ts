import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/training/journey",
  "/training/brain-fit",
  "/training/memory",
  "/training/attention",
  "/training/logic",
  "/training/language",
  "/training/visual",
] as const;

// CSS viewport coverage profiles. These represent common browser layout widths for
// Apple, Samsung and other current phone/tablet classes rather than physical panel pixels.
const profiles = [
  { name:"iPhone 12 mini / 13 mini", width:375, height:812, kind:"phone" },
  { name:"iPhone 12 / 13 / 14", width:390, height:844, kind:"phone" },
  { name:"iPhone 14 Pro", width:393, height:852, kind:"phone" },
  { name:"iPhone 14 Plus / large iPhone", width:428, height:926, kind:"phone" },
  { name:"iPhone Pro Max class", width:430, height:932, kind:"phone" },
  { name:"Samsung Galaxy compact class", width:360, height:800, kind:"phone" },
  { name:"Samsung Galaxy Ultra / Android large", width:412, height:915, kind:"phone" },
  { name:"Pixel / Xiaomi / OnePlus large", width:393, height:873, kind:"phone" },
  { name:"small Android fallback", width:320, height:700, kind:"phone" },
  { name:"iPad mini class", width:768, height:1024, kind:"tablet" },
  { name:"Galaxy Tab portrait class", width:800, height:1280, kind:"tablet" },
  { name:"iPad Air class", width:820, height:1180, kind:"tablet" },
  { name:"iPad Pro 11 class", width:834, height:1194, kind:"tablet" },
  { name:"large Android tablet", width:900, height:1440, kind:"tablet" },
  { name:"iPad Pro 12.9 / 13 class", width:1024, height:1366, kind:"tablet" },
] as const;

function safeName(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}

for (const profile of profiles) {
  test.describe(`${profile.name} spacing`, () => {
    test.use({
      viewport: { width: profile.width, height: profile.height },
      hasTouch: true,
      isMobile: profile.kind === "phone",
    });

    for (const route of routes) {
      test(`${route} keeps safe spacing and no horizontal clipping`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.ok(), `${route} returned ${response?.status()}`).toBeTruthy();
        await expect(page.locator("body")).toBeVisible();

        const geometry = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const visible = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,button,a,input")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              return r.width > 0 && r.height > 0 && style.visibility !== "hidden" && style.display !== "none";
            });

          const clipped = visible.filter((el) => {
            const r = el.getBoundingClientRect();
            return r.left < -1 || r.right > root.clientWidth + 1;
          }).slice(0, 8).map((el) => ({ tag:el.tagName, text:(el.textContent ?? "").trim().slice(0,80), left:el.getBoundingClientRect().left, right:el.getBoundingClientRect().right }));

          const tinyTargets = visible.filter((el) => {
            if (!(el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement || el instanceof HTMLInputElement)) return false;
            const r = el.getBoundingClientRect();
            // Ignore inline text links; enforce the 44px target on controls/navigation surfaces.
            const style = getComputedStyle(el);
            const isControl = el instanceof HTMLButtonElement || el instanceof HTMLInputElement || style.display === "flex" || style.display === "grid" || style.display === "inline-flex";
            return isControl && (r.height < 43 || r.width < 43);
          }).slice(0, 8).map((el) => ({ tag:el.tagName, text:(el.textContent ?? "").trim().slice(0,60), width:el.getBoundingClientRect().width, height:el.getBoundingClientRect().height }));

          return {
            scrollWidth: root.scrollWidth,
            clientWidth: root.clientWidth,
            bodyWidth: body.getBoundingClientRect().width,
            clipped,
            tinyTargets,
          };
        });

        expect(geometry.scrollWidth, `horizontal overflow: ${JSON.stringify(geometry.clipped)}`).toBeLessThanOrEqual(geometry.clientWidth + 1);
        expect(geometry.clipped, `elements clipped at viewport edge`).toEqual([]);
        expect(geometry.tinyTargets, `interactive targets below ~44px`).toEqual([]);

        await page.screenshot({
          path:`test-results/device-spacing/${safeName(profile.name)}/${safeName(route === "/" ? "home" : route)}.png`,
          fullPage:true,
        });
      });
    }
  });
}
