import fs from 'node:fs';
import path from 'node:path';
import { getValidatorScopeProfile } from './validator-scopes.runtime.mjs';

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

const TOP_LEVEL_SCAN_EXCLUSIONS = new Set(['.git', 'node_modules']);
const WALK_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.reports',
  '.turbo',
  '.yarn',
  'coverage',
  'dist',
  'node_modules',
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

export const normalizePath = (relativePath) => relativePath.split(path.sep).join('/');

const sortByPathThenCode = (left, right) => {
  const byPath = left.path.localeCompare(right.path);
  if (byPath !== 0) {
    return byPath;
  }

  return left.code.localeCompare(right.code);
};

const isValidatorOwnedBasenameSignal = (basename) =>
  VALIDATOR_OWNED_BASENAME_PATTERNS.some((pattern) => pattern.test(basename));

const getScopeRoots = (scope) => {
  const normalizedScope = scope ?? 'repo';
  const profile = getValidatorScopeProfile(normalizedScope);

  if (!profile) {
    throw new Error(`Invalid scope profile: ${normalizedScope}`);
  }

  if (normalizedScope === 'repo') {
    return ['.'];
  }

  return profile.includeRoots;
};

const collectPathsFromRoot = (repositoryRoot, rootRelativePath) => {
  const absoluteRoot = path.resolve(repositoryRoot, rootRelativePath);
  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }

  const rootStat = fs.statSync(absoluteRoot);
  if (!rootStat.isDirectory()) {
    return [];
  }

  const collected = [];

  const walk = (absoluteDirectoryPath) => {
    const entries = fs
      .readdirSync(absoluteDirectoryPath, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (WALK_EXCLUDED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }

        walk(path.join(absoluteDirectoryPath, entry.name));
        continue;
      }

      const relativeFilePath = normalizePath(path.relative(repositoryRoot, path.join(absoluteDirectoryPath, entry.name)));
      collected.push(relativeFilePath);
    }
  };

  walk(absoluteRoot);
  return collected;
};

const collectTopLevelUnexpectedFolderFindings = (repositoryRoot, scope) => {
  if ((scope ?? 'repo') !== 'repo') {
    return [];
  }

  return fs
    .readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((directoryName) => !TOP_LEVEL_SCAN_EXCLUSIONS.has(directoryName))
    .filter((directoryName) => !directoryName.startsWith('.'))
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

export const runTreeStructureAdvisor = (repositoryRoot, options = {}) => {
  const selectedScope = options.scope ?? 'repo';
  const scopeRoots = getScopeRoots(selectedScope);
  const scopedPaths = scopeRoots.flatMap((scopeRoot) => collectPathsFromRoot(repositoryRoot, scopeRoot));

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(repositoryRoot, selectedScope),
    ...collectValidatorOwnedOutsideTreeFindings(scopedPaths),
  ].sort(sortByPathThenCode);

  return {
    findings,
    totalFilesScanned: Array.from(new Set(scopedPaths)).length,
    scope: selectedScope,
  };
};
