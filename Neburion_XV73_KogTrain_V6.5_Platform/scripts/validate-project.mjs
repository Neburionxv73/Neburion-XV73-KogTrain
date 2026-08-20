import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const requiredScripts = ["dev", "build", "typecheck", "validate", "quality:core"];
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing script: ${script}`);
}
if (packageJson.version !== "6.5.0") throw new Error("Version must be 6.5.0");
console.log("V6.5 project validation PASS");
