import path from 'node:path';
import fs from 'node:fs';
import {
  ROLE_METADATA,
  ACTIVE_ROLES,
  ROLE_SUFFIXES,
} from './registries/naming-roles.knowledge.mjs';
import { REPORTABLE_EXTENSIONS } from './registries/naming-extensions.knowledge.mjs';
import { EXCLUDED_DIRECTORIES } from './registries/naming-special-cases.knowledge.mjs';
import { SCOPE_PROFILES, cloneScopeProfile } from './registries/naming-scope-profiles.knowledge.mjs';
import { parseCanonicalName } from './rules/naming-rule-parse-canonical.logic.mjs';
import {
  getSpecialCaseType,
  isAllowedSpecialCase,
} from './rules/naming-rule-classify-special-case.logic.mjs';
import { hasHyphenAppendedRoleAmbiguity } from './rules/naming-rule-check-hyphen-role-ambiguity.logic.mjs';
import { isCanonicalSemanticName } from './rules/naming-rule-check-semantic-case.logic.mjs';
import {
  getRoleMetadata,
  isDeprecatedRole,
  isUnknownOrInactiveRole,
} from './rules/naming-rule-check-role.logic.mjs';

export const normalizePath = relativePath => relativePath.split(path.sep).join('/');

export { parseCanonicalName, getSpecialCaseType, isAllowedSpecialCase };

const buildDefaultNamingRolesRuntime = () => ({
  roleMetadata: ROLE_METADATA,
  activeRoles: ACTIVE_ROLES,
  roleSuffixes: ROLE_SUFFIXES,
});

const resolveNamingRolesRuntime = namingRolesRuntime => namingRolesRuntime ?? buildDefaultNamingRolesRuntime();

const isReportableFile = (relativePath, reportableExtensions = REPORTABLE_EXTENSIONS) => {
  const extension = path.extname(relativePath);
  if (reportableExtensions.has(extension)) {
    return true;
  }

  return path.basename(relativePath) === 'package-lock.json' || path.basename(relativePath) === 'package.json';
};

const sortPaths = paths => Array.from(paths).sort((left, right) => left.localeCompare(right));

const collectPathsFromRoot = (rootDirectory, rootRelativePath = '.', options = {}) => {
  const normalizedRoot = normalizePath(rootRelativePath);
  const absoluteRoot = path.resolve(rootDirectory, normalizedRoot);
  if (!fs.existsSync(absoluteRoot)) {
    return [];
  }

  const stat = fs.statSync(absoluteRoot);
  if (!stat.isDirectory()) {
    return [];
  }

  const reportableExtensions = options.reportableExtensions ?? REPORTABLE_EXTENSIONS;
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
      if (isReportableFile(normalizedPath, reportableExtensions)) {
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

const detectMissingRoleCandidate = basename => {
  const segments = basename.split('.');

  if (segments.length === 2) {
    return {
      semanticNameCandidate: segments[0],
      extension: segments[1],
    };
  }

  if (segments.length === 3 && segments[1] === 'module' && segments[2] === 'css') {
    return {
      semanticNameCandidate: segments[0],
      extension: 'module.css',
    };
  }

  return null;
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const selectedScope = options.scope ?? 'repo';
  const profile = getScopeProfile(selectedScope);
  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  const allReportablePaths = collectPathsFromRoot(rootDirectory, '.', {
    reportableExtensions: options.reportableExtensions,
  });

  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  const scopePathPredicate = buildScopePathPredicate(profile);
  const scopedPaths = allReportablePaths.filter(scopePathPredicate);
  return sortPaths(new Set(scopedPaths));
};

export const classifyPath = (relativePath, namingRolesRuntime) => {
  const runtime = resolveNamingRolesRuntime(namingRolesRuntime);
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
    const missingRoleCandidate = detectMissingRoleCandidate(basename);
    if (missingRoleCandidate && parsed.role === 'module' && parsed.extension === 'css') {
      return {
        code: 'NAMING_MISSING_ROLE',
        severity: 'info',
        path: normalizedPath,
        classification: 'legacy-exception',
        message: 'Filename appears to be missing the role segment; canonical format is <semantic-name>.<role>.<ext>.',
        ruleRef: 'doc/ConventionRoutines/FileNamingMasterList-V1_1.md#canonical-pattern',
        suggestedFix: 'Rename to <semantic-name>.<role>.<ext> using an active role.',
        details: missingRoleCandidate,
      };
    }

    const roleMetadata = getRoleMetadata(parsed.role, runtime.roleMetadata);

    if (isUnknownOrInactiveRole(parsed.role, roleMetadata, runtime.activeRoles)) {
      if (isDeprecatedRole(roleMetadata)) {
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

    if (!isCanonicalSemanticName(parsed.semanticName)) {
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

  const ambiguity = hasHyphenAppendedRoleAmbiguity(basename, runtime.roleSuffixes);
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

  const missingRoleCandidate = detectMissingRoleCandidate(basename);
  if (missingRoleCandidate) {
    return {
      code: 'NAMING_MISSING_ROLE',
      severity: 'info',
      path: normalizedPath,
      classification: 'legacy-exception',
      message: 'Filename appears to be missing the role segment; canonical format is <semantic-name>.<role>.<ext>.',
      ruleRef: 'doc/ConventionRoutines/FileNamingMasterList-V1_1.md#canonical-pattern',
      suggestedFix: 'Rename to <semantic-name>.<role>.<ext> using an active role.',
      details: missingRoleCandidate,
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
  const paths = collectRepositoryPaths(rootDirectory, {
    scope: selectedScope,
    reportableExtensions: options.reportableExtensions,
  });
  const findings = paths.map(pathname => classifyPath(pathname, options.namingRolesRuntime));

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
