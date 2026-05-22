const SOURCE_ID = 'tree-occurrence-classification-runtime-evaluation-plan';

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
};

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toSummary = ({
  treeOccurrenceClassificationReplacementRecommendation,
  treeOccurrenceClassificationReplacementReadiness,
  treeOccurrenceClassificationShadowReport,
  treeOccurrenceClassificationParitySummary,
}) => ({
  recommendation: treeOccurrenceClassificationReplacementRecommendation?.recommendation ?? null,
  confidence: treeOccurrenceClassificationReplacementRecommendation?.confidence ?? null,
  replacementDecision: treeOccurrenceClassificationReplacementReadiness?.replacementDecision ?? null,
  replacementReadinessStatus:
    treeOccurrenceClassificationReplacementReadiness?.summary?.replacementReadinessStatus
    ?? treeOccurrenceClassificationParitySummary?.replacementReadinessStatus
    ?? null,
  shadowComparisonStatus:
    treeOccurrenceClassificationShadowReport?.summary?.shadowComparisonStatus ?? null,
  parityCoverageRatio: toNumber(treeOccurrenceClassificationParitySummary?.parityCoverageRatio),
  parityMatchRatio: toNumber(treeOccurrenceClassificationParitySummary?.parityMatchRatio),
  comparableRecords: toNumber(treeOccurrenceClassificationParitySummary?.comparableRecords),
  matchedRecords: toNumber(treeOccurrenceClassificationParitySummary?.matchedRecords),
  differedRecords: toNumber(treeOccurrenceClassificationParitySummary?.differedRecords),
  insufficientEvidenceRecords: toNumber(treeOccurrenceClassificationParitySummary?.insufficientEvidenceRecords),
});

const toEvaluationMode = (summary) => {
  if (summary.recommendation === 'do-not-replace') {
    return 'compatibility-only';
  }

  if (
    summary.recommendation === 'replacement-candidate'
    && summary.replacementDecision === 'candidate-ready'
    && summary.shadowComparisonStatus === 'aligned'
    && summary.confidence === 'high'
  ) {
    return 'evaluation-candidate';
  }

  return 'shadow-evaluation';
};

const toEvaluationStatus = (evaluationMode) => {
  if (evaluationMode === 'compatibility-only') {
    return 'blocked';
  }

  if (evaluationMode === 'evaluation-candidate') {
    return 'ready-for-future-evaluation';
  }

  return 'review-required';
};

const toRationale = ({ evaluationMode, summary }) => {
  if (evaluationMode === 'compatibility-only') {
    return 'Runtime evaluation plan is compatibility-only because replacement recommendation is do-not-replace.';
  }

  if (evaluationMode === 'evaluation-candidate') {
    return 'Runtime evaluation plan is evaluation-candidate because replacement recommendation, readiness decision, shadow alignment, and high confidence are fully aligned.';
  }

  if (summary.recommendation === 'replacement-candidate' && summary.confidence !== 'high') {
    return 'Runtime evaluation plan remains shadow-evaluation because replacement-candidate recommendation is not high confidence.';
  }

  return 'Runtime evaluation plan remains shadow-evaluation because recommendation/readiness/shadow evidence requires review before any future runtime evaluation.';
};

export const planTreeOccurrenceClassificationRuntimeEvaluation = (input) => {
  assertObject(input, 'Tree occurrence classification runtime evaluation plan input');
  assertObject(
    input.treeOccurrenceClassificationReplacementRecommendation,
    'Tree occurrence classification runtime evaluation plan input treeOccurrenceClassificationReplacementRecommendation',
  );
  assertObject(
    input.treeOccurrenceClassificationReplacementReadiness,
    'Tree occurrence classification runtime evaluation plan input treeOccurrenceClassificationReplacementReadiness',
  );
  assertObject(
    input.treeOccurrenceClassificationShadowReport,
    'Tree occurrence classification runtime evaluation plan input treeOccurrenceClassificationShadowReport',
  );
  assertObject(
    input.treeOccurrenceClassificationParitySummary,
    'Tree occurrence classification runtime evaluation plan input treeOccurrenceClassificationParitySummary',
  );

  const summary = toSummary(input);
  const evaluationMode = toEvaluationMode(summary);

  return {
    source: SOURCE_ID,
    evaluationMode,
    evaluationStatus: toEvaluationStatus(evaluationMode),
    summary,
    rationale: toRationale({ evaluationMode, summary }),
  };
};
