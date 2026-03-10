import fs from 'node:fs';
import path from 'node:path';
import { VALIDATOR_CONFIG_VERSION } from './validator-config.contracts.mjs';

const VALID_ROLE_CATEGORIES = new Set([
  'concern-core',
  'architecture-support',
  'documentation',
  'deprecated',
]);
const VALID_ROLE_STATUSES = new Set(['active', 'deprecated']);
const VALID_SEMANTIC_NAME_STYLES = new Set(['kebab-case']);

const fail = (message) => {
  throw new Error(`Invalid validator config: ${message}`);
};

const assertOnlyKeys = (obj, allowedKeys, pathLabel) => {
  const allowed = new Set(allowedKeys);
  Object.keys(obj).forEach((key) => {
    if (!allowed.has(key)) {
      fail(`${pathLabel} contains unknown key "${key}".`);
    }
  });
};

const normalizeReportableExtensions = (additions) =>
  Array.from(new Set(additions.map((extension) => extension.trim())));

const normalizeRoleAdditions = (additions) => {
  const uniqueRoles = new Set();
  const normalized = [];

  additions.forEach((entry) => {
    const trimmedRole = entry.role.trim();
    if (uniqueRoles.has(trimmedRole)) {
      return;
    }

    uniqueRoles.add(trimmedRole);
    normalized.push({
      role: trimmedRole,
      category: entry.category,
      status: entry.status,
      ...(entry.notes === undefined ? {} : { notes: entry.notes }),
    });
  });

  return normalized;
};

const normalizeConfig = (config) => {
  const normalized = {
    version: VALIDATOR_CONFIG_VERSION,
    ...(config?.strictExit === undefined ? {} : { strictExit: config.strictExit }),
  };

  const extensionAdditions = config?.naming?.reportableExtensions?.add;
  const roleAdditions = config?.naming?.roles?.add;
  const semanticNameStyle = config?.naming?.caseRules?.semanticName?.style;

  if (extensionAdditions || roleAdditions || semanticNameStyle !== undefined) {
    normalized.naming = {};
  }

  if (extensionAdditions) {
    normalized.naming.reportableExtensions = {
      add: normalizeReportableExtensions(extensionAdditions),
    };
  }

  if (roleAdditions) {
    normalized.naming.roles = {
      add: normalizeRoleAdditions(roleAdditions),
    };
  }

  if (semanticNameStyle !== undefined) {
    normalized.naming.caseRules = {
      semanticName: {
        style: semanticNameStyle.trim(),
      },
    };
  }

  return normalized;
};

const validateReportableExtensionAdditions = (config) => {
  const reportableExtensions = config?.naming?.reportableExtensions;
  if (reportableExtensions !== undefined) {
    if (
      !reportableExtensions ||
      typeof reportableExtensions !== 'object' ||
      Array.isArray(reportableExtensions)
    ) {
      fail('naming.reportableExtensions must be an object when provided.');
    }

    assertOnlyKeys(reportableExtensions, ['add'], 'naming.reportableExtensions');
  }

  const additions = reportableExtensions?.add;
  if (additions === undefined) {
    return;
  }

  if (!Array.isArray(additions)) {
    fail('naming.reportableExtensions.add must be an array of strings.');
  }

  additions.forEach((extension, index) => {
    if (typeof extension !== 'string') {
      fail(`naming.reportableExtensions.add[${index}] must be a string starting with ".".`);
    }

    const trimmed = extension.trim();
    if (!trimmed.startsWith('.')) {
      fail(`naming.reportableExtensions.add[${index}] must start with ".".`);
    }
  });
};

