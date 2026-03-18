export const CONNECTOR_TOKENS = new Set(['and', 'or', 'with']);

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

export const deriveSemanticFamilyDetails = ({ semanticName }) => {
  const semanticTokens = splitSemanticTokens(semanticName);

  if (semanticTokens.length < 2) {
    return null;
  }

  const grouping = deriveFamilyGrouping(semanticTokens);
  const familySubgroup = grouping.familySubgroupTokens.length > 0
    ? grouping.familySubgroupTokens.join('-')
    : undefined;

  return {
    semanticTokens,
    semanticFamily: grouping.semanticFamily,
    familyRoot: grouping.familyRoot,
    ...(familySubgroup ? { familySubgroup } : {}),
  };
};

export const attachRelatedSemanticNames = (findings) => {
  const semanticNamesByFamily = new Map();

  for (const finding of findings) {
    const semanticFamily = finding.details?.semanticFamily;
    const semanticName = finding.details?.semanticName;

    if (!semanticFamily || !semanticName) {
      continue;
    }

    if (!semanticNamesByFamily.has(semanticFamily)) {
      semanticNamesByFamily.set(semanticFamily, []);
    }

    semanticNamesByFamily.get(semanticFamily).push(semanticName);
  }

  const relatedSemanticNamesByFamily = new Map(
    Array.from(semanticNamesByFamily.entries(), ([semanticFamily, semanticNames]) => [
      semanticFamily,
      toSortedUnique(semanticNames),
    ]),
  );

  return findings.map((finding) => {
    const semanticFamily = finding.details?.semanticFamily;
    const semanticName = finding.details?.semanticName;

    if (!semanticFamily || !semanticName) {
      return finding;
    }

    const relatedSemanticNames = (relatedSemanticNamesByFamily.get(semanticFamily) ?? []).filter(
      (candidateSemanticName) => candidateSemanticName !== semanticName,
    );

    if (relatedSemanticNames.length === 0) {
      return finding;
    }

    return {
      ...finding,
      details: {
        ...finding.details,
        relatedSemanticNames,
      },
    };
  });
};
