import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_FOLDER_KINDS_REGISTRY_PATH = fileURLToPath(
  new URL('folder-kinds.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinFolderKindsRegistry = null;

const normalizeFolderKindsRegistryPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid builtin folder-kinds registry: expected object payload.');
  }

  if (!Array.isArray(payload.folderKinds)) {
    throw new Error('Invalid builtin folder-kinds registry: folderKinds must be an array.');
  }

  return payload;
};

const loadBuiltinFolderKindsRegistry = () => {
  const payload = JSON.parse(fs.readFileSync(BUILTIN_FOLDER_KINDS_REGISTRY_PATH, 'utf8'));
  return normalizeFolderKindsRegistryPayload(payload);
};

export const getBuiltinFolderKindsRegistry = () => {
  if (cachedBuiltinFolderKindsRegistry === null) {
    cachedBuiltinFolderKindsRegistry = loadBuiltinFolderKindsRegistry();
  }

  return cachedBuiltinFolderKindsRegistry;
};
