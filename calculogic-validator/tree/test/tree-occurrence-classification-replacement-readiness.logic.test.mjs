import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateTreeOccurrenceClassificationReplacementReadiness } from '../src/tree-occurrence-classification-replacement-readiness.logic.mjs';

const baseInput = () => ({
  treeOccurrenceClassificationParitySummary: {
    source: 'tree-occurrence-classification-parity-summary',
    comparableRecords: 2,
    matchedRecords: 2,
    differedRecords: 0,
    insufficientEvidenceRecords: 0,
    notApplicableRecords: 1,
    parityCoverageRatio: 1,
    parityMatchRatio: 1,
    replacementReadinessStatus: 'candidate-ready',
  },
  treeOccurrenceClassificationShadowReport: {
    source: 'tree-occurrence-classification-shadow-report',
    summary: {
      shadowComparisonStatus: 'aligned',
    },
  },
});

test('returns candidate-ready when all gates pass', () => {
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(baseInput());
  assert.equal(result.replacementDecision, 'candidate-ready');
});

test('returns blocked when comparableRecords is zero', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.comparableRecords = 0;
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'blocked');
});

test('returns blocked when insufficientEvidenceRecords is greater than zero', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.insufficientEvidenceRecords = 1;
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'blocked');
});

test('returns blocked when replacementReadinessStatus is not-ready', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.replacementReadinessStatus = 'not-ready';
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'blocked');
});

test('returns blocked when shadowComparisonStatus is not-ready', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'not-ready';
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'blocked');
});

test('returns review-required when differedRecords is greater than zero', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.differedRecords = 1;
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'review-required');
});

test('returns review-required when replacementReadinessStatus is needs-review', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.replacementReadinessStatus = 'needs-review';
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'review-required');
});

test('returns review-required when shadowComparisonStatus is needs-review', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'needs-review';
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'review-required');
});

test('blocked wins over review-required', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.insufficientEvidenceRecords = 1;
  input.treeOccurrenceClassificationParitySummary.differedRecords = 1;
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'blocked');
});

test('review-required wins over candidate-ready', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'mismatch';
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);
  assert.equal(result.replacementDecision, 'review-required');
});

test('emits deterministic gates and summary fields, does not mutate input or emit advisor fields', () => {
  const input = baseInput();
  const before = structuredClone(input);
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness(input);

  assert.deepEqual(input, before);
  assert.deepEqual(result.gates, {
    hasComparableRecords: true,
    hasNoInsufficientEvidence: true,
    hasNoDifferences: true,
    hasCandidateReadyParitySummary: true,
    hasAlignedShadowComparison: true,
  });
  assert.deepEqual(result.summary, {
    comparableRecords: 2,
    matchedRecords: 2,
    differedRecords: 0,
    insufficientEvidenceRecords: 0,
    notApplicableRecords: 1,
    parityCoverageRatio: 1,
    parityMatchRatio: 1,
    replacementReadinessStatus: 'candidate-ready',
    shadowComparisonStatus: 'aligned',
  });

  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(result, forbiddenKey), false);
    assert.equal(Object.hasOwn(result.summary, forbiddenKey), false);
  }
});

test('handles minimal input safely by defaulting missing numeric fields', () => {
  const result = evaluateTreeOccurrenceClassificationReplacementReadiness({
    treeOccurrenceClassificationParitySummary: {
      replacementReadinessStatus: 'not-ready',
    },
    treeOccurrenceClassificationShadowReport: {
      summary: {
        shadowComparisonStatus: 'not-ready',
      },
    },
  });

  assert.equal(result.replacementDecision, 'blocked');
  assert.equal(result.summary.comparableRecords, 0);
  assert.equal(result.summary.parityCoverageRatio, 0);
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => evaluateTreeOccurrenceClassificationReplacementReadiness(), /input must be an object/u);
  assert.throws(
    () => evaluateTreeOccurrenceClassificationReplacementReadiness({ treeOccurrenceClassificationShadowReport: {} }),
    /treeOccurrenceClassificationParitySummary must be an object/u,
  );
  assert.throws(
    () => evaluateTreeOccurrenceClassificationReplacementReadiness({ treeOccurrenceClassificationParitySummary: {}, treeOccurrenceClassificationShadowReport: null }),
    /treeOccurrenceClassificationShadowReport must be an object/u,
  );
});
