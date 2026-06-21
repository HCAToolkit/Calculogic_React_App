const BRIDGE_CONTRACT_VERSION = 'naming-occurrence-bridge.v1';
const ENRICHMENT_CONTRACT_VERSION = 'naming-occurrence-bridge-enrichment.v1';

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

const normalizeSourceDiagnostic = (diagnostic) => {
  if (!isPlainObject(diagnostic)) {
    return { source: 'namingOccurrenceBridge.diagnostics', diagnostic };
  }

  return {
    source: 'namingOccurrenceBridge.diagnostics',
    ...diagnostic,
  };
};

const collectNamingPayloadDiagnostics = (payload) => {
  const diagnostics = [];

  if (Array.isArray(payload.diagnostics) && payload.diagnostics.length > 0) {
    diagnostics.push({
      reason: 'source-naming-diagnostics-present',
      diagnosticCount: payload.diagnostics.length,
      diagnostics: payload.diagnostics.map(normalizeSourceDiagnostic),
    });
  }

  if (isPlainObject(payload.compatibility)) {
    const compatibility = payload.compatibility;
    const compatibilityDiagnosticCounts = Object.fromEntries(
      Object.entries(compatibility)
        .filter(([key, value]) => key.endsWith('DiagnosticCount') && Number.isInteger(value) && value > 0)
        .sort(([left], [right]) => left.localeCompare(right)),
    );

    if (compatibility.addressedNamespaceValid === false || Object.keys(compatibilityDiagnosticCounts).length > 0) {
      diagnostics.push({
        reason: 'source-naming-compatibility-diagnostics-present',
        addressedNamespaceValid: compatibility.addressedNamespaceValid ?? null,
        diagnosticCounts: compatibilityDiagnosticCounts,
      });
    }
  }

  return diagnostics;
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

  diagnostics.push(...collectNamingPayloadDiagnostics(payload));

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

const IDENTITY_TUPLE_FIELDS = ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'];

const toIdentityTupleKey = ({ addressProfileId, addressedSnapshotId, occurrenceAddress }) =>
  `${addressProfileId}\u0000${addressedSnapshotId}\u0000${occurrenceAddress}`;

const toSafeIdentityTupleDiagnostic = (identityTuple) =>
  identityTuple
    ? {
        addressProfileId: identityTuple.addressProfileId ?? null,
        addressedSnapshotId: identityTuple.addressedSnapshotId ?? null,
        occurrenceAddress: identityTuple.occurrenceAddress ?? null,
      }
    : null;

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

const isContractValidNamingNote = (note) =>
  isPlainObject(note) &&
  typeof note.code === 'string' &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.code) &&
  typeof note.message === 'string' &&
  note.message.length > 0 &&
  note.source === 'naming';

const normalizeContractNotes = ({ value, fieldName, identityTuple, enrichmentDiagnostics }) => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((note) => !isContractValidNamingNote(note))) {
    enrichmentDiagnostics.push({
      reason: 'invalid-enrichment-field',
      fieldName,
      identityTuple: toSafeIdentityTupleDiagnostic(identityTuple),
    });
    return null;
  }

  return value.map((note) => ({ code: note.code, message: note.message, source: note.source }));
};

const validateEnrichmentEnvelope = (payload) => {
  const sidecar = payload?.occurrenceContextEnrichment;
  if (sidecar === undefined) {
    return { status: 'absent', records: [], diagnostics: [] };
  }

  if (!isPlainObject(sidecar)) {
    return {
      status: 'malformed',
      records: [],
      diagnostics: [{ reason: 'malformed-enrichment-sidecar', fieldName: 'occurrenceContextEnrichment' }],
    };
  }

  const diagnostics = [];
  if (sidecar.enrichmentContractVersion !== ENRICHMENT_CONTRACT_VERSION) {
    diagnostics.push({
      reason: 'unsupported-enrichment-sidecar-version',
      enrichmentContractVersion: sidecar.enrichmentContractVersion ?? null,
      expectedEnrichmentContractVersion: ENRICHMENT_CONTRACT_VERSION,
    });
  }

  if (
    !Array.isArray(sidecar.identityTupleFields) ||
    sidecar.identityTupleFields.length !== IDENTITY_TUPLE_FIELDS.length ||
    sidecar.identityTupleFields.some((field, index) => field !== IDENTITY_TUPLE_FIELDS[index])
  ) {
    diagnostics.push({
      reason: 'malformed-enrichment-sidecar',
      fieldName: 'identityTupleFields',
      expectedIdentityTupleFields: IDENTITY_TUPLE_FIELDS,
    });
  }

  if (!Array.isArray(sidecar.enrichedObservations)) {
    diagnostics.push({ reason: 'malformed-enrichment-sidecar', fieldName: 'enrichedObservations' });
  }

  if (diagnostics.length > 0) {
    return { status: 'invalid', records: [], diagnostics };
  }

  return { status: 'recognized', records: sidecar.enrichedObservations, diagnostics };
};

