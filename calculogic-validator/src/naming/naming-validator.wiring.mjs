import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
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

const toReportableExtensionsSet = extensionArray => new Set(extensionArray);

const toNamingRolesRuntime = rolesArray => {
  const roleMetadata = new Map();

  rolesArray.forEach(entry => {
    if (!roleMetadata.has(entry.role)) {
      roleMetadata.set(entry.role, entry);
    }
  });

  const activeRoles = new Set(
    Array.from(roleMetadata.values())
      .filter(entry => entry.status === 'active')
      .map(entry => entry.role),
  );

  const roleSuffixes = Array.from(roleMetadata.keys()).sort((left, right) => right.length - left.length);

  return {
    roleMetadata,
    activeRoles,
    roleSuffixes,
  };
};

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
