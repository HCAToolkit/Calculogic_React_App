import path from 'node:path';
import { BUILTIN_SPECIAL_CASE_RULES } from '../registries/naming-special-cases.knowledge.mjs';

export const getSpecialCaseType = (normalizedPath) => {
  const basename = path.posix.basename(normalizedPath);

  for (const rule of BUILTIN_SPECIAL_CASE_RULES) {
    if (rule.matches({ normalizedPath, basename })) {
      return rule.type;
    }
  }

  return null;
};

export const isAllowedSpecialCase = (normalizedPath) => getSpecialCaseType(normalizedPath) !== null;
