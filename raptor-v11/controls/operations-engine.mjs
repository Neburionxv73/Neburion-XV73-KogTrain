import fs from 'node:fs';
const policy = JSON.parse(fs.readFileSync(new URL('../policies/operations-policy.json', import.meta.url)));

export function handleDeploymentEvent(event) {
  const shouldRollback = policy.rollbackOn.includes(event.type);
  if (!shouldRollback) return { action: 'CONTINUE', incident: false, severity: event.severity || null };
  return {
    action: 'ROLLBACK',
    incident: policy.requireIncidentRecordOnRollback,
    severity: event.severity || 'SEV-2',
    requireVerification: policy.requirePostRollbackVerification,
    flow: policy.flow
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [type, severity] = process.argv.slice(2);
  const result = handleDeploymentEvent({ type, severity });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.action === 'ROLLBACK' ? 1 : 0);
}
