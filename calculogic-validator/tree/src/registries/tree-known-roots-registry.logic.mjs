import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_TREE_KNOWN_ROOTS_REGISTRY_PATH = fileURLToPath(
  new URL('tree-known-roots.registry.json', BUILTIN_REGISTRY_ROOT),
);

const TOP_ROOT_KIND_VALUES = new Set(['structural', 'semantic']);
const TOP_ROOT_OWNERSHIP_SOURCE_VALUES = new Set(['builtin', 'custom']);

let cachedBuiltinTreeKnownRoots = null;

const compareTopRoots = (left, right) => {
  const rootDiff = left.root.localeCompare(right.root);
  if (rootDiff !== 0) {
    return rootDiff;
  }

  const kindDiff = left.kind.localeCompare(right.kind);
  if (kindDiff !== 0) {
    return kindDiff;
  }

  const ownershipDiff = left.ownershipSource.localeCompare(right.ownershipSource);
  if (ownershipDiff !== 0) {
    return ownershipDiff;
  }

  return (left.styleClass ?? '').localeCompare(right.styleClass ?? '');
};

const validateLegacyKnownTopLevelDirectories = (knownTopLevelDirectories) => {
  if (!Array.isArray(knownTopLevelDirectories)) {
    throw new Error(
      'Invalid builtin tree-known-roots registry: knownTopLevelDirectories must be an array when provided.',
    );
  }

  knownTopLevelDirectories.forEach((directoryName, index) => {
    if (typeof directoryName !== 'string' || directoryName.length === 0) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: knownTopLevelDirectories[${index}] must be a non-empty string.`,
      );
    }
  });

  return [...new Set(knownTopLevelDirectories)].sort((left, right) => left.localeCompare(right));
};

const normalizeStructuredTopRoots = (topRoots) => {
  if (!Array.isArray(topRoots)) {
    throw new Error('Invalid builtin tree-known-roots registry: topRoots must be an array when provided.');
  }

  const normalized = topRoots.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`Invalid builtin tree-known-roots registry: topRoots[${index}] must be an object.`);
    }

    if (typeof entry.root !== 'string' || entry.root.length === 0) {
      throw new Error(`Invalid builtin tree-known-roots registry: topRoots[${index}].root must be a non-empty string.`);
    }

    if (!TOP_ROOT_KIND_VALUES.has(entry.kind)) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: topRoots[${index}].kind must be one of structural|semantic.`,
      );
    }

    if (!TOP_ROOT_OWNERSHIP_SOURCE_VALUES.has(entry.ownershipSource)) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: topRoots[${index}].ownershipSource must be one of builtin|custom.`,
      );
    }

    if (
      typeof entry.styleClass !== 'undefined'
      && (typeof entry.styleClass !== 'string' || entry.styleClass.length === 0)
    ) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: topRoots[${index}].styleClass must be a non-empty string when provided.`,
      );
    }

    return {
      root: entry.root,
      kind: entry.kind,
      ownershipSource: entry.ownershipSource,
      ...(typeof entry.styleClass === 'string' ? { styleClass: entry.styleClass } : {}),
    };
  });

  const sorted = [...normalized].sort(compareTopRoots);
  const deduped = [];

  for (const candidate of sorted) {
    const previous = deduped.at(-1);

    if (!previous || previous.root !== candidate.root) {
      deduped.push(candidate);
      continue;
    }

    const hasMetadataMismatch =
      previous.kind !== candidate.kind
      || previous.ownershipSource !== candidate.ownershipSource
      || (previous.styleClass ?? '') !== (candidate.styleClass ?? '');

    if (hasMetadataMismatch) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: duplicate topRoots entry for root "${candidate.root}" has conflicting metadata.`,
      );
    }
  }

  return deduped;
};

export const normalizeTreeKnownRootsRegistryPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin tree-known-roots registry: expected object payload.');
  }

  const hasStructuredTopRoots = typeof payload.topRoots !== 'undefined';
  const hasLegacyKnownTopLevelDirectories = typeof payload.knownTopLevelDirectories !== 'undefined';

  if (!hasStructuredTopRoots && !hasLegacyKnownTopLevelDirectories) {
    throw new Error(
      'Invalid builtin tree-known-roots registry: expected topRoots array or knownTopLevelDirectories array.',
    );
  }

  const normalizedLegacyKnownTopLevelDirectories = hasLegacyKnownTopLevelDirectories
    ? validateLegacyKnownTopLevelDirectories(payload.knownTopLevelDirectories)
    : [];

  const normalizedStructuredTopRoots = hasStructuredTopRoots
    ? normalizeStructuredTopRoots(payload.topRoots)
    : [];

  if (hasStructuredTopRoots && normalizedStructuredTopRoots.length === 0) {
    throw new Error('Invalid builtin tree-known-roots registry: topRoots must contain at least one entry.');
  }

  if (!hasStructuredTopRoots && normalizedLegacyKnownTopLevelDirectories.length === 0) {
    throw new Error(
      'Invalid builtin tree-known-roots registry: knownTopLevelDirectories must contain at least one entry.',
    );
  }

  const canonicalTopRoots = hasStructuredTopRoots
    ? normalizedStructuredTopRoots
    : normalizedLegacyKnownTopLevelDirectories.map((root) => ({
      root,
      kind: 'structural',
      ownershipSource: 'builtin',
    }));

  return {
    topRoots: canonicalTopRoots,
    knownTopLevelDirectories: new Set(canonicalTopRoots.map((entry) => entry.root)),
  };
};

const loadBuiltinTreeKnownRoots = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_TREE_KNOWN_ROOTS_REGISTRY_PATH, 'utf8'));

  return normalizeTreeKnownRootsRegistryPayload(payload);
};

export const getBuiltinTreeKnownRoots = () => {
  if (cachedBuiltinTreeKnownRoots === null) {
    cachedBuiltinTreeKnownRoots = loadBuiltinTreeKnownRoots();
  }

  return cachedBuiltinTreeKnownRoots;
};
