export function validateProjectContract(contract) {
  const errors = [];
  for (const field of ['project_id','version','scope','risk_profile','data_class','roles','required_gates','release_policy','recovery']) {
    if (contract[field] === undefined || contract[field] === null || contract[field] === '') errors.push(`MISSING_FIELD:${field}`);
  }
  if (!['LOW','STANDARD','HIGH','CRITICAL'].includes(contract.risk_profile)) errors.push('INVALID_RISK_PROFILE');
  if (!['PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED'].includes(contract.data_class)) errors.push('INVALID_DATA_CLASS');
  if (!Array.isArray(contract.roles) || contract.roles.length < 2) errors.push('INSUFFICIENT_ROLE_SEPARATION');
  if (!Array.isArray(contract.required_gates) || contract.required_gates.length === 0) errors.push('NO_REQUIRED_GATES');
  if (!contract.recovery || contract.recovery.rollback !== true || contract.recovery.incident_flow !== true) errors.push('RECOVERY_NOT_ENFORCED');
  return { valid: errors.length === 0, decision: errors.length ? 'REJECT' : 'ACCEPT', errors };
}
