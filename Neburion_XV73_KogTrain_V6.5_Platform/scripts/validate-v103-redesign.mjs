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
const vitalis = { bg:"#F8FAFC", mist:"#EAF3F5", teal:"#087F8C", blue:"#2672D8", gold:"#F5B940", ink:"#1D2A32", muted:"#61727B" };

expect("HARD: exactly one global V10.3 foundation", v103Imports.length === 1 && layout.includes('import "./raptor-v103-clean-foundation.css";'));
expect("HARD: legacy redesign layer absent", !layout.includes('raptor-v103-redesign.css'));
expect("HARD: legacy collision patch absent", !layout.includes('v103-typography-collision-fix.css'));
expect("HARD: component-scoped home art direction", home.includes('HomeV103.module.css') && homeModule.includes('.heroStage') && homeModule.includes('.worldStage'));
expect("HARD: developer governance hidden from public UI", !home.includes("Raptor Delta") && !nav.includes("Raptor Delta") && !home.includes("Hard Mode"));

expect("HARD: Vitalis exact background", foundation.includes(`--k-bg:${vitalis.bg}`));
expect("HARD: Vitalis exact secondary surface", foundation.includes(`--k-surface-2:${vitalis.mist}`));
expect("HARD: Vitalis exact primary teal", foundation.includes(`--k-teal:${vitalis.teal}`));
expect("HARD: Vitalis exact active blue", foundation.includes(`--k-blue:${vitalis.blue}`));
expect("HARD: Vitalis exact citrus gold", foundation.includes(`--k-gold:${vitalis.gold}`));
expect("HARD: Vitalis exact main text", foundation.includes(`--k-ink:${vitalis.ink}`));
expect("HARD: Vitalis exact secondary text", foundation.includes(`--k-muted:${vitalis.muted}`));
expect("HARD: no decorative coral/violet token creep", !foundation.includes("--k-coral") && !foundation.includes("--k-violet"));

expect("HARD: disciplined display scale", foundation.includes("--k-display:clamp(56px,6.2vw,84px)"));
expect("HARD: disciplined H2 scale", foundation.includes("--k-h2:clamp(40px,4.2vw,56px)"));
expect("HARD: body scale defined", foundation.includes("--k-body:17px") && foundation.includes("--k-lead:20px"));
expect("HARD: safe headline line-height", foundation.includes("line-height:1.04!important") && foundation.includes("line-height:1.08!important"));
expect("HARD: no 100px-plus desktop display", !/--k-display:[^;]*1(?:0[0-9]|[1-9][0-9]{2,})px/.test(foundation));

expect("HARD: home uses Vitalis governed colors", homeModule.includes("#087F8C") && homeModule.includes("#2672D8") && homeModule.includes("#F5B940") && homeModule.includes("#1D2A32") && homeModule.includes("#61727B"));
expect("HARD: desktop hero whitespace contract", homeModule.includes("min-height:740px") && homeModule.includes("padding:84px 78px") && homeModule.includes("gap:108px"));
expect("HARD: editorial section spacing", homeModule.includes("padding:124px 0 132px") && homeModule.includes("padding:128px 0"));
expect("HARD: 12-column specialist composition", homeModule.includes("grid-template-columns:repeat(12,minmax(0,1fr))"));

