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
const logicTraining = read("components/LogicTraining2.tsx");
const logicRoute = read("app/training/logic/page.tsx");
const languageTraining = read("components/LanguageTraining.tsx");
const languageRoute = read("app/training/language/page.tsx");
const visual = read("lib/visual.ts");
const visualTraining = read("components/VisualTraining.tsx");
const visualRoute = read("app/training/visual/page.tsx");
const brainFitCompletion = read("lib/brainFitCompletion.ts");
const brainFitRoute = read("app/training/brain-fit/page.tsx");
const progress = read("lib/progress.ts");
const progressUi = read("components/ProgressCoachDashboard.tsx");
const journey = read("components/UnifiedTrainingJourney.tsx");
const home = read("app/page.tsx");
const topNav = read("components/TopNav.tsx");
const pkg = JSON.parse(read("package.json"));

expect("V6.6 package version", pkg.version === "6.6.0");
expect("V6.6 visible in home", home.includes("Neburion XV73 · V6.6") && home.includes("V6.6</span>"));
expect("V6.6 visible in navigation", topNav.includes("V6.6"));
expect("Dynamic history reader exists", dynamicTraining.includes("readRecentTaskIds"));
expect("Dynamic history writer exists", dynamicTraining.includes("rememberTaskIds"));
expect("Fresh task selection helper exists", dynamicTraining.includes("chooseFresh"));
expect("Session seed uses crypto fallback", dynamicTraining.includes("createSessionSeed") && dynamicTraining.includes("crypto.getRandomValues"));

expect("Memory route wires MemoryTraining", memoryRoute.includes('MemoryTraining') && memoryRoute.includes('V6.6'));
expect("Memory UI uses generative engine", memoryTraining.includes("createMemorySession") && memoryTraining.includes("MEMORY_STORAGE_KEY"));
expect("Memory pool expanded", (memory.match(/\"[^\"]+\"/g) ?? []).length > 70 && memory.includes("createSessionSeed"));

expect("Attention route wires AttentionTraining", attentionRoute.includes('AttentionTraining') && attentionRoute.includes('V6.6'));
expect("Attention UI uses generative engine", attentionTraining.includes("createAttentionSession") && attentionTraining.includes("neburion-v65-attention-stats"));
expect("Attention uses generated session seed", attention.includes("createSessionSeed") && attention.includes("visual-search") && attention.includes("interference"));

expect("Logic route wires LogicTraining2", logicRoute.includes('LogicTraining2') && logicRoute.includes('V6.6'));
expect("Logic UI uses generative engine", logicTraining.includes("createLogicSession") && logicTraining.includes("LOGIC_STORAGE_KEY"));
expect("Logic has expanded variants", logic.includes("Thermometer : Temperatur") && logic.includes("Kubikzahlen") && logic.includes("createSessionSeed"));

expect("Language route wires LanguageTraining", languageRoute.includes('LanguageTraining') && languageRoute.includes('V6.6'));
expect("Language persists rolling history", languageTraining.includes("readRecentTaskIds") && languageTraining.includes("rememberTaskIds") && languageTraining.includes("32"));

expect("Visual route wires VisualTraining", visualRoute.includes('VisualTraining') && visualRoute.includes('V6.6'));
expect("Visual UI uses generative engine", visualTraining.includes("createVisualSession") && visualTraining.includes("VISUAL_STORAGE_KEY"));
expect("Visual uses generated session seed", visual.includes("createSessionSeed") && visual.includes("position") && visual.includes("compare"));

expect("BrainFit route wires both training panels", brainFitRoute.includes("BrainFitTraining") && brainFitRoute.includes("BrainFitCompletionPanel") && brainFitRoute.includes("V6.6"));
expect("BrainFit completion pool expanded", (brainFitCompletion.match(/area:\"missingWords\"/g) ?? []).length >= 10 && (brainFitCompletion.match(/area:\"orientation\"/g) ?? []).length >= 10);

expect("Progress dashboard is mounted on home", home.includes("DeferredProgressCoachDashboard"));
expect("Progress tracks trained areas", progress.includes("trainedAreas") && progressUi.includes("Trainierte Bereiche"));
expect("Progress tracks active days", progress.includes("activeDays7") && progressUi.includes("Aktive Tage"));
expect("Progress tracks last session", progress.includes("lastSessionAt") && progressUi.includes("Letzte Session"));
expect("Journey documents full session flow", journey.includes("Start → Aufgabe → direkte Rückmeldung → nächste Aufgabe → Abschluss & Fortschritt"));
expect("No visible recommendation copy in progress UI", !/Empfehlung|empfohlen|recommendation/i.test(progressUi));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nV6.6 validation failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nV6.6 validation passed: ${checks.length}/${checks.length} checks.`);
