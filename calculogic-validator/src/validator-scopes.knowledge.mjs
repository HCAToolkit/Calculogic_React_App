import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT_APP_FILES } from './validator-root-files.knowledge.mjs';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILTIN_SCOPE_PROFILES_REGISTRY_PATH = path.join(
  MODULE_DIR,
  'registries',
  '_builtin',
  'scope-profiles.registry.json',
);

const LEGACY_SCOPE_DESCRIPTIONS = {
  repo: 'Repository-wide scan of all reportable files.',
  app: 'Application-only scan (src/** and test/**).',
  docs: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
  validator: 'Validator-only scan (calculogic-validator/**).',
  system: 'System/tooling files scan (root package/tsconfig/eslint/vite files).',
};

const ROOT_FILE_PATTERN_RESOLVERS = [
  {
    pattern: 'eslint.config.*',
    resolve: () => [...ROOT_APP_FILES].filter((rootFile) => rootFile.startsWith('eslint.config.')),
  },
  {
    pattern: 'vite.config.*',
    resolve: () => [...ROOT_APP_FILES].filter((rootFile) => rootFile.startsWith('vite.config.')),
  },
  {
    pattern: 'tsconfig*.json',
    resolve: () => [...ROOT_APP_FILES].filter((rootFile) => rootFile.startsWith('tsconfig')),
  },
];

function loadJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const normalizeIncludeRootFiles = (includeRootFiles = []) => {
  const expandedRootFiles = [];

  for (const rootFile of includeRootFiles) {
    const matchingResolver = ROOT_FILE_PATTERN_RESOLVERS.find(
      (resolver) => resolver.pattern === rootFile,
    );

    if (matchingResolver) {
      expandedRootFiles.push(...matchingResolver.resolve());
      continue;
    }

    expandedRootFiles.push(rootFile);
  }

  return Array.from(new Set(expandedRootFiles)).sort((left, right) => left.localeCompare(right));
};

const canonicalizeScopeProfile = (scope, profile) => {
  const includeRoots = Array.isArray(profile?.includeRoots) ? profile.includeRoots : [];
  const includeRootFiles = normalizeIncludeRootFiles(
    Array.isArray(profile?.includeRootFiles) ? profile.includeRootFiles : [],
  );

  return {
    description: LEGACY_SCOPE_DESCRIPTIONS[scope],
    includeRoots: [...includeRoots],
    includeRootFiles,
  };
};

const loadBuiltinScopeProfiles = () => {
  const parsedRegistry = loadJsonFile(BUILTIN_SCOPE_PROFILES_REGISTRY_PATH);

  if (!parsedRegistry?.profiles || typeof parsedRegistry.profiles !== 'object') {
    throw new Error('Invalid builtin scope profiles registry: expected profiles object.');
  }

  return Object.fromEntries(
    Object.entries(parsedRegistry.profiles).map(([scope, profile]) => [
      scope,
      canonicalizeScopeProfile(scope, profile),
    ]),
  );
};

export const SCOPE_PROFILES = loadBuiltinScopeProfiles();

export const cloneScopeProfile = (profile) => ({
  description: profile.description,
  includeRoots: [...profile.includeRoots],
  includeRootFiles: [...profile.includeRootFiles],
});

export const listValidatorScopes = () =>
  Array.from(new Set(Object.keys(SCOPE_PROFILES))).sort((a, b) => a.localeCompare(b));

export const getValidatorScopeProfile = (scope) => {
  const normalizedScope = scope ?? 'repo';
  const profile = SCOPE_PROFILES[normalizedScope];
  return profile ? cloneScopeProfile(profile) : null;
};
