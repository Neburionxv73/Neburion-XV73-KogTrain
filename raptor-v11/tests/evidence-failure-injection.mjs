import assert from 'node:assert/strict';
import { validateEvidence, sha256 } from '../controls/evidence-validator.mjs';

const now = new Date('2026-09-02T10:30:00Z');
const context = { project_id: 'AERONYX', build_id: 'BUILD-0042', commit: 'abc123' };
const base = {
  evidence_id: 'EVD-000127', project_id: 'AERONYX', run_id: 'RUN-0042', commit: 'abc123', build_id: 'BUILD-0042',
  gate: 'A11Y_GATE', result: 'PASS', timestamp: '2026-09-02T10:00:00Z', artifact_hash: sha256('artifact-build-0042'), reviewer: 'SYNTHARION'
};

const cases = [
  ['current evidence accepted', base, true, []],
  ['old build rejected', { ...base, build_id: 'BUILD-0041' }, false, ['BUILD_MISMATCH']],
  ['wrong commit rejected', { ...base, commit: 'deadbeef' }, false, ['COMMIT_MISMATCH']],
  ['stale evidence rejected', { ...base, timestamp: '2026-08-31T09:00:00Z' }, false, ['STALE_EVIDENCE']],
  ['future evidence rejected', { ...base, timestamp: '2026-09-03T10:00:00Z' }, false, ['FUTURE_TIMESTAMP']],
  ['invalid artifact hash rejected', { ...base, artifact_hash: 'not-a-hash' }, false, ['INVALID_ARTIFACT_HASH']],
  ['missing reviewer rejected', { ...base, reviewer: '' }, false, ['MISSING_FIELD:reviewer']]
];

for (const [name, evidence, expectedValid, expectedErrors] of cases) {
  const result = validateEvidence(evidence, context, now);
  assert.equal(result.valid, expectedValid, `${name}: validity mismatch`);
  for (const error of expectedErrors) assert.ok(result.errors.includes(error), `${name}: missing ${error}`);
  console.log(`PASS: ${name} -> ${result.decision}${result.errors.length ? '/' + result.errors.join(',') : ''}`);
}
console.log(`EVIDENCE_FAILURE_INJECTION: PASS (${cases.length}/${cases.length})`);
