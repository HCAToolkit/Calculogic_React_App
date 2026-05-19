import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_STRUCTURAL_HOMES_REGISTRY_PATH = fileURLToPath(
  new URL('structural-homes.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinStructuralHomesRegistry = null;

const normalizeStructuralHomesRegistryPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin structural-homes registry: expected object payload.');
  }

  if (!Array.isArray(payload.structuralHomes)) {
    throw new Error('Invalid builtin structural-homes registry: structuralHomes must be an array.');
  }

  return payload;
};

const loadBuiltinStructuralHomesRegistry = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_STRUCTURAL_HOMES_REGISTRY_PATH, 'utf8'));
  return normalizeStructuralHomesRegistryPayload(payload);
};

export const getBuiltinStructuralHomesRegistry = () => {
  if (cachedBuiltinStructuralHomesRegistry === null) {
    cachedBuiltinStructuralHomesRegistry = loadBuiltinStructuralHomesRegistry();
  }

  return cachedBuiltinStructuralHomesRegistry;
};
