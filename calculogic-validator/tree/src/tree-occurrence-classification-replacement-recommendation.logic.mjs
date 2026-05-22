const SOURCE_ID = 'tree-occurrence-classification-replacement-recommendation';

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
};

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toSummary = ({
  treeOccurrenceClassificationReplacementReadiness,
  treeOccurrenceClassificationShadowReport,
  treeOccurrenceClassificationParitySummary,
}) => ({
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

const toRecommendation = (summary) => {
  if (summary.replacementDecision === 'blocked') {
    return 'do-not-replace';
  }

  if (summary.replacementDecision === 'review-required') {
    return 'review-before-replacement';
  }

  if (
    summary.replacementDecision === 'candidate-ready'
    && summary.parityMatchRatio === 1
    && summary.shadowComparisonStatus === 'aligned'
  ) {
    return 'replacement-candidate';
  }

  return 'review-before-replacement';
};

const toConfidence = (recommendation, summary) => {
  if (recommendation === 'do-not-replace') {
    return 'low';
  }

  if (recommendation === 'review-before-replacement') {
    return 'medium';
  }

  if (
    summary.parityCoverageRatio === 1
    && summary.parityMatchRatio === 1
    && summary.shadowComparisonStatus === 'aligned'
  ) {
    return 'high';
  }

  return 'medium';
};

const toRationale = (recommendation) => {
  if (recommendation === 'do-not-replace') {
    return 'Replacement recommendation is do-not-replace because replacement decision is blocked by readiness evidence.';
  }

  if (recommendation === 'review-before-replacement') {
    return 'Replacement recommendation is review-before-replacement because replacement decision requires additional review evidence.';
  }

  return 'Replacement recommendation is replacement-candidate because replacement decision and parity/shadow gates are fully aligned.';
};

export const recommendTreeOccurrenceClassificationReplacement = (input) => {
  assertObject(input, 'Tree occurrence classification replacement recommendation input');
  assertObject(
    input.treeOccurrenceClassificationReplacementReadiness,
    'Tree occurrence classification replacement recommendation input treeOccurrenceClassificationReplacementReadiness',
  );
  assertObject(
    input.treeOccurrenceClassificationShadowReport,
    'Tree occurrence classification replacement recommendation input treeOccurrenceClassificationShadowReport',
  );
  assertObject(
    input.treeOccurrenceClassificationParitySummary,
    'Tree occurrence classification replacement recommendation input treeOccurrenceClassificationParitySummary',
  );

  const summary = toSummary(input);
  const recommendation = toRecommendation(summary);
  const confidence = toConfidence(recommendation, summary);

  return {
    source: SOURCE_ID,
    recommendation,
    confidence,
    summary,
    rationale: toRationale(recommendation),
  };
};
