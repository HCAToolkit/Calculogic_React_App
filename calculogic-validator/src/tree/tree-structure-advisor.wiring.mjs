import fs from 'node:fs';
import path from 'node:path';
import {
  runTreeStructureAdvisor as runTreeStructureAdvisorRuntime,
  summarizeFindings,
} from './tree-structure-advisor.logic.mjs';
import { getValidatorScopeProfile } from '../core/validator-scopes.runtime.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from '../core/scoped-target-paths.logic.mjs';

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

const getScopeRoots = (scope) => {
  const selectedScope = scope ?? 'repo';
  const profile = getValidatorScopeProfile(selectedScope);

  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  if (selectedScope === 'repo') {
    return ['.'];
  }

  return profile.includeRoots;
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
  const scopeRoots = getScopeRoots(selectedScope);
  const scopedPaths = scopeRoots.flatMap((scopeRoot) =>
    collectPathsFromScopeRoot(repositoryRoot, scopeRoot),
  );
  const inScopePaths = sortPaths(new Set(scopedPaths));
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets ?? []);
  const selectedPaths = filterScopedPathsByTargets(repositoryRoot, inScopePaths, resolvedTargets);

  return {
    scope: selectedScope,
    selectedPaths,
    topLevelDirectoryNames: collectTopLevelDirectoryNames(repositoryRoot),
    targets: resolvedTargets.map((target) => target.relPath),
  };
};

export const runTreeStructureAdvisor = (repositoryRoot, { scope, targets } = {}) => {
  const preparedInputs = prepareTreeStructureAdvisorInputs(repositoryRoot, { scope, targets });
  return runTreeStructureAdvisorRuntime(preparedInputs);
};

export { summarizeFindings };
