import fs from 'node:fs';
import path from 'node:path';

export const normalizePath = (relativePath) => relativePath.split(path.sep).join('/');

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const isPathOutsideRoot = (relativePath) =>
  relativePath.startsWith('..') || path.isAbsolute(relativePath);

export const resolveScopedTargets = (repositoryRoot, targets = []) => {
  if (!targets?.length) {
    return [];
  }

  const rootRealPath = fs.realpathSync(repositoryRoot);
  const resolvedTargets = [];
  const dedupeByAbsolutePath = new Set();

  for (const rawTarget of targets) {
    const trimmedTarget = String(rawTarget ?? '').trim();
    const normalizedInput = trimmedTarget.replaceAll('\\', '/');

    if (!normalizedInput) {
      throw new Error('Target path must be a non-empty string.');
    }

    const absoluteCandidatePath = path.isAbsolute(trimmedTarget)
      ? path.resolve(trimmedTarget)
      : path.resolve(repositoryRoot, normalizedInput);

    if (!fs.existsSync(absoluteCandidatePath)) {
      throw new Error(`Target path does not exist: ${normalizedInput}`);
    }

    const absoluteRealPath = fs.realpathSync(absoluteCandidatePath);
    const relativeToRoot = path.relative(rootRealPath, absoluteRealPath);
    if (isPathOutsideRoot(relativeToRoot)) {
      throw new Error(`Target path escapes repository root: ${normalizedInput}`);
    }

    if (dedupeByAbsolutePath.has(absoluteRealPath)) {
      continue;
    }

    const targetStat = fs.statSync(absoluteRealPath);
    const kind = targetStat.isDirectory() ? 'dir' : targetStat.isFile() ? 'file' : null;
    if (!kind) {
      throw new Error(`Target path must be a file or directory: ${normalizedInput}`);
    }

    dedupeByAbsolutePath.add(absoluteRealPath);
    resolvedTargets.push({
      absPath: absoluteRealPath,
      relPath: relativeToRoot ? normalizePath(relativeToRoot) : '.',
      kind,
    });
  }

  return resolvedTargets.sort((left, right) => left.relPath.localeCompare(right.relPath));
};

export const filterScopedPathsByTargets = (
  repositoryRoot,
  relativePaths,
  resolvedTargets = [],
) => {
  if (!resolvedTargets.length) {
    return sortPaths(new Set(relativePaths));
  }

  const selectedPaths = relativePaths.filter((relativePath) => {
    const absolutePath = path.resolve(repositoryRoot, relativePath);

    return resolvedTargets.some((target) => {
      if (target.kind === 'file') {
        return absolutePath === target.absPath;
      }

      return absolutePath === target.absPath || absolutePath.startsWith(`${target.absPath}${path.sep}`);
    });
  });

  return sortPaths(new Set(selectedPaths));
};
