const BRIDGE_CONTRACT_VERSION = 'naming-occurrence-bridge.v1';
const ENRICHMENT_SIDECAR_VERSION = 'naming-occurrence-bridge-enrichment.v1';
const BRIDGE_SOURCE = 'calculogic-validator/naming';
const BRIDGE_PRODUCER_ID = 'naming-semantic-family-occurrence-bridge';

const NAMING_SEMANTIC_FIELDS = [
  'semanticName',
  'semanticFamily',
  'familyRoot',
  'familySubgroup',
  'ambiguityFlags',
  'splitFamilyFlags',
  'disambiguation',
  'semanticEvidenceKind',
  'familyRootQualification',
  'evidenceSource',
];

const toOptionalNonEmptyString = (value) => (typeof value === 'string' && value.length > 0 ? value : null);

const cloneStringArray = (value) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.length > 0) : null;

const toSortedUniqueStrings = (value) =>
  Array.isArray(value)
    ? Array.from(new Set(value.filter((item) => typeof item === 'string' && item.length > 0))).sort((left, right) =>
        left.localeCompare(right),
      )
    : null;

const toOptionalNonNegativeInteger = (value) =>
  Number.isInteger(value) && value >= 0 ? value : null;

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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

    if (field === 'disambiguation') {
      if (isPlainObject(observation.disambiguation)) {
        payload.disambiguation = {
          ...(toSortedUniqueStrings(observation.disambiguation.roleLikeFolderTokens)
            ? { roleLikeFolderTokens: toSortedUniqueStrings(observation.disambiguation.roleLikeFolderTokens) }
            : {}),
          ...(toSortedUniqueStrings(observation.disambiguation.roleLikeSemanticTokens)
            ? { roleLikeSemanticTokens: toSortedUniqueStrings(observation.disambiguation.roleLikeSemanticTokens) }
            : {}),
        };
        if (Object.keys(payload.disambiguation).length === 0) {
          delete payload.disambiguation;
        }
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
    ...(isPlainObject(semanticObservation.evidenceProvenance)
      ? { evidenceProvenance: { ...semanticObservation.evidenceProvenance } }
      : {}),
  };
};


const isKebabCaseString = (value) =>
  typeof value === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(value);

const sortContractNotes = (notes) =>
  Array.from(
    new Map(
      notes
        .filter(
          (note) =>
            isPlainObject(note) &&
            isKebabCaseString(note.code) &&
            toOptionalNonEmptyString(note.message) &&
            note.source === 'naming',
        )
        .map((note) => [
          `${note.code}\u0000${note.message}\u0000${note.source}`,
          { code: note.code, message: note.message, source: 'naming' },
        ]),
    ).values(),
  ).sort(
    (left, right) =>
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message) ||
      left.source.localeCompare(right.source),
  );

const toDisambiguationNotes = (disambiguation) => {
  if (!isPlainObject(disambiguation)) {
    return [];
  }

  const roleLikeFolderTokens = toSortedUniqueStrings(disambiguation.roleLikeFolderTokens);
  const roleLikeSemanticTokens = toSortedUniqueStrings(disambiguation.roleLikeSemanticTokens);

  return sortContractNotes([
    ...(roleLikeFolderTokens?.map((token) => ({
      code: 'role-like-folder-token',
      message: `Role-like folder token: ${token}`,
      source: 'naming',
    })) ?? []),
    ...(roleLikeSemanticTokens?.map((token) => ({
      code: 'role-like-semantic-token',
      message: `Role-like semantic token: ${token}`,
      source: 'naming',
    })) ?? []),
  ]);
};

const toEvidenceLimitNote = (note) => {
  if (!isPlainObject(note)) {
    return null;
  }

  if (isKebabCaseString(note.code) && toOptionalNonEmptyString(note.message) && note.source === 'naming') {
    return { code: note.code, message: note.message, source: 'naming' };
  }

  if (isKebabCaseString(note.noteType)) {
    const detail = toOptionalNonEmptyString(note.detail);
    return {
      code: note.noteType,
      message: detail ?? note.noteType,
      source: 'naming',
    };
  }

  return null;
};

const toNamingMetadataNotes = (semanticObservation) => {
  const notes = {};
  const disambiguationNotes = toDisambiguationNotes(semanticObservation.disambiguation);

  if (disambiguationNotes.length > 0) {
    notes.disambiguationNotes = disambiguationNotes;
  }

  const evidenceLimitNotes = Array.isArray(semanticObservation.evidenceLimitNotes)
    ? sortContractNotes(semanticObservation.evidenceLimitNotes.map(toEvidenceLimitNote).filter(Boolean))
    : [];

  if (evidenceLimitNotes.length > 0) {
    notes.evidenceLimitNotes = evidenceLimitNotes;
  }

  return notes;
};

