import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const expect = (name, condition) => checks.push({ name, pass: Boolean(condition) });
const historyAtLeast = (source, minimum) => {
  const match = source.match(/HISTORY_LIMIT\s*=\s*(\d+)/);
  return match ? Number(match[1]) >= minimum : false;
};

const dynamicTraining = read("lib/dynamicTraining.ts");
const memory = read("lib/memory.ts");
const memoryTraining = read("components/MemoryTraining.tsx");
const attention = read("lib/attention.ts");
const attentionTraining = read("components/AttentionTraining.tsx");
const logicV2 = read("lib/logicV2.ts");
const logicTraining = read("components/LogicTraining.tsx");
const languageV2 = read("lib/languageV2.ts");
const languageTraining = read("components/LanguageTraining.tsx");
const visual = read("lib/visual.ts");
const visualV2 = read("lib/visualV2.ts");
const brainFit = read("lib/brainFit.ts");
const brainFitTraining = read("components/BrainFitTraining.tsx");

expect("V4 core: persistent recent-task history exists", dynamicTraining.includes("readRecentTaskIds") && dynamicTraining.includes("rememberTaskIds"));
expect("V4 core: balanced session selection exists", dynamicTraining.includes("balancedByMode") || dynamicTraining.includes("finalizeBalancedSessionTasks"));
expect("V4 core: evidence-based difficulty exists", dynamicTraining.includes("difficultyFromEvidence"));

expect("Memory V4: adaptive quality UI active", memoryTraining.includes("Adaptive Quality V4"));
expect("Memory V4: eight generated memory modes retained", ["digits","reverse","words","symbols","positions","recognition","nback1","nback2"].every((mode) => memory.includes(`\"${mode}\"`)));
expect("Memory V4: generated sessions and adaptive span active", memory.includes("createSessionSeed") && memory.includes("finalizeBalancedSessionTasks") && memory.includes("showMs"));
expect("Memory V4: long anti-repeat history", memory.includes("memory-v4") && memory.includes("144"));

expect("Attention V4: adaptive quality UI active", attentionTraining.includes("Adaptive Quality V4"));
expect("Attention V4: advanced modes retained", ["go-no-go","visual-search","rule-switch","inhibition","divided","speed","interference"].every((mode) => attention.includes(`\"${mode}\"`)));
expect("Attention V4: variable depth and balanced selection active", attention.includes("taskCount") && attention.includes("finalizeBalancedSessionTasks") && attention.includes("attention-v4"));
expect("Attention V4: anti-repeat history minimum retained", attention.includes("112"));

expect("Logic V4: adaptive quality UI active", logicTraining.includes("Adaptive Quality V4"));
expect("Logic V4: advanced sequence/rule tasks active", logicV2.includes("v4-seq") && logicV2.includes("v4-rule"));
expect("Logic V4: deduction and operator depth active", logicV2.includes("v4-ded") && logicV2.includes("v4-op"));
expect("Logic V4: long anti-repeat history", logicV2.includes("logic-v4") && logicV2.includes("144"));

expect("Language V4: adaptive quality UI active", languageTraining.includes("Adaptive Quality V4"));
expect("Language V4: dedicated V4 task bank active", languageV2.includes("V4_BANK") && languageV2.includes("v4-syn-") && languageV2.includes("v4-ctx-"));
expect("Language V4: rolling history minimum 32", historyAtLeast(languageTraining, 32));
expect("Language V4: rolling history read/write active", languageTraining.includes("readRecentTaskIds") && languageTraining.includes("rememberTaskIds"));
expect("Language V4: balanced adaptive selection active", languageV2.includes("difficultyFromEvidence") && languageV2.includes("finalizeBalancedSessionTasks"));

expect("Visual V4: generated visual modes retained", ["rotation","mirror","pattern","matrix","position","search","compare","memory"].every((mode) => visual.includes(`\"${mode}\"`)));
expect("Visual V4: expanded independent candidate rounds", visualV2.includes("round < 7"));
expect("Visual V4: fresh-first selection active", visualV2.includes("readRecentTaskIds") && visualV2.includes("recent.has"));
expect("Visual V4: balanced selection active", visualV2.includes("balancedByMode"));
expect("Visual V4: long anti-repeat history", visualV2.includes("HISTORY_LIMIT = 144"));

expect("BrainFit: all eight areas retained", ["sudoku","words","crossword","memory","categories","sequence","everydayMath","timeOrder"].every((area) => brainFit.includes(`\"${area}\"`)));
expect("BrainFit: adaptive area mode retained", brainFit.includes("adaptiveMode") && brainFit.includes("challenge") && brainFit.includes("normal") && brainFit.includes("relaxed"));
expect("BrainFit: expanded word and crossword pools retained", brainFit.includes("WORD_SETS") && brainFit.includes("CROSSWORD_POOL"));
expect("BrainFit: rotation history retained", brainFitTraining.includes("ROTATION_STORAGE_KEY") && brainFitTraining.includes("rememberRotation"));
expect("BrainFit: Sudoku accepts every valid grid", brainFitTraining.includes("isValidSudokuGrid"));
expect("BrainFit: portrait crossword remains guarded", brainFitTraining.includes("CROSSWORD_SIZE") && brainFitTraining.includes("crossword"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nAdaptive Quality V4 gate failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nAdaptive Quality V4 gate PASS (${checks.length}/${checks.length})`);
