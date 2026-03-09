import fs from 'node:fs';

const REQUIRED_KEYS = ['code', 'severity', 'classification', 'message', 'ruleRef'];

const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid finding-policy registry: ${fieldName} must be a non-empty string.`);
  }

  return value.trim();
};

const canonicalizeEntry = (entry, outcomeId) => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(
      `Invalid finding-policy registry: outcome "${outcomeId}" must map to an object.`,
    );
  }

  const canonicalEntry = Object.fromEntries(
    REQUIRED_KEYS.map((key) => [key, assertNonEmptyString(entry[key], `${outcomeId}.${key}`)]),
  );

  if (entry.suggestedFix !== undefined) {
    canonicalEntry.suggestedFix = assertNonEmptyString(
      entry.suggestedFix,
      `${outcomeId}.suggestedFix`,
    );
  }

  return canonicalEntry;
};

export const loadFindingPolicyFromFile = (registryFilePath) => {
  const parsed = JSON.parse(fs.readFileSync(registryFilePath, 'utf8'));

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid finding-policy registry: expected object payload.');
  }

  if (!parsed.outcomes || typeof parsed.outcomes !== 'object' || Array.isArray(parsed.outcomes)) {
    throw new Error('Invalid finding-policy registry: expected outcomes object.');
  }

  const entries = Object.entries(parsed.outcomes);
  if (entries.length === 0) {
    throw new Error('Invalid finding-policy registry: outcomes must not be empty.');
  }

  return Object.fromEntries(
    entries
      .map(([outcomeId, entry]) => {
        const canonicalOutcomeId = assertNonEmptyString(outcomeId, 'outcome id');
        return [canonicalOutcomeId, canonicalizeEntry(entry, canonicalOutcomeId)];
      })
      .sort(([left], [right]) => left.localeCompare(right)),
  );
};
