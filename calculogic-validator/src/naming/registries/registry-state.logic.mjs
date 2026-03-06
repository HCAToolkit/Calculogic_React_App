import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stableStringify, sha256Hex } from '../../validator-report-meta.logic.mjs';

const DEFAULT_REGISTRY_STATE = 'builtin';
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILTIN_REGISTRY_DIR = path.join(MODULE_DIR, '_builtin');

const ALLOWED_ROLE_STATUSES = new Set(['active', 'deprecated']);
const BUILTIN_CATEGORIES_PATH = path.join(BUILTIN_REGISTRY_DIR, 'categories.registry.json');


const loadBuiltinCategorySet = () => {
  const parsed = loadJsonFile(BUILTIN_CATEGORIES_PATH);
  const categories = parsed?.categories;

  if (!Array.isArray(categories)) {
    throw new Error('Invalid builtin categories registry: expected a categories array.');
  }

  const categorySet = new Set();

  for (const categoryEntry of categories) {
    if (!categoryEntry || typeof categoryEntry !== 'object' || Array.isArray(categoryEntry)) {
      throw new Error(
        'Invalid builtin categories registry: each category entry must be an object.',
      );
    }

    const category =
      typeof categoryEntry.category === 'string' ? categoryEntry.category.trim() : '';
    if (!category) {
      throw new Error(
        'Invalid builtin categories registry: each category entry must include a non-empty category string.',
      );
    }

    categorySet.add(category);
  }

  return categorySet;
};

const ALLOWED_ROLE_CATEGORIES = loadBuiltinCategorySet();

const canonicalizeRole = (roleEntry) => {
  if (!roleEntry || typeof roleEntry !== 'object' || Array.isArray(roleEntry)) {
    throw new Error('Invalid custom roles registry: each entry must be an object.');
  }

  const role = typeof roleEntry.role === 'string' ? roleEntry.role.trim() : '';
  const category = typeof roleEntry.category === 'string' ? roleEntry.category.trim() : '';
  const status = typeof roleEntry.status === 'string' ? roleEntry.status.trim() : '';

  if (!role || !category || !status) {
    throw new Error(
      'Invalid custom roles registry: role, category, and status must be non-empty strings.',
    );
  }

  if (!ALLOWED_ROLE_CATEGORIES.has(category)) {
    const allowedCategoriesLabel = [...ALLOWED_ROLE_CATEGORIES].sort((a, b) => a.localeCompare(b));
    throw new Error(
      `Invalid custom roles registry: category must be one of ${allowedCategoriesLabel.join(', ')}.`,
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

const canonicalizeRoles = (roles) => {
  const dedupedByRole = new Map();

  for (const roleEntry of roles) {
    const canonicalRole = canonicalizeRole(roleEntry);
    if (!dedupedByRole.has(canonicalRole.role)) {
      dedupedByRole.set(canonicalRole.role, canonicalRole);
    }
  }

  return [...dedupedByRole.values()].sort((a, b) => a.role.localeCompare(b.role));
};

const canonicalizeExtensions = (extensions) => {
  if (!Array.isArray(extensions)) {
    throw new Error('Invalid custom reportable extensions registry: expected an array of strings.');
  }

  const deduped = new Set();

  for (const extensionValue of extensions) {
    if (typeof extensionValue !== 'string') {
      throw new Error(
        'Invalid custom reportable extensions registry: each extension must be a non-empty string.',
      );
    }

    const extension = extensionValue.trim();
    if (!extension) {
      throw new Error(
        'Invalid custom reportable extensions registry: each extension must be a non-empty string.',
      );
    }

    if (!extension.startsWith('.')) {
      throw new Error(
        'Invalid custom reportable extensions registry: each extension must start with ".".',
      );
    }

    deduped.add(extension);
  }

  return [...deduped].sort((a, b) => a.localeCompare(b));
};

const digestPayload = (payload) => sha256Hex(stableStringify(payload));

function loadJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const loadBuiltinRolesPayload = () => {
  const parsed = loadJsonFile(path.join(BUILTIN_REGISTRY_DIR, 'roles.registry.json'));
  const rolesByCategory = parsed?.rolesByCategory;

  if (!rolesByCategory || typeof rolesByCategory !== 'object' || Array.isArray(rolesByCategory)) {
    throw new Error('Invalid builtin roles registry: expected rolesByCategory object.');
  }

  const flattenedRoles = [];

  for (const [category, roles] of Object.entries(rolesByCategory)) {
    if (!Array.isArray(roles)) {
      throw new Error(
        `Invalid builtin roles registry: category "${category}" must map to an array.`,
      );
    }

    for (const roleEntry of roles) {
      flattenedRoles.push({ ...roleEntry, category });
    }
  }

  return canonicalizeRoles(flattenedRoles);
};

const loadBuiltinReportableExtensions = () => {
  const parsed = loadJsonFile(
    path.join(BUILTIN_REGISTRY_DIR, 'reportable-extensions.registry.json'),
  );

  if (!Array.isArray(parsed?.reportableExtensions)) {
    throw new Error(
      'Invalid builtin reportable extensions registry: expected reportableExtensions array.',
    );
  }

  return canonicalizeExtensions(parsed.reportableExtensions);
};

const loadRegistryState = (registryRootDir) => {
  const statePath = path.join(registryRootDir, 'registry-state.json');
  if (!fs.existsSync(statePath)) {
    return DEFAULT_REGISTRY_STATE;
  }

  const parsed = loadJsonFile(statePath);
  const activeRegistry = parsed?.activeRegistry;

  if (activeRegistry !== 'builtin' && activeRegistry !== 'custom') {
    throw new Error(
      'Invalid activeRegistry in registry-state.json: expected "builtin" or "custom".',
    );
  }

  return activeRegistry;
};

const loadCustomPayload = (registryRootDir) => {
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
    throw new Error(
      'Custom registry file missing: _custom/reportable-extensions.registry.custom.json.',
    );
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
  roles: loadBuiltinRolesPayload(),
  reportableExtensions: loadBuiltinReportableExtensions(),
});

const applyConfigOverlay = (builtinPayload, config) => {
  const extensionAdds = config?.naming?.reportableExtensions?.add ?? [];
  const roleAdds = config?.naming?.roles?.add ?? [];

  const mergedExtensions = canonicalizeExtensions([
    ...builtinPayload.reportableExtensions,
    ...extensionAdds,
  ]);

  const existingRoles = new Set(builtinPayload.roles.map((entry) => entry.role));
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

  const customRolesPath = path.join(
    resolvedRegistryRootDir,
    '_custom',
    'roles.registry.custom.json',
  );
  const customExtensionsPath = path.join(
    resolvedRegistryRootDir,
    '_custom',
    'reportable-extensions.registry.custom.json',
  );

  const hasCustomFiles = fs.existsSync(customRolesPath) && fs.existsSync(customExtensionsPath);

  const customPayload = hasCustomFiles
    ? loadCustomPayload(resolvedRegistryRootDir)
    : builtinPayload;
  const customDigest = digestPayload(customPayload);

  if (registryState === 'custom' && !hasCustomFiles) {
    if (!fs.existsSync(customRolesPath)) {
      throw new Error('Custom registry file missing: _custom/roles.registry.custom.json.');
    }

    throw new Error(
      'Custom registry file missing: _custom/reportable-extensions.registry.custom.json.',
    );
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