const normalizeEnrichmentRecord = ({ record, identityTuple, enrichmentDiagnostics }) => {
  const addressingContext = {};
  if (record.parentOccurrenceAddress !== undefined) {
    if (record.parentOccurrenceAddress === null) {
      addressingContext.parentOccurrenceAddress = null;
    } else if (typeof record.parentOccurrenceAddress === 'string' && record.parentOccurrenceAddress.length > 0) {
      addressingContext.parentOccurrenceAddress = record.parentOccurrenceAddress;
    } else {
      enrichmentDiagnostics.push({
        reason: 'invalid-enrichment-field',
        fieldName: 'parentOccurrenceAddress',
        identityTuple: toSafeIdentityTupleDiagnostic(identityTuple),
      });
      return null;
    }
  }

  for (const fieldName of ['occurrenceDepth', 'occurrenceOrderIndex']) {
    if (record[fieldName] !== undefined) {
      if (!isNonNegativeInteger(record[fieldName])) {
        enrichmentDiagnostics.push({
          reason: 'invalid-enrichment-field',
          fieldName,
          identityTuple: toSafeIdentityTupleDiagnostic(identityTuple),
        });
        return null;
      }
      addressingContext[fieldName] = record[fieldName];
    }
  }

  const namingMetadata = {};
  for (const fieldName of ['disambiguationNotes', 'evidenceLimitNotes']) {
    const notes = normalizeContractNotes({ value: record[fieldName], fieldName, identityTuple, enrichmentDiagnostics });
    if (notes === null) {
      return null;
    }
    if (notes !== undefined) {
      namingMetadata[fieldName] = notes;
    }
  }

  return {
    evidenceType: 'tree-local-naming-occurrence-context-enrichment',
    sourceIdentityTuple: { ...identityTuple },
    addressingContext,
    namingMetadata,
  };
};

const normalizeOccurrenceRecordIdentityTuple = ({ occurrenceRecord, addressProfileId, addressedSnapshotId }) => {
  if (!isPlainObject(occurrenceRecord)) {
    return null;
  }

  const occurrenceAddress =
    toNonEmptyString(occurrenceRecord.occurrenceAddress) ?? toNonEmptyString(occurrenceRecord.addressPath);

  if (!addressProfileId || !addressedSnapshotId || !occurrenceAddress) {
    return null;
  }

  return {
    addressProfileId,
    addressedSnapshotId,
    occurrenceAddress,
  };
};

const normalizeStringFlags = (flags) => (Array.isArray(flags) ? flags.filter((flag) => typeof flag === 'string') : []);

const toCleanObservationEvidence = (observation) => ({
  addressProfileId: observation.addressProfileId,
  addressedSnapshotId: observation.addressedSnapshotId,
  occurrenceAddress: observation.occurrenceAddress,
  repoRelativePath: observation.repoRelativePath ?? observation.path ?? null,
  semanticName: observation.semanticName ?? null,
  familyRoot: observation.familyRoot ?? null,
  semanticFamily: observation.semanticFamily ?? null,
  familySubgroup: observation.familySubgroup ?? null,
  ambiguityFlags: normalizeStringFlags(observation.ambiguityFlags),
  splitFamilyFlags: normalizeStringFlags(observation.splitFamilyFlags),
});

