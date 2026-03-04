import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROLE_REGISTRY } from './naming-roles.knowledge.mjs';
import { REPORTABLE_EXTENSIONS } from './naming-extensions.knowledge.mjs';
import { stableStringify, sha256Hex } from '../../validator-report-meta.logic.mjs';

const DEFAULT_REGISTRY_STATE = 'builtin';
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_ROLE_STATUSES = new Set(['active', 'deprecated']);
const ALLOWED_ROLE_CATEGORIES = new Set([
  'concern-core',
  'architecture-support',
  'documentation',
  'deprecated',
]);

const canonicalizeRole = roleEntry => {
  if (!roleEntry || typeof roleEntry !== 'object' || Array.isArray(roleEntry)) {
    throw new Error('Invalid custom roles registry: each entry must be an object.');
  }

  const role = typeof roleEntry.role === 'string' ? roleEntry.role.trim() : '';
  const category = typeof roleEntry.category === 'string' ? roleEntry.category.trim() : '';
  const status = typeof roleEntry.status === 'string' ? roleEntry.status.trim() : '';

  if (!role || !category || !status) {
    throw new Error('Invalid custom roles registry: role, category, and status must be non-empty strings.');
  }

  if (!ALLOWED_ROLE_CATEGORIES.has(category)) {
    throw new Error(
      'Invalid custom roles registry: category must be one of concern-core, architecture-support, documentation, deprecated.',
    );
  }

  if (!ALLOWED_ROLE_STATUSES.has(status)) {
    throw new Error('Invalid custom roles registry: status must be "active" or "deprecated".');
  }

  const canonicalRole = { role, category, status };

  if (roleEntry.notes !== undefined) {
    if (typeof roleEntry.notes !== 'string') {
      throw new Error('Invalid custom roles registry: notes must be a string when provided.');
    }

    const notes = roleEntry.notes.trim();
    if (notes) {
      canonicalRole.notes = notes;
    }
  }

  return canonicalRole;
};

const canonicalizeRoles = roles => {
  const dedupedByRole = new Map();

  for (const roleEntry of roles) {
    const canonicalRole = canonicalizeRole(roleEntry);
    if (!dedupedByRole.has(canonicalRole.role)) {
      dedupedByRole.set(canonicalRole.role, canonicalRole);
    }
  }

  return [...dedupedByRole.values()].sort((a, b) => a.role.localeCompare(b.role));
};

const canonicalizeExtensions = extensions => {
  if (!Array.isArray(extensions)) {
    throw new Error('Invalid custom reportable extensions registry: expected an array of strings.');
  }

  const deduped = new Set();

  for (const extensionValue of extensions) {
    if (typeof extensionValue !== 'string') {
      throw new Error('Invalid custom reportable extensions registry: each extension must be a non-empty string.');
    }

    const extension = extensionValue.trim();
    if (!extension) {
      throw new Error('Invalid custom reportable extensions registry: each extension must be a non-empty string.');
    }

    if (!extension.startsWith('.')) {
      throw new Error('Invalid custom reportable extensions registry: each extension must start with ".".');
    }

    deduped.add(extension);
  }

  return [...deduped].sort((a, b) => a.localeCompare(b));
};

const digestPayload = payload => sha256Hex(stableStringify(payload));

const loadJsonFile = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const loadRegistryState = registryRootDir => {
  const statePath = path.join(registryRootDir, 'registry-state.json');
  if (!fs.existsSync(statePath)) {
    return DEFAULT_REGISTRY_STATE;
  }

  const parsed = loadJsonFile(statePath);
  const activeRegistry = parsed?.activeRegistry;

  if (activeRegistry !== 'builtin' && activeRegistry !== 'custom') {
    throw new Error('Invalid activeRegistry in registry-state.json: expected "builtin" or "custom".');
  }

  return activeRegistry;
};

