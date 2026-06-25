import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_NAMING_FOLDER_COMPOSITION_PATTERNS_REGISTRY_PATH = fileURLToPath(
  new URL('folder-composition-patterns.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinFolderCompositionPatternsRegistry = null;

const assertValidRegistry = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin Naming folder-composition patterns registry: expected object payload.');
  }
  if (!Array.isArray(payload.folderCompositionPatterns)) {
    throw new Error('Invalid builtin Naming folder-composition patterns registry: folderCompositionPatterns must be an array.');
  }
  return payload;
};

export const getBuiltinNamingFolderCompositionPatternsRegistry = () => {
  if (!cachedBuiltinFolderCompositionPatternsRegistry) {
    cachedBuiltinFolderCompositionPatternsRegistry = assertValidRegistry(
      JSON.parse(fs.readFileSync(BUILTIN_NAMING_FOLDER_COMPOSITION_PATTERNS_REGISTRY_PATH, 'utf8')),
    );
  }
  return cachedBuiltinFolderCompositionPatternsRegistry;
};
