import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
import { getBuiltinWalkExclusions } from './registries/naming-walk-exclusions.registry.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
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
  summarizeFindings,
} from './naming-validator.logic.mjs';
import {
  normalizePath,
  resolveScopedTargets,
  filterScopedPathsByTargets,
} from '../../src/core/scoped-target-paths.logic.mjs';

export const prepareNamingRuntimeInputs = (config) => {
  const registryInputs = resolveNamingRegistryInputs({ config });

  return {
    reportableExtensions: toReportableExtensionsSet(registryInputs.reportableExtensions),
    namingRolesRuntime: toNamingRolesRuntime(registryInputs.roles),
    walkExclusions: getBuiltinWalkExclusions(),
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
  const selectedScope = scope ?? 'repo';
  const inScopePaths = collectRepositoryPathsRuntime(repositoryRoot, {
    scope: selectedScope,
    reportableExtensions: runtimeInputs.reportableExtensions,
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
    walkExclusions: options.walkExclusions ?? runtimeInputs.walkExclusions,
  });
};

export const classifyPath = (relativePath, namingRolesRuntime, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);
  return classifyPathRuntime(relativePath, namingRolesRuntime ?? runtimeInputs.namingRolesRuntime);
};

export {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  normalizePath,
  listNamingValidatorScopes,
  getScopeProfile,
  summarizeFindings,
};
