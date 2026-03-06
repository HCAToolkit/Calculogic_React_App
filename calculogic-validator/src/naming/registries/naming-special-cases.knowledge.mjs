import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ROOT_APP_FILES } from '../../validator-root-files.knowledge.mjs';

export { ROOT_APP_FILES };

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

const SPECIAL_CASES_REGISTRY_PATH = fileURLToPath(
  new URL('special-cases.registry.json', BUILTIN_REGISTRY_ROOT),
);

const WALK_EXCLUSIONS_REGISTRY_PATH = fileURLToPath(
  new URL('walk-exclusions.registry.json', BUILTIN_REGISTRY_ROOT),
);

let cachedBuiltinSpecialCaseRules = null;
let cachedBuiltinWalkExclusions = null;

// Registry loader seam: validates builtin JSON and adapts it into runtime matchers.
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


// Registry loader seam: validates builtin JSON and adapts it into runtime walk exclusions.
const loadBuiltinWalkExclusions = () => {
  const payload = JSON.parse(fs.readFileSync(WALK_EXCLUSIONS_REGISTRY_PATH, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin walk-exclusions registry: expected object payload.');
  }

  if (!Array.isArray(payload.excludedDirectories)) {
    throw new Error(
      'Invalid builtin walk-exclusions registry: missing excludedDirectories array.',
    );
  }

  if (typeof payload.skipDotDirectories !== 'boolean') {
    throw new Error(
      'Invalid builtin walk-exclusions registry: missing boolean skipDotDirectories.',
    );
  }

  if (!Array.isArray(payload.allowDotFiles)) {
    throw new Error('Invalid builtin walk-exclusions registry: missing allowDotFiles array.');
  }

  const ensureNonEmptyStringArray = (values, fieldName) => {
    values.forEach((value, index) => {
      if (typeof value !== 'string' || value.length === 0) {
        throw new Error(
          `Invalid builtin walk-exclusions registry: ${fieldName}[${index}] must be a non-empty string.`,
        );
      }
    });
  };

  ensureNonEmptyStringArray(payload.excludedDirectories, 'excludedDirectories');
  ensureNonEmptyStringArray(payload.allowDotFiles, 'allowDotFiles');

  return {
    excludedDirectories: new Set(payload.excludedDirectories),
    skipDotDirectories: payload.skipDotDirectories,
    allowDotFiles: new Set(payload.allowDotFiles),
  };
};

// Primary runtime path: getter-backed access for naming walk exclusions.
export const getBuiltinWalkExclusions = () => {
  if (cachedBuiltinWalkExclusions === null) {
    cachedBuiltinWalkExclusions = loadBuiltinWalkExclusions();
  }

  return cachedBuiltinWalkExclusions;
};

export const BUILTIN_WALK_EXCLUSIONS_REGISTRY_PATH = WALK_EXCLUSIONS_REGISTRY_PATH;


// Primary runtime path: getter-backed access for special-case rule matchers.
export const getBuiltinSpecialCaseRules = () => {
  if (cachedBuiltinSpecialCaseRules === null) {
    cachedBuiltinSpecialCaseRules = loadBuiltinSpecialCases();
  }

  return cachedBuiltinSpecialCaseRules;
};

export const BUILTIN_SPECIAL_CASES_REGISTRY_PATH = SPECIAL_CASES_REGISTRY_PATH;

// Compatibility export: eager snapshot retained for legacy imports.
// Primary runtime path is getBuiltinSpecialCaseRules().
export const BUILTIN_SPECIAL_CASE_RULES = getBuiltinSpecialCaseRules();
