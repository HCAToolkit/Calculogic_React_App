import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

const BUILTIN_EXIT_POLICY_REGISTRY_PATH = path.join(
  MODULE_DIR,
  '_builtin',
  'exit-policy.registry.json',
);

const ALLOWED_PREDICATE_KEYS = new Set([
  'always',
  'strictMode',
  'anyWarnFindings',
  'noWarnFindings',
  'anyLegacyExceptionFindings',
]);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const loadJsonFile = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const validatePredicateShape = (predicate, { policyId }) => {
  if (!isPlainObject(predicate)) {
    throw new Error(
      `Invalid builtin exit policy registry: predicate for policy "${policyId}" must be an object.`,
    );
  }

  const predicateKeys = Object.keys(predicate);
  if (predicateKeys.length === 0) {
    throw new Error(
      `Invalid builtin exit policy registry: predicate for policy "${policyId}" must declare at least one condition.`,
    );
  }

  for (const key of predicateKeys) {
    if (!ALLOWED_PREDICATE_KEYS.has(key)) {
      throw new Error(
        `Invalid builtin exit policy registry: unsupported predicate key "${key}" in policy "${policyId}".`,
      );
    }

    if (typeof predicate[key] !== 'boolean') {
      throw new Error(
        `Invalid builtin exit policy registry: predicate key "${key}" in policy "${policyId}" must be boolean.`,
      );
    }
  }
};

const canonicalizeExitPolicyEntry = (policyEntry) => {
  if (!isPlainObject(policyEntry)) {
    throw new Error('Invalid builtin exit policy registry: each policy entry must be an object.');
  }

  const id = typeof policyEntry.id === 'string' ? policyEntry.id.trim() : '';
  if (!id) {
    throw new Error('Invalid builtin exit policy registry: each policy entry requires a non-empty id.');
  }

  if (!Number.isInteger(policyEntry.exitCode) || policyEntry.exitCode < 0) {
    throw new Error(
      `Invalid builtin exit policy registry: exitCode for policy "${id}" must be a non-negative integer.`,
    );
  }

  validatePredicateShape(policyEntry.predicate, { policyId: id });

  return {
    id,
    exitCode: policyEntry.exitCode,
    predicate: {
      always: policyEntry.predicate.always === true,
      strictMode: policyEntry.predicate.strictMode === true,
      anyWarnFindings: policyEntry.predicate.anyWarnFindings === true,
      noWarnFindings: policyEntry.predicate.noWarnFindings === true,
      anyLegacyExceptionFindings: policyEntry.predicate.anyLegacyExceptionFindings === true,
    },
  };
};

export const loadExitPolicyRegistryFromPayload = (payload) => {
  if (!isPlainObject(payload)) {
    throw new Error('Invalid builtin exit policy registry: expected root object payload.');
  }

  if (!Array.isArray(payload.policies)) {
    throw new Error('Invalid builtin exit policy registry: expected policies array.');
  }

  const canonicalPolicies = payload.policies.map((policyEntry) =>
    canonicalizeExitPolicyEntry(policyEntry),
  );

  if (canonicalPolicies.length === 0) {
    throw new Error('Invalid builtin exit policy registry: policies array must not be empty.');
  }

  const dedupedPolicyIds = new Set();
  for (const policy of canonicalPolicies) {
    if (dedupedPolicyIds.has(policy.id)) {
      throw new Error(
        `Invalid builtin exit policy registry: duplicate policy id "${policy.id}" is not allowed.`,
      );
    }

    dedupedPolicyIds.add(policy.id);
  }

  if (!canonicalPolicies.some((policy) => policy.predicate.always)) {
    throw new Error(
      'Invalid builtin exit policy registry: policies must include a deterministic fallback predicate with always=true.',
    );
  }

  return canonicalPolicies;
};

let cachedBuiltinExitPolicies = null;

export const getBuiltinExitPolicies = () => {
  if (!cachedBuiltinExitPolicies) {
    cachedBuiltinExitPolicies = loadExitPolicyRegistryFromPayload(
      loadJsonFile(BUILTIN_EXIT_POLICY_REGISTRY_PATH),
    );
  }

  return cachedBuiltinExitPolicies.map((policy) => ({
    id: policy.id,
    exitCode: policy.exitCode,
    predicate: { ...policy.predicate },
  }));
};
