import path from 'node:path';
import {
  TEST_CONVENTION_PATTERN,
  AMBIENT_DECLARATION_PATTERN,
  TSCONFIG_PATTERN,
  TOOLING_CONFIG_PATTERN,
} from '../registries/naming-special-cases.knowledge.mjs';

export const getSpecialCaseType = normalizedPath => {
  const basename = path.posix.basename(normalizedPath);

  if (basename === 'README.md') {
    return 'conventional-doc';
  }

  if (basename === 'index.ts' || basename === 'index.tsx') {
    return 'barrel';
  }

  if (TEST_CONVENTION_PATTERN.test(basename)) {
    return 'test-convention';
  }

  if (AMBIENT_DECLARATION_PATTERN.test(basename)) {
    return 'ambient-declaration';
  }

  if (normalizedPath === 'package.json' || normalizedPath === 'package-lock.json') {
    return 'ecosystem-required';
  }

  if (TSCONFIG_PATTERN.test(basename)) {
    return 'ecosystem-required';
  }

  if (TOOLING_CONFIG_PATTERN.test(basename)) {
    return 'ecosystem-required';
  }

  return null;
};

export const isAllowedSpecialCase = normalizedPath => getSpecialCaseType(normalizedPath) !== null;
