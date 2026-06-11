export const buildDirectValidatorReportEnvelope = ({
  registryEntry,
  fallbackValidatorId,
  toolVersion,
  configDigest,
  sourceSnapshot,
  startedAtDate,
  endedAtDate,
}) => {
  const reportMetadata = registryEntry?.metadata?.report ?? {};
  const validatorId = reportMetadata.validatorId ?? registryEntry?.id ?? fallbackValidatorId;
  const mode = reportMetadata.mode ?? 'report';

  return {
    mode,
    validatorId,
    toolVersion,
    ...(toolVersion ? { validatorVersion: toolVersion } : {}),
    ...(configDigest ? { configDigest } : {}),
    sourceSnapshot,
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
  };
};
