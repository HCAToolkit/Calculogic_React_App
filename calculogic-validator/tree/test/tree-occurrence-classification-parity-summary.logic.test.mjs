import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeTreeOccurrenceClassificationParityEvidence } from '../src/tree-occurrence-classification-parity-summary.logic.mjs';

const baseEvidence = () => ({
  source: 'tree-occurrence-classification-parity-evidence',
  parityRecords: [
    { path: 'a', parityStatus: 'matches' },
    { path: 'b', parityStatus: 'differs' },
    { path: 'c', parityStatus: 'insufficient-evidence' },
    { path: 'd', parityStatus: 'not-applicable' },
  ],
  summary: { matches: 1, differs: 1, 'insufficient-evidence': 1, 'not-applicable': 1 },
});

test('summarizes parity evidence counts deterministically without mutation', () => {
  const evidence = baseEvidence();
  const before = structuredClone(evidence);
  const result = summarizeTreeOccurrenceClassificationParityEvidence(evidence);

  assert.deepEqual(evidence, before);
  assert.equal(result.totalRecords, 4);
  assert.equal(result.comparableRecords, 3);
  assert.equal(result.matchedRecords, 1);
  assert.equal(result.differedRecords, 1);
  assert.equal(result.insufficientEvidenceRecords, 1);
  assert.equal(result.notApplicableRecords, 1);
  assert.equal(result.parityCoverageRatio, 2 / 3);
  assert.equal(result.parityMatchRatio, 1 / 3);
});

test('returns not-ready when comparable records are zero', () => {
  const result = summarizeTreeOccurrenceClassificationParityEvidence({
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [{ path: 'x', parityStatus: 'not-applicable' }],
    summary: { matches: 0, differs: 0, 'insufficient-evidence': 0, 'not-applicable': 1 },
  });

  assert.equal(result.replacementReadinessStatus, 'not-ready');
});

test('returns not-ready when insufficient-evidence exists', () => {
  const result = summarizeTreeOccurrenceClassificationParityEvidence(baseEvidence());
  assert.equal(result.replacementReadinessStatus, 'not-ready');
});

test('returns needs-review when differs exists without insufficient-evidence', () => {
  const result = summarizeTreeOccurrenceClassificationParityEvidence({
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [
      { path: 'a', parityStatus: 'matches' },
      { path: 'b', parityStatus: 'differs' },
    ],
    summary: { matches: 1, differs: 1, 'insufficient-evidence': 0, 'not-applicable': 0 },
  });

  assert.equal(result.replacementReadinessStatus, 'needs-review');
});

test('returns candidate-ready when all comparable records match', () => {
  const result = summarizeTreeOccurrenceClassificationParityEvidence({
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [
      { path: 'a', parityStatus: 'matches' },
      { path: 'b', parityStatus: 'matches' },
      { path: 'c', parityStatus: 'not-applicable' },
    ],
    summary: { matches: 2, differs: 0, 'insufficient-evidence': 0, 'not-applicable': 1 },
  });

  assert.equal(result.replacementReadinessStatus, 'candidate-ready');
  assert.equal(result.parityCoverageRatio, 1);
  assert.equal(result.parityMatchRatio, 1);
});

test('does not emit findings or advisor decision fields and handles empty input', () => {
  const result = summarizeTreeOccurrenceClassificationParityEvidence({
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [],
    summary: { matches: 0, differs: 0, 'insufficient-evidence': 0, 'not-applicable': 0 },
  });

  assert.deepEqual(result, {
    source: 'tree-occurrence-classification-parity-summary',
    parityEvidenceSource: 'tree-occurrence-classification-parity-evidence',
    totalRecords: 0,
    comparableRecords: 0,
    matchedRecords: 0,
    differedRecords: 0,
    insufficientEvidenceRecords: 0,
    notApplicableRecords: 0,
    parityCoverageRatio: 0,
    parityMatchRatio: 0,
    replacementReadinessStatus: 'not-ready',
    rationale: 'No comparable parity records were available after excluding not-applicable records.',
  });

  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(result, forbiddenKey), false);
  }
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => summarizeTreeOccurrenceClassificationParityEvidence(), /input must be an object/u);
  assert.throws(
    () => summarizeTreeOccurrenceClassificationParityEvidence({ source: 'x' }),
    /parityRecords must be an array/u,
  );
});
