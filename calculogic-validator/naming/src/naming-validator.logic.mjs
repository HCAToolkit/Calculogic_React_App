import path from 'node:path';
import fs from 'node:fs';
import {
  DEFAULT_VALIDATOR_SCOPE,
  listValidatorScopes,
  getValidatorScopeProfile,
} from '../../src/core/validator-scopes.runtime.mjs';
import {
  normalizePath,
  filterScopedPathsByProfile,
} from '../../src/core/scoped-target-paths.logic.mjs';
import { parseCanonicalName } from './rules/naming-rule-parse-canonical.logic.mjs';
import {
  getSpecialCaseType,
  isAllowedSpecialCase,
} from './rules/naming-rule-classify-special-case.logic.mjs';
import { hasHyphenAppendedRoleAmbiguity } from './rules/naming-rule-check-hyphen-role-ambiguity.logic.mjs';
import { isCanonicalSemanticName } from './rules/naming-rule-check-semantic-case.logic.mjs';
import { deriveDisambiguationHints } from './rules/naming-rule-derive-disambiguation-hints.logic.mjs';
import {
  deriveSemanticFamilyDetails,
  attachRelatedSemanticNames,
  isSemanticFamilyRootEvidenceFinding,
  isSingularSemanticFamilyEvidenceFinding,
} from './rules/naming-rule-derive-semantic-family.logic.mjs';
import {
  getRoleMetadata,
  isDeprecatedRole,
  isUnknownOrInactiveRole,
} from './rules/naming-rule-check-role.logic.mjs';

export { parseCanonicalName, getSpecialCaseType, isAllowedSpecialCase };

const isReportableFile = (relativePath, reportableExtensions, reportableRootFiles) => {
  const extension = path.extname(relativePath);
  if (reportableExtensions.has(extension)) {
    return true;
  }

  const basename = path.basename(relativePath);
  return reportableRootFiles.has(basename);
};

const assertPreparedReportableExtensions = (reportableExtensions) => {
  if (reportableExtensions instanceof Set) {
    return reportableExtensions;
  }

  throw new Error(
    'Naming runtime requires prepared reportableExtensions (Set) from wiring/runtime adapter.',
  );
};

const assertPreparedReportableRootFiles = (reportableRootFiles) => {
  if (reportableRootFiles instanceof Set) {
    return reportableRootFiles;
  }

  throw new Error(
    'Naming runtime requires prepared reportableRootFiles (Set) from wiring/runtime adapter.',
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




const assertPreparedMissingRolePatternsRuntime = (missingRolePatternsRuntime) => {
  if (Array.isArray(missingRolePatternsRuntime)) {
    return missingRolePatternsRuntime;
  }

  throw new Error(
    'Naming runtime requires prepared missingRolePatternsRuntime from wiring/runtime adapter.',
  );
};

const assertPreparedFindingPolicyRuntime = (findingPolicyRuntime) => {
  if (findingPolicyRuntime instanceof Map) {
    return findingPolicyRuntime;
  }

  throw new Error(
    'Naming runtime requires prepared findingPolicyRuntime (Map) from wiring/runtime adapter.',
  );
};

const assertPreparedCaseRulesRuntime = (caseRulesRuntime) => {
  if (
    caseRulesRuntime &&
    caseRulesRuntime.semanticName &&
    typeof caseRulesRuntime.semanticName.style === 'string' &&
    caseRulesRuntime.semanticName.pattern instanceof RegExp
  ) {
    return caseRulesRuntime;
  }

  throw new Error(
    'Naming runtime requires prepared caseRulesRuntime from wiring/runtime adapter.',
  );
};

const NAMING_DECISION_OUTCOME_IDS = Object.freeze({
  ALLOWED_SPECIAL_CASE: 'allowed-special-case',
  DEPRECATED_ROLE: 'deprecated-role',
  UNKNOWN_ROLE: 'unknown-role',
  BAD_SEMANTIC_CASE: 'bad-semantic-case',
  CANONICAL: 'canonical',
  ROLE_HYPHEN_AMBIGUITY: 'role-hyphen-ambiguity',
  MISSING_ROLE: 'missing-role',
  LEGACY_EXCEPTION: 'legacy-exception',
});

const interpolateMessageTemplate = (template, values = {}) =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (token, key) =>
    Object.hasOwn(values, key) ? String(values[key]) : token,
  );

const createFindingFromOutcome = ({
  outcomeId,
  path: normalizedPath,
  findingPolicyRuntime,
  messageValues,
  details,
}) => {
  const policy = findingPolicyRuntime.get(outcomeId);
  if (!policy) {
    throw new Error(
      `Missing naming finding policy for outcome "${outcomeId}" in prepared findingPolicyRuntime.`,
    );
  }

  const finding = {
    code: policy.code,
    severity: policy.severity,
    path: normalizedPath,
    classification: policy.classification,
    message: interpolateMessageTemplate(policy.message, messageValues),
    ruleRef: policy.ruleRef,
  };

  if (policy.suggestedFix) {
    finding.suggestedFix = interpolateMessageTemplate(policy.suggestedFix, messageValues);
  }

  if (details !== undefined) {
    finding.details = details;
  }

  return finding;
};

const assertPreparedSummaryBucketsRuntime = (summaryBucketsRuntime) => {
  if (
    summaryBucketsRuntime &&
    Array.isArray(summaryBucketsRuntime.classificationBuckets) &&
    Array.isArray(summaryBucketsRuntime.secondaryBucketFamilies)
  ) {
    return summaryBucketsRuntime;
  }

  throw new Error(
    'Naming summary requires prepared summaryBucketsRuntime from wiring/runtime adapter.',
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
  const reportableRootFiles = assertPreparedReportableRootFiles(options.reportableRootFiles);
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
      if (isReportableFile(normalizedPath, reportableExtensions, reportableRootFiles)) {
        collected.push(normalizedPath);
      }
    }
  };

  walk(absoluteRoot);
  return collected;
};

