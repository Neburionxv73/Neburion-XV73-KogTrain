import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rbac = JSON.parse(fs.readFileSync(path.join(root, 'policies/rbac-policy.json'), 'utf8'));
const approvals = JSON.parse(fs.readFileSync(path.join(root, 'policies/approval-policy.json'), 'utf8'));

export function authorize({ role, action, approvalsProvided = 0, approvalRole = null, isOwnCriticalWork = false }) {
  const rolePolicy = rbac.roles[role];
  if (!rolePolicy) return { allowed: false, decision: 'DENIED', reason: 'UNKNOWN_ROLE' };

  if (isOwnCriticalWork) {
    return { allowed: false, decision: 'DENIED', reason: 'SEPARATION_OF_DUTIES' };
  }

  if (rolePolicy.deny.includes(action)) {
    return { allowed: false, decision: 'DENIED', reason: 'EXPLICIT_DENY' };
  }

  if (!rolePolicy.allow.includes(action)) {
    return { allowed: false, decision: 'DENIED', reason: 'DEFAULT_DENY' };
  }

  const mode = approvals.actions[action] ?? 'REVIEW';
  if (mode === 'APPROVAL') {
    const req = approvals.approval_requirements[action];
    if (!req) return { allowed: false, decision: 'BLOCKED', reason: 'APPROVAL_POLICY_MISSING' };
    if (approvalsProvided < req.minimum_approvals) {
      return { allowed: false, decision: 'BLOCKED', reason: 'APPROVAL_REQUIRED' };
    }
    if (approvalRole !== req.required_role) {
      return { allowed: false, decision: 'BLOCKED', reason: 'WRONG_APPROVER_ROLE' };
    }
  }

  return { allowed: true, decision: 'ALLOW', reason: mode };
}

if (process.argv[1] && process.argv[1].endsWith('authorization-engine.mjs')) {
  const [role, action, approvalsProvided = '0', approvalRole = '', own = 'false'] = process.argv.slice(2);
  const result = authorize({
    role,
    action,
    approvalsProvided: Number(approvalsProvided),
    approvalRole: approvalRole || null,
    isOwnCriticalWork: own === 'true'
  });
  console.log(JSON.stringify({ role, action, ...result }, null, 2));
  process.exit(result.allowed ? 0 : 1);
}
