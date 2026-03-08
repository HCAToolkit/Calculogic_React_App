import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_TREE_KNOWN_ROOTS_REGISTRY_PATH = fileURLToPath(
  new URL('tree-known-roots.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinTreeKnownRoots = null;

const loadBuiltinTreeKnownRoots = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_TREE_KNOWN_ROOTS_REGISTRY_PATH, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin tree-known-roots registry: expected object payload.');
  }

  if (!Array.isArray(payload.knownTopLevelDirectories)) {
    throw new Error(
      'Invalid builtin tree-known-roots registry: missing knownTopLevelDirectories array.',
    );
  }

  payload.knownTopLevelDirectories.forEach((directoryName, index) => {
    if (typeof directoryName !== 'string' || directoryName.length === 0) {
      throw new Error(
        `Invalid builtin tree-known-roots registry: knownTopLevelDirectories[${index}] must be a non-empty string.`,
      );
    }
  });

  return {
    knownTopLevelDirectories: new Set(payload.knownTopLevelDirectories),
  };
};

export const getBuiltinTreeKnownRoots = () => {
  if (cachedBuiltinTreeKnownRoots === null) {
    cachedBuiltinTreeKnownRoots = loadBuiltinTreeKnownRoots();
  }

  return cachedBuiltinTreeKnownRoots;
};