const loadCustomPayload = registryRootDir => {
  const customRolesPath = path.join(registryRootDir, '_custom', 'roles.registry.custom.json');
  const customExtensionsPath = path.join(
    registryRootDir,
    '_custom',
    'reportable-extensions.registry.custom.json',
  );

  if (!fs.existsSync(customRolesPath)) {
    throw new Error('Custom registry file missing: _custom/roles.registry.custom.json.');
  }

  if (!fs.existsSync(customExtensionsPath)) {
    throw new Error('Custom registry file missing: _custom/reportable-extensions.registry.custom.json.');
  }

  const rolesRaw = loadJsonFile(customRolesPath);
  if (!Array.isArray(rolesRaw)) {
    throw new Error('Invalid custom roles registry: expected an array.');
  }

  const extensionsRaw = loadJsonFile(customExtensionsPath);

  return {
    roles: canonicalizeRoles(rolesRaw),
    reportableExtensions: canonicalizeExtensions(extensionsRaw),
  };
};

const buildBuiltinPayload = () => ({
  roles: canonicalizeRoles(ROLE_REGISTRY),
  reportableExtensions: canonicalizeExtensions([...REPORTABLE_EXTENSIONS]),
});

const applyConfigOverlay = (builtinPayload, config) => {
  const extensionAdds = config?.naming?.reportableExtensions?.add ?? [];
  const roleAdds = config?.naming?.roles?.add ?? [];

  const mergedExtensions = canonicalizeExtensions([
    ...builtinPayload.reportableExtensions,
    ...extensionAdds,
  ]);

  const existingRoles = new Set(builtinPayload.roles.map(entry => entry.role));
  const rolesToAppend = [];

  for (const roleEntry of roleAdds) {
    const canonicalRole = canonicalizeRole(roleEntry);
    if (!existingRoles.has(canonicalRole.role)) {
      existingRoles.add(canonicalRole.role);
      rolesToAppend.push(canonicalRole);
    }
  }

  return {
    roles: canonicalizeRoles([...builtinPayload.roles, ...rolesToAppend]),
    reportableExtensions: mergedExtensions,
  };
};

export const resolveNamingRegistryInputs = ({ config, registryRootDir } = {}) => {
  const resolvedRegistryRootDir = registryRootDir ?? MODULE_DIR;
  const registryState = loadRegistryState(resolvedRegistryRootDir);

  const builtinPayload = buildBuiltinPayload();
  const builtinDigest = digestPayload(builtinPayload);

  const customRolesPath = path.join(resolvedRegistryRootDir, '_custom', 'roles.registry.custom.json');
  const customExtensionsPath = path.join(
    resolvedRegistryRootDir,
    '_custom',
    'reportable-extensions.registry.custom.json',
  );

  const hasCustomFiles = fs.existsSync(customRolesPath) && fs.existsSync(customExtensionsPath);

  const customPayload = hasCustomFiles ? loadCustomPayload(resolvedRegistryRootDir) : builtinPayload;
  const customDigest = digestPayload(customPayload);

  if (registryState === 'custom' && !hasCustomFiles) {
    if (!fs.existsSync(customRolesPath)) {
      throw new Error('Custom registry file missing: _custom/roles.registry.custom.json.');
    }

    throw new Error('Custom registry file missing: _custom/reportable-extensions.registry.custom.json.');
  }

  const hasConfigOverlay = config !== undefined;
  const registrySource = hasConfigOverlay ? 'config' : registryState;

  const resolvedPayload = hasConfigOverlay
    ? applyConfigOverlay(builtinPayload, config)
    : registryState === 'custom'
      ? customPayload
      : builtinPayload;

  const resolvedDigest = digestPayload(resolvedPayload);

  return {
    registryState,
    registrySource,
    registryDigests: {
      builtin: builtinDigest,
      custom: customDigest,
      resolved: resolvedDigest,
    },
    roles: resolvedPayload.roles,
    reportableExtensions: resolvedPayload.reportableExtensions,
  };
};
