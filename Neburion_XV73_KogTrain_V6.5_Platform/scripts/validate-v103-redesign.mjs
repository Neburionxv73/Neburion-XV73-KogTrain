import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const expect = (name, condition) => checks.push({ name, pass: Boolean(condition) });

const layout = read("app/layout.tsx");
const home = read("app/page.tsx");
const foundation = read("app/raptor-v103-clean-foundation.css");
const homeModule = read("app/HomeV103.module.css");
const progressModule = read("components/ProgressCoachDashboard.module.css");
const nav = read("components/TopNav.tsx");
const packageJson = JSON.parse(read("package.json"));

const v103Imports = [...layout.matchAll(/import\s+"\.\/(?:[^\"]*v103[^\"]*)\.css";/gi)].map((match) => match[0]);
const paletteTokens = ["--k-navy", "--k-blue", "--k-teal", "--k-coral", "--k-gold", "--k-violet"];

expect("HARD: exactly one global V10.3 foundation", v103Imports.length === 1 && layout.includes('import "./raptor-v103-clean-foundation.css";'));
expect("HARD: legacy redesign layer absent", !layout.includes('raptor-v103-redesign.css'));
expect("HARD: legacy collision patch absent", !layout.includes('v103-typography-collision-fix.css'));
expect("HARD: component-scoped home art direction", home.includes('HomeV103.module.css') && homeModule.includes('.heroStage') && homeModule.includes('.worldStage'));
expect("HARD: developer governance hidden from public UI", !home.includes("Raptor Delta") && !nav.includes("Raptor Delta") && !home.includes("Hard Mode"));

expect("HARD: disciplined display scale", foundation.includes("--k-display:clamp(58px,6.7vw,88px)"));
expect("HARD: disciplined H2 scale", foundation.includes("--k-h2:clamp(40px,4.4vw,56px)"));
expect("HARD: body scale defined", foundation.includes("--k-body:17px") && foundation.includes("--k-lead:20px"));
expect("HARD: safe headline line-height", foundation.includes("line-height:1.02!important") && foundation.includes("line-height:1.07!important"));
expect("HARD: no 100px-plus desktop display", !/--k-display:[^;]*1(?:0[0-9]|[1-9][0-9]{2,})px/.test(foundation));

expect("HARD: semantic palette present", paletteTokens.every((token) => foundation.includes(token)));
expect("HARD: vivid governed color", homeModule.includes("linear-gradient") && homeModule.includes("#edf2ff") && homeModule.includes("#def7f2") && homeModule.includes("#fff0e8"));
expect("HARD: dark stage uses navy not black", foundation.includes("--k-dark:#17365f"));

expect("HARD: hero whitespace contract", homeModule.includes("min-height:720px") && homeModule.includes("padding:76px 74px") && homeModule.includes("gap:96px"));
expect("HARD: editorial section spacing", homeModule.includes("padding:118px 0 126px") && homeModule.includes("padding:124px 0"));
expect("HARD: 12-column specialist composition", homeModule.includes("grid-template-columns:repeat(12,minmax(0,1fr))"));
expect("HARD: responsive home recomposition", homeModule.includes("@media(max-width:1100px)") && homeModule.includes("@media(max-width:700px)"));

expect("HARD: progress light-surface contract", progressModule.includes("light cards inside dark dashboard must stay readable") && progressModule.includes(".dashboard .panel") && progressModule.includes("color:#172133!important"));
expect("HARD: public hierarchy preserved", home.includes("01 · Trainingsstart") && home.includes("02 · Persönlicher Lernmix") && home.includes("03 · Spezial-Labs") && home.includes("04 · Gehirnfit & Alltag"));
expect("HARD: progress dashboard preserved", home.includes("DeferredProgressCoachDashboard"));
expect("HARD: training routes preserved", home.includes('/training/journey') && home.includes('/training/focus') && home.includes('/training/brain-fit'));

expect("HARD: touch target baseline", foundation.includes("min-height:50px"));
expect("HARD: reduced motion respected", foundation.includes("prefers-reduced-motion") && homeModule.includes("prefers-reduced-motion"));
expect("HARD: skip link retained", layout.includes('className="skipLink"'));
expect("HARD: German document language retained", layout.includes('lang="de"'));
expect("HARD: production robots policy retained", layout.includes("VERCEL_ENV") && layout.includes("robots:"));
expect("HARD: V6.6 product version retained", packageJson.version === "6.6.0");

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV10.3 HARD MODE FAILED: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV10.3 HARD MODE passed: ${checks.length}/${checks.length} checks.`);
