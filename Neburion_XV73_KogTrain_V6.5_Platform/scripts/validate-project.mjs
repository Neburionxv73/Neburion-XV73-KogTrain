import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const requiredScripts = ["dev", "build", "typecheck", "validate", "quality:core"];
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing script: ${script}`);
}
if (packageJson.version !== "6.7.0-dev") throw new Error("Version must be 6.7.0-dev");
console.log("V6.7 project validation PASS");
