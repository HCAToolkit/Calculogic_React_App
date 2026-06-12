import path from 'node:path';
import { getBuiltinTreeSignalPolicy } from './registries/tree-signal-policy-registry.logic.mjs';
import { getBuiltinTreeRepoShapePolicy } from './registries/tree-repo-shape-policy-registry.logic.mjs';

const TREE_SIGNAL_POLICY = getBuiltinTreeSignalPolicy();
const TREE_REPO_SHAPE_POLICY = getBuiltinTreeRepoShapePolicy();
const ALLOWED_TOP_LEVEL_DIRECTORY_NAMES = TREE_REPO_SHAPE_POLICY.allowedTopLevelDirectories;
const ALLOWED_TOP_LEVEL_DIRECTORY_NAME_SET = new Set(ALLOWED_TOP_LEVEL_DIRECTORY_NAMES);

const VALIDATOR_SUITE_CORE_ROOT = 'calculogic-validator/src/';
const SUITE_CORE_BOUNDARY_DRIFT_CARVEOUT_PREFIXES = [
  'calculogic-validator/src/core/',
  'calculogic-validator/src/compat/',
  'calculogic-validator/src/registries/',
];
const SUITE_CORE_BOUNDARY_DRIFT_CARVEOUT_EXACT_PATHS = new Set([
  'calculogic-validator/src/index.mjs',
  'calculogic-validator/src/validator-config.schema.json',
]);
const SUITE_CORE_BOUNDARY_DRIFT_OWNED_SUBSYSTEM_MIN_FILES = 2;

const BOUNDARY_DRIFT_BASENAME_SIGNAL_MATCHER =
  /(?:\.host\.|\.wiring\.|\.logic\.|\.knowledge\.|\.contracts\.|\.runtime\.|registry|registries)/u;

const sortByPathThenCode = (left, right) => {
  const byPath = left.path.localeCompare(right.path);
  if (byPath !== 0) {
    return byPath;
  }

  return left.code.localeCompare(right.code);
};

const isValidatorOwnedBasenameSignal = (basename) =>
  TREE_SIGNAL_POLICY.validatorOwnedBasenameSignalMatchers.some(({ matcher }) => matcher.test(basename));

const createNeutralReplacementRuntime = () => ({
  classifyOccurrenceRecords: (occurrenceRecords = []) => occurrenceRecords,
  collectUnexpectedTopLevelDirectoryNames: (topLevelDirectoryNames = []) => {
    if (!Array.isArray(topLevelDirectoryNames)) {
      throw new Error('Tree unexpected top-level fallback runtime requires topLevelDirectoryNames array.');
    }

    return topLevelDirectoryNames
      .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0)
      .filter((directoryName) => !ALLOWED_TOP_LEVEL_DIRECTORY_NAME_SET.has(directoryName))
      .sort((left, right) => left.localeCompare(right));
  },
});

const isReplacementRuntime = (replacementRuntime) => (
  replacementRuntime &&
  typeof replacementRuntime === 'object' &&
  !Array.isArray(replacementRuntime) &&
  typeof replacementRuntime.classifyOccurrenceRecords === 'function' &&
  typeof replacementRuntime.collectUnexpectedTopLevelDirectoryNames === 'function'
);

const resolveReplacementRuntime = (replacementRuntime) => {
  if (isReplacementRuntime(replacementRuntime)) {
    return replacementRuntime;
  }

  return createNeutralReplacementRuntime();
};

const isRuntimeExecutionReadyForReplacementRoute = (preparedDependencies = {}) => {
  const runtimeExecutionContract = preparedDependencies.treeOccurrenceClassificationRuntimeExecutionContract;
  const replacementReadiness = preparedDependencies.treeOccurrenceClassificationReplacementReadiness;

  return (
    runtimeExecutionContract &&
    typeof runtimeExecutionContract === 'object' &&
    !Array.isArray(runtimeExecutionContract) &&
    runtimeExecutionContract.executionMode === 'execution-candidate' &&
    runtimeExecutionContract.executionStatus === 'ready-for-future-execution-contract' &&
    replacementReadiness &&
    typeof replacementReadiness === 'object' &&
    !Array.isArray(replacementReadiness) &&
    replacementReadiness.replacementDecision === 'candidate-ready'
  );
};

