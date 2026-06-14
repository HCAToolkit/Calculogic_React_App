const BRIDGE_CONTRACT_VERSION = 'naming-occurrence-bridge.v1';
const BRIDGE_SOURCE = 'calculogic-validator/naming';
const BRIDGE_PRODUCER_ID = 'naming-semantic-family-occurrence-bridge';

const NAMING_SEMANTIC_FIELDS = [
  'semanticName',
  'semanticFamily',
  'familyRoot',
  'familySubgroup',
  'ambiguityFlags',
  'splitFamilyFlags',
];

const toOptionalNonEmptyString = (value) => (typeof value === 'string' && value.length > 0 ? value : null);

const cloneStringArray = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.length > 0) : null;

const toPathKey = (value) => toOptionalNonEmptyString(value);

const buildOccurrenceByPath = (occurrenceRecords) => {
  const occurrenceByPath = new Map();

  for (const occurrenceRecord of Array.isArray(occurrenceRecords) ? occurrenceRecords : []) {
    if (!occurrenceRecord || typeof occurrenceRecord !== 'object' || Array.isArray(occurrenceRecord)) {
      continue;
    }

    const repoRelativePath = toPathKey(occurrenceRecord.repoRelativePath) ?? toPathKey(occurrenceRecord.path);
    if (!repoRelativePath || occurrenceByPath.has(repoRelativePath)) {
      continue;
    }

    occurrenceByPath.set(repoRelativePath, occurrenceRecord);
  }

  return occurrenceByPath;
};

const copyNamingSemanticPayload = (observation) => {
  const payload = {};

  for (const field of NAMING_SEMANTIC_FIELDS) {
    if (field === 'ambiguityFlags' || field === 'splitFamilyFlags') {
      const clonedFlags = cloneStringArray(observation[field]);
      if (clonedFlags) {
        payload[field] = clonedFlags;
      }
      continue;
    }

    const fieldValue = toOptionalNonEmptyString(observation[field]);
    if (fieldValue) {
      payload[field] = fieldValue;
    }
  }

  return payload;
};

const toAddressAttachedObservation = ({
  semanticObservation,
  occurrenceRecord,
  addressProfileId,
  addressedSnapshotId,
}) => {
  const repoRelativePath =
    toPathKey(semanticObservation.repoRelativePath) ??
    toPathKey(occurrenceRecord.repoRelativePath) ??
    toPathKey(semanticObservation.path) ??
    toPathKey(occurrenceRecord.path);
  const occurrenceAddress =
    toOptionalNonEmptyString(occurrenceRecord.occurrenceAddress) ??
    toOptionalNonEmptyString(occurrenceRecord.address) ??
    toOptionalNonEmptyString(occurrenceRecord.addressPath);

  if (!addressProfileId || !addressedSnapshotId || !occurrenceAddress || !repoRelativePath) {
    return null;
  }

  return {
    addressProfileId,
    addressedSnapshotId,
    occurrenceAddress,
    repoRelativePath,
    path: toPathKey(semanticObservation.path) ?? repoRelativePath,
    ...(toOptionalNonEmptyString(occurrenceRecord.addressPath)
      ? { addressPath: occurrenceRecord.addressPath }
      : {}),
    ...(toOptionalNonEmptyString(occurrenceRecord.occurrenceType)
      ? { occurrenceType: occurrenceRecord.occurrenceType }
      : {}),
    ...copyNamingSemanticPayload(semanticObservation),
  };
};

const toMissingIdentityDiagnostic = ({ semanticObservation, reason }) => ({
  diagnosticType: 'missing-occurrence-identity',
  reason,
  repoRelativePath: toPathKey(semanticObservation.repoRelativePath) ?? toPathKey(semanticObservation.path) ?? null,
  path: toPathKey(semanticObservation.path) ?? null,
  semanticName: toOptionalNonEmptyString(semanticObservation.semanticName) ?? null,
});

export const createNamingOccurrenceBridgePayload = ({
  namingSemanticFamilyBridge = {},
  addressedOccurrenceNamespace = {},
  sourceReportRef,
  sourceSnapshotRef,
} = {}) => {
  const sourceObservations = Array.isArray(namingSemanticFamilyBridge.observations)
    ? namingSemanticFamilyBridge.observations
    : [];
  const addressProfileId = toOptionalNonEmptyString(addressedOccurrenceNamespace.addressProfileId);
  const addressedSnapshotId = toOptionalNonEmptyString(addressedOccurrenceNamespace.addressedSnapshotId);
  const occurrenceByPath = buildOccurrenceByPath(addressedOccurrenceNamespace.occurrenceRecords);

  const observations = [];
  const diagnostics = [];

  for (const semanticObservation of sourceObservations) {
    if (!semanticObservation || typeof semanticObservation !== 'object' || Array.isArray(semanticObservation)) {
      continue;
    }

    const pathKey = toPathKey(semanticObservation.repoRelativePath) ?? toPathKey(semanticObservation.path);
    if (!pathKey) {
      diagnostics.push(toMissingIdentityDiagnostic({ semanticObservation, reason: 'missing-path-key' }));
      continue;
    }

    const occurrenceRecord = occurrenceByPath.get(pathKey);
    if (!occurrenceRecord) {
      diagnostics.push(toMissingIdentityDiagnostic({ semanticObservation, reason: 'unmatched-occurrence-record' }));
      continue;
    }

    const observation = toAddressAttachedObservation({
      semanticObservation,
      occurrenceRecord,
      addressProfileId,
      addressedSnapshotId,
    });

    if (!observation) {
      diagnostics.push(toMissingIdentityDiagnostic({ semanticObservation, reason: 'incomplete-occurrence-identity' }));
      continue;
    }

    observations.push(observation);
  }

  return {
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    bridgeSource: BRIDGE_SOURCE,
    bridgeProducerId: BRIDGE_PRODUCER_ID,
    ...(addressProfileId ? { addressProfileId } : {}),
    ...(addressedSnapshotId ? { addressedSnapshotId } : {}),
    ...(sourceReportRef !== undefined ? { sourceReportRef } : {}),
    ...(sourceSnapshotRef !== undefined ? { sourceSnapshotRef } : {}),
    compatibility: {
      pathKeyedSemanticPayloadPreserved: true,
      temporaryCompatibilityPathField: 'path',
      temporaryDebugAddressPathField: 'addressPath',
      addressAttachedObservationsOmitMissingIdentity: true,
      sourceObservationCount: sourceObservations.length,
      addressAttachedObservationCount: observations.length,
      missingIdentityDiagnosticCount: diagnostics.length,
    },
    observations: observations.sort((left, right) =>
      left.addressProfileId.localeCompare(right.addressProfileId) ||
      left.addressedSnapshotId.localeCompare(right.addressedSnapshotId) ||
      left.occurrenceAddress.localeCompare(right.occurrenceAddress) ||
      left.repoRelativePath.localeCompare(right.repoRelativePath),
    ),
    ...(diagnostics.length > 0 ? { diagnostics } : {}),
  };
};
