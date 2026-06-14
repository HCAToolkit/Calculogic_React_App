const BRIDGE_CONTRACT_VERSION = 'naming-occurrence-bridge.v1';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toNonEmptyString = (value) => (typeof value === 'string' && value.length > 0 ? value : null);

const toPayloadFromTransport = ({ namingOccurrenceBridge, namingSemanticFamilyBridge } = {}) => {
  if (namingOccurrenceBridge !== undefined) {
    return namingOccurrenceBridge;
  }

  if (isPlainObject(namingSemanticFamilyBridge) && namingSemanticFamilyBridge.namingOccurrenceBridge !== undefined) {
    return namingSemanticFamilyBridge.namingOccurrenceBridge;
  }

  return undefined;
};

const normalizeObservationIdentityTuple = (observation) => {
  if (!isPlainObject(observation)) {
    return null;
  }

  const addressProfileId = toNonEmptyString(observation.addressProfileId);
  const addressedSnapshotId = toNonEmptyString(observation.addressedSnapshotId);
  const occurrenceAddress = toNonEmptyString(observation.occurrenceAddress);

  if (!addressProfileId || !addressedSnapshotId || !occurrenceAddress) {
    return null;
  }

  return {
    addressProfileId,
    addressedSnapshotId,
    occurrenceAddress,
  };
};

export const prepareTreeNamingOccurrenceBridgeIntake = ({
  namingOccurrenceBridge,
  namingSemanticFamilyBridge,
} = {}) => {
  const payload = toPayloadFromTransport({ namingOccurrenceBridge, namingSemanticFamilyBridge });

  if (payload === undefined) {
    return {
      boundary: 'tree-naming-occurrence-bridge-intake',
      status: 'absent',
      recognized: false,
      usedForCurrentTreeJoins: false,
      identityTuples: [],
      diagnostics: [],
    };
  }

  const diagnostics = [];
  if (!isPlainObject(payload)) {
    return {
      boundary: 'tree-naming-occurrence-bridge-intake',
      status: 'invalid',
      recognized: false,
      usedForCurrentTreeJoins: false,
      identityTuples: [],
      diagnostics: [{ reason: 'payload-not-object' }],
    };
  }

  if (payload.bridgeContractVersion !== BRIDGE_CONTRACT_VERSION) {
    diagnostics.push({
      reason: 'unsupported-bridge-contract-version',
      bridgeContractVersion: payload.bridgeContractVersion ?? null,
      expectedBridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    });
  }

  const observations = Array.isArray(payload.observations) ? payload.observations : [];
  if (!Array.isArray(payload.observations)) {
    diagnostics.push({ reason: 'observations-not-array' });
  }

  const identityTuples = observations
    .map(normalizeObservationIdentityTuple)
    .filter(Boolean)
    .sort((left, right) =>
      left.addressProfileId.localeCompare(right.addressProfileId) ||
      left.addressedSnapshotId.localeCompare(right.addressedSnapshotId) ||
      left.occurrenceAddress.localeCompare(right.occurrenceAddress),
    );

  const invalidObservationCount = observations.length - identityTuples.length;
  if (invalidObservationCount > 0) {
    diagnostics.push({ reason: 'invalid-observation-identity-tuple', invalidObservationCount });
  }

  return {
    boundary: 'tree-naming-occurrence-bridge-intake',
    status: diagnostics.length === 0 ? 'recognized-future-evidence-only' : 'recognized-with-diagnostics',
    recognized: true,
    usedForCurrentTreeJoins: false,
    identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
    identityTuples,
    diagnostics,
  };
};
