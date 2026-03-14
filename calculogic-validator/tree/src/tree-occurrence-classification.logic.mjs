const SUBTREE_PARTITION_CANDIDATE_NAMES = new Set(['assets', 'components', 'content', 'shared']);

const buildTopRootKindByName = (treeKnownRoots) => {
  const topRoots = Array.isArray(treeKnownRoots?.topRoots) ? treeKnownRoots.topRoots : [];

  return new Map(
    topRoots
      .filter((entry) => entry && typeof entry.root === 'string' && typeof entry.kind === 'string')
      .map((entry) => [entry.root, entry.kind]),
  );
};

const isRepoTopOccurrencePath = (resolvedPath) =>
  typeof resolvedPath === 'string' && resolvedPath.length > 0 && !resolvedPath.includes('/');

const classifyWithTopRootMap = (occurrenceRecord, topRootKindByName) => {
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

  const topRootKind = isRepoTopOccurrence ? topRootKindByName.get(actualName) : undefined;
  const isStructuralRoot = topRootKind === 'structural';
  const isSemanticRoot = topRootKind === 'semantic';
  const isKnownTopRoot = isStructuralRoot || isSemanticRoot;

  const isSubtreePartitionCandidate =
    occurrenceType === 'folder' &&
    !isRepoTopOccurrence &&
    SUBTREE_PARTITION_CANDIDATE_NAMES.has(actualName);

  let structuralClass = 'unclassified';
  let structuralKind = 'unknown';

  if (isStructuralRoot) {
    structuralClass = 'repo-top-structural-root';
    structuralKind = 'top-root-structural';
  } else if (isSemanticRoot) {
    structuralClass = 'repo-top-semantic-root';
    structuralKind = 'semantic-root';
  } else if (isSubtreePartitionCandidate) {
    structuralClass = 'subtree-structural-partition-candidate';
    structuralKind = 'subtree-partition';
  }

  return {
    structuralClass,
    structuralKind,
    isRepoTopOccurrence,
    isScopedRootOccurrence,
    isKnownTopRoot,
    isStructuralRoot,
    isSemanticRoot,
    isSubtreePartitionCandidate,
  };
};

export const classifyTreeOccurrenceRecord = (occurrenceRecord, treeKnownRoots) =>
  classifyWithTopRootMap(occurrenceRecord, buildTopRootKindByName(treeKnownRoots));

export const classifyTreeOccurrenceRecords = ({ occurrenceRecords = [], treeKnownRoots } = {}) => {
  const topRootKindByName = buildTopRootKindByName(treeKnownRoots);

  return occurrenceRecords.map((occurrenceRecord) => ({
    ...occurrenceRecord,
    ...classifyWithTopRootMap(occurrenceRecord, topRootKindByName),
  }));
};
