import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recommendTreeOccurrenceClassificationReplacement } from '../src/tree-occurrence-classification-replacement-recommendation.logic.mjs';

const baseInput = () => ({
  treeOccurrenceClassificationReplacementReadiness: {
    source: 'tree-occurrence-classification-replacement-readiness',
    replacementDecision: 'candidate-ready',
    summary: {
      replacementReadinessStatus: 'candidate-ready',
    },
  },
  treeOccurrenceClassificationShadowReport: {
    source: 'tree-occurrence-classification-shadow-report',
    summary: {
      shadowComparisonStatus: 'aligned',
    },
  },
  treeOccurrenceClassificationParitySummary: {
    source: 'tree-occurrence-classification-parity-summary',
    comparableRecords: 2,
    matchedRecords: 2,
    differedRecords: 0,
    insufficientEvidenceRecords: 0,
    parityCoverageRatio: 1,
    parityMatchRatio: 1,
    replacementReadinessStatus: 'candidate-ready',
  },
});

test('returns do-not-replace when replacementDecision is blocked', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'blocked';
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.equal(result.recommendation, 'do-not-replace');
});

test('returns review-before-replacement when replacementDecision is review-required', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'review-required';
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.equal(result.recommendation, 'review-before-replacement');
});

test('returns replacement-candidate when candidate-ready parity/shadow gates are aligned', () => {
  const result = recommendTreeOccurrenceClassificationReplacement(baseInput());
  assert.equal(result.recommendation, 'replacement-candidate');
});

test('does not return replacement-candidate when parityMatchRatio is below 1', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationParitySummary.parityMatchRatio = 0.5;
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.notEqual(result.recommendation, 'replacement-candidate');
  assert.equal(result.recommendation, 'review-before-replacement');
});

test('does not return replacement-candidate when shadowComparisonStatus is not aligned', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'needs-review';
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.notEqual(result.recommendation, 'replacement-candidate');
  assert.equal(result.recommendation, 'review-before-replacement');
});

test('returns low confidence for do-not-replace', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'blocked';
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.equal(result.confidence, 'low');
});

test('returns medium confidence for review-before-replacement', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'review-required';
  const result = recommendTreeOccurrenceClassificationReplacement(input);
  assert.equal(result.confidence, 'medium');
});

test('returns high confidence for replacement-candidate only when coverage/match/shadow gates pass', () => {
  const result = recommendTreeOccurrenceClassificationReplacement(baseInput());
  assert.equal(result.recommendation, 'replacement-candidate');
  assert.equal(result.confidence, 'high');

  const degraded = baseInput();
  degraded.treeOccurrenceClassificationParitySummary.parityCoverageRatio = 0.5;
  const degradedResult = recommendTreeOccurrenceClassificationReplacement(degraded);
  assert.equal(degradedResult.recommendation, 'replacement-candidate');
  assert.notEqual(degradedResult.confidence, 'high');
});

test('copies summary fields from input metadata and does not mutate input', () => {
  const input = baseInput();
  const before = structuredClone(input);
  const result = recommendTreeOccurrenceClassificationReplacement(input);

  assert.deepEqual(input, before);
  assert.deepEqual(result.summary, {
    replacementDecision: 'candidate-ready',
    replacementReadinessStatus: 'candidate-ready',
    shadowComparisonStatus: 'aligned',
    parityCoverageRatio: 1,
    parityMatchRatio: 1,
    comparableRecords: 2,
    matchedRecords: 2,
    differedRecords: 0,
    insufficientEvidenceRecords: 0,
  });
});

test('does not emit findings/severity/verdict/advisor fields', () => {
  const result = recommendTreeOccurrenceClassificationReplacement(baseInput());
  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(result, forbiddenKey), false);
    assert.equal(Object.hasOwn(result.summary, forbiddenKey), false);
  }
});

test('handles minimal input safely when required objects exist', () => {
  const result = recommendTreeOccurrenceClassificationReplacement({
    treeOccurrenceClassificationReplacementReadiness: {
      replacementDecision: 'blocked',
      summary: {},
    },
    treeOccurrenceClassificationShadowReport: {
      summary: {},
    },
    treeOccurrenceClassificationParitySummary: {},
  });

  assert.equal(result.recommendation, 'do-not-replace');
  assert.equal(result.summary.parityCoverageRatio, 0);
  assert.equal(result.summary.parityMatchRatio, 0);
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => recommendTreeOccurrenceClassificationReplacement(), /input must be an object/u);
  assert.throws(
    () => recommendTreeOccurrenceClassificationReplacement({ treeOccurrenceClassificationShadowReport: {}, treeOccurrenceClassificationParitySummary: {} }),
    /treeOccurrenceClassificationReplacementReadiness must be an object/u,
  );
  assert.throws(
    () => recommendTreeOccurrenceClassificationReplacement({
      treeOccurrenceClassificationReplacementReadiness: {},
      treeOccurrenceClassificationParitySummary: {},
      treeOccurrenceClassificationShadowReport: null,
    }),
    /treeOccurrenceClassificationShadowReport must be an object/u,
  );
});