const isClassifiedRepoTopFolderRecord = (record) => (
  record &&
  typeof record === 'object' &&
  !Array.isArray(record) &&
  record.occurrenceType === 'folder' &&
  record.isRepoTopOccurrence === true &&
  typeof record.resolvedPath === 'string' &&
  record.resolvedPath.length > 0 &&
  !record.resolvedPath.includes('/') &&
  typeof record.isRepoShapeAllowedTopLevelDirectory === 'boolean'
);

const collectUnexpectedTopLevelDirectoryNamesFromClassification = ({
  topLevelDirectoryNames,
  preparedInputs,
  replacementRuntime,
  preparedDependencies,
}) => {
  if (
    !Array.isArray(topLevelDirectoryNames) ||
    !isReplacementRuntime(replacementRuntime) ||
    !isRuntimeExecutionReadyForReplacementRoute(preparedDependencies)
  ) {
    return null;
  }

  const occurrenceSnapshot = preparedInputs.structuralAddressSnapshot ?? preparedInputs.occurrenceSnapshot;
  const occurrenceRecords = occurrenceSnapshot?.occurrenceRecords;

  if (!Array.isArray(occurrenceRecords)) {
    return null;
  }

  let classifiedOccurrenceRecords;
  try {
    classifiedOccurrenceRecords = replacementRuntime.classifyOccurrenceRecords(occurrenceRecords);
  } catch {
    return null;
  }

  if (!Array.isArray(classifiedOccurrenceRecords)) {
    return null;
  }

  const repoTopFolderRecordsByName = new Map();
  for (const record of classifiedOccurrenceRecords) {
    if (!isClassifiedRepoTopFolderRecord(record)) {
      continue;
    }

    if (repoTopFolderRecordsByName.has(record.resolvedPath)) {
      continue;
    }

    repoTopFolderRecordsByName.set(record.resolvedPath, record);
  }

  const normalizedTopLevelDirectoryNames = topLevelDirectoryNames
    .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0)
    .sort((left, right) => left.localeCompare(right));

  if (normalizedTopLevelDirectoryNames.some((directoryName) => !repoTopFolderRecordsByName.has(directoryName))) {
    return null;
  }

  return normalizedTopLevelDirectoryNames
    .filter((directoryName) => {
      const classification = repoTopFolderRecordsByName.get(directoryName);
      return classification.isRepoShapeAllowedTopLevelDirectory === false;
    })
    .sort((left, right) => left.localeCompare(right));
};

const collectFallbackUnexpectedTopLevelDirectoryNames = (topLevelDirectoryNames, replacementRuntime) => {
  const runtime = resolveReplacementRuntime(replacementRuntime);
  const unexpectedDirectoryNames = runtime.collectUnexpectedTopLevelDirectoryNames(topLevelDirectoryNames);

  if (!Array.isArray(unexpectedDirectoryNames)) {
    throw new Error('Tree replacement runtime collectUnexpectedTopLevelDirectoryNames() must return an array.');
  }

  return unexpectedDirectoryNames;
};

const collectTopLevelUnexpectedFolderFindings = (preparedInputs, replacementRuntime) => {
  if ((preparedInputs.scope ?? 'repo') !== 'repo') {
    return [];
  }

  const unexpectedDirectoryNames = collectUnexpectedTopLevelDirectoryNamesFromClassification({
    topLevelDirectoryNames: preparedInputs.topLevelDirectoryNames,
    preparedInputs,
    replacementRuntime,
    preparedDependencies: preparedInputs.preparedDependencies,
  }) ?? collectFallbackUnexpectedTopLevelDirectoryNames(preparedInputs.topLevelDirectoryNames, replacementRuntime);

  const allowedTopLevelDirectories = [...ALLOWED_TOP_LEVEL_DIRECTORY_NAMES];

  return unexpectedDirectoryNames
    .sort((left, right) => left.localeCompare(right))
    .map((directoryName) => ({
      code: 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER',
      severity: 'info',
      path: directoryName,
      classification: 'advisory-structure',
      message:
        'Top-level folder is outside the known project shape for this repository and may indicate structural drift.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
      details: {
        allowedTopLevelDirectories,
      },
    }));
};

