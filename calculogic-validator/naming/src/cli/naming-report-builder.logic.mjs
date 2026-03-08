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
}) => {
  const summary = summarizeFindings(findings);

  return {
    mode: 'report',
    validatorId: 'naming',
    toolVersion,
    ...(toolVersion ? { validatorVersion: toolVersion } : {}),
    ...(configDigest ? { configDigest } : {}),
    sourceSnapshot,
    ...(registry
      ? {
          registryState: registry.registryState,
          registrySource: registry.registrySource,
          registryDigests: registry.registryDigests,
        }
      : {}),
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
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
    findings,
  };
};
