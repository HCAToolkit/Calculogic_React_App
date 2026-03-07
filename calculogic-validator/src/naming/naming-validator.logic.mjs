import path from 'node:path';
import fs from 'node:fs';
import { listValidatorScopes, getValidatorScopeProfile } from '../core/validator-scopes.runtime.mjs';
import {
  normalizePath,
  filterScopedPathsByProfile,
} from '../core/scoped-target-paths.logic.mjs';
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

export { parseCanonicalName, getSpecialCaseType, isAllowedSpecialCase };

const isReportableFile = (relativePath, reportableExtensions) => {
  const extension = path.extname(relativePath);
  if (reportableExtensions.has(extension)) {
    return true;
  }

  return (
    path.basename(relativePath) === 'package-lock.json' ||
    path.basename(relativePath) === 'package.json'
  );
};

const assertPreparedReportableExtensions = (reportableExtensions) => {
  if (reportableExtensions instanceof Set) {
    return reportableExtensions;
  }

  throw new Error(
    'Naming runtime requires prepared reportableExtensions (Set) from wiring/runtime adapter.',
  );
};

const assertPreparedNamingRolesRuntime = (namingRolesRuntime) => {
  if (
    namingRolesRuntime &&
    namingRolesRuntime.roleMetadata instanceof Map &&
    namingRolesRuntime.activeRoles instanceof Set &&
    Array.isArray(namingRolesRuntime.roleSuffixes)
  ) {
    return namingRolesRuntime;
  }

  throw new Error(
    'Naming runtime requires prepared namingRolesRuntime from wiring/runtime adapter.',
  );
};


const assertPreparedWalkExclusions = (walkExclusions) => {
  if (
    walkExclusions &&
    walkExclusions.excludedDirectories instanceof Set &&
    typeof walkExclusions.skipDotDirectories === 'boolean' &&
    walkExclusions.allowDotFiles instanceof Set
  ) {
    return walkExclusions;
  }

  throw new Error(
    'Naming runtime requires prepared walkExclusions from wiring/runtime adapter.',
  );
};

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

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

  const reportableExtensions = assertPreparedReportableExtensions(options.reportableExtensions);
  const walkExclusions = assertPreparedWalkExclusions(options.walkExclusions);
  const collected = [];

  const walk = (absoluteDirectoryPath) => {
    const entries = fs.readdirSync(absoluteDirectoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const isDotEntry = entry.name.startsWith('.');

      if (entry.isDirectory()) {
        if (walkExclusions.excludedDirectories.has(entry.name)) {
          continue;
        }

        if (isDotEntry && walkExclusions.skipDotDirectories) {
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

export const listNamingValidatorScopes = () => listValidatorScopes();

export const getScopeProfile = (scope) => getValidatorScopeProfile(scope);

const detectMissingRoleCandidate = (basename) => {
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
    walkExclusions: options.walkExclusions,
  });

  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  return filterScopedPathsByProfile(allReportablePaths, profile);
};

export const classifyPath = (relativePath, namingRolesRuntime) => {
  const runtime = assertPreparedNamingRolesRuntime(namingRolesRuntime);
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
      ruleRef:
        'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#allowed-special-cases-and-reserved-filenames-v12',
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
        message:
          'Filename appears to be missing the role segment; canonical format is <semantic-name>.<role>.<ext>.',
        ruleRef:
          'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#canonical-pattern',
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
          ruleRef:
            'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#role-registry-master-list-v1',
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
        ruleRef:
          'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#role-registry-master-list-v1',
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
        ruleRef:
          'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#semantic-name',
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
      ruleRef:
        'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#core-filename-grammar',
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
      ruleRef:
        'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#role-suffix-separation-rule-important',
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
      message:
        'Filename appears to be missing the role segment; canonical format is <semantic-name>.<role>.<ext>.',
      ruleRef:
        'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#canonical-pattern',
      suggestedFix: 'Rename to <semantic-name>.<role>.<ext> using an active role.',
      details: missingRoleCandidate,
    };
  }

  return {
    code: 'NAMING_LEGACY_EXCEPTION',
    severity: 'info',
    path: normalizedPath,
    classification: 'legacy-exception',
    message:
      'Filename does not match canonical format and is treated as incremental legacy exception in report mode.',
    ruleRef:
      'calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md#legacy-file-reality-important',
  };
};

export const runNamingValidator = (preparedInputs = {}) => {
  const selectedPaths = assertPreparedSelectedPaths(preparedInputs.selectedPaths);
  const namingRolesRuntime = assertPreparedNamingRolesRuntime(preparedInputs.namingRolesRuntime);
  const resolvedTargets = Array.isArray(preparedInputs.targets) ? preparedInputs.targets : [];
  const findings = selectedPaths.map((pathname) => classifyPath(pathname, namingRolesRuntime));

  return {
    findings,
    totalFilesScanned: selectedPaths.length,
    scope: preparedInputs.scope ?? 'repo',
    filters: {
      isFiltered: resolvedTargets.length > 0,
      ...(resolvedTargets.length > 0
        ? {
            targets: resolvedTargets,
          }
        : {}),
    },
  };
};

const assertPreparedSelectedPaths = (selectedPaths) => {
  if (Array.isArray(selectedPaths)) {
    return selectedPaths;
  }

  throw new Error('Naming runtime requires prepared selectedPaths from wiring/runtime adapter.');
};

const incrementCounter = (counts, key) => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const sortCountObject = (counts) =>
  Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));

export const summarizeFindings = (findings) => {
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
