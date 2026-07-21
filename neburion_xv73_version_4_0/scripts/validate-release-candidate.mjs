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
if (packageJson.version === "3.9.0-rc.1" && appConfig.version === packageJson.version) pass("Release-Candidate-Version konsistent");
else fail("Release-Candidate-Version ist nicht konsistent");
if (appConfig.channel === "release-candidate") pass("Release-Kanal korrekt gesetzt");
else fail("Release-Kanal ist nicht release-candidate");

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
if (!failures.some((item) => item.startsWith("Defizitorientierte"))) pass("Coach-Sprache ohne direkte Beschämungs- oder Defizitformulierungen");

const requiredBoundaries = [
  { pattern: /keine medizinische Diagnose|stellt keine medizinische Diagnose|keine Diagnose/i, label: "Diagnose-Abgrenzung" },
  { pattern: /ersetzt keine medizinische Behandlung|ersetzt keine.*Therapie|Training ersetzt keine/i, label: "Therapie-Abgrenzung" },
  { pattern: /lokal.*Browser|bleiben im Browser|lokal gespeichert/i, label: "Lokale Datenverarbeitung" }
];
const corpus = sourceFiles.map(read).join("\n");
for (const check of requiredBoundaries) check.pattern.test(corpus) ? pass(`${check.label} vorhanden`) : fail(`${check.label} fehlt`);

const stale = ["Beta 3.5 · Offline Excellence"];
for (const marker of stale) corpus.includes(marker) ? fail(`Veraltete Release-Kennzeichnung gefunden: ${marker}`) : pass(`Keine veraltete Kennzeichnung: ${marker}`);

for (const file of ["docs/BETA_3_9_RELEASE_CANDIDATE.md", "docs/MANUAL_DEVICE_TEST_PLAN.md", "RELEASE_CHECK_WINDOWS.bat"]) {
  exists(file) ? pass(`Release-Artefakt vorhanden: ${file}`) : fail(`Release-Artefakt fehlt: ${file}`);
}

console.log("\nNEBURION XV73 – RELEASE-CANDIDATE-PRÜFUNG\n");
for (const item of passes) console.log(`✓ ${item}`);
if (failures.length) {
  for (const item of failures) console.error(`✗ ${item}`);
  console.error(`\nRC-Prüfung fehlgeschlagen: ${failures.length} Fehler.`);
  process.exit(1);
}
console.log(`\nRC-Prüfung bestanden: ${passes.length} Prüfungen, 0 Fehler.`);
