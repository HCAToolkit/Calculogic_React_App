import { ROOT_APP_FILES } from './naming-special-cases.knowledge.mjs';

export const SCOPE_PROFILES = {
  repo: {
    description: 'Repository-wide scan of all reportable files.',
    includeRoots: ['.'],
    includeRootFiles: [],
  },
  app: {
    description: 'Application-focused scan (src/test/calculogic-validator and root tooling files).',
    includeRoots: ['src', 'test', 'calculogic-validator'],
    includeRootFiles: Array.from(ROOT_APP_FILES),
  },
  docs: {
    description: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
    includeRoots: ['doc', 'docs'],
    includeRootFiles: ['README.md'],
  },
};

export const cloneScopeProfile = profile => ({
  description: profile.description,
  includeRoots: [...profile.includeRoots],
  includeRootFiles: [...profile.includeRootFiles],
});
