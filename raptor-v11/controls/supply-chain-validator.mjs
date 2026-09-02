import fs from 'node:fs';
const policy = JSON.parse(fs.readFileSync(new URL('../policies/supply-chain-policy.json', import.meta.url)));

export function validateSupplyChain(input) {
  const errors = [];
  const warnings = [];
  if (policy.requireLockfile && !input.lockfilePresent) errors.push('LOCKFILE_REQUIRED');
  for (const dep of input.dependencies || []) {
    if (policy.denyFloatingVersions && policy.forbiddenVersionTokens.includes(dep.version)) errors.push(`FLOATING_VERSION:${dep.name}`);
  }
  for (const finding of input.vulnerabilities || []) {
    if (finding.severity === 'critical' && policy.criticalVulnerabilityBlocksRelease) errors.push(`CRITICAL_VULNERABILITY:${finding.id}`);
    if (finding.severity === 'high' && policy.highVulnerabilityRequiresReview) warnings.push(`HIGH_VULNERABILITY_REVIEW:${finding.id}`);
  }
  const text = (input.scannedText || '');
  for (const pattern of policy.secretPatterns) {
    if (text.includes(pattern)) errors.push(`SECRET_PATTERN:${pattern}`);
  }
  if (policy.requireArtifactSha256 && !/^[a-f0-9]{64}$/i.test(input.artifactHash || '')) errors.push('INVALID_ARTIFACT_HASH');
  return { valid: errors.length === 0, decision: errors.length ? 'BLOCK' : 'ALLOW', errors, warnings };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const file = process.argv[2];
  if (!file) process.exit(2);
  const result = validateSupplyChain(JSON.parse(fs.readFileSync(file, 'utf8')));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.valid ? 0 : 1);
}