const validateRoleAdditionEntry = (entry, index) => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    fail(`naming.roles.add[${index}] must be an object.`);
  }

  assertOnlyKeys(entry, ['role', 'category', 'status', 'notes'], `naming.roles.add[${index}]`);

  if (typeof entry.role !== 'string' || entry.role.trim().length === 0) {
    fail(`naming.roles.add[${index}].role must be a non-empty string.`);
  }

  if (!VALID_ROLE_CATEGORIES.has(entry.category)) {
    fail(
      `naming.roles.add[${index}].category must be one of: concern-core, architecture-support, documentation, deprecated.`,
    );
  }

  if (!VALID_ROLE_STATUSES.has(entry.status)) {
    fail(`naming.roles.add[${index}].status must be one of: active, deprecated.`);
  }

  if (entry.notes !== undefined && typeof entry.notes !== 'string') {
    fail(`naming.roles.add[${index}].notes must be a string when provided.`);
  }
};

const validateRoleAdditions = (config) => {
  const roles = config?.naming?.roles;
  if (roles !== undefined) {
    if (!roles || typeof roles !== 'object' || Array.isArray(roles)) {
      fail('naming.roles must be an object when provided.');
    }

    assertOnlyKeys(roles, ['add'], 'naming.roles');
  }

  const additions = roles?.add;
  if (additions === undefined) {
    return;
  }

  if (!Array.isArray(additions)) {
    fail('naming.roles.add must be an array of role metadata objects.');
  }

  additions.forEach(validateRoleAdditionEntry);
};

const validateNamingCaseRules = (config) => {
  const caseRules = config?.naming?.caseRules;
  if (caseRules === undefined) {
    return;
  }

  if (!caseRules || typeof caseRules !== 'object' || Array.isArray(caseRules)) {
    fail('naming.caseRules must be an object when provided.');
  }

  assertOnlyKeys(caseRules, ['semanticName'], 'naming.caseRules');

  const semanticName = caseRules.semanticName;
  if (semanticName === undefined) {
    return;
  }

  if (!semanticName || typeof semanticName !== 'object' || Array.isArray(semanticName)) {
    fail('naming.caseRules.semanticName must be an object when provided.');
  }

  assertOnlyKeys(semanticName, ['style'], 'naming.caseRules.semanticName');

  const style = semanticName.style;
  if (style === undefined) {
    return;
  }

  if (typeof style !== 'string' || style.trim().length === 0) {
    fail('naming.caseRules.semanticName.style must be a non-empty string when provided.');
  }

  if (!VALID_SEMANTIC_NAME_STYLES.has(style.trim())) {
    fail('naming.caseRules.semanticName.style must be "kebab-case".');
  }
};

const validateConfig = (config) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    fail('root must be an object.');
  }

  assertOnlyKeys(config, ['version', 'strictExit', 'naming', '$schema'], 'root');

  if (config.version !== VALIDATOR_CONFIG_VERSION) {
    fail(`version must be "${VALIDATOR_CONFIG_VERSION}".`);
  }

  if (config.strictExit !== undefined && typeof config.strictExit !== 'boolean') {
    fail('strictExit must be a boolean when provided.');
  }

  const naming = config.naming;
  if (naming !== undefined) {
    if (!naming || typeof naming !== 'object' || Array.isArray(naming)) {
      fail('naming must be an object when provided.');
    }

    assertOnlyKeys(naming, ['reportableExtensions', 'roles', 'caseRules'], 'naming');
  }

  validateReportableExtensionAdditions(config);
  validateRoleAdditions(config);
  validateNamingCaseRules(config);
};

export const loadValidatorConfigFromFile = (configPath, { cwd = process.cwd() } = {}) => {
  if (!configPath || typeof configPath !== 'string') {
    fail('path must be a non-empty string.');
  }

  const resolvedPath = path.resolve(cwd, configPath);

  let rawJson;
  try {
    rawJson = fs.readFileSync(resolvedPath, 'utf8');
  } catch {
    throw new Error(`Failed to read validator config file: ${resolvedPath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error(`Failed to parse validator config JSON: ${resolvedPath}`);
  }

  validateConfig(parsed);
  return normalizeConfig(parsed);
};