const toEnrichmentRecord = ({ observation, semanticObservation, occurrenceRecord }) => {
  const enrichment = {
    addressProfileId: observation.addressProfileId,
    addressedSnapshotId: observation.addressedSnapshotId,
    occurrenceAddress: observation.occurrenceAddress,
  };

  const parentOccurrenceAddressSource = occurrenceRecord.parentOccurrenceAddress ?? occurrenceRecord.parentAddressPath;
  if (parentOccurrenceAddressSource === null) {
    enrichment.parentOccurrenceAddress = null;
  } else {
    const parentOccurrenceAddress = toOptionalNonEmptyString(parentOccurrenceAddressSource);
    if (parentOccurrenceAddress) {
      enrichment.parentOccurrenceAddress = parentOccurrenceAddress;
    }
  }

  const occurrenceDepth = toOptionalNonNegativeInteger(occurrenceRecord.occurrenceDepth ?? occurrenceRecord.depth);
  if (occurrenceDepth !== null) {
    enrichment.occurrenceDepth = occurrenceDepth;
  }

  const occurrenceOrderIndex = toOptionalNonNegativeInteger(
    occurrenceRecord.occurrenceOrderIndex ?? occurrenceRecord.orderIndex,
  );
  if (occurrenceOrderIndex !== null) {
    enrichment.occurrenceOrderIndex = occurrenceOrderIndex;
  }

  Object.assign(enrichment, toNamingMetadataNotes(semanticObservation));

  return Object.keys(enrichment).length > 3 ? enrichment : null;
};

const toMissingIdentityDiagnostic = ({ semanticObservation, reason }) => ({
  diagnosticType: 'missing-occurrence-identity',
  reason,
  repoRelativePath: toPathKey(semanticObservation.repoRelativePath) ?? toPathKey(semanticObservation.path) ?? null,
  path: toPathKey(semanticObservation.path) ?? null,
  semanticName: toOptionalNonEmptyString(semanticObservation.semanticName) ?? null,
});

const toInvalidAddressedNamespaceDiagnostics = ({ addressProfileId, addressedSnapshotId }) => {
  const diagnostics = [];

  if (!addressProfileId) {
    diagnostics.push({
      diagnosticType: 'invalid-addressed-namespace',
      reason: 'missing-address-profile-id',
      addressProfileId: null,
      addressedSnapshotId: addressedSnapshotId ?? null,
    });
  }

  if (!addressedSnapshotId) {
    diagnostics.push({
      diagnosticType: 'invalid-addressed-namespace',
      reason: 'missing-addressed-snapshot-id',
      addressProfileId: addressProfileId ?? null,
      addressedSnapshotId: null,
    });
  }

  return diagnostics;
};

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
  const enrichedObservations = [];
  const diagnostics = toInvalidAddressedNamespaceDiagnostics({ addressProfileId, addressedSnapshotId });
  const hasValidAddressedNamespace = diagnostics.length === 0;

  if (hasValidAddressedNamespace) {
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

      const enrichedObservation = toEnrichmentRecord({ observation, semanticObservation, occurrenceRecord });
      if (enrichedObservation) {
        enrichedObservations.push(enrichedObservation);
      }
    }
  }

  return {
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    bridgeSource: BRIDGE_SOURCE,
    bridgeProducerId: BRIDGE_PRODUCER_ID,
    addressProfileId: addressProfileId ?? null,
    addressedSnapshotId: addressedSnapshotId ?? null,
    ...(sourceReportRef !== undefined ? { sourceReportRef } : {}),
    ...(sourceSnapshotRef !== undefined ? { sourceSnapshotRef } : {}),
    compatibility: {
      pathKeyedSemanticPayloadPreserved: true,
      temporaryCompatibilityPathField: 'path',
      temporaryDebugAddressPathField: 'addressPath',
      addressAttachedObservationsOmitMissingIdentity: true,
      addressedNamespaceValid: hasValidAddressedNamespace,
      invalidAddressedNamespaceDiagnosticCount: diagnostics.filter(
        (diagnostic) => diagnostic.diagnosticType === 'invalid-addressed-namespace',
      ).length,
      sourceObservationCount: sourceObservations.length,
      addressAttachedObservationCount: observations.length,
      missingIdentityDiagnosticCount: diagnostics.filter(
        (diagnostic) => diagnostic.diagnosticType === 'missing-occurrence-identity',
      ).length,
      totalDiagnosticCount: diagnostics.length,
      enrichmentSidecarVersion: ENRICHMENT_SIDECAR_VERSION,
      enrichmentObservationCount: enrichedObservations.length,
    },
    observations: observations.sort((left, right) =>
      left.addressProfileId.localeCompare(right.addressProfileId) ||
      left.addressedSnapshotId.localeCompare(right.addressedSnapshotId) ||
      left.occurrenceAddress.localeCompare(right.occurrenceAddress) ||
      left.repoRelativePath.localeCompare(right.repoRelativePath),
    ),
    ...(enrichedObservations.length > 0
      ? {
          occurrenceContextEnrichment: {
            enrichmentContractVersion: ENRICHMENT_SIDECAR_VERSION,
            identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
            // Sidecar route preserves v1 payload semantics while keeping enrichment safely ignorable by Tree v1 intake.
            enrichedObservations: enrichedObservations.sort((left, right) =>
              left.addressProfileId.localeCompare(right.addressProfileId) ||
              left.addressedSnapshotId.localeCompare(right.addressedSnapshotId) ||
              left.occurrenceAddress.localeCompare(right.occurrenceAddress),
            ),
          },
        }
      : {}),
    ...(diagnostics.length > 0 ? { diagnostics } : {}),
  };
};
