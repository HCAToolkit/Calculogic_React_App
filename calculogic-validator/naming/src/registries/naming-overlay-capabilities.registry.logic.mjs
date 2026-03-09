import fs from 'node:fs';

const ALLOWED_TARGETS = new Set(['reportableExtensions', 'roles']);
const ALLOWED_PAYLOAD_TYPES = new Set(['string-array', 'role-array']);
const ALLOWED_OPERATION = 'add';

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

  if (operation !== ALLOWED_OPERATION) {
    throw new Error(
      `Invalid overlay-capabilities registry: capabilities[${index}].operation must be "${ALLOWED_OPERATION}".`,
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
