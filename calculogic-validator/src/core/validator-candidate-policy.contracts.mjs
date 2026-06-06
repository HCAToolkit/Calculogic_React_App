const normalizeCandidateToken = (value) => String(value ?? '').trim();

const normalizeUniqueSortedStrings = (values, fieldName, { allowEmpty = false } = {}) => {
  if (!values || typeof values[Symbol.iterator] !== 'function') {
    throw new Error(`Validator candidate policy requires iterable ${fieldName}.`);
  }

  const normalizedValues = [];
  for (const value of values) {
    const normalizedValue = normalizeCandidateToken(value);
    if (!normalizedValue && !allowEmpty) {
      throw new Error(
        `Validator candidate policy ${fieldName} entries must be non-empty strings.`,
      );
    }

    normalizedValues.push(normalizedValue);
  }

  return Array.from(new Set(normalizedValues)).sort((left, right) => left.localeCompare(right));
};

export const normalizeValidatorCandidatePolicy = ({
  candidateExtensions,
  candidateRootFiles,
  walkExcludedDirectories = [],
  skipDotDirectories = true,
} = {}) => {
  if (typeof skipDotDirectories !== 'boolean') {
    throw new Error('Validator candidate policy skipDotDirectories must be a boolean.');
  }

  return Object.freeze({
    candidateExtensions: Object.freeze(
      normalizeUniqueSortedStrings(candidateExtensions ?? [], 'candidateExtensions', {
        allowEmpty: true,
      }),
    ),
    candidateRootFiles: Object.freeze(
      normalizeUniqueSortedStrings(candidateRootFiles ?? [], 'candidateRootFiles'),
    ),
    walkExcludedDirectories: Object.freeze(
      normalizeUniqueSortedStrings(walkExcludedDirectories ?? [], 'walkExcludedDirectories'),
    ),
    skipDotDirectories,
  });
};

export const toValidatorCandidatePolicyInputSets = (candidatePolicy) => {
  const normalizedPolicy = normalizeValidatorCandidatePolicy(candidatePolicy);

  return Object.freeze({
    candidateExtensions: new Set(normalizedPolicy.candidateExtensions),
    candidateRootFiles: new Set(normalizedPolicy.candidateRootFiles),
    walkExcludedDirectories: new Set(normalizedPolicy.walkExcludedDirectories),
    skipDotDirectories: normalizedPolicy.skipDotDirectories,
  });
};
