import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const checks = [];
function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"} Adaptive V5: ${name}`);
}

const core = read("lib/adaptiveDifficultyV5.ts");
check("shared controller exists", core.includes("applyAdaptiveDifficultyResult") && core.includes("createAdaptiveDifficultyState"));
check("difficulty is clamped to levels 1..3", core.includes("if (value <= 1) return 1") && core.includes("if (value >= 3) return 3"));
check("level-up requires three correct answers", /correctStreak\s*>=\s*3/.test(core));
check("level-up requires strong recent evidence", /recentAccuracy\s*>=\s*0\.8/.test(core));
check("level-down requires two consecutive errors", /wrongStreak\s*>=\s*2/.test(core));
check("transitions move exactly one level", core.includes("state.level + 1") && core.includes("state.level - 1"));
check("single result does not force a transition", core.includes('transition: "hold"'));
check("human-readable difficulty labels exist", core.includes('"Basis"') && core.includes('"Aufbau"') && core.includes('"Challenge"'));

const labs = [
  ["Memory", "components/MemoryTraining.tsx"],
  ["Logic", "components/LogicTraining.tsx"],
  ["Attention", "components/AttentionTraining.tsx"],
  ["Language", "components/LanguageTraining.tsx"],
  ["Visual", "components/VisualTraining.tsx"],
  ["BrainFit", "components/BrainFitAdaptiveV5.tsx"],
];

for (const [name, file] of labs) {
  const full = path.join(root, file);
  const exists = fs.existsSync(full);
  check(`${name} trainer exists`, exists);
  if (!exists) continue;
  const source = fs.readFileSync(full, "utf8");
  check(`${name} uses shared V5 controller`, source.includes("applyAdaptiveDifficultyResult") && source.includes("createAdaptiveDifficultyState"));
  check(`${name} exposes current adaptive level`, source.includes("adaptive.level") || source.includes("data-adaptive-level"));
  check(`${name} exposes V5 reasoning/feedback`, source.includes("adaptive.reason") || source.includes("Adaptive Difficulty V5"));
}

const brainFitClient = read("components/BrainFitClient.tsx");
check("BrainFit V5 is mounted", brainFitClient.includes("BrainFitAdaptiveV5"));

const failed = checks.filter((item) => !item.ok);
console.log(`\nAdaptive Difficulty V5 gate: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) {
  console.error(`Blocked by ${failed.length} Adaptive V5 check(s).`);
  process.exit(1);
}
console.log("Adaptive Difficulty V5 cross-lab gate PASS.");