expect("HARD: tablet breakpoint exists", homeModule.includes("@media(max-width:1100px)") && foundation.includes("@media(max-width:1100px)"));
expect("HARD: narrow tablet breakpoint exists", homeModule.includes("@media(max-width:820px)") && foundation.includes("@media(max-width:820px)"));
expect("HARD: smartphone breakpoint exists", homeModule.includes("@media(max-width:600px)") && foundation.includes("@media(max-width:560px)"));
expect("HARD: small-phone breakpoint exists", homeModule.includes("@media(max-width:420px)") && foundation.includes("@media(max-width:420px)"));
expect("HARD: tablet hero is independently recomposed", homeModule.includes("grid-template-columns:minmax(0,1fr) minmax(300px,.72fr)") && homeModule.includes("min-height:620px"));
expect("HARD: narrow tablet hero stacks", homeModule.includes("grid-template-columns:1fr!important") && homeModule.includes("max-width:560px"));
expect("HARD: smartphone hero uses reduced density", homeModule.includes("padding:34px 22px 28px") && homeModule.includes("font-size:clamp(38px,11.4vw,48px)"));
expect("HARD: small-phone density reduced again", homeModule.includes("padding:28px 18px 22px") && homeModule.includes("font-size:clamp(34px,10.8vw,42px)"));
expect("HARD: smartphone CTA is full width", homeModule.includes("width:100%!important;min-height:52px"));
expect("HARD: smartphone content grids become one column", homeModule.includes(".learningGrid{display:block!important") && homeModule.includes(".worldGrid{display:block!important"));
expect("HARD: mobile nav is horizontally safe", foundation.includes("overflow-x:auto!important") && foundation.includes("white-space:nowrap") && foundation.includes("scrollbar-width:none"));
expect("HARD: mobile training shell is reprioritized", foundation.includes("padding:38px 0 64px") && foundation.includes("font-size:clamp(36px,10vw,46px)"));
expect("HARD: training options collapse to one column", foundation.includes('[class*="Training"][class*="options"]{grid-template-columns:1fr!important'));
expect("HARD: training tasks prevent horizontal overflow", foundation.includes("max-width:100%!important;margin-inline:0!important") && foundation.includes("overflow-wrap:anywhere!important"));
expect("HARD: training stats compact on smartphone", foundation.includes('[class*="Training"][class*="stats"]{min-height:0!important'));
expect("HARD: small-phone training stats become one column", foundation.includes('[class*="Training"][class*="modeGrid"],[class*="Training"][class*="modeStats"]{grid-template-columns:1fr!important'));
expect("HARD: mobile inputs retain 16px minimum", foundation.includes("input,textarea,select{max-width:100%!important;font-size:16px!important"));
expect("HARD: touch target minimum 44px retained", foundation.includes("min-height:44px") && foundation.includes("min-height:52px"));

expect("HARD: Journey tablet becomes single-column", foundation.includes('[class*="UnifiedTrainingJourney"][class*="hero"],[class*="UnifiedTrainingJourney"][class*="controlGrid"]{grid-template-columns:1fr!important'));
expect("HARD: Journey mobile actions are full-width", foundation.includes('[class*="UnifiedTrainingJourney"][class*="primaryAction"]') && foundation.includes('[class*="UnifiedTrainingJourney"][class*="quickGrid"]{grid-template-columns:1fr!important'));
expect("HARD: Focus tablet uses two-column area grid", foundation.includes('[class*="FocusTraining"][class*="areaGrid"]{grid-template-columns:repeat(2,minmax(0,1fr))!important'));
expect("HARD: Focus mobile setup and stage are compact", foundation.includes('[class*="FocusTraining"][class*="stage"]{min-height:0!important') && foundation.includes('[class*="FocusTraining"][class*="areaGrid"]'));
expect("HARD: BrainFit tablet progress stacks", foundation.includes('[class*="BrainFitTraining"][class*="progress"]{grid-template-columns:1fr!important'));
expect("HARD: BrainFit mobile exercise navigation is controlled", foundation.includes('[class*="BrainFitTraining"][class*="modeRow"],[class*="BrainFitTraining"][class*="tabs"]{grid-template-columns:1fr 1fr!important'));
expect("HARD: BrainFit small-phone nav becomes one column", foundation.includes('[class*="BrainFitTraining"][class*="modeRow"],[class*="BrainFitTraining"][class*="tabs"]{grid-template-columns:1fr!important'));
expect("HARD: BrainFit word grid remains scroll-safe", foundation.includes('[class*="BrainFitTraining"][class*="wordGridWrap"]{overflow-x:auto!important'));

expect("HARD: progress surface contract preserved", progressModule.includes(".dashboard .panel") && progressModule.includes("color:#1D2A32!important") && progressModule.includes("color:#61727B!important"));
expect("HARD: progress tablet two-column metrics", progressModule.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
expect("HARD: progress smartphone one-column metrics", progressModule.includes("grid-template-columns:1fr!important"));
expect("HARD: progress mobile chart overflow handled", progressModule.includes("overflow-x:auto") && progressModule.includes("min-width:38px"));

expect("HARD: public hierarchy preserved", home.includes("01 · Trainingsstart") && home.includes("02 · Persönlicher Lernmix") && home.includes("03 · Spezial-Labs") && home.includes("04 · Gehirnfit & Alltag"));
expect("HARD: progress dashboard preserved", home.includes("DeferredProgressCoachDashboard"));
expect("HARD: training routes preserved", home.includes('/training/journey') && home.includes('/training/focus') && home.includes('/training/brain-fit'));
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
