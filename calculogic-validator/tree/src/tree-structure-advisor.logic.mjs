import path from 'node:path';
import { getBuiltinTreeKnownRoots } from './registries/tree-known-roots.registry.logic.mjs';
import { getBuiltinTreeSignalPolicy } from './registries/tree-signal-policy.registry.logic.mjs';
import { classifyTreeOccurrenceRecords } from './tree-occurrence-classification.logic.mjs';

const TREE_KNOWN_ROOTS = getBuiltinTreeKnownRoots();
const TREE_SIGNAL_POLICY = getBuiltinTreeSignalPolicy();

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

const collectTopLevelUnexpectedFolderFindings = (topLevelDirectoryNames, scope) => {
  if ((scope ?? 'repo') !== 'repo') {
    return [];
  }

  return topLevelDirectoryNames
    .filter((directoryName) => !TREE_KNOWN_ROOTS.knownTopLevelDirectories.has(directoryName))
    .sort((left, right) => left.localeCompare(right))
    .map((directoryName) => ({
      code: 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER',
      severity: 'info',
      path: directoryName,
      classification: 'advisory-structure',
      message:
        'Top-level folder is outside the known project shape for this repository and may indicate structural drift.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
      details: {
        knownRoots: Array.from(TREE_KNOWN_ROOTS.knownTopLevelDirectories).sort((a, b) =>
          a.localeCompare(b),
        ),
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
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
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
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
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


const collectFileReasoningInput = (preparedInputs) => {
  const occurrenceSnapshot = preparedInputs?.occurrenceSnapshot;

  const occurrenceRecords = occurrenceSnapshot?.occurrenceRecords;

  if (Array.isArray(occurrenceRecords)) {
    const classifiedOccurrenceRecords = classifyTreeOccurrenceRecords({
      occurrenceRecords,
      treeKnownRoots: TREE_KNOWN_ROOTS,
    });
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
  const fileReasoningInput = collectFileReasoningInput(prepared);
  const selectedPathsForReasoning = fileReasoningInput.resolvedFilePaths;

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(prepared.topLevelDirectoryNames, prepared.scope),
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
