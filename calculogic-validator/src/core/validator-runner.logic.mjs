import { CALCULOGIC_VALIDATOR_REPORT_VERSION } from './validator-report.contracts.mjs';
import { VALIDATOR_REGISTRY, getValidatorById } from './validator-registry.knowledge.mjs';
import { getSourceSnapshot } from './source-snapshot.logic.mjs';
import { projectNamingSemanticFamilyBridge } from '../../naming/src/naming-validator.host.mjs';

const toValidatorReportEntry = (registryEntry, validatorResult) => {
  const summary = validatorResult.summary ?? null;
  const counts = summary?.counts;
  const passThroughSummary = summary
    ? Object.fromEntries(Object.entries(summary).filter(([key]) => key !== 'counts'))
    : {};

  return {
    id: registryEntry.id,
    validatorId: registryEntry.id,
    description: registryEntry.description,
    scope: validatorResult.scope,
    totalFilesScanned: validatorResult.totalFilesScanned,
    ...(counts ? { counts } : {}),
    ...passThroughSummary,
    findings: validatorResult.findings,
    ...(validatorResult.meta ? { meta: validatorResult.meta } : {}),
  };
};

const resolveValidatorsToRun = (selectedValidatorIds) => {
  if (!selectedValidatorIds || selectedValidatorIds.length === 0) {
    return VALIDATOR_REGISTRY;
  }

  const selectedSet = new Set(selectedValidatorIds);
  for (const selectedId of selectedSet) {
    if (!getValidatorById(selectedId)) {
      throw new Error(`Unknown validator id: ${selectedId}`);
    }
  }

  return VALIDATOR_REGISTRY.filter((validator) => selectedSet.has(validator.id));
};

export const runValidatorRunner = (repositoryRoot, options = {}) => {
  const startedAtDate = new Date();
  const validatorsToRun = resolveValidatorsToRun(options.validators);
  const scope = options.scope;
  const config = options.config;
  const targets = options.targets;

  const shouldRunTreeStructureAdvisor = validatorsToRun.some(
    (registryEntry) => registryEntry.id === 'tree-structure-advisor',
  );
  const shouldIncludeNamingReport = validatorsToRun.some((registryEntry) => registryEntry.id === 'naming');
  const namingRegistryEntry = getValidatorById('naming');

  let stagedNamingResult = null;
  let stagedNamingSemanticFamilyBridge = undefined;
  if (shouldRunTreeStructureAdvisor && namingRegistryEntry) {
    stagedNamingResult = namingRegistryEntry.run(repositoryRoot, { scope, config, targets });
    stagedNamingSemanticFamilyBridge = projectNamingSemanticFamilyBridge(stagedNamingResult);
  }

  const validators = validatorsToRun.map((registryEntry) => {
    if (registryEntry.id === 'naming' && shouldIncludeNamingReport && stagedNamingResult) {
      return toValidatorReportEntry(registryEntry, stagedNamingResult);
    }

    const result = registryEntry.run(repositoryRoot, {
      scope,
      config,
      targets,
      ...(registryEntry.id === 'tree-structure-advisor' && stagedNamingSemanticFamilyBridge
        ? { namingSemanticFamilyBridge: stagedNamingSemanticFamilyBridge }
        : {}),
    });
    return toValidatorReportEntry(registryEntry, result);
  });

  const endedAtDate = new Date();
  const sourceSnapshot = getSourceSnapshot({ cwd: repositoryRoot });

  return {
    version: CALCULOGIC_VALIDATOR_REPORT_VERSION,
    mode: 'report',
    ...(scope ? { scope } : {}),
    validatorId: 'runner',
    ...(options.toolVersion ? { toolVersion: options.toolVersion } : {}),
    ...(options.toolVersion ? { validatorVersion: options.toolVersion } : {}),
    ...(options.configDigest ? { configDigest: options.configDigest } : {}),
    sourceSnapshot,
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
    validators,
  };
};
