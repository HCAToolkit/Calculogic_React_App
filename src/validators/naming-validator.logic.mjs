import path from 'node:path';
import fs from 'node:fs';

const ROLE_REGISTRY = [
  { role: 'host', category: 'architecture-support', status: 'active' },
  { role: 'wiring', category: 'architecture-support', status: 'active' },
  { role: 'contracts', category: 'architecture-support', status: 'active' },
  { role: 'build', category: 'concern-core', status: 'active' },
  { role: 'build-style', category: 'concern-core', status: 'active' },
  { role: 'logic', category: 'concern-core', status: 'active' },
  { role: 'knowledge', category: 'concern-core', status: 'active' },
  { role: 'results', category: 'concern-core', status: 'active' },
  { role: 'results-style', category: 'concern-core', status: 'active' },
  {
    role: 'view',
    category: 'deprecated',
    status: 'deprecated',
    notes: 'Historical role from pre-current concern split; manual migration required.',
  },
];

const ROLE_METADATA = new Map(ROLE_REGISTRY.map(entry => [entry.role, entry]));
const ACTIVE_ROLES = new Set(ROLE_REGISTRY.filter(entry => entry.status === 'active').map(entry => entry.role));
const ROLE_SUFFIXES = ROLE_REGISTRY.map(entry => entry.role).sort((a, b) => b.length - a.length);
const CANONICAL_SEMANTIC_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPORTABLE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
  '.md',
]);

const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite']);

const ROOT_APP_FILES = new Set([
  'package.json',
  'package-lock.json',
  'eslint.config.js',
  'eslint.config.mjs',
  'vite.config.ts',
  'vite.config.js',
  'vite.config.mjs',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
]);

const SCOPE_PROFILES = {
  repo: {
    description: 'Repository-wide scan of all reportable files.',
    includeRoots: ['.'],
    includeRootFiles: [],
  },
  app: {
    description: 'Application-focused scan (src/test/scripts and root tooling files).',
    includeRoots: ['src', 'test', 'scripts'],
    includeRootFiles: Array.from(ROOT_APP_FILES),
  },
  docs: {
    description: 'Documentation-focused scan (doc/docs and root conventional docs: README.md).',
    includeRoots: ['doc', 'docs'],
    includeRootFiles: ['README.md'],
  },
};

const cloneScopeProfile = profile => ({
  description: profile.description,
  includeRoots: [...profile.includeRoots],
  includeRootFiles: [...profile.includeRootFiles],
});

export const normalizePath = relativePath => relativePath.split(path.sep).join('/');

const getSpecialCaseType = filePath => {
  const normalizedPath = normalizePath(filePath);
  const basename = path.posix.basename(normalizedPath);

  if (basename === 'README.md') {
    return 'conventional-doc';
  }

  if (basename === 'index.ts' || basename === 'index.tsx') {
    return 'barrel';
  }

  if (/\.test\.[^.]+$/u.test(basename) || /\.spec\.[^.]+$/u.test(basename)) {
    return 'test-convention';
  }

  if (/\.d\.ts$/u.test(basename)) {
    return 'ambient-declaration';
  }

  if (normalizedPath === 'package.json' || normalizedPath === 'package-lock.json') {
    return 'ecosystem-required';
  }

  if (/^tsconfig(\..+)?\.json$/u.test(basename)) {
    return 'ecosystem-required';
  }

  if (/^vite\.config\.[^.]+$/u.test(basename) || /^eslint\.config\.[^.]+$/u.test(basename)) {
    return 'ecosystem-required';
  }

  return null;
};

export const isAllowedSpecialCase = filePath => getSpecialCaseType(filePath) !== null;

export const parseCanonicalName = basename => {
  const parts = basename.split('.');

  if (parts.length < 3) {
    return null;
  }

  if (parts[parts.length - 2] === 'module' && parts[parts.length - 1] === 'css' && parts.length >= 4) {
    return {
      semanticName: parts.slice(0, -3).join('.'),
      role: parts[parts.length - 3],
      extension: 'module.css',
    };
  }

  return {
    semanticName: parts.slice(0, -2).join('.'),
    role: parts[parts.length - 2],
    extension: parts[parts.length - 1],
  };
};

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const hasHyphenAppendedRoleAmbiguity = basename => {
  for (const role of ROLE_SUFFIXES) {
    const pattern = new RegExp(`-${escapeRegExp(role)}\\.[^.]+$`, 'u');
    if (pattern.test(basename)) {
      return { role };
    }
  }

  return null;
};

