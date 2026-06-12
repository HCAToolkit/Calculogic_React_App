import { getValidatorReportIdentity } from './validator-report-identity.logic.mjs';
export const buildDirectValidatorReportEnvelope = ({
  registryEntry,
  fallbackValidatorId,
  toolVersion,
  configDigest,
  sourceSnapshot,
  startedAtDate,
  endedAtDate,
}) => {
  const reportIdentity = getValidatorReportIdentity(registryEntry, {
    validatorId: fallbackValidatorId,
  });

  return {
    mode: reportIdentity.mode,
    validatorId: reportIdentity.validatorId,
    toolVersion,
    ...(toolVersion ? { validatorVersion: toolVersion } : {}),
    ...(configDigest ? { configDigest } : {}),
    sourceSnapshot,
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
  };
};
