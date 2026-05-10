import { prepareTreeOccurrenceSnapshot } from './tree-occurrence-snapshot.logic.mjs';

const POSIX_SEPARATOR = '/';

const normalizeRelativePath = (relativePath) =>
  String(relativePath ?? '')
    .replaceAll('\\', POSIX_SEPARATOR)
    .replace(/^\.\//u, '')
    .replace(/\/$/u, '');

const normalizeScopeRootPath = (scopeRoots = []) => scopeRoots[0] ?? '.';

const normalizeTargetDescriptor = (targetDescriptor) => {
  if (typeof targetDescriptor === 'string') {
    return {
      kind: null,
      relPath: normalizeRelativePath(targetDescriptor),
    };
  }

  return {
    kind: targetDescriptor?.kind ?? null,
    relPath: normalizeRelativePath(targetDescriptor?.relPath ?? ''),
  };
};

const inferTargetKind = (targets = [], selectedPaths = []) => {
  if (targets.length !== 1) {
    return 'mixed';
  }

  const targetDescriptor = normalizeTargetDescriptor(targets[0]);
  if (targetDescriptor.kind === 'dir' || targetDescriptor.kind === 'file') {
    return targetDescriptor.kind;
  }

  if (!targetDescriptor.relPath || targetDescriptor.relPath === '.') {
    return 'mixed';
  }

  const selectedPathSet = new Set(
    selectedPaths.map((selectedPath) => normalizeRelativePath(selectedPath)).filter(Boolean),
  );
  const hasNestedMatch = [...selectedPathSet].some((selectedPath) =>
    selectedPath.startsWith(`${targetDescriptor.relPath}${POSIX_SEPARATOR}`),
  );

  if (hasNestedMatch) {
    return 'dir';
  }

  return selectedPathSet.has(targetDescriptor.relPath) ? 'file' : 'dir';
};

export const prepareTreeStructuralAddressSnapshot = ({
  occurrenceSnapshot = null,
  selectedPaths = [],
  targets = [],
  includeRoots = [],
  scope = null,
  source = 'tree-occurrence-snapshot',
} = {}) => {
  const resolvedOccurrenceSnapshot =
    occurrenceSnapshot && Array.isArray(occurrenceSnapshot.scopeRoots) && Array.isArray(occurrenceSnapshot.occurrenceRecords)
      ? occurrenceSnapshot
      : prepareTreeOccurrenceSnapshot({
          selectedPaths,
          targets,
          includeRoots,
        });

  return {
    scope: {
      scopeRootPath: scope?.scopeRootPath ?? normalizeScopeRootPath(resolvedOccurrenceSnapshot.scopeRoots),
      targetKind: scope?.targetKind ?? inferTargetKind(targets, selectedPaths),
      source: scope?.source ?? source,
    },
    scopeRoots: resolvedOccurrenceSnapshot.scopeRoots,
    occurrenceRecords: resolvedOccurrenceSnapshot.occurrenceRecords,
  };
};