const collectValidatorOwnedOutsideTreeFindings = (paths) =>
  paths
    .filter((relativePath) => !relativePath.startsWith('calculogic-validator/'))
    .filter((relativePath) => isValidatorOwnedBasenameSignal(path.posix.basename(relativePath)))
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => ({
      code: 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE',
      severity: 'info',
      path: relativePath,
      classification: 'advisory-structure',
      message:
        'Path appears validator-owned by basename signal but is located outside calculogic-validator/**.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
      details: {
        expectedRoot: 'calculogic-validator/',
      },
    }));

const isBoundaryDriftCarveoutPath = (relativePath) =>
  SUITE_CORE_BOUNDARY_DRIFT_CARVEOUT_EXACT_PATHS.has(relativePath) ||
  SUITE_CORE_BOUNDARY_DRIFT_CARVEOUT_PREFIXES.some((prefix) => relativePath.startsWith(prefix));

const collectOwnedSliceBoundaryDriftFindings = (paths) => {
  const filesBySuiteCoreSubtree = new Map();

  for (const relativePath of paths) {
    if (!relativePath.startsWith(VALIDATOR_SUITE_CORE_ROOT)) {
      continue;
    }

    if (isBoundaryDriftCarveoutPath(relativePath)) {
      continue;
    }

    const suffix = relativePath.slice(VALIDATOR_SUITE_CORE_ROOT.length);
    const [topLevelSegment] = suffix.split('/');
    if (!topLevelSegment || topLevelSegment.includes('.')) {
      continue;
    }

    const siblingPaths = filesBySuiteCoreSubtree.get(topLevelSegment) ?? [];
    siblingPaths.push(relativePath);
    filesBySuiteCoreSubtree.set(topLevelSegment, siblingPaths);
  }

  return Array.from(filesBySuiteCoreSubtree.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([topLevelSegment, siblingPaths]) => {
      const matchedOwnedSignals = siblingPaths
        .filter((candidatePath) =>
          BOUNDARY_DRIFT_BASENAME_SIGNAL_MATCHER.test(path.posix.basename(candidatePath)),
        )
        .sort((left, right) => left.localeCompare(right));

      if (matchedOwnedSignals.length < SUITE_CORE_BOUNDARY_DRIFT_OWNED_SUBSYSTEM_MIN_FILES) {
        return [];
      }

      return [
        {
          code: 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
          severity: 'info',
          path: `${VALIDATOR_SUITE_CORE_ROOT}${topLevelSegment}/`,
          classification: 'advisory-structure',
          message:
            'Likely validator-owned subsystem growth is accumulating under suite-core calculogic-validator/src/** rather than an owned slice root.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            suiteCoreRoot: VALIDATOR_SUITE_CORE_ROOT,
            observedSubtree: topLevelSegment,
            matchedOwnedSignalPaths: matchedOwnedSignals,
            threshold: {
              minOwnedSignalFiles: SUITE_CORE_BOUNDARY_DRIFT_OWNED_SUBSYSTEM_MIN_FILES,
            },
          },
        },
      ];
    });
};


