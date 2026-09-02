import assert from 'node:assert/strict';
import { authorize } from '../controls/authorization-engine.mjs';

const tests = [
  {
    name: 'Mudrasol cannot deploy production',
    input: { role: 'MUDRASOL', action: 'production.deploy' },
    allowed: false,
    reason: 'EXPLICIT_DENY'
  },
  {
    name: 'Syntharion cannot deploy production',
    input: { role: 'SYNTHARION', action: 'production.deploy' },
    allowed: false,
    reason: 'EXPLICIT_DENY'
  },
  {
    name: 'Neburion cannot self-approve critical work',
    input: { role: 'NEBURION_XV73', action: 'release.recommend', isOwnCriticalWork: true },
    allowed: false,
    reason: 'SEPARATION_OF_DUTIES'
  },
  {
    name: 'Deployment role without approval is blocked',
    input: { role: 'DEPLOYMENT', action: 'production.deploy' },
    allowed: false,
    reason: 'APPROVAL_REQUIRED'
  },
  {
    name: 'Deployment role with wrong approver is blocked',
    input: { role: 'DEPLOYMENT', action: 'production.deploy', approvalsProvided: 1, approvalRole: 'NEBURION_XV73' },
    allowed: false,
    reason: 'WRONG_APPROVER_ROLE'
  },
  {
    name: 'Deployment role with valid approval may deploy',
    input: { role: 'DEPLOYMENT', action: 'production.deploy', approvalsProvided: 1, approvalRole: 'DEPLOYMENT' },
    allowed: true,
    reason: 'APPROVAL'
  },
  {
    name: 'Unknown role is denied by default',
    input: { role: 'UNKNOWN_AGENT', action: 'production.deploy' },
    allowed: false,
    reason: 'UNKNOWN_ROLE'
  }
];

for (const test of tests) {
  const result = authorize(test.input);
  assert.equal(result.allowed, test.allowed, `${test.name}: allowed mismatch`);
  assert.equal(result.reason, test.reason, `${test.name}: reason mismatch`);
  console.log(`PASS: ${test.name} -> ${result.decision}/${result.reason}`);
}

console.log(`RBAC_FAILURE_INJECTION: PASS (${tests.length}/${tests.length})`);
