import fs from "node:fs";
import path from "node:path";
const required = [
  "app/page.tsx","app/dashboard/page.tsx","app/training/page.tsx",
  "app/developer-center/page.tsx","app/product-manifest/page.tsx","app/memory-lab/page.tsx","app/attention-lab/page.tsx",
  "features/exercise-runner/engine.ts","data/exercises.ts","vercel.json","public/sw.js"
];
const missing = required.filter(file => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Fehlende Pflichtdateien:\n" + missing.join("\n"));
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync("data/app-config.json","utf8"));
if (!config.version || !config.channel) {
  console.error("app-config.json benötigt version und channel.");
  process.exit(1);
}
console.log(`Projektprüfung bestanden: ${config.name} ${config.version} (${config.channel})`);
