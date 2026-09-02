import assert from 'node:assert/strict';
import { routeModel } from '../controls/model-router.mjs';

const cases = [
  ['restricted on local trusted allowed', { dataClass: 'RESTRICTED', requestedModel: 'LOCAL_TRUSTED', requestedTool: 'local.compute' }, true, 'POLICY_MATCH'],
  ['restricted on frontier denied', { dataClass: 'RESTRICTED', requestedModel: 'FRONTIER_APPROVED', requestedTool: 'repo.read' }, false, 'MODEL_NOT_ALLOWED_FOR_DATA_CLASS'],
  ['restricted on open weight denied', { dataClass: 'RESTRICTED', requestedModel: 'OPEN_WEIGHT_SANDBOX', requestedTool: 'local.compute' }, false, 'MODEL_NOT_ALLOWED_FOR_DATA_CLASS'],
  ['confidential on frontier allowed', { dataClass: 'CONFIDENTIAL', requestedModel: 'FRONTIER_APPROVED', requestedTool: 'repo.read' }, true, 'POLICY_MATCH'],
  ['internal on open weight allowed', { dataClass: 'INTERNAL', requestedModel: 'OPEN_WEIGHT_SANDBOX', requestedTool: 'local.compute' }, true, 'POLICY_MATCH'],
  ['unknown model denied', { dataClass: 'PUBLIC', requestedModel: 'UNKNOWN_MODEL', requestedTool: 'repo.read' }, false, 'UNKNOWN_MODEL'],
  ['tool outside model permission denied', { dataClass: 'INTERNAL', requestedModel: 'OPEN_WEIGHT_SANDBOX', requestedTool: 'repo.write' }, false, 'TOOL_NOT_ALLOWED_FOR_MODEL']
];

for (const [name, input, allowed, reason] of cases) {
  const result = routeModel(input);
  assert.equal(result.allowed, allowed, `${name}: allowed mismatch`);
  assert.equal(result.reason, reason, `${name}: reason mismatch`);
  console.log(`PASS: ${name} -> ${result.decision}/${result.reason}`);
}
console.log(`MODEL_GOVERNANCE_FAILURE_INJECTION: PASS (${cases.length}/${cases.length})`);
