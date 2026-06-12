export const getValidatorReportIdentity = (registryEntry, fallback = {}) => {
  const reportMetadata = registryEntry?.metadata?.report ?? {};
  const fallbackId = fallback.id ?? registryEntry?.id;

  return {
    id: reportMetadata.entryId ?? fallbackId,
    validatorId:
      reportMetadata.validatorId ?? fallback.validatorId ?? registryEntry?.id ?? fallbackId,
    description: reportMetadata.description ?? fallback.description ?? registryEntry?.description,
    mode: reportMetadata.mode ?? fallback.mode ?? 'report',
  };
};
