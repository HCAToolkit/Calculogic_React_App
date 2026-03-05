import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const validatorPackageJsonPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'package.json',
);

export const getValidatorToolVersion = () => {
  const packageJsonRaw = fs.readFileSync(validatorPackageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonRaw);
  return packageJson.version;
};

const normalizeForStableStringify = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeForStableStringify);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalizeForStableStringify(value[key])]),
    );
  }

  return value;
};

export const stableStringify = (value) => JSON.stringify(normalizeForStableStringify(value));

export const sha256Hex = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

export const computeConfigDigest = (config) => sha256Hex(stableStringify(config));
