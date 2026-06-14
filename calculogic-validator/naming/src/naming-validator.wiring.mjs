import { resolveNamingRegistryInputs } from './registries/registry-state.logic.mjs';
import { getBuiltinWalkExclusions } from './registries/naming-walk-exclusions-registry.logic.mjs';
import {
  toNamingRolesRuntime,
  toReportableExtensionsSet,
  toReportableRootFilesSet,
  toSummaryBucketsRuntime,
  toMissingRolePatternsRuntime,
  toFindingPolicyRuntime,
  toCaseRulesRuntime,
} from './naming-runtime-converters.logic.mjs';
import {
  parseCanonicalName,
  getSpecialCaseType,
  isAllowedSpecialCase,
  classifyPath as classifyPathRuntime,
  runNamingValidator as runNamingValidatorRuntime,
  listNamingValidatorScopes,
  getScopeProfile,
  summarizeFindings as summarizeFindingsRuntime,
} from './naming-validator.logic.mjs';
import { projectNamingSemanticFamilyBridge } from './naming-semantic-family-bridge-projection.logic.mjs';
import { createNamingOccurrenceBridgePayload } from './naming-occurrence-bridge-payload.logic.mjs';
import { prepareNamingSemanticEvidenceBridge } from './naming-semantic-evidence-bridge.logic.mjs';
import { normalizePath } from '../../src/core/scoped-target-paths.logic.mjs';
import { collectValidatorCandidatePaths } from '../../src/core/validator-candidate-collection.logic.mjs';
import { createValidatorCandidatePolicyFromValues } from '../../src/core/validator-candidate-policy.logic.mjs';
import { DEFAULT_VALIDATOR_SCOPE } from '../../src/core/validator-scopes.logic.mjs';

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
    caseRulesRuntime: toCaseRulesRuntime(registryInputs.caseRules),
    registry: {
      registryState: registryInputs.registryState,
      registrySource: registryInputs.registrySource,
      registryDigests: registryInputs.registryDigests,
    },
  };
};

const createNamingCandidatePolicy = ({
  reportableExtensions,
  reportableRootFiles,
  walkExclusions,
}) =>
  createValidatorCandidatePolicyFromValues({
    candidateExtensions: reportableExtensions,
    candidateRootFiles: reportableRootFiles,
    walkExclusions,
  });

const collectNamingCandidatePaths = (repositoryRoot, {
  scope,
  targets = [],
  reportableExtensions,
  reportableRootFiles,
  walkExclusions,
}) =>
  collectValidatorCandidatePaths(repositoryRoot, {
    scope,
    targets,
    skipSymlinkedCandidateScopeRoots: true,
    candidatePolicy: createNamingCandidatePolicy({
      reportableExtensions,
      reportableRootFiles,
      walkExclusions,
    }),
  });

export const prepareNamingValidatorInputs = (
  repositoryRoot,
  { scope, config, targets } = {},
) => {
  const runtimeInputs = prepareNamingRuntimeInputs(config);
  const selectedScope = scope ?? DEFAULT_VALIDATOR_SCOPE;
  const candidatePaths = collectNamingCandidatePaths(repositoryRoot, {
    scope: selectedScope,
    targets: targets ?? [],
    reportableExtensions: runtimeInputs.reportableExtensions,
    reportableRootFiles: runtimeInputs.reportableRootFiles,
    walkExclusions: runtimeInputs.walkExclusions,
  });

  return {
    ...runtimeInputs,
    scope: candidatePaths.scope,
    selectedPaths: candidatePaths.selectedPaths,
    targets: candidatePaths.targets,
  };
};

export const projectNamingOccurrenceBridge = (namingRuntimeOrReportOutput = {}, options = {}) =>
  createNamingOccurrenceBridgePayload({
    namingSemanticFamilyBridge: options.namingSemanticFamilyBridge ??
      projectNamingSemanticFamilyBridge(namingRuntimeOrReportOutput),
    addressedOccurrenceNamespace: options.addressedOccurrenceNamespace,
    sourceReportRef: options.sourceReportRef,
    sourceSnapshotRef: options.sourceSnapshotRef,
  });

export const runNamingValidator = (repositoryRoot, { scope, config, targets, addressedOccurrenceNamespace } = {}) => {
  const preparedInputs = prepareNamingValidatorInputs(repositoryRoot, { scope, config, targets });

  const result = runNamingValidatorRuntime(preparedInputs);
  const namingOccurrenceBridge = addressedOccurrenceNamespace !== undefined
    ? projectNamingOccurrenceBridge(result, { addressedOccurrenceNamespace })
    : undefined;

  return {
    ...result,
    registry: preparedInputs.registry,
    ...(namingOccurrenceBridge ? { namingOccurrenceBridge } : {}),
  };
};

export const collectRepositoryPaths = (rootDirectory, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);

  return collectNamingCandidatePaths(rootDirectory, {
    scope: options.scope,
    targets: options.targets ?? [],
    reportableExtensions: options.reportableExtensions ?? runtimeInputs.reportableExtensions,
    reportableRootFiles: options.reportableRootFiles ?? runtimeInputs.reportableRootFiles,
    walkExclusions: options.walkExclusions ?? runtimeInputs.walkExclusions,
  }).selectedPaths;
};

export const classifyPath = (relativePath, namingRolesRuntime, options = {}) => {
  const runtimeInputs = prepareNamingRuntimeInputs(options.config);
  return classifyPathRuntime(
    relativePath,
    namingRolesRuntime ?? runtimeInputs.namingRolesRuntime,
    runtimeInputs.missingRolePatternsRuntime,
    runtimeInputs.findingPolicyRuntime,
    runtimeInputs.caseRulesRuntime,
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
  projectNamingSemanticFamilyBridge,
  createNamingOccurrenceBridgePayload,
  prepareNamingSemanticEvidenceBridge,
};
