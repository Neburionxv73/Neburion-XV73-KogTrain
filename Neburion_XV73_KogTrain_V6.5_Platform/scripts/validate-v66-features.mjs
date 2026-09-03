import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const expect = (name, condition) => checks.push({ name, pass: Boolean(condition) });

const dynamicTraining = read("lib/dynamicTraining.ts");
const memory = read("lib/memory.ts");
const memoryTraining = read("components/MemoryTraining.tsx");
const memoryRoute = read("app/training/memory/page.tsx");
const attention = read("lib/attention.ts");
const attentionTraining = read("components/AttentionTraining.tsx");
const attentionRoute = read("app/training/attention/page.tsx");
const logic = read("lib/logic.ts");
const logicTrainingLegacy = read("components/LogicTraining2.tsx");
const logicTrainingV5 = read("components/LogicTraining.tsx");
const logicRoute = read("app/training/logic/page.tsx");
const languageTraining = read("components/LanguageTraining.tsx");
const languageRoute = read("app/training/language/page.tsx");
const visual = read("lib/visual.ts");
const visualTraining = read("components/VisualTraining.tsx");
const visualRoute = read("app/training/visual/page.tsx");
const brainFitCompletion = read("lib/brainFitCompletion.ts");
const brainFitRoute = read("app/training/brain-fit/page.tsx");
const brainFitClient = read("components/BrainFitClient.tsx");
const progress = read("lib/progress.ts");
const progressUi = read("components/ProgressCoachDashboard.tsx");
const homeDashboardV11 = read("components/HomeDashboardV11.tsx");
const journey = read("components/UnifiedTrainingJourney.tsx");
const home = read("app/page.tsx");

// V6.6 is a frozen regression baseline. Later trainers and dashboards may replace
// the active UI, but the behavior introduced in V6.6 must remain present or be superseded.
expect("V6.6 baseline: dynamic history reader exists", dynamicTraining.includes("readRecentTaskIds"));
expect("V6.6 baseline: dynamic history writer exists", dynamicTraining.includes("rememberTaskIds"));
expect("V6.6 baseline: fresh task selection helper exists", dynamicTraining.includes("chooseFresh"));
expect("V6.6 baseline: session seed uses crypto fallback", dynamicTraining.includes("createSessionSeed") && dynamicTraining.includes("crypto.getRandomValues"));

expect("V6.6 baseline: Memory route wires MemoryTraining", memoryRoute.includes("MemoryTraining"));
expect("V6.6 baseline: Memory UI uses generative engine", memoryTraining.includes("createMemorySession") && memoryTraining.includes("MEMORY_STORAGE_KEY"));
expect("V6.6 baseline: Memory pool expanded", (memory.match(/\"[^\"]+\"/g) ?? []).length > 70 && memory.includes("createSessionSeed"));

expect("V6.6 baseline: Attention route wires AttentionTraining", attentionRoute.includes("AttentionTraining"));
expect("V6.6 baseline: Attention UI uses generative engine", attentionTraining.includes("createAttentionSession") && attentionTraining.includes("neburion-v65-attention-stats"));
expect("V6.6 baseline: Attention uses generated session seed", attention.includes("createSessionSeed") && attention.includes("visual-search") && attention.includes("interference"));

expect("V6.6 baseline: Logic route wires an active Logic trainer", logicRoute.includes("LogicTraining") || logicRoute.includes("LogicTraining2"));
expect("V6.6 baseline: Logic UI uses generative engine", [logicTrainingLegacy,logicTrainingV5].some(source=>source.includes("createLogicSession") && source.includes("LOGIC_STORAGE_KEY")));
expect("V6.6 baseline: Logic has expanded variants", logic.includes("Thermometer : Temperatur") && logic.includes("Kubikzahlen") && logic.includes("createSessionSeed"));

expect("V6.6 baseline: Language route wires LanguageTraining", languageRoute.includes("LanguageTraining"));
const languageHistoryLimit = Number(languageTraining.match(/HISTORY_LIMIT\s*=\s*(\d+)/)?.[1] ?? 0);
expect("V6.6 baseline: Language persists rolling history",languageTraining.includes("readRecentTaskIds") && languageTraining.includes("rememberTaskIds") && languageHistoryLimit >= 32);

expect("V6.6 baseline: Visual route wires VisualTraining", visualRoute.includes("VisualTraining"));
expect("V6.6 baseline: Visual UI uses generative engine", visualTraining.includes("createVisualSession") && visualTraining.includes("VISUAL_STORAGE_KEY"));
expect("V6.6 baseline: Visual uses generated session seed", visual.includes("createSessionSeed") && visual.includes("position") && visual.includes("compare"));

expect("V6.6 baseline: BrainFit route wires client boundary", brainFitRoute.includes("BrainFitClient") && brainFitRoute.includes("<BrainFitClient"));
expect("V6.6 baseline: BrainFit client boundary wires both training panels", brainFitClient.includes("BrainFitTraining") && brainFitClient.includes("BrainFitCompletionPanel") && brainFitClient.includes("ssr: false"));
expect("V6.6 baseline: BrainFit completion pool expanded", (brainFitCompletion.match(/area:\"missingWords\"/g) ?? []).length >= 10 && (brainFitCompletion.match(/area:\"orientation\"/g) ?? []).length >= 10);

const legacyProgressMounted = home.includes("DeferredProgressCoachDashboard");
const v11ProgressMounted = home.includes("HomeDashboardV11") && homeDashboardV11.includes("getProgressSnapshot") && homeDashboardV11.includes('id="fortschritt"') && homeDashboardV11.includes("Bereiche und Entwicklung") && homeDashboardV11.includes("Heute und diese Woche");
expect("V6.6 baseline: Progress dashboard is mounted on home", legacyProgressMounted || v11ProgressMounted);
expect("V6.6 baseline: Progress tracks trained areas", progress.includes("trainedAreas") && (progressUi.includes("Trainierte Bereiche") || homeDashboardV11.includes("Bereiche und Entwicklung")));
expect("V6.6 baseline: Progress tracks active days", progress.includes("activeDays7") && (progressUi.includes("Aktive Tage") || homeDashboardV11.includes("aktive Tage")));
expect("V6.6 baseline: Progress tracks last session", progress.includes("lastSessionAt") && (progressUi.includes("Letzte Session") || homeDashboardV11.includes("lastSessionAt")));
expect("V6.6 baseline: Journey documents full session flow",journey.includes("startHref") && journey.includes("Nach jeder Station") && journey.includes("Fortschritt ansehen") && journey.includes("Jetzt {duration} Minuten starten"));
const forbiddenRecommendationUi = ["Empfehlung öffnen", "Empfohlen", "Nächster Fokus", "Heute sinnvoll", "Coach-Empfehlung"];
expect("V6.6 baseline: No visible recommendation UI in progress", forbiddenRecommendationUi.every((label) => !progressUi.includes(label) && !homeDashboardV11.includes(label)));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV6.6 regression baseline failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV6.6 regression baseline passed: ${checks.length}/${checks.length} checks.`);
