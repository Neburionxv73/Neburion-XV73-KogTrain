import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const passes = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const pass = (m) => passes.push(m);
const fail = (m) => failures.push(m);

const packageJson = JSON.parse(read("package.json"));
const appConfig = JSON.parse(read("data/app-config.json"));
if (packageJson.version === "4.0.0" && appConfig.version === packageJson.version) pass("Stable-Version 4.0.0 konsistent");
else fail("Stable-Version ist nicht konsistent");
if (appConfig.channel === "stable") pass("Release-Kanal stable gesetzt");
else fail("Release-Kanal ist nicht stable");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (/\.(tsx?|jsx?|json|md)$/.test(entry.name)) sourceFiles.push(relative);
  }
};
for (const dir of ["app", "components", "features", "data"]) if (exists(dir)) walk(dir);

const forbiddenCoachPhrases = [
  /deine\s+(leistung|aufmerksamkeit|logik|sprache|wahrnehmung)\s+ist\s+(schwach|schlecht)/i,
  /du\s+hast\s+versagt/i,
  /ungenügend/i,
  /unterdurchschnittlich/i,
  /dein\s+defizit/i
];
for (const file of sourceFiles) {
  const source = read(file);
  for (const pattern of forbiddenCoachPhrases) if (pattern.test(source)) fail(`Defizitorientierte Formulierung in ${file}: ${pattern}`);
}
if (!failures.some((item) => item.startsWith("Defizitorientierte"))) pass("Coach-Sprache bleibt stärkenorientiert und nicht beschämend");

const corpus = sourceFiles.map(read).join("\n");
for (const check of [
  { pattern: /keine medizinische Diagnose|stellt keine medizinische Diagnose|keine Diagnose/i, label: "Diagnose-Abgrenzung" },
  { pattern: /ersetzt keine medizinische Behandlung|ersetzt keine.*Therapie|Training ersetzt keine/i, label: "Therapie-Abgrenzung" },
  { pattern: /lokal.*Browser|bleiben im Browser|lokal gespeichert/i, label: "Lokale Datenverarbeitung" }
]) check.pattern.test(corpus) ? pass(`${check.label} vorhanden`) : fail(`${check.label} fehlt`);

for (const marker of ["Beta 3.9 · Release Candidate", 'const APP_VERSION = "3.4.0-beta.1"', 'const VERSION = "3.5.0-beta.1"']) {
  corpus.includes(marker) || (exists("public/sw.js") && read("public/sw.js").includes(marker)) ? fail(`Veraltete produktive Kennzeichnung gefunden: ${marker}`) : pass(`Keine veraltete produktive Kennzeichnung: ${marker}`);
}

for (const file of [
  "docs/VERSION_4_0_PLATFORM_RELEASE.md",
  "docs/QA_RESULT_VERSION_4_0.md",
  "docs/MANUAL_DEVICE_TEST_PLAN.md",
  "RELEASE_CHECK_WINDOWS.bat"
]) exists(file) ? pass(`Release-Artefakt vorhanden: ${file}`) : fail(`Release-Artefakt fehlt: ${file}`);

const releaseNotes = JSON.parse(read("data/release-notes.json"));
if (releaseNotes[0]?.version === "4.0.0") pass("Release Notes beginnen mit Version 4.0.0");
else fail("Release Notes enthalten Version 4.0.0 nicht an erster Stelle");

console.log("\nNEBURION XV73 – PLATFORM-RELEASE-PRÜFUNG\n");
for (const item of passes) console.log(`✓ ${item}`);
if (failures.length) {
  for (const item of failures) console.error(`✗ ${item}`);
  console.error(`\nRelease-Prüfung fehlgeschlagen: ${failures.length} Fehler.`);
  process.exit(1);
}
console.log(`\nRelease-Prüfung bestanden: ${passes.length} Prüfungen, 0 Fehler.`);
