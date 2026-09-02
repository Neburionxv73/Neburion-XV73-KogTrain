const REQUIRED = [
  'GATE_ENFORCEMENT','RBAC','SEPARATION_OF_DUTIES','HUMAN_APPROVAL','EVIDENCE_INTEGRITY',
  'MODEL_GOVERNANCE','DATA_CLASSIFICATION','SUPPLY_CHAIN','INCIDENT_RECOVERY','PROJECT_CONTRACT'
];

export function certify(input) {
  const missing = REQUIRED.filter(k => input.controls?.[k] !== 'PASS');
  const criticalRisks = Number(input.critical_open_risks ?? 0);
  if (criticalRisks > 0) missing.push('CRITICAL_OPEN_RISKS');
  const allowed = missing.length === 0;
  return {
    status: allowed ? 'V11.0-RC1' : 'NOT_CERTIFIED',
    releaseCandidate: allowed,
    missing,
    principle: 'NO EVIDENCE -> NO ENTERPRISE CLAIM'
  };
}
