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
  collectRepositoryPaths,
  classifyPath,
  runNamingValidator as runNamingValidatorRuntime,
  summarizeFindings,
} from './naming-validator.logic.mjs';

export const runNamingValidator = (repositoryRoot, { scope, config, targets } = {}) => {
  const registryInputs = resolveNamingRegistryInputs({ config });
  const reportableExtensions = toReportableExtensionsSet(registryInputs.reportableExtensions);
  const namingRolesRuntime = toNamingRolesRuntime(registryInputs.roles);

  const result = runNamingValidatorRuntime(repositoryRoot, {
    scope,
    targets,
    reportableExtensions,
    namingRolesRuntime,
  });

  return {
    ...result,
    registry: {
      registryState: registryInputs.registryState,
      registrySource: registryInputs.registrySource,
      registryDigests: registryInputs.registryDigests,
    },
  };
};

export {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  normalizePath,
  listNamingValidatorScopes,
  getScopeProfile,
  collectRepositoryPaths,
  classifyPath,
  summarizeFindings,
};
