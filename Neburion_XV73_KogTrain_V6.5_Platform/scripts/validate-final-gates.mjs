import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const layout = read("app/layout.tsx");
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
const nextConfig = read("next.config.ts");
const responsive = read("app/responsive-a11y-v97.css");
const interaction = read("app/interaction-finish-v97.css");
const journeyCss = read("components/UnifiedTrainingJourney.module.css");
const progressCss = read("components/ProgressCoachDashboard.module.css");
const brainfit = read("components/BrainFitTraining.tsx");
const brainfitCss = read("app/brainfit-functional-hardening.css");

const checks = [
  ["responsive: tablet breakpoint", /max-width:\s*(900|980)px/.test(journeyCss + progressCss + responsive)],
  ["responsive: mobile breakpoint", /max-width:\s*640px/.test(journeyCss + progressCss + responsive)],
  ["responsive: touch target baseline", responsive.includes("44px") || interaction.includes("44px")],
  ["responsive: journey recomposes", journeyCss.includes("grid-template-columns:1fr") && journeyCss.includes("@media(max-width:640px)")],
  ["responsive: progress recomposes", progressCss.includes("@media(max-width:980px)") && progressCss.includes("@media(max-width:640px)")],
  ["a11y: skip navigation", layout.includes("className=\"skipLink\"") && layout.includes("href=\"#top\"")],
  ["a11y: visible focus", interaction.includes(":focus-visible")],
  ["a11y: reduced motion", interaction.includes("prefers-reduced-motion")],
  ["a11y: stateful controls", brainfit.includes("aria-pressed") || journeyCss.includes("aria-pressed")],
  ["a11y: crossword focus treatment", interaction.includes("bfCrosswordCell") && interaction.includes(":focus-visible")],
  ["brainfit: mobile crossword target", brainfitCss.includes("min-width:44px") || brainfitCss.includes("min-height:44px")],
  ["seo: metadata base", layout.includes("metadataBase") && layout.includes("VERCEL_PROJECT_PRODUCTION_URL")],
  ["seo: canonical", layout.includes("alternates") && layout.includes("canonical")],
  ["seo: sitemap", sitemap.includes("/training/brain-fit") && sitemap.includes("/training/journey")],
  ["seo: robots sitemap", robots.includes("sitemap:") && robots.includes("VERCEL_ENV")],
  ["security: framework fingerprint disabled", nextConfig.includes("poweredByHeader: false")],
  ["security: baseline headers", nextConfig.includes("X-Content-Type-Options") && nextConfig.includes("Permissions-Policy") && nextConfig.includes("X-Frame-Options")],
];

const failed = checks.filter(([, pass]) => !pass);
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) throw new Error(`Final gate baseline failed: ${failed.map(([name]) => name).join(", ")}`);
console.log(`Final gate baseline PASS (${checks.length}/${checks.length})`);
