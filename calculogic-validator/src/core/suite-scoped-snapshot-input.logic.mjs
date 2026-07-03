import fs from 'node:fs';
import path from 'node:path';
import { resolveContextualValidatorScopeProfile, DEFAULT_VALIDATOR_SCOPE } from './validator-scopes.logic.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from './scoped-target-paths.logic.mjs';

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const collectPathsFromScopeRoot = (
  repositoryRoot,
  scopeRoot,
  {
    walkExcludedDirectories = new Set(),
    skipDotDirectories = true,
    skipSymlinkedCandidateScopeRoots = false,
    packageRoot,
  } = {},
) => {
  const absoluteRoot = path.resolve(repositoryRoot, scopeRoot);
  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }

  const isRepositoryRootScope = path.normalize(scopeRoot) === '.';
  if (
    skipSymlinkedCandidateScopeRoots &&
    !isRepositoryRootScope &&
    fs.lstatSync(absoluteRoot).isSymbolicLink()
  ) {
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
    skipSymlinkedCandidateScopeRoots = false,
    packageRoot,
  } = {},
) => {
  const selectedScope = scope ?? DEFAULT_VALIDATOR_SCOPE;
  const scopeResolution = resolveContextualValidatorScopeProfile(selectedScope, {
    targetRepositoryRoot: repositoryRoot,
    packageRoot,
  });

  if (scopeResolution.status === 'invalid-scope') {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  if (scopeResolution.status === 'unavailable-scope') {
    throw new Error(scopeResolution.message);
  }

  const profile = scopeResolution.profile;

  const scopedPaths = profile.includeRoots.flatMap((scopeRoot) =>
    collectPathsFromScopeRoot(repositoryRoot, scopeRoot, {
      walkExcludedDirectories,
      skipDotDirectories,
      skipSymlinkedCandidateScopeRoots,
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
    skipSymlinkedCandidateScopeRoots = false,
    packageRoot,
  } = {},
) => {
  const scopedCollection = collectSuiteScopedPaths(repositoryRoot, {
    scope,
    walkExcludedDirectories,
    skipDotDirectories,
    skipSymlinkedCandidateScopeRoots,
    packageRoot,
  });
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets);

  return {
    ...scopedCollection,
    selectedPaths: filterScopedPathsByTargets(
      repositoryRoot,
      scopedCollection.inScopePaths,
      resolvedTargets,
    ),
    targetDescriptors: resolvedTargets.map((target) => ({
      kind: target.kind,
      relPath: target.relPath,
    })),
    targets: resolvedTargets.map((target) => target.relPath),
  };
};
