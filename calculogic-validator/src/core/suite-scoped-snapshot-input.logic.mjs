import fs from 'node:fs';
import path from 'node:path';
import { getValidatorScopeProfile, DEFAULT_VALIDATOR_SCOPE } from './validator-scopes.runtime.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from './scoped-target-paths.logic.mjs';

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const collectPathsFromScopeRoot = (
  repositoryRoot,
  scopeRoot,
  { walkExcludedDirectories = new Set(), skipDotDirectories = true } = {},
) => {
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
        if (walkExcludedDirectories.has(entry.name)) {
          continue;
        }

        if (skipDotDirectories && entry.name.startsWith('.')) {
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

export const collectSuiteScopedPaths = (
  repositoryRoot,
  {
    scope,
    walkExcludedDirectories = new Set(),
    skipDotDirectories = true,
  } = {},
) => {
  const selectedScope = scope ?? DEFAULT_VALIDATOR_SCOPE;
  const profile = getValidatorScopeProfile(selectedScope);

  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  const scopedPaths = profile.includeRoots.flatMap((scopeRoot) =>
    collectPathsFromScopeRoot(repositoryRoot, scopeRoot, {
      walkExcludedDirectories,
      skipDotDirectories,
    }),
  );
  const rootFilePaths = collectPathsFromRootFiles(repositoryRoot, profile.includeRootFiles);

  return {
    scope: selectedScope,
    includeRoots: [...profile.includeRoots],
    includeRootFiles: [...profile.includeRootFiles],
    inScopePaths: sortPaths(new Set([...scopedPaths, ...rootFilePaths])),
  };
};

export const collectSuiteScopedSnapshotInputs = (
  repositoryRoot,
  {
    scope,
    targets = [],
    walkExcludedDirectories = new Set(),
    skipDotDirectories = true,
  } = {},
) => {
  const scopedCollection = collectSuiteScopedPaths(repositoryRoot, {
    scope,
    walkExcludedDirectories,
    skipDotDirectories,
  });
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets);

  return {
    ...scopedCollection,
    selectedPaths: filterScopedPathsByTargets(
      repositoryRoot,
      scopedCollection.inScopePaths,
      resolvedTargets,
    ),
    targets: resolvedTargets.map((target) => target.relPath),
  };
};
