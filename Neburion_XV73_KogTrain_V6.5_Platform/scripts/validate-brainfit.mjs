import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const training = read("components/BrainFitTraining.tsx");
const trainingCss = read("components/BrainFitTraining.module.css");
const hardeningCss = read("app/brainfit-functional-hardening.css");
const responsiveCss = read("app/responsive-a11y-v97.css");
const interactionCss = read("app/interaction-finish-v97.css");
const layout = read("app/layout.tsx");
const journey = read("components/UnifiedTrainingJourney.tsx");
const progress = read("components/ProgressCoachDashboard.tsx");

const checks = [
  ["word search straight-line validation", training.includes("isStraightContiguous") && training.includes("WORD_GRID_SIZE")],
  ["word search robust board generation", training.includes("tryWordPuzzle") && training.includes("for(let board=0;board<50;board++)")],
  ["multiple sudoku variants", training.includes("makeSudokuRound") && training.includes("shuffled(ANIMALS)") && training.includes("rowOrder") && training.includes("colOrder")],
  ["crossword grid generation", training.includes("buildCrossword") && training.includes("CrosswordPuzzle") && training.includes("bfCrosswordGrid")],
  ["crossword intersections", training.includes("validateCrosswordPlacement") && training.includes("intersections")],
  ["brain-fit completion guard", training.includes("recorded[target]") && training.includes("recordBrainFitResult")],
  ["brain-fit touch targets", trainingCss.includes("min-height:52px") || responsiveCss.includes("min-height:44px")],
  ["2x2 sudoku visual regions", hardeningCss.includes("nth-child(2)") && hardeningCss.includes("nth-child(6)") && hardeningCss.includes("nth-child(n+5):nth-child(-n+8)")],
  ["no visible brain-fit recommendation CTA", !training.includes("Empfehlung öffnen") && !training.includes("Empfohlen")],
  ["no coach recommendation track", !journey.includes("Coach-Empfehlung") && !journey.includes("recommended")],
  ["progress dashboard has no recommendation panel", !progress.includes("Nächster Fokus") && !progress.includes("Heute sinnvoll")],
  ["reduced motion support", trainingCss.includes("prefers-reduced-motion") || responsiveCss.includes("prefers-reduced-motion")],
  ["keyboard focus styling", interactionCss.includes(":focus-visible") && interactionCss.includes("outline:3px solid")],
  ["skip link present", layout.includes("className=\"skipLink\"") && layout.includes("href=\"#main-content\"") && layout.includes("id=\"main-content\"") && layout.includes("tabIndex={-1}")],
  ["interaction finish loaded", layout.includes("interaction-finish-v97.css")],
  ["tab selection visible", interactionCss.includes("aria-selected=\"true\"")],
];

const failed = checks.filter(([, pass]) => !pass);
for (const [name, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) {
  throw new Error(`BrainFit QA failed: ${failed.map(([name]) => name).join(", ")}`);
}
console.log(`BrainFit QA PASS (${checks.length}/${checks.length})`);
