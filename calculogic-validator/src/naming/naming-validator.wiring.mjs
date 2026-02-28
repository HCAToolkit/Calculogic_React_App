import { REPORTABLE_EXTENSIONS } from './registries/naming-extensions.knowledge.mjs';
import {
  ROLE_METADATA,
} from './registries/naming-roles.knowledge.mjs';
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

const deriveReportableExtensions = config => {
  const additions = config?.naming?.reportableExtensions?.add ?? [];
  return new Set([...REPORTABLE_EXTENSIONS, ...additions]);
};

const deriveNamingRolesRuntime = config => {
  const additions = config?.naming?.roles?.add ?? [];
  const roleMetadata = new Map(ROLE_METADATA);

  additions.forEach(entry => {
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

export const runNamingValidator = (repositoryRoot, { scope, config, targets } = {}) =>
  runNamingValidatorRuntime(repositoryRoot, {
    scope,
    targets,
    reportableExtensions: deriveReportableExtensions(config),
    namingRolesRuntime: deriveNamingRolesRuntime(config),
  });

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
