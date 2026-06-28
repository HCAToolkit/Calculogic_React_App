import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeStructuralContextAssessment } from '../src/tree-structural-context-assessment.logic.mjs';

const policy = (policyId = 'relationship-qualified-semantic-qualified-structural-container-aligned') => ({
  policyId,
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
    rationale: 'coherent rationale',
  },
});

const matchingClassification = (overrides = {}) => ({
  addressPath: 'A.2.1.1',
  parentAddressPath: 'A.2.1',
  path: 'calculogic-validator/naming/naming-src',
  name: 'naming-src',
  occurrenceType: 'folder',
  structuralClass: 'relationship-qualified-structural-container',
  structuralKind: 'implementation-container',
  relationshipQualified: true,
  classificationEvidenceKind: 'relationship-qualified-folder-kind',
  relationshipPerspective: 'semantic-qualified-structural-container',
  relationshipInterpretation: 'semantic-qualified-structural-container-aligned',
  structuralRole: 'implementation-container',
  semanticContext: 'naming',
  semanticContextEvidenceAddressPath: 'A.2.1',
  ...overrides,
});

const assess = (records, policies = [policy()]) => prepareTreeStructuralContextAssessment({
  currentOccurrenceClassificationRecords: records,
  structuralContextAssessmentPoliciesRegistry: { version: '1', policies },
});

test('one exact matching classification produces one coherent assessment record', () => {
  const result = assess([matchingClassification()]);

  assert.equal(result.source, 'tree-structural-context-assessment');
  assert.equal(result.assessmentRecords.length, 1);
  assert.deepEqual(result.assessmentRecords[0], {
    addressPath: 'A.2.1.1',
    parentAddressPath: 'A.2.1',
    path: 'calculogic-validator/naming/naming-src',
    name: 'naming-src',
    occurrenceType: 'folder',
    structuralClass: 'relationship-qualified-structural-container',
    structuralKind: 'implementation-container',
    relationshipQualified: true,
    classificationEvidenceKind: 'relationship-qualified-folder-kind',
    relationshipPerspective: 'semantic-qualified-structural-container',
    relationshipInterpretation: 'semantic-qualified-structural-container-aligned',
    structuralRole: 'implementation-container',
    semanticContext: 'naming',
    semanticContextEvidenceAddressPath: 'A.2.1',
    assessmentPolicyId: 'relationship-qualified-semantic-qualified-structural-container-aligned',
    assessmentOutcome: 'coherent',
    assessmentKind: 'coherent-semantic-qualified-structural-container',
    reportable: false,
    rationale: 'coherent rationale',
  });
});

test('no matching policy produces no assessment record', () => {
  assert.deepEqual(assess([matchingClassification({ structuralKind: 'other' })]).assessmentRecords, []);
});

test('partial or incomplete classification produces no assessment record', () => {
  const partial = matchingClassification();
  delete partial.relationshipPerspective;

  assert.deepEqual(assess([partial]).assessmentRecords, []);
});

test('matching-looking file classification produces no assessment record', () => {
  assert.deepEqual(assess([matchingClassification({ occurrenceType: 'file' })]).assessmentRecords, []);
});

test('matching-looking classification without addressPath produces no assessment record', () => {
  const incomplete = matchingClassification();
  delete incomplete.addressPath;

  assert.deepEqual(assess([incomplete]).assessmentRecords, []);
});

test('missing structuralRole on classification produces no assessment record', () => {
  const incomplete = matchingClassification();
  delete incomplete.structuralRole;

  assert.deepEqual(assess([incomplete]).assessmentRecords, []);
});

test('matching policy preserves same addressPath and carries policy id', () => {
  const [record] = assess([matchingClassification({ addressPath: 'A.9', path: 'z' })]).assessmentRecords;

  assert.equal(record.addressPath, 'A.9');
  assert.equal(record.assessmentPolicyId, 'relationship-qualified-semantic-qualified-structural-container-aligned');
});

test('multiple matching policies throw deterministic configuration error', () => {
  assert.throws(
    () => assess([matchingClassification()], [policy('b-policy'), policy('a-policy')]),
    /Tree structural-context assessment policy ambiguity.*a-policy, b-policy/u,
  );
});

test('invalid structural-context assessment input rejects', () => {
  assert.throws(() => prepareTreeStructuralContextAssessment({ currentOccurrenceClassificationRecords: {}, structuralContextAssessmentPoliciesRegistry: { policies: [] } }), /currentOccurrenceClassificationRecords array/u);
  assert.throws(() => prepareTreeStructuralContextAssessment({ currentOccurrenceClassificationRecords: [], structuralContextAssessmentPoliciesRegistry: {} }), /policies array/u);
});

test('structural-context assessment output ordering is stable by path, then addressPath, then policy id', () => {
  const result = assess([
    matchingClassification({ path: 'b', addressPath: 'A.1' }),
    matchingClassification({ path: 'a', addressPath: 'A.2' }),
    matchingClassification({ path: 'a', addressPath: 'A.1' }),
  ]);

  assert.deepEqual(
    result.assessmentRecords.map((record) => `${record.path}|${record.addressPath}|${record.assessmentPolicyId}`),
    [
      'a|A.1|relationship-qualified-semantic-qualified-structural-container-aligned',
      'a|A.2|relationship-qualified-semantic-qualified-structural-container-aligned',
      'b|A.1|relationship-qualified-semantic-qualified-structural-container-aligned',
    ],
  );
});
