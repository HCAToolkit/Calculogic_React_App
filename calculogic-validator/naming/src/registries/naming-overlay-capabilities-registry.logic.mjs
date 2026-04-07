import fs from 'node:fs';

const ALLOWED_TARGETS = new Set(['reportableExtensions', 'roles', 'caseRules']);
const ALLOWED_PAYLOAD_TYPES = new Set(['string-array', 'role-array', 'case-rules-object']);
const ALLOWED_OPERATIONS = new Set(['add', 'set']);

const CAPABILITY_CONTRACT_BY_TARGET = {
  reportableExtensions: { operation: 'add', payloadType: 'string-array' },
  roles: { operation: 'add', payloadType: 'role-array' },
  caseRules: { operation: 'set', payloadType: 'case-rules-object' },
};

const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid overlay-capabilities registry: ${fieldName} must be a non-empty string.`);
  }

  return value.trim();
};

const canonicalizeCapabilityEntry = (entry, index) => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}] must be an object.`,
    );
  }

  const configPath = assertNonEmptyString(entry.configPath, `capabilities[${index}].configPath`);
  const operation = assertNonEmptyString(entry.operation, `capabilities[${index}].operation`);
  const payloadType = assertNonEmptyString(entry.payloadType, `capabilities[${index}].payloadType`);
  const target = assertNonEmptyString(entry.target, `capabilities[${index}].target`);

  if (!ALLOWED_OPERATIONS.has(operation)) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}].operation must be one of ${[...ALLOWED_OPERATIONS].join(', ')}.`,
    );
  }

  if (!ALLOWED_PAYLOAD_TYPES.has(payloadType)) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}].payloadType must be one of ${[...ALLOWED_PAYLOAD_TYPES].join(', ')}.`,
    );
  }

  if (!ALLOWED_TARGETS.has(target)) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}].target must be one of ${[...ALLOWED_TARGETS].join(', ')}.`,
    );
  }

  const targetContract = CAPABILITY_CONTRACT_BY_TARGET[target];
  if (targetContract.operation !== operation) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}] target "${target}" must use operation "${targetContract.operation}".`,
    );
  }

  if (targetContract.payloadType !== payloadType) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}] target "${target}" must use payloadType "${targetContract.payloadType}".`,
    );
  }

  return {
    configPath,
    operation,
    payloadType,
    target,
  };
};

export const loadOverlayCapabilitiesFromFile = (registryPath) => {
  const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid overlay-capabilities registry: expected object payload.');
  }

  if (!Array.isArray(parsed.capabilities)) {
    throw new Error('Invalid overlay-capabilities registry: expected capabilities array.');
  }

  const dedupedByKey = new Map();

  parsed.capabilities.forEach((entry, index) => {
    const canonical = canonicalizeCapabilityEntry(entry, index);
    dedupedByKey.set(`${canonical.configPath}:${canonical.operation}`, canonical);
  });

  const canonicalCapabilities = [...dedupedByKey.values()].sort((left, right) => {
    const byPath = left.configPath.localeCompare(right.configPath);
    return byPath !== 0 ? byPath : left.operation.localeCompare(right.operation);
  });

  if (canonicalCapabilities.length === 0) {
    throw new Error('Invalid overlay-capabilities registry: capabilities must not be empty.');
  }

  return {
    entries: canonicalCapabilities,
    byPathOperation: Object.fromEntries(
      canonicalCapabilities.map((entry) => [
        `${entry.configPath}:${entry.operation}`,
        {
          configPath: entry.configPath,
          payloadType: entry.payloadType,
          target: entry.target,
        },
      ]),
    ),
  };
};