const toOccurrenceEvidence = (occurrenceRecord, identityTuple) => ({
  ...identityTuple,
  resolvedPath: occurrenceRecord.resolvedPath ?? occurrenceRecord.path ?? null,
  path: occurrenceRecord.path ?? occurrenceRecord.resolvedPath ?? null,
  name: occurrenceRecord.name ?? occurrenceRecord.actualName ?? null,
  occurrenceType: occurrenceRecord.occurrenceType ?? null,
  addressPath: occurrenceRecord.addressPath ?? occurrenceRecord.occurrenceAddress ?? null,
});

const sortJoinEntries = (entries) =>
  entries.sort((left, right) =>
    (left.identityTuple?.addressProfileId ?? '').localeCompare(right.identityTuple?.addressProfileId ?? '') ||
    (left.identityTuple?.addressedSnapshotId ?? '').localeCompare(right.identityTuple?.addressedSnapshotId ?? '') ||
    (left.identityTuple?.occurrenceAddress ?? '').localeCompare(right.identityTuple?.occurrenceAddress ?? '') ||
    (left.reason ?? '').localeCompare(right.reason ?? ''),
  );

export const prepareTreeNamingOccurrenceAddressJoinEvidence = ({
  namingOccurrenceBridge,
  namingSemanticFamilyBridge,
  addressedOccurrenceNamespace = {},
} = {}) => {
  const intake = prepareTreeNamingOccurrenceBridgeIntake({ namingOccurrenceBridge, namingSemanticFamilyBridge });
  const addressProfileId = toNonEmptyString(addressedOccurrenceNamespace.addressProfileId);
  const addressedSnapshotId = toNonEmptyString(addressedOccurrenceNamespace.addressedSnapshotId);
  const occurrenceRecords = Array.isArray(addressedOccurrenceNamespace.occurrenceRecords)
    ? addressedOccurrenceNamespace.occurrenceRecords
    : [];
  const diagnostics = [];
  const joinedEvidence = [];
  const skippedJoins = [];

  if (!addressProfileId) {
    diagnostics.push({ reason: 'missing-addressed-occurrence-namespace-addressProfileId' });
  }

  if (!addressedSnapshotId) {
    diagnostics.push({ reason: 'missing-addressed-occurrence-namespace-addressedSnapshotId' });
  }

  if (!Array.isArray(addressedOccurrenceNamespace.occurrenceRecords)) {
    diagnostics.push({ reason: 'addressed-occurrence-records-not-array' });
  }

  if (intake.status === 'absent') {
    return {
      boundary: 'tree-naming-occurrence-address-join',
      status: 'absent',
      usedForCurrentTreeJoins: false,
      identityTupleFields: IDENTITY_TUPLE_FIELDS,
      joinedEvidence,
      skippedJoins,
      diagnostics,
    };
  }

  diagnostics.push(...intake.diagnostics.map((diagnostic) => ({ source: intake.boundary, ...diagnostic })));

  if (!intake.recognized || intake.diagnostics.length > 0 || diagnostics.length > 0) {
    return {
      boundary: 'tree-naming-occurrence-address-join',
      status: 'skipped-with-diagnostics',
      usedForCurrentTreeJoins: false,
      identityTupleFields: IDENTITY_TUPLE_FIELDS,
      joinedEvidence,
      skippedJoins,
      diagnostics,
    };
  }

  const occurrenceRecordsByTuple = new Map();
  const ambiguousOccurrenceTupleKeys = new Set();

  for (const occurrenceRecord of occurrenceRecords) {
    const identityTuple = normalizeOccurrenceRecordIdentityTuple({ occurrenceRecord, addressProfileId, addressedSnapshotId });
    if (!identityTuple) {
      diagnostics.push({ reason: 'invalid-occurrence-record-identity-tuple' });
      continue;
    }

    const key = toIdentityTupleKey(identityTuple);
    if (occurrenceRecordsByTuple.has(key)) {
      ambiguousOccurrenceTupleKeys.add(key);
    }
    occurrenceRecordsByTuple.set(key, { occurrenceRecord, identityTuple });
  }

  const payload = toPayloadFromTransport({ namingOccurrenceBridge, namingSemanticFamilyBridge });
  const observations = Array.isArray(payload?.observations) ? payload.observations : [];
  const observationTupleCounts = new Map();
  for (const observation of observations) {
    const identityTuple = normalizeObservationIdentityTuple(observation);
    if (identityTuple) {
      const key = toIdentityTupleKey(identityTuple);
      observationTupleCounts.set(key, (observationTupleCounts.get(key) ?? 0) + 1);
    }
  }

  for (const observation of observations) {
    const identityTuple = normalizeObservationIdentityTuple(observation);
    if (!identityTuple) {
      skippedJoins.push({ reason: 'invalid-observation-identity-tuple', identityTuple: null });
      continue;
    }

    const key = toIdentityTupleKey(identityTuple);
    if ((observationTupleCounts.get(key) ?? 0) > 1) {
      skippedJoins.push({ reason: 'ambiguous-observation-identity-tuple', identityTuple });
      continue;
    }

    if (ambiguousOccurrenceTupleKeys.has(key)) {
      skippedJoins.push({ reason: 'ambiguous-occurrence-record-identity-tuple', identityTuple });
      continue;
    }

    const occurrenceEntry = occurrenceRecordsByTuple.get(key);
    if (!occurrenceEntry) {
      skippedJoins.push({ reason: 'no-matching-occurrence-record-identity-tuple', identityTuple });
      continue;
    }

    joinedEvidence.push({
      evidenceType: 'tree-prepared-naming-occurrence-address-join',
      identityTuple,
      namingObservation: toCleanObservationEvidence(observation),
      occurrenceRecord: toOccurrenceEvidence(occurrenceEntry.occurrenceRecord, occurrenceEntry.identityTuple),
    });
  }

  const joinedEvidenceByTuple = new Map(joinedEvidence.map((entry) => [toIdentityTupleKey(entry.identityTuple), entry]));
  const enrichmentDiagnostics = [];
  const enrichmentEnvelope = validateEnrichmentEnvelope(payload);
  enrichmentDiagnostics.push(...enrichmentEnvelope.diagnostics);

  if (enrichmentEnvelope.status === 'recognized') {
    const enrichmentTupleCounts = new Map();
    for (const record of enrichmentEnvelope.records) {
      const identityTuple = normalizeObservationIdentityTuple(record);
      if (identityTuple) {
        const key = toIdentityTupleKey(identityTuple);
        enrichmentTupleCounts.set(key, (enrichmentTupleCounts.get(key) ?? 0) + 1);
      }
    }

    for (const record of enrichmentEnvelope.records) {
      if (!isPlainObject(record)) {
        enrichmentDiagnostics.push({ reason: 'invalid-enrichment-identity-tuple', identityTuple: null });
        continue;
      }

      const identityTuple = normalizeObservationIdentityTuple(record);
      if (!identityTuple) {
        enrichmentDiagnostics.push({ reason: 'invalid-enrichment-identity-tuple', identityTuple: null });
        continue;
      }

      const key = toIdentityTupleKey(identityTuple);
      if ((enrichmentTupleCounts.get(key) ?? 0) > 1) {
        enrichmentDiagnostics.push({ reason: 'duplicate-enrichment-identity-tuple', identityTuple });
        continue;
      }

      const joinedEntry = joinedEvidenceByTuple.get(key);
      if (!joinedEntry) {
        enrichmentDiagnostics.push({ reason: 'unmatched-enrichment-identity-tuple', identityTuple });
        continue;
      }

      const occurrenceContextEnrichment = normalizeEnrichmentRecord({ record, identityTuple, enrichmentDiagnostics });
      if (occurrenceContextEnrichment) {
        joinedEntry.occurrenceContextEnrichment = occurrenceContextEnrichment;
      }
    }
  }

  const status = diagnostics.length > 0 || skippedJoins.length > 0
    ? 'joined-with-skips'
    : joinedEvidence.length > 0
      ? 'joined'
      : 'no-joined-evidence';

  return {
    boundary: 'tree-naming-occurrence-address-join',
    status,
    usedForCurrentTreeJoins: status === 'joined' && joinedEvidence.length > 0,
    identityTupleFields: IDENTITY_TUPLE_FIELDS,
    joinedEvidence: sortJoinEntries(joinedEvidence),
    skippedJoins: sortJoinEntries(skippedJoins),
    diagnostics,
    enrichmentDiagnostics: sortJoinEntries(enrichmentDiagnostics),
  };
};
