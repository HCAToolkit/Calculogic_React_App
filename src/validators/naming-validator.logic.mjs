import path from 'node:path';
import fs from 'node:fs';

const ACTIVE_ROLES = new Set([
  'host',
  'wiring',
  'contracts',
  'build',
  'build-style',
  'logic',
  'knowledge',
  'results',
  'results-style',
]);

const ROLE_SUFFIXES = [...ACTIVE_ROLES].sort((a, b) => b.length - a.length);
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

export const normalizePath = relativePath => relativePath.split(path.sep).join('/');

export const isAllowedSpecialCase = filePath => {
  const normalizedPath = normalizePath(filePath);
  const basename = path.posix.basename(normalizedPath);

  if (basename === 'index.ts' || basename === 'index.tsx') {
    return true;
  }

  if (/\.test\.[^.]+$/u.test(basename) || /\.spec\.[^.]+$/u.test(basename)) {
    return true;
  }

  if (/\.d\.ts$/u.test(basename)) {
    return true;
  }

  if (normalizedPath === 'package.json' || normalizedPath === 'package-lock.json') {
    return true;
  }

  if (/^tsconfig(\..+)?\.json$/u.test(basename)) {
    return true;
  }

  if (/^vite\.config\.[^.]+$/u.test(basename) || /^eslint\.config\.[^.]+$/u.test(basename)) {
    return true;
  }

  return false;
};

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

export const classifyPath = relativePath => {
  const normalizedPath = normalizePath(relativePath);
  const basename = path.posix.basename(normalizedPath);

  if (isAllowedSpecialCase(normalizedPath)) {
    return {
      code: 'NAMING_ALLOWED_SPECIAL_CASE',
      severity: 'info',
      path: normalizedPath,
      classification: 'allowed-special-case',
      message: 'Filename matches an allowed reserved/special-case pattern.',
      ruleRef: 'FileNamingMasterList-V1_1.md#allowed-special-cases-and-reserved-filenames-v12',
    };
  }

  const parsed = parseCanonicalName(basename);
  if (parsed) {
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
        details: parsed,
      };
    }

    return {
      code: 'NAMING_CANONICAL',
      severity: 'info',
      path: normalizedPath,
      classification: 'canonical',
      message: 'Filename is canonical.',
      ruleRef: 'FileNamingMasterList-V1_1.md#core-filename-grammar',
      details: parsed,
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

export const collectRepositoryPaths = rootDirectory => {
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
      if (isReportableFile(relativePath)) {
        collected.push(normalizePath(relativePath));
      }
    }
  };

  walk(rootDirectory);

  return collected.sort((left, right) => left.localeCompare(right));
};

export const runNamingValidator = rootDirectory => {
  const paths = collectRepositoryPaths(rootDirectory);
  const findings = paths.map(pathname => classifyPath(pathname));

  return {
    findings,
    totalFilesScanned: paths.length,
  };
};

export const summarizeFindings = findings => {
  const counts = {
    canonical: 0,
    'allowed-special-case': 0,
    'legacy-exception': 0,
    'invalid-ambiguous': 0,
  };

  for (const finding of findings) {
    counts[finding.classification] += 1;
  }

  return counts;
};
