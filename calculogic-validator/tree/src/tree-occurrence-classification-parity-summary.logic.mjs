const SOURCE_ID = 'tree-occurrence-classification-parity-summary';

const VALID_PARITY_STATUSES = new Set(['matches', 'differs', 'insufficient-evidence', 'not-applicable']);

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree occurrence classification parity summary input must be an object.');
  }

  if (!Array.isArray(input.parityRecords)) {
    throw new Error('Tree occurrence classification parity summary input parityRecords must be an array.');
  }
};

const countByParityStatus = (parityRecords) => {
  const counts = {
    matches: 0,
    differs: 0,
    'insufficient-evidence': 0,
    'not-applicable': 0,
  };

  for (const record of parityRecords) {
    const parityStatus = record?.parityStatus;

    if (!VALID_PARITY_STATUSES.has(parityStatus)) {
      continue;
    }

    counts[parityStatus] += 1;
  }

  return counts;
};

const toReplacementReadinessStatus = ({ comparableRecords, insufficientEvidenceRecords, differedRecords, matchedRecords }) => {
  if (comparableRecords === 0 || insufficientEvidenceRecords > 0) {
    return 'not-ready';
  }

  if (differedRecords > 0) {
    return 'needs-review';
  }

  if (matchedRecords === comparableRecords) {
    return 'candidate-ready';
  }

  return 'needs-review';
};

const toRationale = ({ replacementReadinessStatus, comparableRecords, insufficientEvidenceRecords, differedRecords, matchedRecords }) => {
  if (replacementReadinessStatus === 'not-ready' && comparableRecords === 0) {
    return 'No comparable parity records were available after excluding not-applicable records.';
  }

  if (replacementReadinessStatus === 'not-ready' && insufficientEvidenceRecords > 0) {
    return 'One or more comparable parity records were insufficient-evidence; replacement confidence cannot be observed as ready.';
  }

  if (replacementReadinessStatus === 'needs-review' && differedRecords > 0) {
    return 'One or more comparable parity records differed and need review before any behavior-preserving replacement decision.';
  }

  if (replacementReadinessStatus === 'candidate-ready' && matchedRecords === comparableRecords) {
    return 'All comparable parity records matched with no insufficient-evidence records.';
  }

  return 'Parity evidence summary indicates review is required before replacement confidence can be considered ready.';
};

export const summarizeTreeOccurrenceClassificationParityEvidence = (parityEvidence) => {
  assertValidInput(parityEvidence);

  const counts = countByParityStatus(parityEvidence.parityRecords);
  const totalRecords = parityEvidence.parityRecords.length;
  const notApplicableRecords = counts['not-applicable'];
  const comparableRecords = totalRecords - notApplicableRecords;
  const matchedRecords = counts.matches;
  const differedRecords = counts.differs;
  const insufficientEvidenceRecords = counts['insufficient-evidence'];
  const parityCoverageRatio = comparableRecords === 0 ? 0 : (matchedRecords + differedRecords) / comparableRecords;
  const parityMatchRatio = comparableRecords === 0 ? 0 : matchedRecords / comparableRecords;

  const replacementReadinessStatus = toReplacementReadinessStatus({
    comparableRecords,
    insufficientEvidenceRecords,
    differedRecords,
    matchedRecords,
  });

  return {
    source: SOURCE_ID,
    parityEvidenceSource: parityEvidence.source ?? null,
    totalRecords,
    comparableRecords,
    matchedRecords,
    differedRecords,
    insufficientEvidenceRecords,
    notApplicableRecords,
    parityCoverageRatio,
    parityMatchRatio,
    replacementReadinessStatus,
    rationale: toRationale({
      replacementReadinessStatus,
      comparableRecords,
      insufficientEvidenceRecords,
      differedRecords,
      matchedRecords,
    }),
  };
};
