const toSortedUniqueStringFlags = (flags) =>
  Array.from(
    new Set(flags.filter((flag) => typeof flag === 'string' && flag.length > 0)),
  ).sort((left, right) => left.localeCompare(right));

const toBridgeObservationFromFinding = (finding) => {
  if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
    return null;
  }

  if (finding.classification !== 'canonical') {
    return null;
  }

  if (typeof finding.path !== 'string' || finding.path.length === 0) {
    return null;
  }

  const details = finding.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return null;
  }

  if (
    typeof details.semanticName !== 'string' ||
    details.semanticName.length === 0 ||
    typeof details.familyRoot !== 'string' ||
    details.familyRoot.length === 0 ||
    typeof details.semanticFamily !== 'string' ||
    details.semanticFamily.length === 0
  ) {
    return null;
  }

  return {
    path: finding.path,
    semanticName: details.semanticName,
    familyRoot: details.familyRoot,
    semanticFamily: details.semanticFamily,
    ...(typeof details.familySubgroup === 'string' && details.familySubgroup.length > 0
      ? { familySubgroup: details.familySubgroup }
      : {}),
    ...(Array.isArray(details.ambiguityFlags)
      ? { ambiguityFlags: toSortedUniqueStringFlags(details.ambiguityFlags) }
      : {}),
    ...(Array.isArray(details.splitFamilyFlags)
      ? { splitFamilyFlags: toSortedUniqueStringFlags(details.splitFamilyFlags) }
      : {}),
  };
};

export const projectNamingSemanticFamilyBridge = (namingRuntimeOrReportOutput = {}) => {
  const findings = Array.isArray(namingRuntimeOrReportOutput.findings)
    ? namingRuntimeOrReportOutput.findings
    : [];

  return {
    observations: findings
      .map(toBridgeObservationFromFinding)
      .filter(Boolean)
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
};
