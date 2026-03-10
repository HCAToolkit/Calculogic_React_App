import path from 'node:path';
import { collectShimCompatFindings } from './tree-shim-detection.logic.mjs';
import { getBuiltinTreeKnownRoots } from './registries/tree-known-roots.registry.logic.mjs';
import { getBuiltinTreeSignalPolicy } from './registries/tree-signal-policy.registry.logic.mjs';

const TREE_KNOWN_ROOTS = getBuiltinTreeKnownRoots();
const TREE_SIGNAL_POLICY = getBuiltinTreeSignalPolicy();

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
    Array.isArray(preparedInputs.targets) &&
    typeof preparedInputs.getFileContent === 'function';

  if (hasPreparedRuntimeInputs) {
    return preparedInputs;
  }

  throw new Error(
    'Tree runtime requires prepared inputs from wiring/runtime adapter: selectedPaths[], topLevelDirectoryNames[], targets[], and getFileContent(relativePath).',
  );
};

export const runTreeStructureAdvisor = (preparedInputs = {}) => {
  const prepared = assertPreparedTreeInputs(preparedInputs);

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(prepared.topLevelDirectoryNames, prepared.scope),
    ...collectValidatorOwnedOutsideTreeFindings(prepared.selectedPaths),
    ...collectShimCompatFindings(prepared.selectedPaths, prepared.getFileContent),
  ].sort(sortByPathThenCode);

  return {
    findings,
    totalFilesScanned: prepared.selectedPaths.length,
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
