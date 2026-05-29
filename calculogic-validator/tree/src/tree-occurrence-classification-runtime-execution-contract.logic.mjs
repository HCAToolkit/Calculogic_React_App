const SOURCE_ID = 'tree-occurrence-classification-runtime-execution-contract';

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
};

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toSummary = ({
  treeOccurrenceClassificationRuntimeEvaluationPlan,
  treeOccurrenceClassificationReplacementRecommendation,
  treeOccurrenceClassificationReplacementReadiness,
  treeOccurrenceClassificationShadowReport,
  treeOccurrenceClassificationParitySummary,
}) => ({
  evaluationMode: treeOccurrenceClassificationRuntimeEvaluationPlan?.evaluationMode ?? null,
  evaluationStatus: treeOccurrenceClassificationRuntimeEvaluationPlan?.evaluationStatus ?? null,
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

const hasExecutionCandidateEvidence = (summary) => (
  summary.evaluationMode === 'evaluation-candidate'
  && summary.evaluationStatus === 'ready-for-future-evaluation'
  && summary.recommendation === 'replacement-candidate'
  && summary.confidence === 'high'
  && summary.replacementDecision === 'candidate-ready'
  && summary.shadowComparisonStatus === 'aligned'
  && summary.parityMatchRatio === 1
);

const toExecutionMode = (summary) => {
  if (
    summary.evaluationMode === 'compatibility-only'
    || summary.evaluationStatus === 'blocked'
    || summary.recommendation === 'do-not-replace'
  ) {
    return 'compatibility-preserved';
  }

  if (hasExecutionCandidateEvidence(summary)) {
    return 'execution-candidate';
  }

  return 'evaluation-only';
};

const toExecutionStatus = (executionMode) => {
  if (executionMode === 'compatibility-preserved') {
    return 'blocked';
  }

  if (executionMode === 'execution-candidate') {
    return 'ready-for-future-execution-contract';
  }

  return 'guarded-review-required';
};

const toGuardRationale = ({ id, satisfied }) => {
  if (id === 'parity-alignment') {
    return satisfied
      ? 'Parity alignment guard is satisfied because parityMatchRatio is 1.'
      : 'Parity alignment guard remains required because parityMatchRatio is not 1.';
  }

  if (id === 'shadow-alignment') {
    return satisfied
      ? 'Shadow alignment guard is satisfied because shadowComparisonStatus is aligned.'
      : 'Shadow alignment guard remains required because shadowComparisonStatus is not aligned.';
  }

  if (id === 'high-confidence') {
    return satisfied
      ? 'High confidence guard is satisfied because recommendation confidence is high.'
      : 'High confidence guard remains required because recommendation confidence is not high.';
  }

  if (id === 'runtime-observability') {
    return satisfied
      ? 'Runtime observability guard is satisfied because evaluationStatus is ready-for-future-evaluation.'
      : 'Runtime observability guard remains required because evaluationStatus is not ready-for-future-evaluation.';
  }

  return 'Rollback availability guard remains required because no current prepared metadata provides rollback availability evidence.';
};

const toRequiredGuards = (summary) => ([
  {
    id: 'parity-alignment',
    satisfied: summary.parityMatchRatio === 1,
  },
  {
    id: 'shadow-alignment',
    satisfied: summary.shadowComparisonStatus === 'aligned',
  },
  {
    id: 'high-confidence',
    satisfied: summary.confidence === 'high',
  },
  {
    id: 'runtime-observability',
    satisfied: summary.evaluationStatus === 'ready-for-future-evaluation',
  },
  {
    id: 'rollback-available',
    satisfied: false,
  },
]).map((guard) => ({
  ...guard,
  rationale: toGuardRationale(guard),
}));

const toRationale = ({ executionMode, summary }) => {
  if (executionMode === 'compatibility-preserved') {
    return 'Runtime execution-contract planning preserves compatibility because evaluation evidence is blocked, compatibility-only, or recommends do-not-replace.';
  }

  if (executionMode === 'execution-candidate') {
    return 'Runtime execution-contract planning is an execution-candidate because evaluation, recommendation, readiness, shadow, confidence, and parity evidence are aligned; this remains evidence metadata only.';
  }

  if (summary.evaluationMode === 'shadow-evaluation' || summary.evaluationStatus === 'review-required') {
    return 'Runtime execution-contract planning remains evaluation-only because runtime evaluation evidence still requires guarded review before any future execution contract.';
  }

  if (summary.recommendation === 'review-before-replacement') {
    return 'Runtime execution-contract planning remains evaluation-only because replacement recommendation requires review before replacement.';
  }

  return 'Runtime execution-contract planning remains evaluation-only because candidate execution-contract evidence is incomplete.';
};

export const planTreeOccurrenceClassificationRuntimeExecutionContract = (input) => {
  assertObject(input, 'Tree occurrence classification runtime execution contract input');
  assertObject(
    input.treeOccurrenceClassificationRuntimeEvaluationPlan,
    'Tree occurrence classification runtime execution contract input treeOccurrenceClassificationRuntimeEvaluationPlan',
  );
  assertObject(
    input.treeOccurrenceClassificationReplacementRecommendation,
    'Tree occurrence classification runtime execution contract input treeOccurrenceClassificationReplacementRecommendation',
  );
  assertObject(
    input.treeOccurrenceClassificationReplacementReadiness,
    'Tree occurrence classification runtime execution contract input treeOccurrenceClassificationReplacementReadiness',
  );
  assertObject(
    input.treeOccurrenceClassificationShadowReport,
    'Tree occurrence classification runtime execution contract input treeOccurrenceClassificationShadowReport',
  );
  assertObject(
    input.treeOccurrenceClassificationParitySummary,
    'Tree occurrence classification runtime execution contract input treeOccurrenceClassificationParitySummary',
  );

  const summary = toSummary(input);
  const executionMode = toExecutionMode(summary);

  return {
    source: SOURCE_ID,
    executionMode,
    executionStatus: toExecutionStatus(executionMode),
    requiredGuards: toRequiredGuards(summary),
    summary,
    rationale: toRationale({ executionMode, summary }),
  };
};
