import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stableStringify, sha256Hex } from '../../../src/core/validator-report-meta.logic.mjs';
import { loadSummaryBucketsFromFile } from './naming-summary-buckets.registry.logic.mjs';
import { loadMissingRolePatternsFromFile } from './naming-missing-role-patterns.registry.logic.mjs';
import { loadFindingPolicyFromFile } from './naming-finding-policy.registry.logic.mjs';

const DEFAULT_REGISTRY_STATE = 'builtin';
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILTIN_REGISTRY_DIR = path.join(MODULE_DIR, '_builtin');
const REQUIRED_BUILTIN_REGISTRY_FILES = [
  'categories.registry.json',
  'roles.registry.json',
  'reportable-extensions.registry.json',
  'reportable-root-files.registry.json',
  'summary-buckets.registry.json',
  'missing-role-patterns.registry.json',
  'finding-policy.registry.json',
];

const ALLOWED_ROLE_STATUSES = new Set(['active', 'deprecated']);

const hasRequiredBuiltinRegistryFiles = ({ builtinRegistryDir }) =>
  REQUIRED_BUILTIN_REGISTRY_FILES.every((registryFile) =>
    fs.existsSync(path.join(builtinRegistryDir, registryFile)),
  );

const resolveBuiltinRegistryDir = ({ resolvedRegistryRootDir }) => {
  const candidateBuiltinRegistryDir = path.join(resolvedRegistryRootDir, '_builtin');
  return hasRequiredBuiltinRegistryFiles({ builtinRegistryDir: candidateBuiltinRegistryDir })
    ? candidateBuiltinRegistryDir
    : BUILTIN_REGISTRY_DIR;
};

