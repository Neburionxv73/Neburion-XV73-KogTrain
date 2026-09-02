import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'policies', 'release-policy.json'), 'utf8'));

export function evaluateRelease(input) {
  const reasons = [];
  const gateMap = new Map((input.gates ?? []).map((g) => [g.gate, g]));

  for (const gateName of policy.requiredGates) {
    const gate = gateMap.get(gateName);
    if (!gate) {
      reasons.push(`${gateName}:MISSING`);
      continue;
    }
    if (gate.status !== policy.allowedPassState) {
      reasons.push(`${gateName}:${gate.status}`);
      continue;
    }
    if (policy.requireEvidence && (!Array.isArray(gate.evidence) || gate.evidence.length === 0)) {
      reasons.push(`${gateName}:NO_EVIDENCE`);
    }
  }

  const criticalRisks = Number(input.criticalRisks ?? 0);
  if (criticalRisks > policy.criticalRiskLimit) {
    reasons.push(`CRITICAL_RISKS:${criticalRisks}`);
  }

  const allowed = reasons.length === 0;
  return {
    releaseGate: allowed ? policy.releaseDecision.pass : policy.releaseDecision.deny,
    releaseAllowed: allowed,
    reasons
  };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node gate-engine.mjs <release-input.json>');
    process.exit(2);
  }

  const input = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const result = evaluateRelease(input);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.releaseAllowed ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  main();
}
