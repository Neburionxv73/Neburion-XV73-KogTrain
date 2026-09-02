import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { evaluateRelease } from '../controls/gate-engine.mjs';

const root = path.resolve(import.meta.dirname, '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, 'fixtures', name), 'utf8'));

const pass = evaluateRelease(load('all-pass.json'));
assert.equal(pass.releaseAllowed, true, 'all-pass fixture must release');
assert.equal(pass.releaseGate, 'PASS');
assert.deepEqual(pass.reasons, []);

const missingVisual = evaluateRelease(load('missing-visual-evidence.json'));
assert.equal(missingVisual.releaseAllowed, false, 'missing visual evidence must block release');
assert.equal(missingVisual.releaseGate, 'BLOCKED');
assert.ok(missingVisual.reasons.includes('VISUAL_QA_GATE:NOT_CAPTURED'));

const selfContainedNoEvidence = load('all-pass.json');
selfContainedNoEvidence.gates = selfContainedNoEvidence.gates.map((gate) =>
  gate.gate === 'A11Y_GATE' ? { ...gate, evidence: [] } : gate
);
const noEvidence = evaluateRelease(selfContainedNoEvidence);
assert.equal(noEvidence.releaseAllowed, false, 'PASS without evidence must block release');
assert.ok(noEvidence.reasons.includes('A11Y_GATE:NO_EVIDENCE'));

const criticalRiskInput = load('all-pass.json');
criticalRiskInput.criticalRisks = 1;
const criticalRisk = evaluateRelease(criticalRiskInput);
assert.equal(criticalRisk.releaseAllowed, false, 'critical risk must block release');
assert.ok(criticalRisk.reasons.includes('CRITICAL_RISKS:1'));

console.log('Raptor Delta V11 Sprint 1 failure-injection tests: PASS');
