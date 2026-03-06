import path from 'node:path';
import fs from 'node:fs';
import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
import { BUILTIN_WALK_EXCLUSIONS } from './registries/naming-special-cases.knowledge.mjs';
import {
  listValidatorScopes,
  getValidatorScopeProfile,
} from './registries/naming-scope-profiles.knowledge.mjs';
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

export const normalizePath = (relativePath) => relativePath.split(path.sep).join('/');

export { parseCanonicalName, getSpecialCaseType, isAllowedSpecialCase };


const toReportableExtensionsSet = (extensionArray) => new Set(extensionArray);

const toNamingRolesRuntime = (rolesArray) => {
  const roleMetadata = new Map();

  rolesArray.forEach((entry) => {
    if (!roleMetadata.has(entry.role)) {
      roleMetadata.set(entry.role, entry);
    }
  });

  const activeRoles = new Set(
    Array.from(roleMetadata.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.role),
  );

  const roleSuffixes = Array.from(roleMetadata.keys()).sort(
    (left, right) => right.length - left.length,
  );

  return {
    roleMetadata,
    activeRoles,
    roleSuffixes,
  };
};

const BUILTIN_NAMING_REGISTRY_INPUTS = resolveNamingRegistryInputs();
const DEFAULT_NAMING_ROLES_RUNTIME = toNamingRolesRuntime(BUILTIN_NAMING_REGISTRY_INPUTS.roles);
const DEFAULT_REPORTABLE_EXTENSIONS = toReportableExtensionsSet(
  BUILTIN_NAMING_REGISTRY_INPUTS.reportableExtensions,
);

const resolveNamingRolesRuntime = (namingRolesRuntime) =>
  namingRolesRuntime ?? DEFAULT_NAMING_ROLES_RUNTIME;

const isReportableFile = (relativePath, reportableExtensions = DEFAULT_REPORTABLE_EXTENSIONS) => {
  const extension = path.extname(relativePath);
  if (reportableExtensions.has(extension)) {
    return true;
  }

  return (
    path.basename(relativePath) === 'package-lock.json' ||
    path.basename(relativePath) === 'package.json'
  );
};

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

const isPathOutsideRoot = (relativePath) =>
  relativePath.startsWith('..') || path.isAbsolute(relativePath);

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

  const reportableExtensions = options.reportableExtensions ?? DEFAULT_REPORTABLE_EXTENSIONS;
  const walkExclusions = options.walkExclusions ?? BUILTIN_WALK_EXCLUSIONS;
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

const buildScopePathPredicate = (profile) => {
  const includeRootSet = new Set(profile.includeRoots.map(normalizePath));
  const includeRootFileSet = new Set(profile.includeRootFiles.map(normalizePath));

  return (relativePath) => {
    const normalizedPath = normalizePath(relativePath);
    if (normalizedPath.includes('/')) {
      const firstSegment = normalizedPath.split('/')[0];
      return includeRootSet.has(firstSegment);
    }

    return includeRootFileSet.has(normalizedPath);
  };
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
  });

  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  const scopePathPredicate = buildScopePathPredicate(profile);
  const scopedPaths = allReportablePaths.filter(scopePathPredicate);
  return sortPaths(new Set(scopedPaths));
};

export const resolveNamingValidatorTargets = (rootDirectory, targets = []) => {
  if (!targets?.length) {
    return [];
  }

  const repositoryRoot = fs.realpathSync(rootDirectory);
  const resolvedTargets = [];
  const dedupeByAbsolutePath = new Set();

  for (const rawTarget of targets) {
    const trimmedTarget = String(rawTarget ?? '').trim();
    const normalizedInput = trimmedTarget.replaceAll('\\', '/');

    if (!normalizedInput) {
      throw new Error('Target path must be a non-empty string.');
    }

    const absoluteCandidatePath = path.isAbsolute(trimmedTarget)
      ? path.resolve(trimmedTarget)
      : path.resolve(rootDirectory, normalizedInput);

    if (!fs.existsSync(absoluteCandidatePath)) {
      throw new Error(`Target path does not exist: ${normalizedInput}`);
    }

    const absoluteRealPath = fs.realpathSync(absoluteCandidatePath);
    const relativeToRoot = path.relative(repositoryRoot, absoluteRealPath);
    if (isPathOutsideRoot(relativeToRoot)) {
      throw new Error(`Target path escapes repository root: ${normalizedInput}`);
    }

    if (dedupeByAbsolutePath.has(absoluteRealPath)) {
      continue;
    }

    const targetStat = fs.statSync(absoluteRealPath);
    const kind = targetStat.isDirectory() ? 'dir' : targetStat.isFile() ? 'file' : null;
    if (!kind) {
      throw new Error(`Target path must be a file or directory: ${normalizedInput}`);
    }

    dedupeByAbsolutePath.add(absoluteRealPath);
    resolvedTargets.push({
      absPath: absoluteRealPath,
      relPath: relativeToRoot ? normalizePath(relativeToRoot) : '.',
      kind,
    });
  }

  return resolvedTargets.sort((left, right) => left.relPath.localeCompare(right.relPath));
};

export const filterRepositoryPathsByTargets = (
  rootDirectory,
  relativePaths,
  resolvedTargets = [],
) => {
  if (!resolvedTargets.length) {
    return sortPaths(new Set(relativePaths));
  }

  const selectedPaths = relativePaths.filter((relativePath) => {
    const absolutePath = path.resolve(rootDirectory, relativePath);

    return resolvedTargets.some((target) => {
      if (target.kind === 'file') {
        return absolutePath === target.absPath;
      }

      return (
        absolutePath === target.absPath || absolutePath.startsWith(`${target.absPath}${path.sep}`)
      );
    });
  });

  return sortPaths(new Set(selectedPaths));
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

export const runNamingValidator = (rootDirectory, options = {}) => {
  const selectedScope = options.scope ?? 'repo';
  const inScopePaths = collectRepositoryPaths(rootDirectory, {
    scope: selectedScope,
    reportableExtensions: options.reportableExtensions,
  });
  const resolvedTargets = resolveNamingValidatorTargets(rootDirectory, options.targets ?? []);
  const paths = filterRepositoryPathsByTargets(rootDirectory, inScopePaths, resolvedTargets);
  const findings = paths.map((pathname) => classifyPath(pathname, options.namingRolesRuntime));

  return {
    findings,
    totalFilesScanned: paths.length,
    scope: selectedScope,
    filters: {
      isFiltered: resolvedTargets.length > 0,
      ...(resolvedTargets.length > 0
        ? {
            targets: resolvedTargets.map((target) => target.relPath),
          }
        : {}),
    },
  };
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
