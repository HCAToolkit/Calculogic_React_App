const SOURCE_ID = 'tree-occurrence-classification-shadow-report';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree occurrence classification shadow report input must be an object.');
  }

  if (!input.treeOccurrenceClassificationParityEvidence || typeof input.treeOccurrenceClassificationParityEvidence !== 'object' || Array.isArray(input.treeOccurrenceClassificationParityEvidence)) {
    throw new Error('Tree occurrence classification shadow report input must include treeOccurrenceClassificationParityEvidence object.');
  }

  if (!Array.isArray(input.treeOccurrenceClassificationParityEvidence.parityRecords)) {
    throw new Error('Tree occurrence classification shadow report input treeOccurrenceClassificationParityEvidence.parityRecords must be an array.');
  }

  if (!input.treeOccurrenceClassificationParitySummary || typeof input.treeOccurrenceClassificationParitySummary !== 'object' || Array.isArray(input.treeOccurrenceClassificationParitySummary)) {
    throw new Error('Tree occurrence classification shadow report input must include treeOccurrenceClassificationParitySummary object.');
  }
}

const toComparisonStatus = (parityStatus) => {
  if (parityStatus === 'matches') {
    return 'aligned';
  }

  if (parityStatus === 'differs') {
    return 'mismatch';
  }

  if (parityStatus === 'insufficient-evidence') {
    return 'insufficient-evidence';
  }

  if (parityStatus === 'not-applicable') {
    return 'not-applicable';
  }

  return 'insufficient-evidence';
};

const toShadowComparisonStatus = (replacementReadinessStatus) => {
  if (replacementReadinessStatus === 'candidate-ready') {
    return 'aligned';
  }

  if (replacementReadinessStatus === 'needs-review') {
    return 'needs-review';
  }

  return 'not-ready';
};

const toSummaryRationale = (replacementReadinessStatus) => {
  if (replacementReadinessStatus === 'candidate-ready') {
    return 'Parity summary replacement readiness is candidate-ready; shadow comparison remains observational evidence only.';
  }

  if (replacementReadinessStatus === 'needs-review') {
    return 'Parity summary replacement readiness is needs-review; shadow comparison remains observational evidence only.';
  }

  return 'Parity summary replacement readiness is not-ready; shadow comparison remains observational evidence only.';
};

const toShadowRecordRationale = ({ parityStatus, parityRationale }) => {
  if (typeof parityRationale === 'string' && parityRationale.length > 0) {
    return parityRationale;
  }

  return `Parity status ${String(parityStatus)} was mapped to shadow comparison status for observation.`;
};

export const prepareTreeOccurrenceClassificationShadowReport = (input) => {
  assertValidInput(input);

  const parityEvidence = input.treeOccurrenceClassificationParityEvidence;
  const paritySummary = input.treeOccurrenceClassificationParitySummary;

  const shadowRecords = parityEvidence.parityRecords.map((parityRecord) => ({
    addressPath: parityRecord?.addressPath ?? null,
    parentAddressPath: parityRecord?.parentAddressPath ?? null,
    path: parityRecord?.path ?? null,
    name: parityRecord?.name ?? null,
    occurrenceType: parityRecord?.occurrenceType ?? null,
    currentStructuralClass: parityRecord?.currentStructuralClass ?? null,
    currentStructuralKind: parityRecord?.currentStructuralKind ?? null,
    currentIsRepoShapeAllowedTopLevelDirectory: parityRecord?.currentIsRepoShapeAllowedTopLevelDirectory ?? false,
    currentIsStructuralRoot: parityRecord?.currentIsStructuralRoot ?? false,
    currentIsSemanticRoot: parityRecord?.currentIsSemanticRoot ?? false,
    replacementFolderKind: parityRecord?.replacementFolderKind ?? null,
    replacementStructuralHome: parityRecord?.replacementStructuralHome ?? null,
    replacementSemanticHome: parityRecord?.replacementSemanticHome ?? null,
    parityStatus: parityRecord?.parityStatus ?? null,
    replacementReadinessStatus: paritySummary?.replacementReadinessStatus ?? null,
    comparisonStatus: toComparisonStatus(parityRecord?.parityStatus),
    rationale: toShadowRecordRationale({ parityStatus: parityRecord?.parityStatus, parityRationale: parityRecord?.rationale }),
  }));

  return {
    source: SOURCE_ID,
    summary: {
      source: SOURCE_ID,
      paritySummarySource: paritySummary?.source ?? null,
      totalRecords: paritySummary?.totalRecords ?? 0,
      comparableRecords: paritySummary?.comparableRecords ?? 0,
      matchedRecords: paritySummary?.matchedRecords ?? 0,
      differedRecords: paritySummary?.differedRecords ?? 0,
      insufficientEvidenceRecords: paritySummary?.insufficientEvidenceRecords ?? 0,
      notApplicableRecords: paritySummary?.notApplicableRecords ?? 0,
      parityCoverageRatio: paritySummary?.parityCoverageRatio ?? 0,
      parityMatchRatio: paritySummary?.parityMatchRatio ?? 0,
      replacementReadinessStatus: paritySummary?.replacementReadinessStatus ?? null,
      shadowComparisonStatus: toShadowComparisonStatus(paritySummary?.replacementReadinessStatus),
      rationale: toSummaryRationale(paritySummary?.replacementReadinessStatus),
    },
    shadowRecords,
  };
};
