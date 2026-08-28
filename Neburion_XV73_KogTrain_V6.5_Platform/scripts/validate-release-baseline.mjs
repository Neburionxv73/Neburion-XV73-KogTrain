import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const nextConfig = read("next.config.ts");
const layout = read("app/layout.tsx");
const robots = read("app/robots.ts");
const interaction = read("app/interaction-finish-v97.css");
const performance = read("app/performance-baseline-v97.css");

const checks = [
  ["security: nosniff", nextConfig.includes("X-Content-Type-Options") && nextConfig.includes("nosniff")],
  ["security: referrer policy", nextConfig.includes("strict-origin-when-cross-origin")],
  ["security: permissions policy", nextConfig.includes("Permissions-Policy")],
  ["security: clickjacking protection", nextConfig.includes("X-Frame-Options") && nextConfig.includes("DENY")],
  ["security: cross-origin opener policy", nextConfig.includes("Cross-Origin-Opener-Policy")],
  ["seo: environment-aware robots", robots.includes("VERCEL_ENV") && robots.includes("disallow: \"/\"")],
  ["seo: preview noindex metadata", layout.includes("index: false") && layout.includes("follow: false")],
  ["seo: structured metadata", layout.includes("openGraph") && layout.includes("keywords") && layout.includes("applicationName")],
  ["a11y: skip link", layout.includes("className=\"skipLink\"") && layout.includes("href=\"#main-content\"") && layout.includes("id=\"main-content\"") && layout.includes("tabIndex={-1}")],
  ["a11y: visible keyboard focus", interaction.includes(":focus-visible")],
  ["a11y: reduced motion", interaction.includes("prefers-reduced-motion") && performance.includes("prefers-reduced-motion")],
  ["performance: below-fold containment", performance.includes("content-visibility:auto") && performance.includes("contain-intrinsic-size")],
];

const failed = checks.filter(([, pass]) => !pass);
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) throw new Error(`Release baseline failed: ${failed.map(([name]) => name).join(", ")}`);
console.log(`Release baseline PASS (${checks.length}/${checks.length})`);
