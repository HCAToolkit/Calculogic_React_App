import { REPORTABLE_EXTENSIONS } from './registries/naming-extensions.knowledge.mjs';
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

export const runNamingValidator = (repositoryRoot, { scope, config } = {}) =>
  runNamingValidatorRuntime(repositoryRoot, {
    scope,
    reportableExtensions: deriveReportableExtensions(config),
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