const loadBuiltinCategorySet = ({ builtinRegistryDir }) => {
  const parsed = loadJsonFile(path.join(builtinRegistryDir, 'categories.registry.json'));
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

const canonicalizeRole = (roleEntry, { allowedCategories }) => {
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

  if (!allowedCategories.has(category)) {
    const allowedCategoriesLabel = [...allowedCategories].sort((a, b) => a.localeCompare(b));
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

const canonicalizeRoles = (roles, { allowedCategories }) => {
  const dedupedByRole = new Map();

  for (const roleEntry of roles) {
    const canonicalRole = canonicalizeRole(roleEntry, { allowedCategories });
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

const loadBuiltinRolesPayload = ({ builtinRegistryDir }) => {
  const parsed = loadJsonFile(path.join(builtinRegistryDir, 'roles.registry.json'));
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

  const allowedCategories = loadBuiltinCategorySet({ builtinRegistryDir });
  return canonicalizeRoles(flattenedRoles, { allowedCategories });
};

const loadBuiltinReportableExtensions = ({ builtinRegistryDir }) => {
  const parsed = loadJsonFile(
    path.join(builtinRegistryDir, 'reportable-extensions.registry.json'),
  );

  if (!Array.isArray(parsed?.reportableExtensions)) {
    throw new Error(
      'Invalid builtin reportable extensions registry: expected reportableExtensions array.',
    );
  }

  return canonicalizeExtensions(parsed.reportableExtensions);
};

const canonicalizeRootFilenames = (rootFilenames) => {
  if (!Array.isArray(rootFilenames)) {
    throw new Error('Invalid builtin reportable root files registry: expected an array of strings.');
  }

  const deduped = new Set();

  for (const rootFilenameValue of rootFilenames) {
    if (typeof rootFilenameValue !== 'string') {
      throw new Error(
        'Invalid builtin reportable root files registry: each root filename must be a non-empty string.',
      );
    }

    const rootFilename = rootFilenameValue.trim();
    if (!rootFilename) {
      throw new Error(
        'Invalid builtin reportable root files registry: each root filename must be a non-empty string.',
      );
    }

    deduped.add(rootFilename);
  }

  return [...deduped].sort((a, b) => a.localeCompare(b));
};

const loadBuiltinReportableRootFiles = ({ builtinRegistryDir }) => {
  const parsed = loadJsonFile(
    path.join(builtinRegistryDir, 'reportable-root-files.registry.json'),
  );

  if (!Array.isArray(parsed?.reportableRootFiles)) {
    throw new Error(
      'Invalid builtin reportable root files registry: expected reportableRootFiles array.',
    );
  }

  return canonicalizeRootFilenames(parsed.reportableRootFiles);
};

const loadBuiltinSummaryBuckets = ({ builtinRegistryDir }) =>
  loadSummaryBucketsFromFile(path.join(builtinRegistryDir, 'summary-buckets.registry.json'));

const loadBuiltinMissingRolePatterns = ({ builtinRegistryDir }) =>
  loadMissingRolePatternsFromFile(path.join(builtinRegistryDir, 'missing-role-patterns.registry.json'));

const loadBuiltinFindingPolicy = ({ builtinRegistryDir }) =>
  loadFindingPolicyFromFile(path.join(builtinRegistryDir, 'finding-policy.registry.json'));

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

const loadCustomPayload = ({ registryRootDir, builtinRegistryDir }) => {
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
    roles: canonicalizeRoles(rolesRaw, {
      allowedCategories: loadBuiltinCategorySet({ builtinRegistryDir }),
    }),
    reportableExtensions: canonicalizeExtensions(extensionsRaw),
    reportableRootFiles: loadBuiltinReportableRootFiles({ builtinRegistryDir }),
    summaryBuckets: loadBuiltinSummaryBuckets({ builtinRegistryDir }),
    missingRolePatterns: loadBuiltinMissingRolePatterns({ builtinRegistryDir }),
    findingPolicy: loadBuiltinFindingPolicy({ builtinRegistryDir }),
  };
};

const buildBuiltinPayload = ({ builtinRegistryDir }) => ({
  roles: loadBuiltinRolesPayload({ builtinRegistryDir }),
  reportableExtensions: loadBuiltinReportableExtensions({ builtinRegistryDir }),
  reportableRootFiles: loadBuiltinReportableRootFiles({ builtinRegistryDir }),
  summaryBuckets: loadBuiltinSummaryBuckets({ builtinRegistryDir }),
  missingRolePatterns: loadBuiltinMissingRolePatterns({ builtinRegistryDir }),
  findingPolicy: loadBuiltinFindingPolicy({ builtinRegistryDir }),
});

const applyConfigOverlay = ({ builtinPayload, config, builtinRegistryDir }) => {
  const extensionAdds = config?.naming?.reportableExtensions?.add ?? [];
  const roleAdds = config?.naming?.roles?.add ?? [];
  const allowedCategories = loadBuiltinCategorySet({ builtinRegistryDir });

  const mergedExtensions = canonicalizeExtensions([
    ...builtinPayload.reportableExtensions,
    ...extensionAdds,
  ]);

  const existingRoles = new Set(builtinPayload.roles.map((entry) => entry.role));
  const rolesToAppend = [];

  for (const roleEntry of roleAdds) {
    const canonicalRole = canonicalizeRole(roleEntry, { allowedCategories });
    if (!existingRoles.has(canonicalRole.role)) {
      existingRoles.add(canonicalRole.role);
      rolesToAppend.push(canonicalRole);
    }
  }

  return {
    roles: canonicalizeRoles([...builtinPayload.roles, ...rolesToAppend], { allowedCategories }),
    reportableExtensions: mergedExtensions,
    reportableRootFiles: builtinPayload.reportableRootFiles,
    summaryBuckets: builtinPayload.summaryBuckets,
    missingRolePatterns: builtinPayload.missingRolePatterns,
    findingPolicy: builtinPayload.findingPolicy,
  };
};

export const resolveNamingRegistryInputs = ({ config, registryRootDir } = {}) => {
  const resolvedRegistryRootDir = registryRootDir ?? MODULE_DIR;
  const registryState = loadRegistryState(resolvedRegistryRootDir);

  const builtinRegistryDir = resolveBuiltinRegistryDir({ resolvedRegistryRootDir });
  const builtinPayload = buildBuiltinPayload({ builtinRegistryDir });
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
    ? loadCustomPayload({ registryRootDir: resolvedRegistryRootDir, builtinRegistryDir })
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
    ? applyConfigOverlay({ builtinPayload, config, builtinRegistryDir })
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
    reportableRootFiles: resolvedPayload.reportableRootFiles,
    summaryBuckets: resolvedPayload.summaryBuckets,
    missingRolePatterns: resolvedPayload.missingRolePatterns,
    findingPolicy: resolvedPayload.findingPolicy,
  };
};
