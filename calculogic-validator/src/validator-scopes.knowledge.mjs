import { ROOT_APP_FILES } from './validator-root-files.knowledge.mjs';

export const SCOPE_PROFILES = {
  repo: {
    description: 'Repository-wide scan of all reportable files.',
    includeRoots: ['.'],
    includeRootFiles: [],
  },
  app: {
    description: 'Application-only scan (src/** and test/**).',
    includeRoots: ['src', 'test'],
    includeRootFiles: [],
  },
  docs: {
    description: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
    includeRoots: ['doc', 'docs'],
    includeRootFiles: ['README.md'],
  },
  validator: {
    description: 'Validator-only scan (calculogic-validator/**).',
    includeRoots: ['calculogic-validator'],
    includeRootFiles: [],
  },
  system: {
    description: 'System/tooling files scan (root package/tsconfig/eslint/vite files).',
    includeRoots: [],
    includeRootFiles: Array.from(ROOT_APP_FILES),
  },
};

export const cloneScopeProfile = profile => ({
  description: profile.description,
  includeRoots: [...profile.includeRoots],
  includeRootFiles: [...profile.includeRootFiles],
});

export const listValidatorScopes = () => Array.from(new Set(Object.keys(SCOPE_PROFILES))).sort((a, b) => a.localeCompare(b));

export const getValidatorScopeProfile = scope => {
  const normalizedScope = scope ?? 'repo';
  const profile = SCOPE_PROFILES[normalizedScope];
  return profile ? cloneScopeProfile(profile) : null;
};