const isReportableFile = relativePath => {
  const extension = path.extname(relativePath);
  if (REPORTABLE_EXTENSIONS.has(extension)) {
    return true;
  }

  return path.basename(relativePath) === 'package-lock.json' || path.basename(relativePath) === 'package.json';
};

const sortPaths = paths => Array.from(paths).sort((left, right) => left.localeCompare(right));

const collectPathsFromRoot = (rootDirectory, rootRelativePath = '.') => {
  const normalizedRoot = normalizePath(rootRelativePath);
  const absoluteRoot = path.resolve(rootDirectory, normalizedRoot);
  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }

  const stat = fs.statSync(absoluteRoot);
  if (!stat.isDirectory()) {
    return [];
  }

  const collected = [];

  const walk = absoluteDirectoryPath => {
    const entries = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.eslintrc') {
        if (entry.isDirectory()) {
          continue;
        }
      }

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        walk(path.join(absoluteDirectoryPath, entry.name));
        continue;
      }

      const absolutePath = path.join(absoluteDirectoryPath, entry.name);
      const relativePath = path.relative(rootDirectory, absolutePath);
      const normalizedPath = normalizePath(relativePath);
      if (isReportableFile(normalizedPath)) {
        collected.push(normalizedPath);
      }
    }
  };

  walk(absoluteRoot);
  return collected;
};

const buildScopePathPredicate = profile => {
  const includeRootSet = new Set(profile.includeRoots.map(normalizePath));
  const includeRootFileSet = new Set(profile.includeRootFiles.map(normalizePath));

  return relativePath => {
    const normalizedPath = normalizePath(relativePath);
    if (normalizedPath.includes('/')) {
      const firstSegment = normalizedPath.split('/')[0];
      return includeRootSet.has(firstSegment);
    }

    return includeRootFileSet.has(normalizedPath);
  };
};

export const listNamingValidatorScopes = () => sortPaths(new Set(Object.keys(SCOPE_PROFILES)));

export const getScopeProfile = scope => {
  const normalizedScope = scope ?? 'repo';
  const profile = SCOPE_PROFILES[normalizedScope];
  return profile ? cloneScopeProfile(profile) : null;
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const selectedScope = options.scope ?? 'repo';
  const profile = getScopeProfile(selectedScope);
  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  const allReportablePaths = collectPathsFromRoot(rootDirectory, '.');

  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  const scopePathPredicate = buildScopePathPredicate(profile);
  const scopedPaths = allReportablePaths.filter(scopePathPredicate);
  return sortPaths(new Set(scopedPaths));
};

