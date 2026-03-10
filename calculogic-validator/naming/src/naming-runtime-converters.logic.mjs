import { prepareDisambiguationRoleTokens } from './rules/naming-rule-derive-disambiguation-hints.logic.mjs';

export const toReportableExtensionsSet = (extensionArray) => new Set(extensionArray);

export const toNamingRolesRuntime = (rolesArray) => {
  const roleMetadata = new Map();

  rolesArray.forEach((entry) => {
    if (!roleMetadata.has(entry.role)) {
      roleMetadata.set(entry.role, entry);
    }
  });

  const activeRoles = new Set(
    Array.from(roleMetadata.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.role),
  );

  const roleSuffixes = Array.from(roleMetadata.keys()).sort(
    (left, right) => right.length - left.length,
  );

  const disambiguationRoleTokens = prepareDisambiguationRoleTokens({
    roleMetadata,
    activeRoles,
    roleSuffixes,
  });

  return {
    roleMetadata,
    activeRoles,
    roleSuffixes,
    disambiguationRoleTokens,
  };
};


export const toReportableRootFilesSet = (rootFilesArray) => new Set(rootFilesArray);


export const toSummaryBucketsRuntime = (summaryBuckets) => ({
  classificationBuckets: [...summaryBuckets.classificationBuckets],
  secondaryBucketFamilies: [...summaryBuckets.secondaryBucketFamilies],
});


export const toMissingRolePatternsRuntime = (missingRolePatterns) =>
  missingRolePatterns.map((pattern) => ({
    ...pattern,
    extensionSegmentIndexes: [...pattern.extensionSegmentIndexes],
    literalSegmentConstraints: { ...pattern.literalSegmentConstraints },
  }));

export const toFindingPolicyRuntime = (findingPolicy) =>
  new Map(
    Object.entries(findingPolicy).map(([outcomeId, entry]) => [
      outcomeId,
      {
        ...entry,
      },
    ]),
  );

const CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const toCaseRulesRuntime = (caseRules) => {
  if (!caseRules || typeof caseRules !== 'object' || Array.isArray(caseRules)) {
    throw new Error('Naming runtime case rules must be an object.');
  }

  if (!caseRules.semanticName || typeof caseRules.semanticName !== 'object') {
    throw new Error('Naming runtime case rules semanticName must be an object.');
  }

  const semanticStyle =
    typeof caseRules.semanticName.style === 'string' ? caseRules.semanticName.style.trim() : '';

  if (semanticStyle !== 'kebab-case') {
    throw new Error(`Unsupported semantic-name style in case rules runtime: ${semanticStyle}`);
  }

  return {
    semanticName: {
      style: semanticStyle,
      pattern: CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN,
    },
  };
};