export const listNamingValidatorScopes = () => listValidatorScopes();

export const getScopeProfile = (scope) => getValidatorScopeProfile(scope);

const detectMissingRoleCandidate = (basename, missingRolePatternsRuntime) => {
  const segments = basename.split('.');

  for (const pattern of missingRolePatternsRuntime) {
    if (segments.length !== pattern.dotSegments) {
      continue;
    }

    const doesMatchLiteralConstraints = Object.entries(pattern.literalSegmentConstraints).every(
      ([segmentIndexRaw, segmentValue]) => segments[Number(segmentIndexRaw)] === segmentValue,
    );

    if (!doesMatchLiteralConstraints) {
      continue;
    }

    const extension =
      pattern.compoundExtension ||
      pattern.extensionSegmentIndexes.map((segmentIndex) => segments[segmentIndex]).join('.');

    return {
      semanticNameCandidate: segments[pattern.semanticSegmentIndex],
      extension,
    };
  }

  return null;
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const selectedScope = options.scope ?? DEFAULT_VALIDATOR_SCOPE;
  const profile = getScopeProfile(selectedScope);
  if (!profile) {
    throw new Error(`Invalid scope profile: ${selectedScope}`);
  }

  const allReportablePaths = collectPathsFromRoot(rootDirectory, '.', {
    reportableExtensions: options.reportableExtensions,
    reportableRootFiles: options.reportableRootFiles,
    walkExclusions: options.walkExclusions,
  });

  if (selectedScope === 'repo') {
    return sortPaths(new Set(allReportablePaths));
  }

  return filterScopedPathsByProfile(allReportablePaths, profile);
};

