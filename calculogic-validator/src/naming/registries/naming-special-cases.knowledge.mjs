import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ROOT_APP_FILES } from '../../validator-root-files.knowledge.mjs';

export const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite']);

export { ROOT_APP_FILES };

const SPECIAL_CASES_REGISTRY_PATH = fileURLToPath(
  new URL('./_builtin/special-cases.registry.json', import.meta.url),
);

let cachedBuiltinSpecialCaseRules = null;

const loadBuiltinSpecialCases = () => {
  const payload = JSON.parse(fs.readFileSync(SPECIAL_CASES_REGISTRY_PATH, 'utf8'));

  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.specialCases)) {
    throw new Error('Invalid builtin special-cases registry: missing specialCases array.');
  }

  return payload.specialCases.map((specialCase, index) => {
    const entryPrefix = `Invalid builtin special-cases registry entry at index ${index}`;

    if (!specialCase || typeof specialCase !== 'object') {
      throw new Error(`${entryPrefix}: expected object.`);
    }

    if (typeof specialCase.type !== 'string' || specialCase.type.length === 0) {
      throw new Error(`${entryPrefix}: expected non-empty string type.`);
    }

    const match = specialCase.match;
    if (!match || typeof match !== 'object') {
      throw new Error(`${entryPrefix}: missing match object.`);
    }

    if (Array.isArray(match.basenameEquals)) {
      return {
        type: specialCase.type,
        matches: ({ basename }) => match.basenameEquals.includes(basename),
      };
    }

    if (Array.isArray(match.suffixEquals)) {
      return {
        type: specialCase.type,
        matches: ({ basename }) => match.suffixEquals.some((suffix) => basename.endsWith(suffix)),
      };
    }

    if (typeof match.regex === 'string') {
      const regex = new RegExp(match.regex, 'u');
      return {
        type: specialCase.type,
        matches: ({ basename }) => regex.test(basename),
      };
    }

    throw new Error(`${entryPrefix}: unsupported match form.`);
  });
};

export const getBuiltinSpecialCaseRules = () => {
  if (cachedBuiltinSpecialCaseRules === null) {
    cachedBuiltinSpecialCaseRules = loadBuiltinSpecialCases();
  }

  return cachedBuiltinSpecialCaseRules;
};

export const BUILTIN_SPECIAL_CASES_REGISTRY_PATH = SPECIAL_CASES_REGISTRY_PATH;

export const BUILTIN_SPECIAL_CASE_RULES = getBuiltinSpecialCaseRules();
