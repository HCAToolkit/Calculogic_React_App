import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
import { getBuiltinWalkExclusions } from './registries/naming-walk-exclusions.registry.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
  toReportableRootFilesSet,
  toSummaryBucketsRuntime,
  toMissingRolePatternsRuntime,
  toFindingPolicyRuntime,
} from './naming-runtime-converters.logic.mjs';
import {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  collectRepositoryPaths as collectRepositoryPathsRuntime,
  classifyPath as classifyPathRuntime,
  runNamingValidator as runNamingValidatorRuntime,
  listNamingValidatorScopes,
  getScopeProfile,
  summarizeFindings as summarizeFindingsRuntime,
} from './naming-validator.logic.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from '../../src/core/scoped-target-paths.logic.mjs';
import { DEFAULT_VALIDATOR_SCOPE } from '../../src/core/validator-scopes.runtime.mjs';

export const prepareNamingRuntimeInputs = (config) => {
  const registryInputs = resolveNamingRegistryInputs({ config });

  return {
    reportableExtensions: toReportableExtensionsSet(registryInputs.reportableExtensions),
    reportableRootFiles: toReportableRootFilesSet(registryInputs.reportableRootFiles),
    namingRolesRuntime: toNamingRolesRuntime(registryInputs.roles),
    walkExclusions: getBuiltinWalkExclusions(),
    summaryBucketsRuntime: toSummaryBucketsRuntime(registryInputs.summaryBuckets),
    missingRolePatternsRuntime: toMissingRolePatternsRuntime(registryInputs.missingRolePatterns),
    findingPolicyRuntime: toFindingPolicyRuntime(registryInputs.findingPolicy),
    registry: {
      registryState: registryInputs.registryState,
      registrySource: registryInputs.registrySource,
      registryDigests: registryInputs.registryDigests,
    },
  };
};

export const prepareNamingValidatorInputs = (
  repositoryRoot,
  { scope, config, targets } = {},
) => {
  const runtimeInputs = prepareNamingRuntimeInputs(config);
  const selectedScope = scope ?? DEFAULT_VALIDATOR_SCOPE;
  const inScopePaths = collectRepositoryPathsRuntime(repositoryRoot, {
    scope: selectedScope,
    reportableExtensions: runtimeInputs.reportableExtensions,
    reportableRootFiles: runtimeInputs.reportableRootFiles,
    walkExclusions: runtimeInputs.walkExclusions,
  });
  const resolvedTargets = resolveScopedTargets(repositoryRoot, targets ?? []);

  return {
    ...runtimeInputs,
    scope: selectedScope,
    selectedPaths: filterScopedPathsByTargets(repositoryRoot, inScopePaths, resolvedTargets),
    targets: resolvedTargets.map((target) => target.relPath),
  };
};

export const runNamingValidator = (repositoryRoot, { scope, config, targets } = {}) => {
  const preparedInputs = prepareNamingValidatorInputs(repositoryRoot, { scope, config, targets });

  const result = runNamingValidatorRuntime(preparedInputs);

  return {
    ...result,
    registry: preparedInputs.registry,
  };
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);

  return collectRepositoryPathsRuntime(rootDirectory, {
    ...options,
    reportableExtensions: options.reportableExtensions ?? runtimeInputs.reportableExtensions,
    reportableRootFiles: options.reportableRootFiles ?? runtimeInputs.reportableRootFiles,
    walkExclusions: options.walkExclusions ?? runtimeInputs.walkExclusions,
  });
};

export const classifyPath = (relativePath, namingRolesRuntime, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);
  return classifyPathRuntime(
    relativePath,
    namingRolesRuntime ?? runtimeInputs.namingRolesRuntime,
    runtimeInputs.missingRolePatternsRuntime,
    runtimeInputs.findingPolicyRuntime,
  );
};

export const summarizeFindings = (findings, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);
  const summaryBucketsRuntime = options.summaryBucketsRuntime ?? runtimeInputs.summaryBucketsRuntime;
  return summarizeFindingsRuntime(findings, summaryBucketsRuntime);
};

export {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  normalizePath,
  listNamingValidatorScopes,
  getScopeProfile,
};
