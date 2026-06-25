const toSortedUniqueStringFlags = (flags) =>
  Array.from(
    new Set(flags.filter((flag) => typeof flag === 'string' && flag.length > 0)),
  ).sort((left, right) => left.localeCompare(right));

const PACKAGE_MANIFEST_FILE_NAME = 'package.json';

const toPackageRootSemanticTokens = (packageJsonPath) => {
  if (typeof packageJsonPath !== 'string' || !packageJsonPath.endsWith(`/${PACKAGE_MANIFEST_FILE_NAME}`)) {
    return null;
  }

  const packageRootPath = packageJsonPath.slice(0, -`/${PACKAGE_MANIFEST_FILE_NAME}`.length);
  if (!packageRootPath || packageRootPath.includes('/')) {
    return null;
  }

  const [familyRoot] = packageRootPath.split('-');
  if (!familyRoot) {
    return null;
  }

  return { packageRootPath, semanticName: packageRootPath, semanticFamily: packageRootPath, familyRoot };
};

const cloneEvidenceLimitNotes = (evidenceLimitNotes) =>
  Array.isArray(evidenceLimitNotes)
    ? evidenceLimitNotes
        .filter((note) => note && typeof note === 'object' && !Array.isArray(note))
        .map((note) => ({ ...note }))
    : null;

const toDisambiguationPayload = (disambiguation) => {
  if (!disambiguation || typeof disambiguation !== 'object' || Array.isArray(disambiguation)) {
    return null;
  }

  const payload = {
    ...(Array.isArray(disambiguation.roleLikeFolderTokens)
      ? { roleLikeFolderTokens: toSortedUniqueStringFlags(disambiguation.roleLikeFolderTokens) }
      : {}),
    ...(Array.isArray(disambiguation.roleLikeSemanticTokens)
      ? { roleLikeSemanticTokens: toSortedUniqueStringFlags(disambiguation.roleLikeSemanticTokens) }
      : {}),
  };

  return Object.keys(payload).length > 0 ? payload : null;
};

const toCanonicalBridgeObservationFromFinding = (finding) => {
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

  const disambiguationPayload = toDisambiguationPayload(details.disambiguation);
  const evidenceLimitNotes = cloneEvidenceLimitNotes(details.evidenceLimitNotes);

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
    ...(disambiguationPayload ? { disambiguation: disambiguationPayload } : {}),
    ...(evidenceLimitNotes ? { evidenceLimitNotes } : {}),
  };
};

const toFolderFamilyRootObservationFromFinding = (finding) => {
  if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
    return null;
  }

  if (finding.code !== 'NAMING_ALLOWED_SPECIAL_CASE') {
    return null;
  }

  if (finding.details?.specialCaseType !== 'ecosystem-required') {
    return null;
  }

  const packageRootTokens = toPackageRootSemanticTokens(finding.path);
  if (!packageRootTokens) {
    return null;
  }

  return {
    path: packageRootTokens.packageRootPath,
    repoRelativePath: packageRootTokens.packageRootPath,
    occurrenceType: 'folder',
    semanticName: packageRootTokens.semanticName,
    familyRoot: packageRootTokens.familyRoot,
    semanticFamily: packageRootTokens.semanticFamily,
    semanticEvidenceKind: 'semantic-family-root-folder',
    familyRootQualification: 'package-root-folder',
    evidenceSource: 'naming-semantic-family-bridge-projection',
    evidenceProvenance: {
      sourceFindingCode: finding.code,
      sourceFindingPath: finding.path,
      sourceSpecialCaseType: finding.details.specialCaseType,
    },
  };
};

export const projectNamingSemanticFamilyBridge = (namingRuntimeOrReportOutput = {}) => {
  const findings = Array.isArray(namingRuntimeOrReportOutput.findings)
    ? namingRuntimeOrReportOutput.findings
    : [];

  return {
    observations: [
      ...findings.map(toCanonicalBridgeObservationFromFinding).filter(Boolean),
      ...findings.map(toFolderFamilyRootObservationFromFinding).filter(Boolean),
    ].sort((left, right) =>
      left.path.localeCompare(right.path) ||
      (left.occurrenceType ?? '').localeCompare(right.occurrenceType ?? '') ||
      left.semanticName.localeCompare(right.semanticName),
    ),
  };
};
