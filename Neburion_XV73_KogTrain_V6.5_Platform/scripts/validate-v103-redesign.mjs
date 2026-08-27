import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const expect = (name, condition) => checks.push({ name, pass: Boolean(condition) });

const layout = read("app/layout.tsx");
const home = read("app/page.tsx");
const foundation = read("app/raptor-v103-clean-foundation.css");
const nav = read("components/TopNav.tsx");
const packageJson = JSON.parse(read("package.json"));

expect("Single V10.3 foundation imported", layout.includes('import "./raptor-v103-clean-foundation.css";'));
expect("Legacy V10.3 redesign layer not imported", !layout.includes('import "./raptor-v103-redesign.css";'));
expect("Legacy typography collision patch not imported", !layout.includes('import "./v103-typography-collision-fix.css";'));
expect("V10.3 identity visible", home.includes("Raptor Delta V10.3") && nav.includes("Raptor Delta V10.3"));
expect("Editorial hero present", home.includes("Trainiere klarer. Lerne bewusster."));
expect("Status band present", home.includes("v103-statusBand") && home.includes("Editorial statt Dashboard"));
expect("Three training paths preserved", home.includes("Trainingswege") && home.includes("03"));
expect("Five specialist labs preserved", home.includes("Spezial-Labs") && home.includes("05"));
expect("BrainFit stage preserved", home.includes("Gehirnfit & Alltag") && home.includes("12"));
expect("Progress dashboard preserved", home.includes("DeferredProgressCoachDashboard"));
expect("Training routes preserved", home.includes('/training/journey') && home.includes('/training/focus') && home.includes('/training/brain-fit'));
expect("Cheerful token system", foundation.includes("--k-surface-sun") && foundation.includes("--k-surface-peach") && foundation.includes("--k-mint") && foundation.includes("--k-blue"));
expect("Collision-safe headline scale", foundation.includes("font-size:clamp(54px,7vw,104px)") && foundation.includes("line-height:.98"));
expect("Desktop specialist grid", foundation.includes("grid-template-columns:repeat(12,minmax(0,1fr))"));
expect("Tablet recomposition", foundation.includes("@media(max-width:1100px)"));
expect("Mobile reprioritization", foundation.includes("@media(max-width:560px)"));
expect("Touch target baseline", foundation.includes("min-height:52px"));
expect("Reduced motion respected", foundation.includes("prefers-reduced-motion"));
expect("A11Y skip link retained", layout.includes('className="skipLink"') && layout.includes('lang="de"'));
expect("Production robots policy retained", layout.includes("VERCEL_ENV") && layout.includes("robots:"));
expect("V6.6 product version retained", packageJson.version === "6.6.0");
expect("Legacy V9.7 not presented as current visual standard", !home.includes("Raptor Delta V9.7"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV10.3 clean-foundation validation failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV10.3 clean-foundation validation passed: ${checks.length}/${checks.length} checks.`);
