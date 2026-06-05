import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_TREE_REPO_SHAPE_POLICY_REGISTRY_PATH = fileURLToPath(
  new URL('repo-shape-policy.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinTreeRepoShapePolicy = null;

const normalizeAllowedTopLevelDirectories = (allowedTopLevelDirectories) => {
  if (!Array.isArray(allowedTopLevelDirectories)) {
    throw new Error(
      'Invalid builtin tree repo-shape policy registry: allowedTopLevelDirectories must be an array.',
    );
  }

  allowedTopLevelDirectories.forEach((directoryName, index) => {
    if (typeof directoryName !== 'string' || directoryName.length === 0) {
      throw new Error(
        `Invalid builtin tree repo-shape policy registry: allowedTopLevelDirectories[${index}] must be a non-empty string.`,
      );
    }
  });

  return [...new Set(allowedTopLevelDirectories)].sort((left, right) => left.localeCompare(right));
};

export const normalizeTreeRepoShapePolicyRegistryPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin tree repo-shape policy registry: expected object payload.');
  }

  return {
    version: payload.version,
    allowedTopLevelDirectories: normalizeAllowedTopLevelDirectories(payload.allowedTopLevelDirectories),
  };
};

const loadBuiltinTreeRepoShapePolicy = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_TREE_REPO_SHAPE_POLICY_REGISTRY_PATH, 'utf8'));

  return normalizeTreeRepoShapePolicyRegistryPayload(payload);
};

export const getBuiltinTreeRepoShapePolicy = () => {
  if (cachedBuiltinTreeRepoShapePolicy === null) {
    cachedBuiltinTreeRepoShapePolicy = loadBuiltinTreeRepoShapePolicy();
  }

  return cachedBuiltinTreeRepoShapePolicy;
};
