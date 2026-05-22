import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planTreeOccurrenceClassificationRuntimeEvaluation } from '../src/tree-occurrence-classification-runtime-evaluation-plan.logic.mjs';

const baseInput = () => ({
  treeOccurrenceClassificationReplacementRecommendation: {
    source: 'tree-occurrence-classification-replacement-recommendation',
    recommendation: 'review-before-replacement',
    confidence: 'medium',
  },
  treeOccurrenceClassificationReplacementReadiness: {
    source: 'tree-occurrence-classification-replacement-readiness',
    replacementDecision: 'review-required',
    summary: {
      replacementReadinessStatus: 'needs-review',
    },
  },
  treeOccurrenceClassificationShadowReport: {
    source: 'tree-occurrence-classification-shadow-report',
    summary: {
      shadowComparisonStatus: 'needs-review',
    },
  },
  treeOccurrenceClassificationParitySummary: {
    source: 'tree-occurrence-classification-parity-summary',
    comparableRecords: 3,
    matchedRecords: 2,
    differedRecords: 1,
    insufficientEvidenceRecords: 0,
    parityCoverageRatio: 1,
    parityMatchRatio: 2 / 3,
    replacementReadinessStatus: 'needs-review',
  },
});

test('returns compatibility-only/blocked when recommendation is do-not-replace', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'do-not-replace';

  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.equal(result.evaluationMode, 'compatibility-only');
  assert.equal(result.evaluationStatus, 'blocked');
});

test('returns shadow-evaluation/review-required when recommendation is review-before-replacement', () => {
  const result = planTreeOccurrenceClassificationRuntimeEvaluation(baseInput());

  assert.equal(result.evaluationMode, 'shadow-evaluation');
  assert.equal(result.evaluationStatus, 'review-required');
});

test('returns evaluation-candidate/ready-for-future-evaluation when candidate gates align and confidence is high', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'replacement-candidate';
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'high';
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'candidate-ready';
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'aligned';

  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.equal(result.evaluationMode, 'evaluation-candidate');
  assert.equal(result.evaluationStatus, 'ready-for-future-evaluation');
});

test('does not return ready-for-future-evaluation when recommendation confidence is not high', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'replacement-candidate';
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'medium';
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'candidate-ready';
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'aligned';

  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.equal(result.evaluationMode, 'shadow-evaluation');
  assert.equal(result.evaluationStatus, 'review-required');
});

test('does not return evaluation-candidate when replacementDecision is not candidate-ready', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'replacement-candidate';
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'high';
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'review-required';
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'aligned';

  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.equal(result.evaluationMode, 'shadow-evaluation');
});

test('does not return evaluation-candidate when shadowComparisonStatus is not aligned', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'replacement-candidate';
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'high';
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'candidate-ready';
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'needs-review';

  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.equal(result.evaluationMode, 'shadow-evaluation');
});

test('copies summary fields from prepared metadata and does not mutate input', () => {
  const input = baseInput();
  const before = structuredClone(input);
  const result = planTreeOccurrenceClassificationRuntimeEvaluation(input);

  assert.deepEqual(input, before);
  assert.equal(result.summary.recommendation, input.treeOccurrenceClassificationReplacementRecommendation.recommendation);
  assert.equal(result.summary.confidence, input.treeOccurrenceClassificationReplacementRecommendation.confidence);
  assert.equal(result.summary.replacementDecision, input.treeOccurrenceClassificationReplacementReadiness.replacementDecision);
  assert.equal(result.summary.replacementReadinessStatus, input.treeOccurrenceClassificationReplacementReadiness.summary.replacementReadinessStatus);
  assert.equal(result.summary.shadowComparisonStatus, input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus);
  assert.equal(result.summary.parityCoverageRatio, input.treeOccurrenceClassificationParitySummary.parityCoverageRatio);
  assert.equal(result.summary.parityMatchRatio, input.treeOccurrenceClassificationParitySummary.parityMatchRatio);
  assert.equal(result.summary.comparableRecords, input.treeOccurrenceClassificationParitySummary.comparableRecords);
  assert.equal(result.summary.matchedRecords, input.treeOccurrenceClassificationParitySummary.matchedRecords);
  assert.equal(result.summary.differedRecords, input.treeOccurrenceClassificationParitySummary.differedRecords);
  assert.equal(result.summary.insufficientEvidenceRecords, input.treeOccurrenceClassificationParitySummary.insufficientEvidenceRecords);
});

test('does not emit finding/severity/verdict/advisor fields', () => {
  const result = planTreeOccurrenceClassificationRuntimeEvaluation(baseInput());
  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];

  for (const key of forbiddenKeys) {
    assert.equal(Object.hasOwn(result, key), false);
    assert.equal(Object.hasOwn(result.summary, key), false);
  }
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => planTreeOccurrenceClassificationRuntimeEvaluation(), /input must be an object/u);
  assert.throws(
    () => planTreeOccurrenceClassificationRuntimeEvaluation({}),
    /treeOccurrenceClassificationReplacementRecommendation must be an object/u,
  );
});
