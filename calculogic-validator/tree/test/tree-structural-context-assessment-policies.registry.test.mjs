import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getBuiltinStructuralContextAssessmentPoliciesRegistry,
  normalizeStructuralContextAssessmentPoliciesRegistryPayload,
} from '../src/registries/tree-structural-context-assessment-policies-registry.logic.mjs';

const validPayload = () => ({
  version: '1',
  policies: [{
    policyId: 'relationship-qualified-semantic-qualified-structural-container-aligned',
    match: {
      structuralClass: 'relationship-qualified-structural-container',
      structuralKind: 'implementation-container',
      relationshipQualified: true,
      classificationEvidenceKind: 'relationship-qualified-folder-kind',
      relationshipPerspective: 'semantic-qualified-structural-container',
      relationshipInterpretation: 'semantic-qualified-structural-container-aligned',
    },
    assessment: {
      outcome: 'coherent',
      kind: 'coherent-semantic-qualified-structural-container',
      reportable: false,
      rationale: 'Tree-approved aligned semantic-qualified structural implementation-container classification is structurally coherent in its addressed semantic context.',
    },
  }],
});

test('valid builtin structural-context assessment policy loads', () => {
  const registry = getBuiltinStructuralContextAssessmentPoliciesRegistry();

  assert.equal(registry.version, '1');
  assert.equal(registry.policies.length, 1);
  assert.deepEqual(registry.policies[0], validPayload().policies[0]);
});

test('structural-context assessment registry rejects non-object payloads', () => {
  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(null), /expected object payload/u);
  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload([]), /expected object payload/u);
});

test('structural-context assessment registry rejects non-array policy list', () => {
  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload({ policies: {} }), /policies must be an array/u);
});

test('structural-context assessment registry rejects missing policy id', () => {
  const payload = validPayload();
  delete payload.policies[0].policyId;

  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(payload), /policyId must be a non-empty string/u);
});

test('structural-context assessment registry rejects duplicate policy id', () => {
  const payload = validPayload();
  payload.policies.push({ ...validPayload().policies[0] });

  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(payload), /duplicate policyId/u);
});

test('structural-context assessment registry rejects missing required classification selector', () => {
  const payload = validPayload();
  delete payload.policies[0].match.relationshipInterpretation;

  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(payload), /match\.relationshipInterpretation is required/u);
});

test('structural-context assessment registry rejects missing assessment outcome or kind', () => {
  const withoutOutcome = validPayload();
  delete withoutOutcome.policies[0].assessment.outcome;
  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(withoutOutcome), /assessment\.outcome/u);

  const withoutKind = validPayload();
  delete withoutKind.policies[0].assessment.kind;
  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(withoutKind), /assessment\.kind/u);
});

test('structural-context assessment registry rejects non-boolean reportable', () => {
  const payload = validPayload();
  payload.policies[0].assessment.reportable = 'false';

  assert.throws(() => normalizeStructuralContextAssessmentPoliciesRegistryPayload(payload), /assessment\.reportable must be a boolean/u);
});
