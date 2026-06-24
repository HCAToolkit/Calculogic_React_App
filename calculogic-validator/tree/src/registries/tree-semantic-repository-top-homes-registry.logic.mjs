import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_SEMANTIC_REPOSITORY_TOP_HOMES_REGISTRY_PATH = fileURLToPath(
  new URL('semantic-repository-top-homes.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinSemanticRepositoryTopHomesRegistry = null;

const normalizeSemanticRepositoryTopHomesRegistryPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin semantic-repository-top-homes registry: expected object payload.');
  }

  if (!Array.isArray(payload.semanticRepositoryTopHomes)) {
    throw new Error(
      'Invalid builtin semantic-repository-top-homes registry: semanticRepositoryTopHomes must be an array.',
    );
  }

  return payload;
};

const loadBuiltinSemanticRepositoryTopHomesRegistry = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_SEMANTIC_REPOSITORY_TOP_HOMES_REGISTRY_PATH, 'utf8'));
  return normalizeSemanticRepositoryTopHomesRegistryPayload(payload);
};

export const getBuiltinSemanticRepositoryTopHomesRegistry = () => {
  if (cachedBuiltinSemanticRepositoryTopHomesRegistry === null) {
    cachedBuiltinSemanticRepositoryTopHomesRegistry = loadBuiltinSemanticRepositoryTopHomesRegistry();
  }

  return cachedBuiltinSemanticRepositoryTopHomesRegistry;
};
