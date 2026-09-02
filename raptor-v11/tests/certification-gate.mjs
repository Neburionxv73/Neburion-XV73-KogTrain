import assert from 'node:assert/strict';
import { validateProjectContract } from '../controls/project-contract-validator.mjs';
import { certify } from '../controls/certification-engine.mjs';

const contract = {
  project_id:'AERONYX', version:'11.0-rc1', scope:'Enterprise reference project', risk_profile:'HIGH', data_class:'INTERNAL',
  roles:['NEBURION_XV73','MUDRASOL','SYNTHARION','DEPLOYMENT'],
  required_gates:['SPEC_GATE','SECURITY_GATE','BUILD_GATE','RESPONSIVE_GATE','A11Y_GATE','PERFORMANCE_GATE','VISUAL_QA_GATE','REVIEW_GATE','RELEASE_GATE'],
  release_policy:'raptor-v11/policies/release-policy.json', recovery:{rollback:true,incident_flow:true}
};
assert.equal(validateProjectContract(contract).valid, true);
assert.equal(validateProjectContract({...contract,roles:['NEBURION_XV73']}).valid, false);

const controls = {
  GATE_ENFORCEMENT:'PASS', RBAC:'PASS', SEPARATION_OF_DUTIES:'PASS', HUMAN_APPROVAL:'PASS', EVIDENCE_INTEGRITY:'PASS',
  MODEL_GOVERNANCE:'PASS', DATA_CLASSIFICATION:'PASS', SUPPLY_CHAIN:'PASS', INCIDENT_RECOVERY:'PASS', PROJECT_CONTRACT:'PASS'
};
const pass = certify({controls,critical_open_risks:0});
assert.equal(pass.releaseCandidate,true);
assert.equal(pass.status,'V11.0-RC1');
const fail = certify({controls:{...controls,EVIDENCE_INTEGRITY:'FAIL'},critical_open_risks:0});
assert.equal(fail.releaseCandidate,false);
assert.ok(fail.missing.includes('EVIDENCE_INTEGRITY'));
const riskFail = certify({controls,critical_open_risks:1});
assert.equal(riskFail.releaseCandidate,false);
console.log('PROJECT_CONTRACT: PASS');
console.log('ENTERPRISE_CERTIFICATION_GATE: PASS');
