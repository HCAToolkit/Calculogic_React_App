import fs from 'node:fs';
import path from 'node:path';
import { VALIDATOR_CONFIG_VERSION } from './validator-config.contracts.mjs';

const fail = message => {
  throw new Error(`Invalid validator config: ${message}`);
};

const normalizeConfig = config => {
  const normalized = {
    version: VALIDATOR_CONFIG_VERSION,
  };

  const additions = config?.naming?.reportableExtensions?.add;
  if (additions) {
    normalized.naming = {
      reportableExtensions: {
        add: Array.from(new Set(additions.map(extension => extension.trim()))),
      },
    };
  }

  return normalized;
};

const validateConfig = config => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    fail('root must be an object.');
  }

  if (config.version !== VALIDATOR_CONFIG_VERSION) {
    fail(`version must be "${VALIDATOR_CONFIG_VERSION}".`);
  }

  const additions = config?.naming?.reportableExtensions?.add;
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
