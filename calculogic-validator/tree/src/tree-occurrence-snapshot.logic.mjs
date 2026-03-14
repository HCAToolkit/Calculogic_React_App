const POSIX_SEPARATOR = '/';

const normalizeRelativePath = (relativePath) =>
  String(relativePath ?? '')
    .replaceAll('\\', POSIX_SEPARATOR)
    .replace(/^\.\//u, '')
    .replace(/\/$/u, '');

const sortStrings = (values) => [...values].sort((left, right) => left.localeCompare(right));

const isPathInsideDirectoryPath = (candidatePath, directoryPath) => {
  if (directoryPath === '' || directoryPath === '.') {
    return true;
  }

  return candidatePath === directoryPath || candidatePath.startsWith(`${directoryPath}${POSIX_SEPARATOR}`);
};

const toAlphabeticMarker = (index) => {
  let marker = '';
  let value = index + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    marker = String.fromCharCode(65 + remainder) + marker;
    value = Math.floor((value - 1) / 26);
  }

  return marker;
};

const normalizeTargetDescriptors = (targetDescriptors = []) => {
  const normalized = [];

  for (const targetDescriptor of targetDescriptors) {
    if (typeof targetDescriptor === 'string') {
      const relPath = normalizeRelativePath(targetDescriptor);
      if (relPath && relPath !== '.') {
        normalized.push({ relPath, kind: null });
      }
      continue;
    }

    const relPath = normalizeRelativePath(targetDescriptor?.relPath ?? '');
    if (relPath && relPath !== '.') {
      normalized.push({ relPath, kind: targetDescriptor?.kind ?? null });
    }
  }

  const deduped = new Map();
  for (const targetDescriptor of normalized) {
    if (!deduped.has(targetDescriptor.relPath)) {
      deduped.set(targetDescriptor.relPath, targetDescriptor);
    }
  }

  return [...deduped.values()].sort((left, right) => left.relPath.localeCompare(right.relPath));
};

const inferTargetKind = (targetDescriptor, selectedPathSet) => {
  if (targetDescriptor.kind === 'file' || targetDescriptor.kind === 'dir') {
    return targetDescriptor.kind;
  }

  const hasNestedMatch = [...selectedPathSet].some((selectedPath) =>
    selectedPath.startsWith(`${targetDescriptor.relPath}${POSIX_SEPARATOR}`),
  );

  if (hasNestedMatch) {
    return 'dir';
  }

  return selectedPathSet.has(targetDescriptor.relPath) ? 'file' : 'dir';
};

const toScopeRootPath = (targetDescriptor, selectedPathSet) => {
  const targetKind = inferTargetKind(targetDescriptor, selectedPathSet);

  if (targetKind === 'dir') {
    return targetDescriptor.relPath;
  }

  if (!targetDescriptor.relPath.includes(POSIX_SEPARATOR)) {
    return '.';
  }

  return targetDescriptor.relPath.slice(0, targetDescriptor.relPath.lastIndexOf(POSIX_SEPARATOR));
};

const buildScopeRoots = ({ selectedPaths, targets, includeRoots }) => {
  if (targets.length > 0) {
    const selectedPathSet = new Set(selectedPaths);
    const targetScopeRoots = sortStrings(
      new Set(targets.map((targetDescriptor) => toScopeRootPath(targetDescriptor, selectedPathSet))),
    );
    return targetScopeRoots.map((relPath) => ({ relPath, kind: 'dir' }));
  }

  if (includeRoots.length > 0) {
    return includeRoots.map((includeRoot) => ({ relPath: includeRoot, kind: 'dir' }));
  }

  const topLevelRoots = new Set(
    selectedPaths.map((relativePath) => relativePath.split(POSIX_SEPARATOR)[0]).filter(Boolean),
  );

  return sortStrings(topLevelRoots).map((relPath) => ({ relPath, kind: 'dir' }));
};

const resolveScopeRootPathForNode = (resolvedPath, scopeRoots) => {
  if (scopeRoots.length === 0) {
    return '.';
  }

  const matchedRoots = scopeRoots
    .filter((scopeRoot) => isPathInsideDirectoryPath(resolvedPath, scopeRoot.relPath))
    .sort((left, right) => right.relPath.length - left.relPath.length || left.relPath.localeCompare(right.relPath));

  if (matchedRoots.length > 0) {
    return matchedRoots[0].relPath;
  }

  return scopeRoots[0].relPath;
};

