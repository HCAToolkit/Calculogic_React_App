const SOURCE_ID = 'tree-known-roots-runtime-routing';

export const TREE_KNOWN_ROOTS_RUNTIME_MODES = Object.freeze({
  LEGACY: 'legacy-known-roots',
  REPLACEMENT: 'replacement-prepared',
  FALLBACK: 'fallback-known-roots',
});

const LEGACY_RUNTIME_TRUTH = Object.freeze({
  unexpectedTopLevelFolders: 'knownTopLevelDirectories',
  occurrenceClassification: 'topRoots[].kind',
});

const REPLACEMENT_RUNTIME_FUNCTIONS = ['classifyOccurrenceRecords', 'collectUnexpectedTopLevelDirectoryNames'];

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const normalizeRequestedMode = (requestedMode) => {
  if (requestedMode === TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT) {
    return TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT;
  }

  return TREE_KNOWN_ROOTS_RUNTIME_MODES.LEGACY;
};

const hasPreparedReplacementRuntime = (replacementRuntime) =>
  Boolean(
    isObject(replacementRuntime) &&
      REPLACEMENT_RUNTIME_FUNCTIONS.every((functionName) => typeof replacementRuntime[functionName] === 'function'),
  );

const hasSatisfiedRuntimeExecutionContract = (runtimeExecutionContract) =>
  Boolean(
    isObject(runtimeExecutionContract) &&
      runtimeExecutionContract.executionMode === 'execution-candidate' &&
      Array.isArray(runtimeExecutionContract.requiredGuards) &&
      runtimeExecutionContract.requiredGuards.length > 0 &&
      runtimeExecutionContract.requiredGuards.every((guard) => guard?.satisfied === true),
  );

export const selectTreeKnownRootsRuntimeRoute = ({
  requestedMode,
  replacementRuntime,
  runtimeExecutionContract,
} = {}) => {
  const normalizedRequestedMode = normalizeRequestedMode(requestedMode);

  if (normalizedRequestedMode !== TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT) {
    return {
      source: SOURCE_ID,
      requestedMode: normalizedRequestedMode,
      activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.LEGACY,
      fallbackUsed: false,
      fallbackReason: null,
      replacementAvailable: hasPreparedReplacementRuntime(replacementRuntime),
      replacementSafe: hasSatisfiedRuntimeExecutionContract(runtimeExecutionContract),
      legacyRuntimeTruth: LEGACY_RUNTIME_TRUTH,
    };
  }

  const replacementAvailable = hasPreparedReplacementRuntime(replacementRuntime);
  const replacementSafe = hasSatisfiedRuntimeExecutionContract(runtimeExecutionContract);

  if (!replacementAvailable) {
    return {
      source: SOURCE_ID,
      requestedMode: normalizedRequestedMode,
      activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK,
      fallbackUsed: true,
      fallbackReason: 'replacement-runtime-unavailable',
      replacementAvailable,
      replacementSafe,
      legacyRuntimeTruth: LEGACY_RUNTIME_TRUTH,
    };
  }

  if (!replacementSafe) {
    return {
      source: SOURCE_ID,
      requestedMode: normalizedRequestedMode,
      activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK,
      fallbackUsed: true,
      fallbackReason: 'replacement-runtime-unsafe',
      replacementAvailable,
      replacementSafe,
      legacyRuntimeTruth: LEGACY_RUNTIME_TRUTH,
    };
  }

  return {
    source: SOURCE_ID,
    requestedMode: normalizedRequestedMode,
    activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT,
    fallbackUsed: false,
    fallbackReason: null,
    replacementAvailable,
    replacementSafe,
    legacyRuntimeTruth: LEGACY_RUNTIME_TRUTH,
    replacementRuntime,
  };
};

const toClassificationComparable = (record) => ({
  path: record?.path ?? null,
  resolvedPath: record?.resolvedPath ?? null,
  occurrenceType: record?.occurrenceType ?? null,
  structuralClass: record?.structuralClass ?? null,
  structuralKind: record?.structuralKind ?? null,
  isKnownTopRoot: record?.isKnownTopRoot === true,
  isStructuralRoot: record?.isStructuralRoot === true,
  isSemanticRoot: record?.isSemanticRoot === true,
  isSubtreePartitionCandidate: record?.isSubtreePartitionCandidate === true,
});

