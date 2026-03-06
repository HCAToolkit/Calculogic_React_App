import path from 'node:path';
import { getBuiltinSpecialCaseRules } from '../registries/naming-special-cases.knowledge.mjs';

export const getSpecialCaseType = (normalizedPath) => {
  const basename = path.posix.basename(normalizedPath);

  for (const rule of getBuiltinSpecialCaseRules()) {
    if (rule.matches({ normalizedPath, basename })) {
      return rule.type;
    }
  }

  return null;
};

export const isAllowedSpecialCase = (normalizedPath) => getSpecialCaseType(normalizedPath) !== null;