const collectFileReasoningInput = (preparedInputs, replacementRuntime) => {
  const occurrenceSnapshot = preparedInputs?.structuralAddressSnapshot ?? preparedInputs?.occurrenceSnapshot;

  const occurrenceRecords = occurrenceSnapshot?.occurrenceRecords;

  if (Array.isArray(occurrenceRecords)) {
    const runtime = resolveReplacementRuntime(replacementRuntime);
    let classifiedOccurrenceRecords;

    try {
      classifiedOccurrenceRecords = runtime.classifyOccurrenceRecords(occurrenceRecords);
    } catch {
      classifiedOccurrenceRecords = null;
    }

    if (!Array.isArray(classifiedOccurrenceRecords)) {
      return {
        source: 'selectedPaths-fallback',
        fileRecords: [],
        resolvedFilePaths: preparedInputs.selectedPaths,
      };
    }

    const fileRecords = classifiedOccurrenceRecords.filter(
      (record) =>
        record &&
        record.occurrenceType === 'file' &&
        typeof record.resolvedPath === 'string' &&
        record.resolvedPath.length > 0,
    );
    const resolvedFilePaths = [...new Set(fileRecords.map((record) => record.resolvedPath))].sort((left, right) =>
      left.localeCompare(right),
    );

    return {
      source: 'occurrenceSnapshot',
      occurrenceRecords: classifiedOccurrenceRecords,
      fileRecords,
      resolvedFilePaths,
    };
  }

  return {
    source: 'selectedPaths-fallback',
    fileRecords: [],
    resolvedFilePaths: preparedInputs.selectedPaths,
  };
};

const incrementCounter = (counts, key) => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const sortCountObject = (counts) =>
  Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));

export const summarizeFindings = (findings) => {
  const counts = {
    'advisory-structure': 0,
  };
  const codeCounts = {};

  for (const finding of findings) {
    incrementCounter(counts, finding.classification);
    incrementCounter(codeCounts, finding.code);
  }

  return {
    counts,
    codeCounts: sortCountObject(codeCounts),
  };
};

const assertPreparedTreeInputs = (preparedInputs) => {
  const hasPreparedRuntimeInputs =
    preparedInputs &&
    Array.isArray(preparedInputs.selectedPaths) &&
    Array.isArray(preparedInputs.topLevelDirectoryNames) &&
    Array.isArray(preparedInputs.targets);

  if (hasPreparedRuntimeInputs) {
    return preparedInputs;
  }

  throw new Error(
    'Tree runtime requires prepared tree-core inputs from wiring/runtime adapter: selectedPaths[], topLevelDirectoryNames[], and targets[].',
  );
};

const collectContributorFindings = (preparedInputs) => {
  const { findingContributors } = preparedInputs;

  if (!Array.isArray(findingContributors) || findingContributors.length === 0) {
    return [];
  }

  return findingContributors.flatMap((contributor) => {
    if (typeof contributor !== 'function') {
      throw new Error('Tree runtime findingContributors must contain functions only.');
    }

    const contributedFindings = contributor(preparedInputs);
    if (!Array.isArray(contributedFindings)) {
      throw new Error('Tree runtime finding contributor must return an array of findings.');
    }

    return contributedFindings;
  });
};

export const runTreeStructureAdvisor = (preparedInputs = {}) => {
  const prepared = assertPreparedTreeInputs(preparedInputs);
  const replacementRuntime = prepared.preparedDependencies?.treeOccurrenceClassificationReplacementRuntime;
  const fileReasoningInput = collectFileReasoningInput(prepared, replacementRuntime);
  const selectedPathsForReasoning = fileReasoningInput.resolvedFilePaths;

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(prepared, replacementRuntime),
    ...collectValidatorOwnedOutsideTreeFindings(selectedPathsForReasoning),
    ...collectOwnedSliceBoundaryDriftFindings(selectedPathsForReasoning),
    ...collectContributorFindings(prepared),
  ].sort(sortByPathThenCode);

  return {
    findings,
    totalFilesScanned: selectedPathsForReasoning.length,
    scope: prepared.scope ?? 'repo',
    filters: {
      isFiltered: prepared.targets.length > 0,
      ...(prepared.targets.length > 0
        ? {
            targets: prepared.targets,
          }
        : {}),
    },
  };
};
