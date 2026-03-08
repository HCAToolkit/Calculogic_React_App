import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_SUMMARY_BUCKETS_REGISTRY_PATH = fileURLToPath(
  new URL('summary-buckets.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinSummaryBuckets = null;

const ensureStringArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid builtin summary-buckets registry: missing ${fieldName} array.`);
  }

  const seen = new Set();
  const normalized = [];

  value.forEach((entry, index) => {
    if (typeof entry !== 'string' || entry.length === 0) {
      throw new Error(
        `Invalid builtin summary-buckets registry: ${fieldName}[${index}] must be a non-empty string.`,
      );
    }

    if (!seen.has(entry)) {
      seen.add(entry);
      normalized.push(entry);
    }
  });

  return normalized;
};

export const loadSummaryBucketsFromFile = (registryPath) => {
  const payload = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin summary-buckets registry: expected object payload.');
  }

  return {
    classificationBuckets: ensureStringArray(payload.classificationBuckets, 'classificationBuckets'),
    secondaryBucketFamilies: ensureStringArray(
      payload.secondaryBucketFamilies,
      'secondaryBucketFamilies',
    ),
  };
};

export const getBuiltinSummaryBuckets = () => {
  if (cachedBuiltinSummaryBuckets === null) {
    cachedBuiltinSummaryBuckets = loadSummaryBucketsFromFile(BUILTIN_SUMMARY_BUCKETS_REGISTRY_PATH);
  }

  return cachedBuiltinSummaryBuckets;
};