export const classifyPath = relativePath => {
  const normalizedPath = normalizePath(relativePath);
  const basename = path.posix.basename(normalizedPath);

  const specialCaseType = getSpecialCaseType(normalizedPath);
  if (specialCaseType) {
    return {
      code: 'NAMING_ALLOWED_SPECIAL_CASE',
      severity: 'info',
      path: normalizedPath,
      classification: 'allowed-special-case',
      message: 'Filename matches an allowed reserved/special-case pattern.',
      ruleRef: 'FileNamingMasterList-V1_1.md#allowed-special-cases-and-reserved-filenames-v12',
      details: { specialCaseType },
    };
  }

  const parsed = parseCanonicalName(basename);
  if (parsed) {
    const roleMetadata = ROLE_METADATA.get(parsed.role);

    if (!roleMetadata) {
      return {
        code: 'NAMING_UNKNOWN_ROLE',
        severity: 'warn',
        path: normalizedPath,
        classification: 'invalid-ambiguous',
        message: `Unknown role segment "${parsed.role}" in canonical position.`,
        ruleRef: 'FileNamingMasterList-V1_1.md#role-registry-master-list-v1',
        suggestedFix: 'Use a role from the active role registry.',
        details: parsed,
      };
    }

    if (roleMetadata.status === 'deprecated') {
      return {
        code: 'NAMING_DEPRECATED_ROLE',
        severity: 'warn',
        path: normalizedPath,
        classification: 'invalid-ambiguous',
        message: `Role segment "${parsed.role}" is deprecated and requires manual migration planning.`,
        ruleRef: 'FileNamingMasterList-V1_1.md#role-registry-master-list-v1',
        suggestedFix: 'Replace deprecated roles manually using current active role taxonomy.',
        details: {
          ...parsed,
          roleStatus: roleMetadata.status,
          roleCategory: roleMetadata.category,
          deprecationNote: roleMetadata.notes,
        },
      };
    }

    if (!ACTIVE_ROLES.has(parsed.role)) {
      return {
        code: 'NAMING_UNKNOWN_ROLE',
        severity: 'warn',
        path: normalizedPath,
        classification: 'invalid-ambiguous',
        message: `Unknown role segment "${parsed.role}" in canonical position.`,
        ruleRef: 'FileNamingMasterList-V1_1.md#role-registry-master-list-v1',
        suggestedFix: 'Use a role from the active role registry.',
        details: parsed,
      };
    }

    if (!CANONICAL_SEMANTIC_PATTERN.test(parsed.semanticName)) {
      return {
        code: 'NAMING_BAD_SEMANTIC_CASE',
        severity: 'warn',
        path: normalizedPath,
        classification: 'invalid-ambiguous',
        message: 'Semantic name must use kebab-case for canonical filenames.',
        ruleRef: 'FileNamingMasterList-V1_1.md#semantic-name',
        suggestedFix: `Rename semantic name "${parsed.semanticName}" to kebab-case.`,
        details: {
          ...parsed,
          roleStatus: roleMetadata.status,
          roleCategory: roleMetadata.category,
        },
      };
    }

    return {
      code: 'NAMING_CANONICAL',
      severity: 'info',
      path: normalizedPath,
      classification: 'canonical',
      message: 'Filename is canonical.',
      ruleRef: 'FileNamingMasterList-V1_1.md#core-filename-grammar',
      details: {
        ...parsed,
        roleStatus: roleMetadata.status,
        roleCategory: roleMetadata.category,
      },
    };
  }

  const ambiguity = hasHyphenAppendedRoleAmbiguity(basename);
  if (ambiguity) {
    return {
      code: 'NAMING_ROLE_HYPHEN_AMBIGUITY',
      severity: 'warn',
      path: normalizedPath,
      classification: 'invalid-ambiguous',
      message: `Role "${ambiguity.role}" appears hyphen-appended instead of dot-separated.`,
      ruleRef: 'FileNamingMasterList-V1_1.md#role-suffix-separation-rule-important',
      suggestedFix: 'Rename using <semantic-name>.<role>.<ext>.',
    };
  }

  return {
    code: 'NAMING_LEGACY_EXCEPTION',
    severity: 'info',
    path: normalizedPath,
    classification: 'legacy-exception',
    message: 'Filename does not match canonical format and is treated as incremental legacy exception in report mode.',
    ruleRef: 'FileNamingMasterList-V1_1.md#legacy-file-reality-important',
  };
};

export const runNamingValidator = (rootDirectory, options = {}) => {
  const selectedScope = options.scope ?? 'repo';
  const paths = collectRepositoryPaths(rootDirectory, { scope: selectedScope });
  const findings = paths.map(pathname => classifyPath(pathname));

  return {
    findings,
    totalFilesScanned: paths.length,
    scope: selectedScope,
  };
};

const incrementCounter = (counts, key) => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const sortCountObject = counts =>
  Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );

export const summarizeFindings = findings => {
  const counts = {
    canonical: 0,
    'allowed-special-case': 0,
    'legacy-exception': 0,
    'invalid-ambiguous': 0,
  };
  const codeCounts = {};
  const specialCaseTypeCounts = {};
  const warningRoleStatusCounts = {};
  const warningRoleCategoryCounts = {};

  for (const finding of findings) {
    incrementCounter(counts, finding.classification);
    incrementCounter(codeCounts, finding.code);

    if (finding.details?.specialCaseType) {
      incrementCounter(specialCaseTypeCounts, finding.details.specialCaseType);
    }

    if (finding.severity === 'warn' && finding.details?.roleStatus) {
      incrementCounter(warningRoleStatusCounts, finding.details.roleStatus);
    }

    if (finding.severity === 'warn' && finding.details?.roleCategory) {
      incrementCounter(warningRoleCategoryCounts, finding.details.roleCategory);
    }
  }

  return {
    counts,
    codeCounts: sortCountObject(codeCounts),
    specialCaseTypeCounts: sortCountObject(specialCaseTypeCounts),
    warningRoleStatusCounts: sortCountObject(warningRoleStatusCounts),
    warningRoleCategoryCounts: sortCountObject(warningRoleCategoryCounts),
  };
};