export const classifyPath = (
  relativePath,
  namingRolesRuntime,
  missingRolePatternsRuntime,
  findingPolicyRuntime,
  caseRulesRuntime,
) => {
  const runtime = assertPreparedNamingRolesRuntime(namingRolesRuntime);
  const missingRolePatterns = assertPreparedMissingRolePatternsRuntime(missingRolePatternsRuntime);
  const findingPolicy = assertPreparedFindingPolicyRuntime(findingPolicyRuntime);
  const caseRules = assertPreparedCaseRulesRuntime(caseRulesRuntime);
  const normalizedPath = normalizePath(relativePath);
  const basename = path.posix.basename(normalizedPath);

  const specialCaseType = getSpecialCaseType(normalizedPath);
  if (specialCaseType) {
    return createFindingFromOutcome({
      outcomeId: NAMING_DECISION_OUTCOME_IDS.ALLOWED_SPECIAL_CASE,
      path: normalizedPath,
      findingPolicyRuntime: findingPolicy,
      details: { specialCaseType },
    });
  }

  const parsed = parseCanonicalName(basename);
  if (parsed) {
    const missingRoleCandidate = detectMissingRoleCandidate(basename, missingRolePatterns);
    if (missingRoleCandidate && parsed.role === 'module' && parsed.extension === 'css') {
      return createFindingFromOutcome({
        outcomeId: NAMING_DECISION_OUTCOME_IDS.MISSING_ROLE,
        path: normalizedPath,
        findingPolicyRuntime: findingPolicy,
        details: missingRoleCandidate,
      });
    }

    const roleMetadata = getRoleMetadata(parsed.role, runtime.roleMetadata);

    if (isUnknownOrInactiveRole(parsed.role, roleMetadata, runtime.activeRoles)) {
      if (isDeprecatedRole(roleMetadata)) {
        return createFindingFromOutcome({
          outcomeId: NAMING_DECISION_OUTCOME_IDS.DEPRECATED_ROLE,
          path: normalizedPath,
          findingPolicyRuntime: findingPolicy,
          messageValues: { role: parsed.role },
          details: {
            ...parsed,
            roleStatus: roleMetadata.status,
            roleCategory: roleMetadata.category,
            deprecationNote: roleMetadata.notes,
          },
        });
      }

      return createFindingFromOutcome({
        outcomeId: NAMING_DECISION_OUTCOME_IDS.UNKNOWN_ROLE,
        path: normalizedPath,
        findingPolicyRuntime: findingPolicy,
        messageValues: { role: parsed.role },
        details: parsed,
      });
    }

    if (!isCanonicalSemanticName(parsed.semanticName, caseRules)) {
      return createFindingFromOutcome({
        outcomeId: NAMING_DECISION_OUTCOME_IDS.BAD_SEMANTIC_CASE,
        path: normalizedPath,
        findingPolicyRuntime: findingPolicy,
        messageValues: { semanticName: parsed.semanticName },
        details: {
          ...parsed,
          roleStatus: roleMetadata.status,
          roleCategory: roleMetadata.category,
        },
      });
    }

    const semanticFamilyDetails = deriveSemanticFamilyDetails({
      semanticName: parsed.semanticName,
    });
    const disambiguationHints = deriveDisambiguationHints({
      normalizedPath,
      parsed,
      namingRolesRuntime: runtime,
    });

    return createFindingFromOutcome({
      outcomeId: NAMING_DECISION_OUTCOME_IDS.CANONICAL,
      path: normalizedPath,
      findingPolicyRuntime: findingPolicy,
      details: {
        ...parsed,
        roleStatus: roleMetadata.status,
        roleCategory: roleMetadata.category,
        ...(semanticFamilyDetails ?? {}),
        ...(disambiguationHints ? { disambiguation: disambiguationHints } : {}),
      },
    });
  }

  const ambiguity = hasHyphenAppendedRoleAmbiguity(basename, runtime.roleSuffixes);
  if (ambiguity) {
    return createFindingFromOutcome({
      outcomeId: NAMING_DECISION_OUTCOME_IDS.ROLE_HYPHEN_AMBIGUITY,
      path: normalizedPath,
      findingPolicyRuntime: findingPolicy,
      messageValues: { role: ambiguity.role },
    });
  }

  const missingRoleCandidate = detectMissingRoleCandidate(basename, missingRolePatterns);
  if (missingRoleCandidate) {
    return createFindingFromOutcome({
      outcomeId: NAMING_DECISION_OUTCOME_IDS.MISSING_ROLE,
      path: normalizedPath,
      findingPolicyRuntime: findingPolicy,
      details: missingRoleCandidate,
    });
  }

  return createFindingFromOutcome({
    outcomeId: NAMING_DECISION_OUTCOME_IDS.LEGACY_EXCEPTION,
    path: normalizedPath,
    findingPolicyRuntime: findingPolicy,
  });
};

