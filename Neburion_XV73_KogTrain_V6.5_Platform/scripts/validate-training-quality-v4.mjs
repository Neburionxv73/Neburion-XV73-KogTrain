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
const hasAdaptiveQualityLabel = (source) =>
  source.includes("Adaptive Quality V4") ||
  source.includes("Adaptive Difficulty V5") ||
  source.includes("Dynamik 1") ||
  source.includes("Dynamik 2") ||
  source.includes("Dynamik 3");

const dynamicTraining = read("lib/dynamicTraining.ts");
const adaptiveDifficultyV5 = read("lib/adaptiveDifficultyV5.ts");
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
const visualTraining = read("components/VisualTraining.tsx");
const brainFit = read("lib/brainFit.ts");
const brainFitTraining = read("components/BrainFitTraining.tsx");

expect("V4 core: persistent recent-task history exists", dynamicTraining.includes("readRecentTaskIds") && dynamicTraining.includes("rememberTaskIds"));
expect("V4 core: balanced session selection exists", dynamicTraining.includes("balancedByMode") || dynamicTraining.includes("finalizeBalancedSessionTasks"));
expect("V4 core: evidence-based difficulty exists", dynamicTraining.includes("difficultyFromEvidence"));
expect("V5 core: within-session adaptive controller retained", adaptiveDifficultyV5.includes("createAdaptiveDifficultyState") && adaptiveDifficultyV5.includes("applyAdaptiveDifficultyResult") && adaptiveDifficultyV5.includes("correctStreak >= 3") && adaptiveDifficultyV5.includes("wrongStreak >= 2"));

expect("Memory adaptive quality UI active", hasAdaptiveQualityLabel(memoryTraining));
expect("Memory V4: eight generated memory modes retained", ["digits","reverse","words","symbols","positions","recognition","nback1","nback2"].every((mode) => memory.includes(`\"${mode}\"`)));
expect("Memory V4: generated sessions and adaptive span active", memory.includes("createSessionSeed") && memory.includes("finalizeBalancedSessionTasks") && memory.includes("showMs"));
expect("Memory V4: long anti-repeat history", memory.includes("memory-v4") && memory.includes("144"));

expect("Attention V4: adaptive quality UI active", attentionTraining.includes("createAttentionSession(stats.bestAccuracy)") && attentionTraining.includes("session.difficulty") && attentionTraining.includes("session.targetMs"));
expect("Attention V4: advanced modes retained", ["go-no-go","visual-search","rule-switch","inhibition","divided","speed","interference"].every((mode) => attention.includes(`\"${mode}\"`)));
expect("Attention V4: variable depth and balanced selection active", attention.includes("taskCount") && attention.includes("finalizeBalancedSessionTasks") && attention.includes("attention-v4"));
expect("Attention V4: anti-repeat history minimum retained", attention.includes("112"));

expect("Logic adaptive quality UI active", hasAdaptiveQualityLabel(logicTraining));
expect("Logic V4: advanced sequence/rule tasks active", logicV2.includes("v4-seq") && logicV2.includes("v4-rule"));
expect("Logic V4: deduction and operator depth active", logicV2.includes("v4-ded") && logicV2.includes("v4-op"));
expect("Logic V4: long anti-repeat history", logicV2.includes("logic-v4") && logicV2.includes("144"));

expect("Language V4: adaptive quality UI active", hasAdaptiveQualityLabel(languageTraining));
expect("Language V4: dedicated V4 task bank active", languageV2.includes("V4_BANK") && languageV2.includes("v4-syn-") && languageV2.includes("v4-ctx-"));
expect("Language V4: rolling history minimum 32", historyAtLeast(languageTraining, 32));
expect("Language V4: rolling history read/write active", languageTraining.includes("readRecentTaskIds") && languageTraining.includes("rememberTaskIds"));
expect("Language V4: balanced adaptive selection active", languageV2.includes("difficultyFromEvidence") && languageV2.includes("finalizeBalancedSessionTasks"));

expect("Visual adaptive quality UI active", hasAdaptiveQualityLabel(visualTraining) && visualTraining.includes("data-adaptive-level") && visualTraining.includes("applyAdaptiveDifficultyResult"));
expect("Visual V4: generated visual modes retained", ["rotation","mirror","pattern","matrix","position","search","compare","memory"].every((mode) => visual.includes(`\"${mode}\"`)));
expect("Visual V4: expanded independent candidate rounds", visualV2.includes("round < 7"));
expect("Visual V4: fresh-first selection active", visualV2.includes("readRecentTaskIds") && visualV2.includes("recent.has"));
expect("Visual V4: balanced selection active", visualV2.includes("balancedByMode"));
expect("Visual V4: long anti-repeat history", visualV2.includes("HISTORY_LIMIT = 144"));
expect("Visual V5: forced difficulty regeneration active", visualV2.includes("forcedDifficulty") && visualTraining.includes("createVisualSession(stats.bestScore, stats.sessions, nextAdaptive.level)"));

expect("BrainFit V4: all eight areas retained", ["sudoku","words","crossword","memory","categories","sequence","everydayMath","timeOrder"].every((area) => brainFit.includes(`\"${area}\"`)));
expect("BrainFit V4: evidence-based area mode retained", brainFit.includes("adaptiveMode") && brainFit.includes("stat.sessions>=4") && brainFit.includes("stat.bestScore"));
expect("BrainFit V4: long anti-repeat history", brainFit.includes("BRAIN_FIT_V4_HISTORY_LIMIT = 144") && brainFit.includes("brainfit-${area}-v4"));
expect("BrainFit V4: word-search content pool expanded", brainFit.includes("PLANET") && brainFit.includes("KOMPASS") && brainFitTraining.includes("rememberRotation"));
expect("BrainFit V4: crossword pool expanded and adaptive depth retained", brainFit.includes("KALENDER") && brainFit.includes("FLUGHAFEN") && brainFitTraining.includes('mode==="relaxed"?4:mode==="normal"?6:8'));
expect("BrainFit V4: memory pair depth retained", brainFitTraining.includes('mode==="relaxed"?4:mode==="normal"?6:8') && brainFitTraining.includes("MEMORY_POOL"));
expect("BrainFit V4: Sudoku clue depth retained", brainFitTraining.includes('mode==="relaxed"?8:mode==="normal"?6:4') && brainFitTraining.includes("isValidSudokuGrid"));
expect("BrainFit V4: quiz content has normal/challenge tiers", brainFit.includes('level:BrainFitMode') && brainFit.includes('"challenge"') && brainFit.includes('rank[task.level??"relaxed"]<=rank[mode]'));
expect("BrainFit V4: category reasoning depth expanded", brainFit.includes("Schlussverfahren") && brainFit.includes("Semantik"));
expect("BrainFit V4: sequence reasoning depth expanded", brainFit.includes("2 · 5 · 11 · 23 · 47") && brainFit.includes("3 · 4 · 7 · 11 · 18 · 29"));
expect("BrainFit V4: everyday math depth expanded", brainFit.includes("25 % Rabatt") && brainFit.includes("20 % USt"));
expect("BrainFit V4: time/order depth expanded", brainFit.includes("22:50") && brainFit.includes("95 Minuten"));
expect("BrainFit V4: portrait crossword remains guarded", brainFitTraining.includes("CROSSWORD_SIZE") && brainFitTraining.includes("crossword"));

const failed = checks.filter((check) => !check.pass);
for (const check of checks) console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
if (failed.length) {
  console.error(`\nAdaptive Quality compatibility gate failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nAdaptive Quality compatibility gate PASS (${checks.length}/${checks.length})`);
