import fs from 'node:fs';
import path from 'node:path';
import {
  runTreeStructureAdvisor as runTreeStructureAdvisorRuntime,
  summarizeFindings,
} from './tree-structure-advisor.logic.mjs';
import { getValidatorScopeProfile } from '../../src/core/validator-scopes.runtime.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from '../../src/core/scoped-target-paths.logic.mjs';

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

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const getScopeCollectionProfile = (scope) => {
  const selectedScope = scope ?? 'repo';
  const profile = getValidatorScopeProfile(selectedScope);

  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  if (selectedScope === 'repo') {
    return { includeRoots: ['.'], includeRootFiles: [] };
  }

  return {
    includeRoots: profile.includeRoots,
    includeRootFiles: profile.includeRootFiles,
  };
};

const collectPathsFromScopeRoot = (repositoryRoot, scopeRoot) => {
  const absoluteRoot = path.resolve(repositoryRoot, scopeRoot);
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

      const relativeFilePath = normalizePath(
        path.relative(repositoryRoot, path.join(absoluteDirectoryPath, entry.name)),
      );
      collected.push(relativeFilePath);
    }
  };

  walk(absoluteRoot);
  return collected;
};


const collectPathsFromRootFiles = (repositoryRoot, includeRootFiles) => {
  const repositoryAbsoluteRoot = path.resolve(repositoryRoot);

  return includeRootFiles.flatMap((rootFilePath) => {
    const absolutePath = path.resolve(repositoryRoot, rootFilePath);

    if (path.dirname(absolutePath) !== repositoryAbsoluteRoot || !fs.existsSync(absolutePath)) {
      return [];
    }

    const rootFileStat = fs.statSync(absolutePath);
    if (!rootFileStat.isFile()) {
      return [];
    }

    return [normalizePath(path.relative(repositoryRoot, absolutePath))];
  });
};

const collectTopLevelDirectoryNames = (repositoryRoot) =>
  fs
    .readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((directoryName) => !TOP_LEVEL_SCAN_EXCLUSIONS.has(directoryName))
    .filter((directoryName) => !directoryName.startsWith('.'))
    .sort((left, right) => left.localeCompare(right));

export const prepareTreeStructureAdvisorInputs = (repositoryRoot, { scope, targets } = {}) => {
  const selectedScope = scope ?? 'repo';
  const scopeCollectionProfile = getScopeCollectionProfile(selectedScope);
  const scopedPaths = scopeCollectionProfile.includeRoots.flatMap((scopeRoot) =>
    collectPathsFromScopeRoot(repositoryRoot, scopeRoot),
  );
  const rootFilePaths = collectPathsFromRootFiles(
    repositoryRoot,
    scopeCollectionProfile.includeRootFiles,
  );
  const inScopePaths = sortPaths(new Set([...scopedPaths, ...rootFilePaths]));
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets ?? []);
  const selectedPaths = filterScopedPathsByTargets(repositoryRoot, inScopePaths, resolvedTargets);
  const contentByPathCache = new Map();
  const selectedPathSet = new Set(selectedPaths);
  const getFileContent = (relativePath) => {
    if (!selectedPathSet.has(relativePath)) {
      throw new Error(
        `Tree prepared getFileContent received out-of-scope path: ${relativePath}`,
      );
    }

    if (contentByPathCache.has(relativePath)) {
      return contentByPathCache.get(relativePath);
    }

    const rawContent = fs.readFileSync(path.resolve(repositoryRoot, relativePath), 'utf8');
    contentByPathCache.set(relativePath, rawContent);
    return rawContent;
  };

  return {
    scope: selectedScope,
    selectedPaths,
    topLevelDirectoryNames: collectTopLevelDirectoryNames(repositoryRoot),
    targets: resolvedTargets.map((target) => target.relPath),
    getFileContent,
  };
};

export const runTreeStructureAdvisor = (repositoryRoot, { scope, targets } = {}) => {
  const preparedInputs = prepareTreeStructureAdvisorInputs(repositoryRoot, { scope, targets });
  return runTreeStructureAdvisorRuntime(preparedInputs);
};

export { summarizeFindings };