const collectAllOccurrencePaths = (selectedPaths, scopeRoots) => {
  const directoryPaths = new Set(scopeRoots.map((scopeRoot) => scopeRoot.relPath).filter((scopeRoot) => scopeRoot !== '.'));
  const filePaths = new Set();

  for (const selectedPath of selectedPaths) {
    filePaths.add(selectedPath);

    const segments = selectedPath.split(POSIX_SEPARATOR);
    for (let index = 0; index < segments.length - 1; index += 1) {
      directoryPaths.add(segments.slice(0, index + 1).join(POSIX_SEPARATOR));
    }
  }

  return {
    directoryPaths,
    filePaths,
  };
};

const buildLineageSegments = (resolvedPath, scopeRootPath) => {
  if (scopeRootPath === '.') {
    return resolvedPath.split(POSIX_SEPARATOR).filter(Boolean);
  }

  const lineageTail =
    scopeRootPath === resolvedPath
      ? []
      : resolvedPath
          .slice(scopeRootPath.length + 1)
          .split(POSIX_SEPARATOR)
          .filter(Boolean);

  return [scopeRootPath, ...lineageTail].filter(Boolean);
};

export const prepareTreeOccurrenceSnapshot = ({
  selectedPaths = [],
  targets = [],
  includeRoots = [],
} = {}) => {
  const normalizedSelectedPaths = sortStrings(
    selectedPaths.map((selectedPath) => normalizeRelativePath(selectedPath)).filter(Boolean),
  );
  const normalizedTargetDescriptors = normalizeTargetDescriptors(targets);
  const normalizedIncludeRoots = sortStrings(
    includeRoots.map((includeRoot) => normalizeRelativePath(includeRoot)).filter(Boolean),
  );
  const scopeRoots = buildScopeRoots({
    selectedPaths: normalizedSelectedPaths,
    targets: normalizedTargetDescriptors,
    includeRoots: normalizedIncludeRoots,
  });

  const { directoryPaths, filePaths } = collectAllOccurrencePaths(normalizedSelectedPaths, scopeRoots);
  const allPaths = sortStrings(new Set([...directoryPaths, ...filePaths]));

  const recordsByPath = new Map();

  for (const resolvedPath of allPaths) {
    const occurrenceType = filePaths.has(resolvedPath) ? 'file' : 'folder';
    const actualName = resolvedPath.includes(POSIX_SEPARATOR)
      ? resolvedPath.slice(resolvedPath.lastIndexOf(POSIX_SEPARATOR) + 1)
      : resolvedPath;
    const scopeRootPath = resolveScopeRootPathForNode(resolvedPath, scopeRoots);
    const lineageSegments = buildLineageSegments(resolvedPath, scopeRootPath);

    let parentResolvedPath = null;
    if (resolvedPath !== scopeRootPath && resolvedPath.includes(POSIX_SEPARATOR)) {
      const candidateParent = resolvedPath.slice(0, resolvedPath.lastIndexOf(POSIX_SEPARATOR));
      if (candidateParent && isPathInsideDirectoryPath(candidateParent, scopeRootPath)) {
        parentResolvedPath = candidateParent;
      }
    }

    recordsByPath.set(resolvedPath, {
      resolvedPath,
      actualName,
      occurrenceType,
      parentResolvedPath,
      depth: lineageSegments.length - 1,
      scopeRootPath,
      lineageSegments,
      markerSegments: [],
      occurrenceMarker: '',
      isScopedRoot: resolvedPath === scopeRootPath,
      isScopeTopOccurrence: lineageSegments.length === 1,
    });
  }

  const childrenByParent = new Map();

  for (const record of recordsByPath.values()) {
    const parentKey = record.parentResolvedPath ?? '__ROOT__';
    const parentChildren = childrenByParent.get(parentKey) ?? [];
    parentChildren.push(record);
    childrenByParent.set(parentKey, parentChildren);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort(
      (left, right) =>
        left.actualName.localeCompare(right.actualName) ||
        left.occurrenceType.localeCompare(right.occurrenceType) ||
        left.resolvedPath.localeCompare(right.resolvedPath),
    );

    let folderCounter = 0;
    let fileCounter = 0;

    for (const record of siblings) {
      const marker =
        record.occurrenceType === 'folder'
          ? toAlphabeticMarker(folderCounter++)
          : String(fileCounter++ + 1);
      const parentSegments =
        record.parentResolvedPath && recordsByPath.has(record.parentResolvedPath)
          ? recordsByPath.get(record.parentResolvedPath).markerSegments
          : [];

      record.markerSegments = [...parentSegments, marker];
      record.occurrenceMarker = record.markerSegments.join('.');
    }
  }

  return {
    scopeRoots: scopeRoots.map((scopeRoot) => scopeRoot.relPath),
    occurrenceRecords: allPaths.map((resolvedPath) => recordsByPath.get(resolvedPath)),
  };
};
