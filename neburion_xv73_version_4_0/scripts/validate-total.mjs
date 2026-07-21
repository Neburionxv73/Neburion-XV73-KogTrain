import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const pass = (message) => passes.push(message);
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

const routes = [
  "/", "/dashboard", "/onboarding", "/session", "/training", "/memory-lab", "/attention-lab",
  "/logic-lab", "/language-lab", "/visual-lab", "/progress", "/achievements", "/coach",
  "/profile", "/settings", "/app-status", "/offline", "/developer-center", "/product-manifest"
];

for (const route of routes) {
  const page = route === "/" ? "app/page.tsx" : `app${route}/page.tsx`;
  exists(page) ? pass(`Route vorhanden: ${route}`) : fail(`Route fehlt: ${route} (${page})`);
}

const labComponents = ["MemoryLab", "AttentionLab", "LogicLab", "LanguageLab", "VisualLab"];
for (const component of labComponents) {
  const file = `components/training/${component}.tsx`;
  exists(file) ? pass(`Trainingskomponente vorhanden: ${component}`) : fail(`Trainingskomponente fehlt: ${file}`);
}

const packageJson = JSON.parse(read("package.json"));
const appConfig = JSON.parse(read("data/app-config.json"));
if (packageJson.version === appConfig.version) pass(`Version konsistent: ${appConfig.version}`);
else fail(`Versionskonflikt: package.json=${packageJson.version}, app-config=${appConfig.version}`);

const tsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) tsFiles.push(relative);
  }
};
for (const dir of ["app", "components", "features", "data"]) if (exists(dir)) walk(dir);

const knownRoutes = new Set(routes);
const discoveredLinks = new Set();
for (const file of tsFiles) {
  const source = read(file);
  for (const match of source.matchAll(/href\s*=\s*["'`]([^"'`]+)["'`]/g)) {
    const href = match[1];
    if (href.startsWith("/")) discoveredLinks.add(href.split(/[?#]/)[0]);
    if (href === "#") warn(`Leerer Platzhalter-Link in ${file}`);
  }
}
for (const href of discoveredLinks) {
  if (!knownRoutes.has(href)) fail(`Interner Link ohne bekannte Route: ${href}`);
}
pass(`${discoveredLinks.size} interne Linkziele geprüft`);

const idMap = new Map();
for (const file of ["data/exercises.ts", "data/memory-exercises.ts", "data/attention-exercises.ts"]) {
  const source = read(file);
  for (const match of source.matchAll(/\bid:\s*["']([^"']+)["']/g)) {
    const id = match[1];
    if (idMap.has(id)) fail(`Doppelte Übungs-ID '${id}' in ${idMap.get(id)} und ${file}`);
    else idMap.set(id, file);
  }
}
if (idMap.size >= 30) pass(`${idMap.size} eindeutige datenbasierte Übungs-IDs geprüft`);
else warn(`Nur ${idMap.size} datenbasierte Übungs-IDs gefunden; komponenteninterne Übungen werden separat per TypeScript geprüft.`);

const shell = read("components/layout/AppShell.tsx");
if (/id=["']main-content["']/.test(shell) || /<main\b/.test(shell)) pass("Hauptinhalts-Landmarke vorhanden");
else fail("Keine erkennbare Hauptinhalts-Landmarke im AppShell");
if (/skip|Zum Hauptinhalt|Hauptinhalt/i.test(shell)) pass("Sprunglink/Skip-Navigation vorhanden");
else warn("Sprunglink konnte im AppShell nicht eindeutig erkannt werden");

const navigation = read("components/layout/Navigation.tsx");
if (/aria-current/.test(navigation)) pass("Aktive Navigation verwendet aria-current");
else warn("aria-current wurde in der Navigation nicht gefunden");

const css = read("app/globals.css");
if (/:focus-visible/.test(css)) pass("Tastatur-Fokuszustände definiert");
else fail("Keine :focus-visible-Regeln gefunden");
if (/prefers-reduced-motion/.test(css)) pass("Reduzierte Bewegung wird berücksichtigt");
else fail("prefers-reduced-motion fehlt");
if (/prefers-contrast/.test(css)) pass("Erhöhter Kontrast wird berücksichtigt");
else warn("prefers-contrast konnte nicht gefunden werden");

if (exists("public/sw.js")) pass("Service Worker vorhanden");
else fail("Service Worker fehlt");
if (exists("app/manifest.ts")) pass("Web-App-Manifest vorhanden");
else fail("Web-App-Manifest fehlt");
for (const icon of ["public/icons/icon-192.png","public/icons/icon-512.png","public/icons/icon-maskable-512.png"]) exists(icon) ? pass(`PWA-Icon vorhanden: ${icon}`) : fail(`PWA-Icon fehlt: ${icon}`);
const sw = read("public/sw.js");
if (/offline/.test(sw) && /SKIP_WAITING/.test(sw)) pass("Offline-Fallback und kontrolliertes Service-Worker-Update vorhanden"); else fail("Service Worker enthält nicht alle Beta-3.5-PWA-Funktionen");
if (exists("vercel.json")) pass("Vercel-Konfiguration vorhanden");
else fail("Vercel-Konfiguration fehlt");
if (exists(".github/workflows/quality.yml")) pass("CI-Build-Cache und Qualitätsworkflow vorhanden");
else fail("CI-Qualitätsworkflow fehlt");

console.log("\nNEBURION XV73 – GESAMTPRÜFUNG\n");
for (const item of passes) console.log(`✓ ${item}`);
for (const item of warnings) console.warn(`⚠ ${item}`);

if (failures.length) {
  for (const item of failures) console.error(`✗ ${item}`);
  console.error(`\nGesamtprüfung fehlgeschlagen: ${failures.length} Fehler, ${warnings.length} Hinweise.`);
  process.exit(1);
}
console.log(`\nGesamtprüfung bestanden: ${passes.length} Prüfungen, ${warnings.length} Hinweise, 0 Fehler.`);
