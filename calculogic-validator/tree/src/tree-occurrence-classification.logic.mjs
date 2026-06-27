const SUBTREE_PARTITION_CANDIDATE_NAMES = new Set(['assets', 'components', 'content', 'shared']);

const SOURCE_ID = 'tree-occurrence-classification-replacement-runtime';

const isRepoTopOccurrencePath = (resolvedPath) =>
  typeof resolvedPath === 'string' && resolvedPath.length > 0 && !resolvedPath.includes('/');

const toIdentityKeys = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return [];
  }

  const keys = [];

  if (typeof record.addressPath === 'string' && record.addressPath.length > 0) {
    keys.push(`address:${record.addressPath}`);
  }

  if (
    typeof record.path === 'string' &&
    record.path.length > 0 &&
    typeof record.occurrenceType === 'string' &&
    record.occurrenceType.length > 0
  ) {
    keys.push(`path-type:${record.path}::${record.occurrenceType}`);
  }

  if (typeof record.path === 'string' && record.path.length > 0) {
    keys.push(`path:${record.path}`);
  }

  if (typeof record.resolvedPath === 'string' && record.resolvedPath.length > 0) {
    keys.push(`path:${record.resolvedPath}`);
  }

  return keys;
};

const toEvidenceLookup = (evidenceRecords, evidenceKey) => {
  const lookup = new Map();

  for (const evidenceRecord of evidenceRecords) {
    for (const key of toIdentityKeys(evidenceRecord)) {
      if (lookup.has(key)) {
        continue;
      }

      lookup.set(key, evidenceRecord[evidenceKey] ?? null);
    }
  }

  return lookup;
};

const lookupFirstAvailable = (lookup, record, fallback = null) => {
  for (const key of toIdentityKeys(record)) {
    if (lookup.has(key)) {
      return lookup.get(key);
    }
  }

  return fallback;
};


const isApprovedRelationshipQualifiedFolderKindEvidence = (record) => (
  record &&
  typeof record === 'object' &&
  !Array.isArray(record) &&
  typeof record.addressPath === 'string' &&
  record.addressPath.length > 0 &&
  record.occurrenceType === 'folder' &&
  record.folderKind === 'semantic-qualified-structural-container' &&
  record.relationshipQualified === true &&
  record.relationshipPerspective === 'semantic-qualified-structural-container' &&
  record.relationshipInterpretation === 'semantic-qualified-structural-container-aligned'
);

const toRelationshipQualifiedFolderKindLookupByAddressPath = (evidenceRecords) => {
  const lookup = new Map();

  for (const evidenceRecord of evidenceRecords) {
    if (!isApprovedRelationshipQualifiedFolderKindEvidence(evidenceRecord)) {
      continue;
    }

    if (lookup.has(evidenceRecord.addressPath)) {
      continue;
    }

    lookup.set(evidenceRecord.addressPath, evidenceRecord);
  }

  return lookup;
};

const lookupExactRelationshipQualifiedFolderKindEvidence = (lookup, occurrenceRecord) => {
  if (
    occurrenceRecord?.occurrenceType !== 'folder' ||
    typeof occurrenceRecord.addressPath !== 'string' ||
    occurrenceRecord.addressPath.length === 0
  ) {
    return null;
  }

  const evidenceRecord = lookup.get(occurrenceRecord.addressPath) ?? null;
  if (!isApprovedRelationshipQualifiedFolderKindEvidence(evidenceRecord)) {
    return null;
  }

  return evidenceRecord;
};

const toRelationshipQualifiedStructuralContainerClassification = (evidenceRecord) => ({
  structuralClass: 'relationship-qualified-structural-container',
  structuralKind: evidenceRecord.structuralRole ?? 'implementation-container',
  isRepoShapeAllowedTopLevelDirectory: false,
  isStructuralRoot: false,
  isSemanticRoot: false,
  relationshipQualified: true,
  classificationEvidenceKind: 'relationship-qualified-folder-kind',
  relationshipPerspective: evidenceRecord.relationshipPerspective,
  relationshipInterpretation: evidenceRecord.relationshipInterpretation,
  structuralRole: evidenceRecord.structuralRole ?? null,
  semanticContext: evidenceRecord.semanticContext ?? null,
  semanticContextEvidenceAddressPath: evidenceRecord.semanticContextEvidenceAddressPath ?? null,
});

const toAllowedTopLevelDirectorySet = (allowedTopLevelDirectories) =>
  new Set(
    allowedTopLevelDirectories
      .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0),
  );

const assertReplacementRuntimeInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree occurrence classification replacement runtime input must be an object.');
  }

  if (!input.treeStructuralHomeEvidence || typeof input.treeStructuralHomeEvidence !== 'object' || Array.isArray(input.treeStructuralHomeEvidence)) {
    throw new Error('Tree occurrence classification replacement runtime input must include treeStructuralHomeEvidence object.');
  }

  if (!Array.isArray(input.treeStructuralHomeEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification replacement runtime treeStructuralHomeEvidence.evidenceRecords must be an array.');
  }

  if (!input.treeSemanticHomeEvidence || typeof input.treeSemanticHomeEvidence !== 'object' || Array.isArray(input.treeSemanticHomeEvidence)) {
    throw new Error('Tree occurrence classification replacement runtime input must include treeSemanticHomeEvidence object.');
  }

  if (!Array.isArray(input.treeSemanticHomeEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification replacement runtime treeSemanticHomeEvidence.evidenceRecords must be an array.');
  }

  if (!input.treeFolderKindEvidence || typeof input.treeFolderKindEvidence !== 'object' || Array.isArray(input.treeFolderKindEvidence)) {
    throw new Error('Tree occurrence classification replacement runtime input must include treeFolderKindEvidence object.');
  }

  if (!Array.isArray(input.treeFolderKindEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification replacement runtime treeFolderKindEvidence.evidenceRecords must be an array.');
  }

  if (
    input.treeSemanticNamingFolderTypeRelationshipEvidence !== undefined &&
    (!input.treeSemanticNamingFolderTypeRelationshipEvidence ||
      typeof input.treeSemanticNamingFolderTypeRelationshipEvidence !== 'object' ||
      Array.isArray(input.treeSemanticNamingFolderTypeRelationshipEvidence) ||
      !Array.isArray(input.treeSemanticNamingFolderTypeRelationshipEvidence.unclassifiedRelationshipRecords))
  ) {
    throw new Error('Tree occurrence classification replacement runtime treeSemanticNamingFolderTypeRelationshipEvidence.unclassifiedRelationshipRecords must be an array when provided.');
  }

  if (!input.treeRepoShapePolicy || typeof input.treeRepoShapePolicy !== 'object' || Array.isArray(input.treeRepoShapePolicy)) {
    throw new Error('Tree occurrence classification replacement runtime input must include treeRepoShapePolicy object.');
  }

  if (!Array.isArray(input.treeRepoShapePolicy.allowedTopLevelDirectories)) {
    throw new Error('Tree occurrence classification replacement runtime treeRepoShapePolicy.allowedTopLevelDirectories must be an array.');
  }
};

const toReplacementRootClassification = ({ folderKind, structuralHome, semanticHome, isRepoShapeAllowedTopLevelDirectory, classificationExplanation }) => {
  if (folderKind === 'structural' || structuralHome) {
    return {
      structuralClass: 'repo-top-structural-root',
      structuralKind: 'top-root-structural',
      isRepoShapeAllowedTopLevelDirectory: true,
      isStructuralRoot: true,
      isSemanticRoot: false,
    };
  }

  if (folderKind === 'semantic' || semanticHome) {
    return {
      structuralClass: 'repo-top-semantic-root',
      structuralKind: 'semantic-root',
      isRepoShapeAllowedTopLevelDirectory: true,
      isStructuralRoot: false,
      isSemanticRoot: true,
    };
  }

  return {
    structuralClass: 'unclassified',
    structuralKind: 'unknown',
    isRepoShapeAllowedTopLevelDirectory,
    ...(classificationExplanation ? { classificationExplanation } : {}),
    isStructuralRoot: false,
    isSemanticRoot: false,
  };
};

const classifyWithPreparedEvidence = ({ occurrenceRecord, structuralHomeLookup, semanticHomeLookup, folderKindLookup, relationshipQualifiedFolderKindLookupByAddressPath, relationshipExplanationLookup, allowedTopLevelDirectorySet }) => {
  if (!occurrenceRecord || typeof occurrenceRecord !== 'object') {
    return {
      structuralClass: 'unclassified',
      structuralKind: 'unknown',
      isRepoTopOccurrence: false,
      isScopedRootOccurrence: false,
      isRepoShapeAllowedTopLevelDirectory: false,
      isStructuralRoot: false,
      isSemanticRoot: false,
      isSubtreePartitionCandidate: false,
    };
  }

  const resolvedPath = String(occurrenceRecord.resolvedPath ?? '');
  const actualName = String(occurrenceRecord.actualName ?? '');
  const occurrenceType = String(occurrenceRecord.occurrenceType ?? '');
  const isRepoTopOccurrence = isRepoTopOccurrencePath(resolvedPath);
  const isScopedRootOccurrence = occurrenceRecord.isScopedRoot === true;
  const isSubtreePartitionCandidate =
    occurrenceType === 'folder' &&
    !isRepoTopOccurrence &&
    SUBTREE_PARTITION_CANDIDATE_NAMES.has(actualName);

  if (occurrenceType === 'folder' && isRepoTopOccurrence) {
    return {
      ...toReplacementRootClassification({
        folderKind: lookupFirstAvailable(folderKindLookup, occurrenceRecord),
        structuralHome: lookupFirstAvailable(structuralHomeLookup, occurrenceRecord),
        semanticHome: lookupFirstAvailable(semanticHomeLookup, occurrenceRecord),
        isRepoShapeAllowedTopLevelDirectory: allowedTopLevelDirectorySet.has(resolvedPath),
        classificationExplanation: lookupFirstAvailable(relationshipExplanationLookup, occurrenceRecord),
      }),
      isRepoTopOccurrence,
      isScopedRootOccurrence,
      isSubtreePartitionCandidate,
    };
  }

  const relationshipQualifiedFolderKindEvidence = lookupExactRelationshipQualifiedFolderKindEvidence(relationshipQualifiedFolderKindLookupByAddressPath, occurrenceRecord);

  if (relationshipQualifiedFolderKindEvidence) {
    return {
      ...toRelationshipQualifiedStructuralContainerClassification(relationshipQualifiedFolderKindEvidence),
      isRepoTopOccurrence,
      isScopedRootOccurrence,
      isSubtreePartitionCandidate,
    };
  }

  if (isSubtreePartitionCandidate) {
    return {
      structuralClass: 'subtree-structural-partition-candidate',
      structuralKind: 'subtree-partition',
      isRepoTopOccurrence,
      isScopedRootOccurrence,
      isRepoShapeAllowedTopLevelDirectory: false,
      isStructuralRoot: false,
      isSemanticRoot: false,
      isSubtreePartitionCandidate,
    };
  }

  const relationshipExplanation = lookupFirstAvailable(relationshipExplanationLookup, occurrenceRecord);

  return {
    structuralClass: 'unclassified',
    structuralKind: 'unknown',
    isRepoTopOccurrence,
    isScopedRootOccurrence,
    isRepoShapeAllowedTopLevelDirectory: false,
    ...(relationshipExplanation ? { classificationExplanation: relationshipExplanation } : {}),
    isStructuralRoot: false,
    isSemanticRoot: false,
    isSubtreePartitionCandidate,
  };
};

export const prepareTreeOccurrenceClassificationReplacementRuntime = (input) => {
  assertReplacementRuntimeInput(input);

  const structuralHomeLookup = toEvidenceLookup(input.treeStructuralHomeEvidence.evidenceRecords, 'structuralHome');
  const semanticHomeLookup = toEvidenceLookup(input.treeSemanticHomeEvidence.evidenceRecords, 'semanticHome');
  const folderKindLookup = toEvidenceLookup(input.treeFolderKindEvidence.evidenceRecords, 'folderKind');
  const relationshipQualifiedFolderKindLookupByAddressPath = toRelationshipQualifiedFolderKindLookupByAddressPath(
    input.treeFolderKindEvidence.evidenceRecords,
  );
  const relationshipExplanationLookup = toEvidenceLookup(
    input.treeSemanticNamingFolderTypeRelationshipEvidence?.unclassifiedRelationshipRecords ?? [],
    'classificationExplanation',
  );
  const allowedTopLevelDirectorySet = toAllowedTopLevelDirectorySet(
    input.treeRepoShapePolicy.allowedTopLevelDirectories,
  );

  return {
    source: SOURCE_ID,
    classifyOccurrenceRecords: (occurrenceRecords = []) => {
      if (!Array.isArray(occurrenceRecords)) {
        throw new Error('Tree occurrence classification replacement runtime requires occurrenceRecords array.');
      }

      return occurrenceRecords.map((occurrenceRecord) => ({
        ...occurrenceRecord,
        ...classifyWithPreparedEvidence({
          occurrenceRecord,
          structuralHomeLookup,
          semanticHomeLookup,
          folderKindLookup,
          relationshipQualifiedFolderKindLookupByAddressPath,
          relationshipExplanationLookup,
          allowedTopLevelDirectorySet,
        }),
      }));
    },
    collectUnexpectedTopLevelDirectoryNames: (topLevelDirectoryNames = []) => {
      if (!Array.isArray(topLevelDirectoryNames)) {
        throw new Error('Tree unexpected top-level replacement runtime requires topLevelDirectoryNames array.');
      }

      return topLevelDirectoryNames
        .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0)
        .filter((directoryName) => !allowedTopLevelDirectorySet.has(directoryName))
        .sort((left, right) => left.localeCompare(right));
    },
  };
};
