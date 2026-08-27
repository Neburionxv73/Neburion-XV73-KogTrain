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

const v103Imports = [...layout.matchAll(/import\s+"\.\/(?:[^\"]*v103[^\"]*)\.css";/gi)].map((match) => match[0]);
const paletteTokens = ["--k-navy", "--k-blue", "--k-teal", "--k-coral", "--k-gold", "--k-violet"];

expect("HARD: exactly one V10.3 stylesheet imported", v103Imports.length === 1 && layout.includes('import "./raptor-v103-clean-foundation.css";'));
expect("HARD: legacy redesign layer absent", !layout.includes('raptor-v103-redesign.css'));
expect("HARD: legacy collision patch absent", !layout.includes('v103-typography-collision-fix.css'));
expect("HARD: V10.3 Hard Mode identity visible", home.includes("Raptor Delta V10.3 Hard Mode"));
expect("HARD: specialist footer identity visible", home.includes("Specialist Foundation"));

expect("HARD: disciplined display scale", foundation.includes("--k-display:clamp(58px,6.7vw,88px)"));
expect("HARD: disciplined H2 scale", foundation.includes("--k-h2:clamp(40px,4.4vw,56px)"));
expect("HARD: body scale defined", foundation.includes("--k-body:17px") && foundation.includes("--k-lead:20px"));
expect("HARD: safe headline line-height", foundation.includes("line-height:1.02!important") && foundation.includes("line-height:1.07!important"));
expect("HARD: headline measure constrained", foundation.includes("max-width:12ch") && foundation.includes("max-width:17ch"));
expect("HARD: no 100px-plus desktop display", !/--k-display:[^;]*1(?:0[0-9]|[1-9][0-9]{2,})px/.test(foundation));

expect("HARD: restrained semantic palette", paletteTokens.every((token) => foundation.includes(token)));
expect("HARD: neutral foundation present", foundation.includes("--k-bg:#f6f7f9") && foundation.includes("--k-surface:#ffffff") && foundation.includes("--k-ink:#18212b"));
expect("HARD: one dark system stage", foundation.includes("--k-dark:#17232f") && foundation.includes("ProgressCoachDashboard"));

expect("HARD: editorial hero preserved", home.includes("Lernen mit Struktur. Trainieren mit Fokus."));
expect("HARD: platform hierarchy preserved", home.includes("01 · Trainingsstart") && home.includes("02 · Persönlicher Lernmix") && home.includes("03 · Spezial-Labs") && home.includes("04 · Gehirnfit & Alltag"));
expect("HARD: three training paths preserved", home.includes("Trainingswege") && home.includes("03"));
expect("HARD: five specialist labs preserved", home.includes("Spezial-Labs") && home.includes("05"));
expect("HARD: twelve BrainFit worlds preserved", home.includes("Gehirnfit-Welten") && home.includes("12"));
expect("HARD: progress dashboard preserved", home.includes("DeferredProgressCoachDashboard"));
expect("HARD: training routes preserved", home.includes('/training/journey') && home.includes('/training/focus') && home.includes('/training/brain-fit'));

expect("HARD: 12-column desktop composition", foundation.includes("grid-template-columns:repeat(12,minmax(0,1fr))"));
expect("HARD: tablet recomposition", foundation.includes("@media(max-width:1100px)") && foundation.includes("@media(max-width:820px)"));
expect("HARD: mobile reprioritization", foundation.includes("@media(max-width:560px)"));
expect("HARD: phone body size reduced safely", foundation.includes("--k-body:16px") && foundation.includes("--k-lead:17px"));
expect("HARD: touch target baseline", foundation.includes("min-height:50px"));
expect("HARD: reduced motion respected", foundation.includes("prefers-reduced-motion"));

expect("HARD: skip link retained", layout.includes('className="skipLink"'));
expect("HARD: German document language retained", layout.includes('lang="de"'));
expect("HARD: production robots policy retained", layout.includes("VERCEL_ENV") && layout.includes("robots:"));
expect("HARD: V6.6 product version retained", packageJson.version === "6.6.0");
expect("HARD: V9.7 not presented as current visual standard", !home.includes("Raptor Delta V9.7"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV10.3 HARD MODE FAILED: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV10.3 HARD MODE passed: ${checks.length}/${checks.length} checks.`);
