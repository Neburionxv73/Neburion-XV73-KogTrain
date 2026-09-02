import assert from 'node:assert/strict';
import { validateSupplyChain } from '../controls/supply-chain-validator.mjs';

const goodHash = 'a'.repeat(64);
const cases = [
  ['clean supply chain allowed', { lockfilePresent: true, dependencies: [{name:'next',version:'16.2.11'}], vulnerabilities: [], scannedText: '', artifactHash: goodHash }, true, []],
  ['missing lockfile blocked', { lockfilePresent: false, dependencies: [], vulnerabilities: [], scannedText: '', artifactHash: goodHash }, false, ['LOCKFILE_REQUIRED']],
  ['floating dependency blocked', { lockfilePresent: true, dependencies: [{name:'react',version:'latest'}], vulnerabilities: [], scannedText: '', artifactHash: goodHash }, false, ['FLOATING_VERSION:react']],
  ['critical vulnerability blocked', { lockfilePresent: true, dependencies: [], vulnerabilities: [{id:'CVE-TEST-1',severity:'critical'}], scannedText: '', artifactHash: goodHash }, false, ['CRITICAL_VULNERABILITY:CVE-TEST-1']],
  ['secret pattern blocked', { lockfilePresent: true, dependencies: [], vulnerabilities: [], scannedText: 'token=ghp_example', artifactHash: goodHash }, false, ['SECRET_PATTERN:ghp_']],
  ['bad artifact hash blocked', { lockfilePresent: true, dependencies: [], vulnerabilities: [], scannedText: '', artifactHash: 'bad' }, false, ['INVALID_ARTIFACT_HASH']]
];

for (const [name, input, valid, expectedErrors] of cases) {
  const result = validateSupplyChain(input);
  assert.equal(result.valid, valid, `${name}: validity mismatch`);
  for (const error of expectedErrors) assert.ok(result.errors.includes(error), `${name}: missing ${error}`);
  console.log(`PASS: ${name} -> ${result.decision}${result.errors.length ? '/' + result.errors.join(',') : ''}`);
}
console.log(`SUPPLY_CHAIN_FAILURE_INJECTION: PASS (${cases.length}/${cases.length})`);