const classificationResultsDiverge = (leftRecords, rightRecords) =>
  JSON.stringify(leftRecords.map(toClassificationComparable)) !==
  JSON.stringify(rightRecords.map(toClassificationComparable));

const withFallback = (route, fallbackReason) => ({
  ...route,
  activeExecutionMode: TREE_KNOWN_ROOTS_RUNTIME_MODES.FALLBACK,
  fallbackUsed: true,
  fallbackReason,
});

export const resolveTreeOccurrenceClassificationRuntime = ({
  occurrenceRecords,
  legacyClassifyOccurrenceRecords,
  route,
} = {}) => {
  if (!Array.isArray(occurrenceRecords)) {
    throw new Error('Tree known-roots runtime routing requires occurrenceRecords array.');
  }

  if (typeof legacyClassifyOccurrenceRecords !== 'function') {
    throw new Error('Tree known-roots runtime routing requires a legacy occurrence classifier.');
  }

  const legacyRecords = legacyClassifyOccurrenceRecords(occurrenceRecords);

  if (!Array.isArray(legacyRecords)) {
    throw new Error('Tree known-roots runtime routing legacy occurrence classifier must return an array.');
  }

  if (route?.activeExecutionMode !== TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT) {
    return {
      route,
      records: legacyRecords,
    };
  }

  const replacementRecords = route.replacementRuntime?.classifyOccurrenceRecords?.(occurrenceRecords);

  if (!Array.isArray(replacementRecords)) {
    return {
      route: withFallback(route, 'replacement-runtime-unavailable'),
      records: legacyRecords,
    };
  }

  if (classificationResultsDiverge(replacementRecords, legacyRecords)) {
    return {
      route: withFallback(route, 'replacement-runtime-divergent'),
      records: legacyRecords,
    };
  }

  return {
    route,
    records: replacementRecords,
  };
};

export const resolveTreeUnexpectedTopLevelDirectoryRuntime = ({
  topLevelDirectoryNames,
  legacyCollectUnexpectedDirectoryNames,
  route,
} = {}) => {
  if (!Array.isArray(topLevelDirectoryNames)) {
    throw new Error('Tree known-roots runtime routing requires topLevelDirectoryNames array.');
  }

  if (typeof legacyCollectUnexpectedDirectoryNames !== 'function') {
    throw new Error('Tree known-roots runtime routing requires a legacy unexpected top-level directory collector.');
  }

  const legacyDirectoryNames = legacyCollectUnexpectedDirectoryNames(topLevelDirectoryNames);

  if (!Array.isArray(legacyDirectoryNames)) {
    throw new Error('Tree known-roots runtime routing legacy unexpected top-level directory collector must return an array.');
  }

  if (route?.activeExecutionMode !== TREE_KNOWN_ROOTS_RUNTIME_MODES.REPLACEMENT) {
    return {
      route,
      unexpectedDirectoryNames: legacyDirectoryNames,
    };
  }

  const replacementDirectoryNames = route.replacementRuntime?.collectUnexpectedTopLevelDirectoryNames?.(topLevelDirectoryNames);

  if (!Array.isArray(replacementDirectoryNames)) {
    return {
      route: withFallback(route, 'replacement-runtime-unavailable'),
      unexpectedDirectoryNames: legacyDirectoryNames,
    };
  }

  const sortedReplacementDirectoryNames = [...replacementDirectoryNames].sort((left, right) => left.localeCompare(right));
  const sortedLegacyDirectoryNames = [...legacyDirectoryNames].sort((left, right) => left.localeCompare(right));

  if (JSON.stringify(sortedReplacementDirectoryNames) !== JSON.stringify(sortedLegacyDirectoryNames)) {
    return {
      route: withFallback(route, 'replacement-runtime-divergent'),
      unexpectedDirectoryNames: legacyDirectoryNames,
    };
  }

  return {
    route,
    unexpectedDirectoryNames: sortedReplacementDirectoryNames,
  };
};
