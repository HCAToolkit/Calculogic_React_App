import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_WALK_EXCLUSIONS_REGISTRY_PATH = fileURLToPath(
  new URL('walk-exclusions.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinWalkExclusions = null;

const loadBuiltinWalkExclusions = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_WALK_EXCLUSIONS_REGISTRY_PATH, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin walk-exclusions registry: expected object payload.');
  }

  if (!Array.isArray(payload.excludedDirectories)) {
    throw new Error('Invalid builtin walk-exclusions registry: missing excludedDirectories array.');
  }

  if (typeof payload.skipDotDirectories !== 'boolean') {
    throw new Error('Invalid builtin walk-exclusions registry: missing boolean skipDotDirectories.');
  }

  if (!Array.isArray(payload.allowDotFiles)) {
    throw new Error('Invalid builtin walk-exclusions registry: missing allowDotFiles array.');
  }

  const ensureNonEmptyStringArray = (values, fieldName) => {
    values.forEach((value, index) => {
      if (typeof value !== 'string' || value.length === 0) {
        throw new Error(
          `Invalid builtin walk-exclusions registry: ${fieldName}[${index}] must be a non-empty string.`,
        );
      }
    });
  };

  ensureNonEmptyStringArray(payload.excludedDirectories, 'excludedDirectories');
  ensureNonEmptyStringArray(payload.allowDotFiles, 'allowDotFiles');

  return {
    excludedDirectories: new Set(payload.excludedDirectories),
    skipDotDirectories: payload.skipDotDirectories,
    allowDotFiles: new Set(payload.allowDotFiles),
  };
};

export const getBuiltinWalkExclusions = () => {
  if (cachedBuiltinWalkExclusions === null) {
    cachedBuiltinWalkExclusions = loadBuiltinWalkExclusions();
  }

  return cachedBuiltinWalkExclusions;
};
