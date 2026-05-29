import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planTreeOccurrenceClassificationRuntimeExecutionContract } from '../src/tree-occurrence-classification-runtime-execution-contract.logic.mjs';

const forbiddenEvidenceKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];

const baseInput = () => ({
  treeOccurrenceClassificationRuntimeEvaluationPlan: {
    source: 'tree-occurrence-classification-runtime-evaluation-plan',
    evaluationMode: 'shadow-evaluation',
    evaluationStatus: 'review-required',
  },
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

const candidateInput = () => {
  const input = baseInput();

  input.treeOccurrenceClassificationRuntimeEvaluationPlan.evaluationMode = 'evaluation-candidate';
  input.treeOccurrenceClassificationRuntimeEvaluationPlan.evaluationStatus = 'ready-for-future-evaluation';
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'replacement-candidate';
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'high';
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'candidate-ready';
  input.treeOccurrenceClassificationReplacementReadiness.summary.replacementReadinessStatus = 'candidate-ready';
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'aligned';
  input.treeOccurrenceClassificationParitySummary.comparableRecords = 3;
  input.treeOccurrenceClassificationParitySummary.matchedRecords = 3;
  input.treeOccurrenceClassificationParitySummary.differedRecords = 0;
  input.treeOccurrenceClassificationParitySummary.insufficientEvidenceRecords = 0;
  input.treeOccurrenceClassificationParitySummary.parityCoverageRatio = 1;
  input.treeOccurrenceClassificationParitySummary.parityMatchRatio = 1;
  input.treeOccurrenceClassificationParitySummary.replacementReadinessStatus = 'candidate-ready';

  return input;
};

test('returns compatibility-preserved/blocked when evaluationMode is compatibility-only', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationRuntimeEvaluationPlan.evaluationMode = 'compatibility-only';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'compatibility-preserved');
  assert.equal(result.executionStatus, 'blocked');
});

test('returns compatibility-preserved/blocked when recommendation is do-not-replace', () => {
  const input = baseInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'do-not-replace';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'compatibility-preserved');
  assert.equal(result.executionStatus, 'blocked');
});

test('returns evaluation-only/guarded-review-required when evaluationMode is shadow-evaluation', () => {
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(baseInput());

  assert.equal(result.executionMode, 'evaluation-only');
  assert.equal(result.executionStatus, 'guarded-review-required');
});

test('returns evaluation-only/guarded-review-required when recommendation is review-before-replacement', () => {
  const input = candidateInput();
  input.treeOccurrenceClassificationReplacementRecommendation.recommendation = 'review-before-replacement';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'evaluation-only');
  assert.equal(result.executionStatus, 'guarded-review-required');
});

test('returns execution-candidate/ready-for-future-execution-contract only when all candidate conditions pass', () => {
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(candidateInput());

  assert.equal(result.executionMode, 'execution-candidate');
  assert.equal(result.executionStatus, 'ready-for-future-execution-contract');
});

test('does not return execution-candidate when confidence is not high', () => {
  const input = candidateInput();
  input.treeOccurrenceClassificationReplacementRecommendation.confidence = 'medium';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'evaluation-only');
  assert.equal(result.executionStatus, 'guarded-review-required');
});

test('does not return execution-candidate when replacementDecision is not candidate-ready', () => {
  const input = candidateInput();
  input.treeOccurrenceClassificationReplacementReadiness.replacementDecision = 'review-required';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'evaluation-only');
});

test('does not return execution-candidate when shadowComparisonStatus is not aligned', () => {
  const input = candidateInput();
  input.treeOccurrenceClassificationShadowReport.summary.shadowComparisonStatus = 'needs-review';

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'evaluation-only');
});

test('does not return execution-candidate when parityMatchRatio is not 1', () => {
  const input = candidateInput();
  input.treeOccurrenceClassificationParitySummary.parityMatchRatio = 2 / 3;

  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.equal(result.executionMode, 'evaluation-only');
});

test('does not mark rollback-available satisfied without current prepared metadata support', () => {
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(candidateInput());
  const rollbackGuard = result.requiredGuards.find((guard) => guard.id === 'rollback-available');

  assert.deepEqual(rollbackGuard, {
    id: 'rollback-available',
    satisfied: false,
    rationale: 'Rollback availability guard remains required because no current prepared metadata provides rollback availability evidence.',
  });
});

test('emits deterministic required guard records', () => {
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(candidateInput());

  assert.deepEqual(result.requiredGuards, [
    {
      id: 'parity-alignment',
      satisfied: true,
      rationale: 'Parity alignment guard is satisfied because parityMatchRatio is 1.',
    },
    {
      id: 'shadow-alignment',
      satisfied: true,
      rationale: 'Shadow alignment guard is satisfied because shadowComparisonStatus is aligned.',
    },
    {
      id: 'high-confidence',
      satisfied: true,
      rationale: 'High confidence guard is satisfied because recommendation confidence is high.',
    },
    {
      id: 'runtime-observability',
      satisfied: true,
      rationale: 'Runtime observability guard is satisfied because evaluationStatus is ready-for-future-evaluation.',
    },
    {
      id: 'rollback-available',
      satisfied: false,
      rationale: 'Rollback availability guard remains required because no current prepared metadata provides rollback availability evidence.',
    },
  ]);
});

test('copies summary fields from prepared metadata and does not mutate input', () => {
  const input = baseInput();
  const before = structuredClone(input);
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(input);

  assert.deepEqual(input, before);
  assert.equal(result.summary.evaluationMode, input.treeOccurrenceClassificationRuntimeEvaluationPlan.evaluationMode);
  assert.equal(result.summary.evaluationStatus, input.treeOccurrenceClassificationRuntimeEvaluationPlan.evaluationStatus);
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

test('does not emit findings/severity/verdict/advisor fields', () => {
  const result = planTreeOccurrenceClassificationRuntimeExecutionContract(candidateInput());

  assert.deepEqual(Object.keys(result).sort(), ['executionMode', 'executionStatus', 'rationale', 'requiredGuards', 'source', 'summary']);
  assert.equal(forbiddenEvidenceKeys.some((key) => Object.hasOwn(result, key)), false);
  assert.equal(forbiddenEvidenceKeys.some((key) => Object.hasOwn(result.summary, key)), false);
  assert.equal(
    result.requiredGuards.some((guard) => forbiddenEvidenceKeys.some((key) => Object.hasOwn(guard, key))),
    false,
  );
});

test('rejects invalid input deterministically', () => {
  assert.throws(
    () => planTreeOccurrenceClassificationRuntimeExecutionContract({}),
    /treeOccurrenceClassificationRuntimeEvaluationPlan must be an object/u,
  );
});
