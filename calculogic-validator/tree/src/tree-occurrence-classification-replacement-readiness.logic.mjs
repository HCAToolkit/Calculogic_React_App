const SOURCE_ID = 'tree-occurrence-classification-replacement-readiness';

const assertObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
};

const toNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toSummary = ({ treeOccurrenceClassificationParitySummary, treeOccurrenceClassificationShadowReport }) => {
  const paritySummary = treeOccurrenceClassificationParitySummary;
  const shadowSummary = treeOccurrenceClassificationShadowReport?.summary ?? {};

  return {
    comparableRecords: toNumber(paritySummary?.comparableRecords),
    matchedRecords: toNumber(paritySummary?.matchedRecords),
    differedRecords: toNumber(paritySummary?.differedRecords),
    insufficientEvidenceRecords: toNumber(paritySummary?.insufficientEvidenceRecords),
    notApplicableRecords: toNumber(paritySummary?.notApplicableRecords),
    parityCoverageRatio: toNumber(paritySummary?.parityCoverageRatio),
    parityMatchRatio: toNumber(paritySummary?.parityMatchRatio),
    replacementReadinessStatus: paritySummary?.replacementReadinessStatus ?? null,
    shadowComparisonStatus: shadowSummary?.shadowComparisonStatus ?? null,
  };
};

const toGates = (summary) => ({
  hasComparableRecords: summary.comparableRecords > 0,
  hasNoInsufficientEvidence: summary.insufficientEvidenceRecords === 0,
  hasNoDifferences: summary.differedRecords === 0,
  hasCandidateReadyParitySummary: summary.replacementReadinessStatus === 'candidate-ready',
  hasAlignedShadowComparison: summary.shadowComparisonStatus === 'aligned',
});

const toDecision = (summary, gates) => {
  if (
    summary.comparableRecords === 0 ||
    summary.insufficientEvidenceRecords > 0 ||
    summary.replacementReadinessStatus === 'not-ready' ||
    summary.shadowComparisonStatus === 'not-ready'
  ) {
    return 'blocked';
  }

  if (
    summary.differedRecords > 0 ||
    summary.replacementReadinessStatus === 'needs-review' ||
    summary.shadowComparisonStatus === 'needs-review' ||
    summary.shadowComparisonStatus !== 'aligned'
  ) {
    return 'review-required';
  }

  if (
    gates.hasComparableRecords &&
    gates.hasNoInsufficientEvidence &&
    gates.hasNoDifferences &&
    summary.matchedRecords === summary.comparableRecords &&
    gates.hasCandidateReadyParitySummary &&
    gates.hasAlignedShadowComparison
  ) {
    return 'candidate-ready';
  }

  return 'review-required';
};

const toRationale = (replacementDecision) => {
  if (replacementDecision === 'blocked') {
    return 'Replacement-readiness is blocked because parity/shadow evidence is incomplete or explicitly not-ready.';
  }

  if (replacementDecision === 'review-required') {
    return 'Replacement-readiness requires review because parity/shadow evidence has differences, review flags, or non-aligned status.';
  }

  return 'Replacement-readiness is candidate-ready because parity/shadow evidence is complete, matched, and aligned.';
};

export const evaluateTreeOccurrenceClassificationReplacementReadiness = (input) => {
  assertObject(input, 'Tree occurrence classification replacement readiness input');
  assertObject(input.treeOccurrenceClassificationParitySummary, 'Tree occurrence classification replacement readiness input treeOccurrenceClassificationParitySummary');
  assertObject(input.treeOccurrenceClassificationShadowReport, 'Tree occurrence classification replacement readiness input treeOccurrenceClassificationShadowReport');

  const summary = toSummary(input);
  const gates = toGates(summary);
  const replacementDecision = toDecision(summary, gates);

  return {
    source: SOURCE_ID,
    replacementDecision,
    gates,
    summary,
    rationale: toRationale(replacementDecision),
  };
};
