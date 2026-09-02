import assert from 'node:assert/strict';
import { handleDeploymentEvent } from '../controls/operations-engine.mjs';

const cases = [
  ['healthy deploy continues', { type: 'HEALTHCHECK_PASS' }, 'CONTINUE', false],
  ['failed healthcheck rolls back', { type: 'HEALTHCHECK_FAIL', severity: 'SEV-2' }, 'ROLLBACK', true],
  ['critical runtime error rolls back', { type: 'CRITICAL_RUNTIME_ERROR', severity: 'SEV-1' }, 'ROLLBACK', true],
  ['security regression rolls back', { type: 'SECURITY_REGRESSION', severity: 'SEV-1' }, 'ROLLBACK', true],
  ['minor warning does not rollback', { type: 'NON_CRITICAL_WARNING', severity: 'SEV-4' }, 'CONTINUE', false]
];

for (const [name, event, action, incident] of cases) {
  const result = handleDeploymentEvent(event);
  assert.equal(result.action, action, `${name}: action mismatch`);
  assert.equal(result.incident, incident, `${name}: incident mismatch`);
  if (action === 'ROLLBACK') {
    assert.equal(result.requireVerification, true, `${name}: verification required`);
    assert.deepEqual(result.flow, ['DETECT','CONTAIN','ANALYZE','RECOVER','VERIFY','DOCUMENT']);
  }
  console.log(`PASS: ${name} -> ${result.action}`);
}
console.log(`OPERATIONS_FAILURE_INJECTION: PASS (${cases.length}/${cases.length})`);
