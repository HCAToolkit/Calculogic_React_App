import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_STRUCTURAL_ROLE_TOKENS_REGISTRY_PATH = fileURLToPath(
  new URL('structural-role-tokens.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinStructuralRoleTokensRegistry = null;

const assertValidRegistry = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin Tree structural-role tokens registry: expected object payload.');
  }
  if (!Array.isArray(payload.structuralRoleTokens)) {
    throw new Error('Invalid builtin Tree structural-role tokens registry: structuralRoleTokens must be an array.');
  }
  return payload;
};

export const getBuiltinStructuralRoleTokensRegistry = () => {
  if (!cachedBuiltinStructuralRoleTokensRegistry) {
    cachedBuiltinStructuralRoleTokensRegistry = assertValidRegistry(
      JSON.parse(fs.readFileSync(BUILTIN_STRUCTURAL_ROLE_TOKENS_REGISTRY_PATH, 'utf8')),
    );
  }
  return cachedBuiltinStructuralRoleTokensRegistry;
};
