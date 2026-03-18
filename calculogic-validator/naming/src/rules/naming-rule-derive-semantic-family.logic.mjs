export const CONNECTOR_TOKENS = new Set(['and', 'or', 'with']);

export const SEMANTIC_FAMILY_EVIDENCE_CLASSIFICATIONS = new Set(['canonical']);

export const SEMANTIC_FAMILY_AMBIGUITY_FLAGS = Object.freeze({
  FAMILY_BOUNDARY_HEURISTIC: 'family-boundary-heuristic',
});

export const SEMANTIC_FAMILY_SPLIT_FLAGS = Object.freeze({
  ROOT_HAS_MULTIPLE_FAMILIES: 'family-root-observed-multiple-families',
});

const splitSemanticTokens = (semanticName) =>
  semanticName.split(/[-.]/u).map((token) => token.trim()).filter(Boolean);

const toSortedUnique = (values) => Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));

const deriveFamilyGrouping = (semanticTokens) => {
  const hasConnectorToken = semanticTokens.slice(1).some((token) => CONNECTOR_TOKENS.has(token));

  if (hasConnectorToken) {
    return {
      semanticFamily: semanticTokens[0],
      familyRoot: semanticTokens[0],
      familySubgroupTokens: semanticTokens.slice(1),
    };
  }

  if (semanticTokens.length >= 4) {
    return {
      semanticFamily: semanticTokens.slice(0, 2).join('-'),
      familyRoot: semanticTokens[0],
      familySubgroupTokens: semanticTokens.slice(1, -1),
    };
  }

  return {
    semanticFamily: semanticTokens[0],
    familyRoot: semanticTokens[0],
    familySubgroupTokens: semanticTokens.slice(1),
  };
};

const deriveAmbiguityFlags = ({ semanticTokens }) => {
  if (semanticTokens.length >= 4 && !semanticTokens.slice(1).some((token) => CONNECTOR_TOKENS.has(token))) {
    return [SEMANTIC_FAMILY_AMBIGUITY_FLAGS.FAMILY_BOUNDARY_HEURISTIC];
  }

  return [];
};

const withSortedUniqueFlags = (details, fieldName, flags) => {
  if (flags.length === 0) {
    return details;
  }

  return {
    ...details,
    [fieldName]: toSortedUnique(flags),
  };
};

export const deriveSemanticFamilyDetails = ({ semanticName }) => {
  const semanticTokens = splitSemanticTokens(semanticName);

  if (semanticTokens.length < 2) {
    return null;
  }

  const grouping = deriveFamilyGrouping(semanticTokens);
  const familySubgroup = grouping.familySubgroupTokens.length > 0
    ? grouping.familySubgroupTokens.join('-')
    : undefined;

  return withSortedUniqueFlags({
    semanticTokens,
    semanticFamily: grouping.semanticFamily,
    familyRoot: grouping.familyRoot,
    ...(familySubgroup ? { familySubgroup } : {}),
  }, 'ambiguityFlags', deriveAmbiguityFlags({ semanticTokens }));
};

export const isSemanticFamilyEvidenceFinding = (finding) =>
  SEMANTIC_FAMILY_EVIDENCE_CLASSIFICATIONS.has(finding.classification) &&
  typeof finding.details?.semanticName === 'string' &&
  typeof finding.details?.semanticFamily === 'string' &&
  typeof finding.details?.familyRoot === 'string';

const buildSemanticFamilyObservationMaps = (findings) => {
  const semanticNamesByFamily = new Map();
  const semanticFamiliesByRoot = new Map();

  for (const finding of findings) {
    if (!isSemanticFamilyEvidenceFinding(finding)) {
      continue;
    }

    const { semanticFamily, semanticName, familyRoot } = finding.details;

    if (!semanticNamesByFamily.has(semanticFamily)) {
      semanticNamesByFamily.set(semanticFamily, []);
    }

    semanticNamesByFamily.get(semanticFamily).push(semanticName);

    if (!semanticFamiliesByRoot.has(familyRoot)) {
      semanticFamiliesByRoot.set(familyRoot, []);
    }

    semanticFamiliesByRoot.get(familyRoot).push(semanticFamily);
  }

  return {
    relatedSemanticNamesByFamily: new Map(
      Array.from(semanticNamesByFamily.entries(), ([semanticFamily, semanticNames]) => [
        semanticFamily,
        toSortedUnique(semanticNames),
      ]),
    ),
    semanticFamiliesByRoot: new Map(
      Array.from(semanticFamiliesByRoot.entries(), ([familyRoot, semanticFamilies]) => [
        familyRoot,
        toSortedUnique(semanticFamilies),
      ]),
    ),
  };
};

export const attachRelatedSemanticNames = (findings) => {
  const {
    relatedSemanticNamesByFamily,
    semanticFamiliesByRoot,
  } = buildSemanticFamilyObservationMaps(findings);

  return findings.map((finding) => {
    if (!isSemanticFamilyEvidenceFinding(finding)) {
      return finding;
    }

    const { semanticFamily, semanticName, familyRoot } = finding.details;
    const relatedSemanticNames = (relatedSemanticNamesByFamily.get(semanticFamily) ?? []).filter(
      (candidateSemanticName) => candidateSemanticName !== semanticName,
    );

    const splitFamilyFlags = (semanticFamiliesByRoot.get(familyRoot) ?? []).length > 1
      ? [SEMANTIC_FAMILY_SPLIT_FLAGS.ROOT_HAS_MULTIPLE_FAMILIES]
      : [];

    const detailsWithRelatedNames = relatedSemanticNames.length > 0
      ? {
          ...finding.details,
          relatedSemanticNames,
        }
      : finding.details;

    return {
      ...finding,
      details: withSortedUniqueFlags(detailsWithRelatedNames, 'splitFamilyFlags', splitFamilyFlags),
    };
  });
};
