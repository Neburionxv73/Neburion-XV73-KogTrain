import fs from 'node:fs';
import crypto from 'node:crypto';

const policy = JSON.parse(fs.readFileSync(new URL('../policies/evidence-policy.json', import.meta.url)));

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function validateEvidence(evidence, context, now = new Date()) {
  const errors = [];
  for (const field of policy.requiredFields) {
    if (evidence[field] === undefined || evidence[field] === null || evidence[field] === '') errors.push(`MISSING_FIELD:${field}`);
  }
  if (!policy.allowedResults.includes(evidence.result)) errors.push('INVALID_RESULT');
  if (policy.requireBuildBinding && evidence.build_id !== context.build_id) errors.push('BUILD_MISMATCH');
  if (policy.requireCommitBinding && evidence.commit !== context.commit) errors.push('COMMIT_MISMATCH');
  if (policy.requireSha256ArtifactHash && !/^[a-f0-9]{64}$/i.test(evidence.artifact_hash || '')) errors.push('INVALID_ARTIFACT_HASH');

  const ts = new Date(evidence.timestamp);
  if (Number.isNaN(ts.getTime())) errors.push('INVALID_TIMESTAMP');
  else {
    const ageMs = now.getTime() - ts.getTime();
    if (policy.denyFutureTimestamp && ageMs < 0) errors.push('FUTURE_TIMESTAMP');
    if (ageMs > policy.maxAgeHours * 60 * 60 * 1000) errors.push('STALE_EVIDENCE');
  }

  return {
    valid: errors.length === 0,
    decision: errors.length === 0 ? 'ACCEPT' : 'REJECT',
    errors,
    evidence_id: evidence.evidence_id,
    gate: evidence.gate
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [evidencePath, contextPath] = process.argv.slice(2);
  if (!evidencePath || !contextPath) {
    console.error('Usage: node evidence-validator.mjs <evidence.json> <context.json>');
    process.exit(2);
  }
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
  const result = validateEvidence(evidence, context);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.valid ? 0 : 1);
}
