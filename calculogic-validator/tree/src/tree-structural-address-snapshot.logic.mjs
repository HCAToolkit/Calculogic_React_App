import { prepareTreeOccurrenceSnapshot } from './tree-occurrence-snapshot.logic.mjs';

const normalizeScopeRootPath = (scopeRoots = []) => scopeRoots[0] ?? '.';

const inferTargetKind = (targets = []) => {
  if (targets.length !== 1) {
    return 'mixed';
  }

  const targetKind = targets[0]?.kind;
  if (targetKind === 'dir' || targetKind === 'file') {
    return targetKind;
  }

  return 'mixed';
};

export const prepareTreeStructuralAddressSnapshot = ({
  selectedPaths = [],
  targets = [],
  includeRoots = [],
  scope = null,
  source = 'tree-occurrence-snapshot',
} = {}) => {
  const occurrenceSnapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths,
    targets,
    includeRoots,
  });

  return {
    scope: {
      scopeRootPath: scope?.scopeRootPath ?? normalizeScopeRootPath(occurrenceSnapshot.scopeRoots),
      targetKind: scope?.targetKind ?? inferTargetKind(targets),
      source: scope?.source ?? source,
    },
    scopeRoots: occurrenceSnapshot.scopeRoots,
    occurrenceRecords: occurrenceSnapshot.occurrenceRecords,
  };
};
