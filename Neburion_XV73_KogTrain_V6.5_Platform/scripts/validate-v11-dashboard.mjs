import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const expect = (name, condition) => checks.push({ name, pass: Boolean(condition) });

const layout = read("app/layout.tsx");
const home = read("app/page.tsx");
const dashboard = read("components/HomeDashboardV11.tsx");
const dashboardCss = read("components/HomeDashboardV11.module.css");
const foundation = read("app/raptor-v103-clean-foundation.css");
const progress = read("lib/progress.ts");
const journey = read("components/UnifiedTrainingJourney.tsx");
const packageJson = JSON.parse(read("package.json"));

expect("V11: homepage mounts approved dashboard", home.includes("HomeDashboardV11") && home.includes("<HomeDashboardV11"));
expect("V11: dashboard uses real progress snapshot", dashboard.includes("getProgressSnapshot") && dashboard.includes("ProgressSnapshot"));
expect("V11: sidebar preserves all training routes", ["/training/memory","/training/attention","/training/logic","/training/language","/training/visual","/training/brain-fit"].every(route => dashboard.includes(route)));
expect("V11: adaptive journey remains primary CTA", dashboard.includes('/training/journey') && dashboard.includes("Training starten"));
expect("V11: progress sections are present", dashboard.includes("Bereiche und Entwicklung") && dashboard.includes("Heute und diese Woche") && dashboard.includes("Trainings-") && dashboard.includes("rhythmus"));
expect("V11: real daily and weekly goals retained", dashboard.includes("todaySessions") && dashboard.includes("dailyGoal") && dashboard.includes("weekSessions") && dashboard.includes("weeklyGoal"));
expect("V11: no fabricated progress values", dashboard.includes("snapshot?.") && dashboard.includes("Noch keine Daten") && !dashboard.includes("Math.random"));
expect("V11: desktop dashboard shell exists", dashboardCss.includes(".appShell") && dashboardCss.includes(".sidebar") && dashboardCss.includes(".content"));
expect("V11: dashboard cards and metrics exist", dashboardCss.includes(".metrics") && dashboardCss.includes(".panel") && dashboardCss.includes(".areaList") && dashboardCss.includes(".goal"));
expect("V11: responsive breakpoints exist", /@media\s*\(max-width:\s*1180px\)/.test(dashboardCss) && /@media\s*\(max-width:\s*860px\)/.test(dashboardCss) && /@media\s*\(max-width:\s*560px\)/.test(dashboardCss));
expect("V11: mobile sidebar safely recomposes", dashboardCss.includes(".sidebar{position:relative") && dashboardCss.includes(".appShell{display:block}"));
expect("V11: readable light content contrast", ["#122236","#13283a","#102437"].some(color => dashboardCss.includes(color)) && dashboardCss.includes("background:#fff"));
expect("V11: teal navigation identity retained", ["#064e59","#043f48","#03333b","#0a9aac","#0b8493"].some(color => dashboardCss.includes(color)));

expect("Release: V10.3 global foundation retained", layout.includes('import "./raptor-v103-clean-foundation.css";'));
expect("Release: skip link retained", layout.includes('className="skipLink"'));
expect("Release: German document language retained", layout.includes('lang="de"'));
expect("Release: production robots policy retained", layout.includes("VERCEL_ENV") && layout.includes("robots:"));
expect("Release: progress engine retains trained areas", progress.includes("trainedAreas"));
expect("Release: progress engine retains active days", progress.includes("activeDays7"));
expect("Release: progress engine retains last session", progress.includes("lastSessionAt"));
expect("Release: adaptive journey remains functional", journey.includes("startHref") && journey.includes("Nach jeder Station") && journey.includes("Jetzt {duration} Minuten starten"));
expect("Release: reduced-motion handling exists", foundation.includes("prefers-reduced-motion") || dashboardCss.includes("prefers-reduced-motion"));
expect("Release: touch target baseline retained", foundation.includes("min-height:44px") || dashboardCss.includes("min-height:44px"));
expect("Release: V6.7 product version retained", packageJson.version === "6.7.0-dev");

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV11 DASHBOARD GATE FAILED: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV11 dashboard gate passed: ${checks.length}/${checks.length} checks.`);
