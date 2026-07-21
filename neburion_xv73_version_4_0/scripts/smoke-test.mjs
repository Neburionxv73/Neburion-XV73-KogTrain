import { spawn } from "node:child_process";

const port = 43173;
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
  "/", "/dashboard", "/onboarding", "/session", "/training", "/memory-lab", "/attention-lab",
  "/logic-lab", "/language-lab", "/visual-lab", "/progress", "/achievements", "/coach",
  "/profile", "/settings", "/app-status", "/offline", "/developer-center", "/product-manifest", "/manifest.webmanifest"
];

const server = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "start", "--", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "production" },
  detached: process.platform !== "win32"
});

let output = "";
server.stdout.on("data", (chunk) => { output += chunk.toString(); });
server.stderr.on("data", (chunk) => { output += chunk.toString(); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const deadline = Date.now() + 30000;
let ready = false;

try {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) { ready = true; break; }
    } catch {}
    await sleep(500);
  }

  if (!ready) throw new Error(`Produktionsserver wurde nicht rechtzeitig erreichbar.\n${output}`);

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    if (response.status < 200 || response.status >= 400) {
      throw new Error(`Smoke-Test fehlgeschlagen: ${route} antwortet mit HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (route !== "/manifest.webmanifest" && !contentType.includes("text/html")) {
      throw new Error(`Smoke-Test fehlgeschlagen: ${route} liefert unerwarteten Content-Type '${contentType}'`);
    }
    console.log(`✓ HTTP ${response.status} ${route}`);
  }
  console.log(`\nSmoke-Test bestanden: ${routes.length} Produktionsrouten erreichbar.`);
} finally {
  if (process.platform === "win32") {
    server.kill("SIGTERM");
  } else {
    try { process.kill(-server.pid, "SIGTERM"); } catch {}
  }
  await sleep(300);
}
