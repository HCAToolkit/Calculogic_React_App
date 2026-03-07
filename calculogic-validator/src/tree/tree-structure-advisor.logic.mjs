import path from 'node:path';
import { collectShimCompatFindings } from './tree-shim-detection.logic.mjs';

const KNOWN_TOP_LEVEL_DIRECTORIES = new Set([
  'bin',
  'calculogic-validator',
  'doc',
  'docs',
  'public',
  'scripts',
  'src',
  'test',
  'tools',
]);

const VALIDATOR_OWNED_BASENAME_PATTERNS = [
  /^naming-validator\.(logic|host|wiring|contracts)\.mjs$/u,
  /^tree-structure-advisor\.(logic|host|wiring|contracts)\.mjs$/u,
  /^validator-(?:runner|registry|config|exit-code|report|scopes|health-check).+\.mjs$/u,
  /^validate-(?:all|naming)\.mjs$/u,
  /^calculogic-validate(?:-naming|-validator-health)?\.mjs$/u,
  /^validator-.+\.test\.mjs$/u,
  /^naming-.+\.test\.mjs$/u,
];

const sortByPathThenCode = (left, right) => {
  const byPath = left.path.localeCompare(right.path);
  if (byPath !== 0) {
    return byPath;
  }

  return left.code.localeCompare(right.code);
};

const isValidatorOwnedBasenameSignal = (basename) =>
  VALIDATOR_OWNED_BASENAME_PATTERNS.some((pattern) => pattern.test(basename));

const collectTopLevelUnexpectedFolderFindings = (topLevelDirectoryNames, scope) => {
  if ((scope ?? 'repo') !== 'repo') {
    return [];
  }

  return topLevelDirectoryNames
    .filter((directoryName) => !KNOWN_TOP_LEVEL_DIRECTORIES.has(directoryName))
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
        knownRoots: Array.from(KNOWN_TOP_LEVEL_DIRECTORIES).sort((a, b) => a.localeCompare(b)),
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
  if (
    preparedInputs &&
    Array.isArray(preparedInputs.selectedPaths) &&
    Array.isArray(preparedInputs.topLevelDirectoryNames)
  ) {
    return preparedInputs;
  }

  throw new Error('Tree runtime requires prepared inputs from wiring/runtime adapter.');
};

export const runTreeStructureAdvisor = (preparedInputs = {}) => {
  const prepared = assertPreparedTreeInputs(preparedInputs);

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(prepared.topLevelDirectoryNames, prepared.scope),
    ...collectValidatorOwnedOutsideTreeFindings(prepared.selectedPaths),
    ...collectShimCompatFindings(prepared.selectedPaths, prepared.fileContentsByPath),
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
