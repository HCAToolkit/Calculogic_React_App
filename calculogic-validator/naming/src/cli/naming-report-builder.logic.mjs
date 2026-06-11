import { buildDirectValidatorReportEnvelope } from '../../../src/core/validator-direct-report.logic.mjs';
import { summarizeFindings } from '../naming-validator.host.mjs';

export const buildNamingValidatorReport = ({
  findings,
  totalFilesScanned,
  scope,
  filters,
  registry,
  toolVersion,
  configDigest,
  sourceSnapshot,
  selectedScopeProfile,
  startedAtDate,
  endedAtDate,
  registryEntry,
}) => {
  const summary = summarizeFindings(findings);

  return {
    ...buildDirectValidatorReportEnvelope({
      registryEntry,
      fallbackValidatorId: 'naming',
      toolVersion,
      configDigest,
      sourceSnapshot,
      startedAtDate,
      endedAtDate,
    }),
    ...(registry
      ? {
          registryState: registry.registryState,
          registrySource: registry.registrySource,
          registryDigests: registry.registryDigests,
        }
      : {}),
    scope,
    totalFilesScanned,
    filters,
    scopeSummary: {
      scope,
      reportableFilesInScope: totalFilesScanned,
      findingsGenerated: findings.length,
    },
    scopeContract: {
      description: selectedScopeProfile?.description ?? '',
      includeRoots: selectedScopeProfile?.includeRoots ?? [],
      includeRootFiles: selectedScopeProfile?.includeRootFiles ?? [],
    },
    counts: summary.counts,
    codeCounts: summary.codeCounts,
    specialCaseTypeCounts: summary.specialCaseTypeCounts,
    warningRoleStatusCounts: summary.warningRoleStatusCounts,
    warningRoleCategoryCounts: summary.warningRoleCategoryCounts,
    familyRootCounts: summary.familyRootCounts,
    familySubgroupCounts: summary.familySubgroupCounts,
    semanticFamilyCounts: summary.semanticFamilyCounts,
    findings,
  };
};
