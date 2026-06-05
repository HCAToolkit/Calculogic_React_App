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

  if (!input.treeRepoShapePolicy || typeof input.treeRepoShapePolicy !== 'object' || Array.isArray(input.treeRepoShapePolicy)) {
    throw new Error('Tree occurrence classification replacement runtime input must include treeRepoShapePolicy object.');
  }

  if (!Array.isArray(input.treeRepoShapePolicy.allowedTopLevelDirectories)) {
    throw new Error('Tree occurrence classification replacement runtime treeRepoShapePolicy.allowedTopLevelDirectories must be an array.');
  }
};

const toReplacementRootClassification = ({ folderKind, structuralHome, semanticHome }) => {
  if (folderKind === 'structural' || structuralHome) {
    return {
      structuralClass: 'repo-top-structural-root',
      structuralKind: 'top-root-structural',
      isKnownTopRoot: true,
      isStructuralRoot: true,
      isSemanticRoot: false,
    };
  }

  if (folderKind === 'semantic' || semanticHome) {
    return {
      structuralClass: 'repo-top-semantic-root',
      structuralKind: 'semantic-root',
      isKnownTopRoot: true,
      isStructuralRoot: false,
      isSemanticRoot: true,
    };
  }

  return {
    structuralClass: 'unclassified',
    structuralKind: 'unknown',
    isKnownTopRoot: false,
    isStructuralRoot: false,
    isSemanticRoot: false,
  };
};

const classifyWithPreparedEvidence = ({ occurrenceRecord, structuralHomeLookup, semanticHomeLookup, folderKindLookup }) => {
  if (!occurrenceRecord || typeof occurrenceRecord !== 'object') {
    return {
      structuralClass: 'unclassified',
      structuralKind: 'unknown',
      isRepoTopOccurrence: false,
      isScopedRootOccurrence: false,
      isKnownTopRoot: false,
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
      }),
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
      isKnownTopRoot: false,
      isStructuralRoot: false,
      isSemanticRoot: false,
      isSubtreePartitionCandidate,
    };
  }

  return {
    structuralClass: 'unclassified',
    structuralKind: 'unknown',
    isRepoTopOccurrence,
    isScopedRootOccurrence,
    isKnownTopRoot: false,
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