export const runNamingValidator = (preparedInputs = {}) => {
  const selectedPaths = assertPreparedSelectedPaths(preparedInputs.selectedPaths);
  const namingRolesRuntime = assertPreparedNamingRolesRuntime(preparedInputs.namingRolesRuntime);
  const resolvedTargets = Array.isArray(preparedInputs.targets) ? preparedInputs.targets : [];
  const missingRolePatternsRuntime = assertPreparedMissingRolePatternsRuntime(
    preparedInputs.missingRolePatternsRuntime,
  );
  const findingPolicyRuntime = assertPreparedFindingPolicyRuntime(
    preparedInputs.findingPolicyRuntime,
  );
  const caseRulesRuntime = assertPreparedCaseRulesRuntime(preparedInputs.caseRulesRuntime);
  const findings = attachRelatedSemanticNames(
    selectedPaths.map((pathname) =>
      classifyPath(
        pathname,
        namingRolesRuntime,
        missingRolePatternsRuntime,
        findingPolicyRuntime,
        caseRulesRuntime,
      ),
    ),
  );

  return {
    findings,
    totalFilesScanned: selectedPaths.length,
    scope: preparedInputs.scope ?? DEFAULT_VALIDATOR_SCOPE,
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

export const summarizeFindings = (findings, summaryBucketsRuntime) => {
  const summaryBuckets = assertPreparedSummaryBucketsRuntime(summaryBucketsRuntime);
  const counts = Object.fromEntries(
    summaryBuckets.classificationBuckets.map((classification) => [classification, 0]),
  );

  const secondaryCountsByFamily = Object.fromEntries(
    summaryBuckets.secondaryBucketFamilies.map((bucketFamily) => [bucketFamily, {}]),
  );

  secondaryCountsByFamily.familyRootCounts ??= {};
  secondaryCountsByFamily.familySubgroupCounts ??= {};
  secondaryCountsByFamily.semanticFamilyCounts ??= {};

  const incrementSecondaryFamilyCounter = (bucketFamily, counterKey) => {
    if (!secondaryCountsByFamily[bucketFamily]) {
      return;
    }

    incrementCounter(secondaryCountsByFamily[bucketFamily], counterKey);
  };

  for (const finding of findings) {
    incrementCounter(counts, finding.classification);
    incrementSecondaryFamilyCounter('codeCounts', finding.code);

    if (finding.details?.specialCaseType) {
      incrementSecondaryFamilyCounter('specialCaseTypeCounts', finding.details.specialCaseType);
    }

    if (finding.severity === 'warn' && finding.details?.roleStatus) {
      incrementSecondaryFamilyCounter('warningRoleStatusCounts', finding.details.roleStatus);
    }

    if (finding.severity === 'warn' && finding.details?.roleCategory) {
      incrementSecondaryFamilyCounter('warningRoleCategoryCounts', finding.details.roleCategory);
    }

    if (isSemanticFamilyRootEvidenceFinding(finding)) {
      incrementSecondaryFamilyCounter('familyRootCounts', finding.details.familyRoot);
    }

    if (isSingularSemanticFamilyEvidenceFinding(finding)) {
      if (finding.details.familySubgroup) {
        incrementSecondaryFamilyCounter('familySubgroupCounts', finding.details.familySubgroup);
      }

      incrementSecondaryFamilyCounter('semanticFamilyCounts', finding.details.semanticFamily);
    }
  }

  return {
    counts,
    codeCounts: sortCountObject(secondaryCountsByFamily.codeCounts ?? {}),
    specialCaseTypeCounts: sortCountObject(secondaryCountsByFamily.specialCaseTypeCounts ?? {}),
    warningRoleStatusCounts: sortCountObject(secondaryCountsByFamily.warningRoleStatusCounts ?? {}),
    warningRoleCategoryCounts: sortCountObject(secondaryCountsByFamily.warningRoleCategoryCounts ?? {}),
    familyRootCounts: sortCountObject(secondaryCountsByFamily.familyRootCounts ?? {}),
    familySubgroupCounts: sortCountObject(secondaryCountsByFamily.familySubgroupCounts ?? {}),
    semanticFamilyCounts: sortCountObject(secondaryCountsByFamily.semanticFamilyCounts ?? {}),
  };
};
