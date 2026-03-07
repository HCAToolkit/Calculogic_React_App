import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
} from './naming-runtime-converters.logic.mjs';
import {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  normalizePath,
  listNamingValidatorScopes,
  getScopeProfile,
  collectRepositoryPaths as collectRepositoryPathsRuntime,
  classifyPath as classifyPathRuntime,
  runNamingValidator as runNamingValidatorRuntime,
  summarizeFindings,
} from './naming-validator.logic.mjs';

export const prepareNamingRuntimeInputs = (config) => {
  const registryInputs = resolveNamingRegistryInputs({ config });

  return {
    reportableExtensions: toReportableExtensionsSet(registryInputs.reportableExtensions),
    namingRolesRuntime: toNamingRolesRuntime(registryInputs.roles),
    registry: {
      registryState: registryInputs.registryState,
      registrySource: registryInputs.registrySource,
      registryDigests: registryInputs.registryDigests,
    },
  };
};

export const runNamingValidator = (repositoryRoot, { scope, config, targets } = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(config);

  const result = runNamingValidatorRuntime(repositoryRoot, {
    scope,
    targets,
    reportableExtensions: runtimeInputs.reportableExtensions,
    namingRolesRuntime: runtimeInputs.namingRolesRuntime,
  });

  return {
    ...result,
    registry: runtimeInputs.registry,
  };
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);

  return collectRepositoryPathsRuntime(rootDirectory, {
    ...options,
    reportableExtensions: options.reportableExtensions ?? runtimeInputs.reportableExtensions,
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
