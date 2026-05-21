const SOURCE_ID = 'tree-occurrence-classification-parity-evidence';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree occurrence classification parity evidence input must be an object.');
  }

  if (!Array.isArray(input.addressedOccurrenceRecords)) {
    throw new Error('Tree occurrence classification parity evidence input addressedOccurrenceRecords must be an array.');
  }

  if (!Array.isArray(input.currentOccurrenceClassificationRecords)) {
    throw new Error('Tree occurrence classification parity evidence input currentOccurrenceClassificationRecords must be an array.');
  }

  if (!input.treeStructuralHomeEvidence || typeof input.treeStructuralHomeEvidence !== 'object' || Array.isArray(input.treeStructuralHomeEvidence)) {
    throw new Error('Tree occurrence classification parity evidence input must include treeStructuralHomeEvidence object.');
  }

  if (!Array.isArray(input.treeStructuralHomeEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification parity evidence treeStructuralHomeEvidence.evidenceRecords must be an array.');
  }

  if (!input.treeSemanticHomeEvidence || typeof input.treeSemanticHomeEvidence !== 'object' || Array.isArray(input.treeSemanticHomeEvidence)) {
    throw new Error('Tree occurrence classification parity evidence input must include treeSemanticHomeEvidence object.');
  }

  if (!Array.isArray(input.treeSemanticHomeEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification parity evidence treeSemanticHomeEvidence.evidenceRecords must be an array.');
  }

  if (!input.treeFolderKindEvidence || typeof input.treeFolderKindEvidence !== 'object' || Array.isArray(input.treeFolderKindEvidence)) {
    throw new Error('Tree occurrence classification parity evidence input must include treeFolderKindEvidence object.');
  }

  if (!Array.isArray(input.treeFolderKindEvidence.evidenceRecords)) {
    throw new Error('Tree occurrence classification parity evidence treeFolderKindEvidence.evidenceRecords must be an array.');
  }
};

const toIdentityKeys = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return [];
  }

  const keys = [];

  if (typeof record.addressPath === 'string' && record.addressPath.length > 0) {
    keys.push(`address:${record.addressPath}`);
  }

  if (
    typeof record.path === 'string' &&
    record.path.length > 0 &&
    typeof record.occurrenceType === 'string' &&
    record.occurrenceType.length > 0
  ) {
    keys.push(`path-type:${record.path}::${record.occurrenceType}`);
  }

  if (typeof record.path === 'string' && record.path.length > 0) {
    keys.push(`path:${record.path}`);
  }

  return keys;
};

const toEvidenceLookup = (evidenceRecords, evidenceKey) => {
  const lookup = new Map();

  for (const evidenceRecord of evidenceRecords) {
    for (const key of toIdentityKeys(evidenceRecord)) {
      if (lookup.has(key)) {
        continue;
      }

      lookup.set(key, evidenceRecord[evidenceKey] ?? null);
    }
  }

  return lookup;
};

const lookupFirstAvailable = (lookup, record, fallback = null) => {
  for (const key of toIdentityKeys(record)) {
    if (lookup.has(key)) {
      return lookup.get(key);
    }
  }

  return fallback;
};

const toCurrentClassLabel = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  if (record?.isStructuralRoot === true) {
    return 'structural-root';
  }

  if (record?.isSemanticRoot === true) {
    return 'semantic-root';
  }

  if (record?.isKnownTopRoot === true) {
    return 'known-top-root';
  }

  return 'non-root-or-unknown';
};

const toReplacementClassLabel = ({ replacementFolderKind, replacementStructuralHome, replacementSemanticHome }) => {
  if (replacementFolderKind === 'structural' || replacementStructuralHome) {
    return 'structural-root';
  }

  if (replacementFolderKind === 'semantic' || replacementSemanticHome) {
    return 'semantic-root';
  }

  if (replacementFolderKind === 'unspecified') {
    return 'non-root-or-unknown';
  }

  return 'insufficient-evidence';
};

const isTopRootCandidateOccurrence = (occurrenceRecord, currentRecord) => {
  if (occurrenceRecord?.occurrenceType !== 'folder') {
    return false;
  }

  if (currentRecord?.isKnownTopRoot === true || currentRecord?.isStructuralRoot === true || currentRecord?.isSemanticRoot === true) {
    return true;
  }

  if (occurrenceRecord?.isScopeTopOccurrence === true || occurrenceRecord?.depth === 0 || occurrenceRecord?.parentAddressPath === null) {
    return true;
  }

  return false;
};

const toParityStatus = ({ occurrenceType, isTopRootCandidate, hasCurrentClassification, replacementClassLabel, currentClassLabel }) => {
  if (occurrenceType !== 'folder' || isTopRootCandidate !== true) {
    return 'not-applicable';
  }

  if (!hasCurrentClassification || replacementClassLabel === 'insufficient-evidence' || currentClassLabel === null) {
    return 'insufficient-evidence';
  }

  return currentClassLabel === replacementClassLabel ? 'matches' : 'differs';
};

const toRationale = ({ parityStatus, currentClassLabel, replacementClassLabel }) => {
  if (parityStatus === 'not-applicable') {
    return 'Occurrence is not a folder; root classification parity comparison is not applicable.';
  }

  if (parityStatus === 'insufficient-evidence') {
    return 'Tree-owned folder-kind/structural-home/semantic-home evidence did not safely resolve a replacement class.';
  }

  if (parityStatus === 'matches') {
    return `Current class ${currentClassLabel} matched Tree-owned replacement evidence class ${replacementClassLabel}.`;
  }

  return `Current class ${currentClassLabel} differed from Tree-owned replacement evidence class ${replacementClassLabel}.`;
};

const sortByPathThenAddress = (left, right) => {
  const byPath = String(left.path ?? '').localeCompare(String(right.path ?? ''));
  if (byPath !== 0) {
    return byPath;
  }

  return String(left.addressPath ?? '').localeCompare(String(right.addressPath ?? ''));
};

export const prepareTreeOccurrenceClassificationParityEvidence = (input) => {
  assertValidInput(input);

  const structuralHomeLookup = toEvidenceLookup(input.treeStructuralHomeEvidence.evidenceRecords, 'structuralHome');
  const semanticHomeLookup = toEvidenceLookup(input.treeSemanticHomeEvidence.evidenceRecords, 'semanticHome');
  const folderKindLookup = toEvidenceLookup(input.treeFolderKindEvidence.evidenceRecords, 'folderKind');

  const currentByIdentity = new Map();
  for (const record of input.currentOccurrenceClassificationRecords) {
    for (const key of toIdentityKeys(record)) {
      if (currentByIdentity.has(key)) {
        continue;
      }

      currentByIdentity.set(key, record);
    }
  }

  const parityRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    const currentRecord = lookupFirstAvailable(currentByIdentity, occurrenceRecord);

    const replacementFolderKind = lookupFirstAvailable(folderKindLookup, occurrenceRecord);
    const replacementStructuralHome = lookupFirstAvailable(structuralHomeLookup, occurrenceRecord);
    const replacementSemanticHome = lookupFirstAvailable(semanticHomeLookup, occurrenceRecord);

    const currentClassLabel = toCurrentClassLabel(currentRecord);
    const isTopRootCandidate = isTopRootCandidateOccurrence(occurrenceRecord, currentRecord);
    const hasCurrentClassification = currentRecord && typeof currentRecord === 'object' && !Array.isArray(currentRecord);
    const replacementClassLabel = toReplacementClassLabel({
      replacementFolderKind,
      replacementStructuralHome,
      replacementSemanticHome,
    });

    const parityStatus = toParityStatus({
      occurrenceType: occurrenceRecord?.occurrenceType ?? null,
      isTopRootCandidate,
      hasCurrentClassification,
      currentClassLabel,
      replacementClassLabel,
    });

    parityRecords.push({
      addressPath: occurrenceRecord?.addressPath ?? null,
      parentAddressPath: occurrenceRecord?.parentAddressPath ?? null,
      path: occurrenceRecord?.path ?? null,
      name: occurrenceRecord?.name ?? null,
      occurrenceType: occurrenceRecord?.occurrenceType ?? null,
      currentStructuralClass: currentRecord?.structuralClass ?? null,
      currentStructuralKind: currentRecord?.structuralKind ?? null,
      currentIsKnownTopRoot: currentRecord?.isKnownTopRoot ?? false,
      currentIsStructuralRoot: currentRecord?.isStructuralRoot ?? false,
      currentIsSemanticRoot: currentRecord?.isSemanticRoot ?? false,
      replacementFolderKind,
      replacementStructuralHome,
      replacementSemanticHome,
      parityStatus,
      rationale: toRationale({ parityStatus, currentClassLabel, replacementClassLabel }),
    });
  }

  const orderedParityRecords = [...parityRecords].sort(sortByPathThenAddress);
  const summary = orderedParityRecords.reduce(
    (counts, parityRecord) => ({ ...counts, [parityRecord.parityStatus]: (counts[parityRecord.parityStatus] ?? 0) + 1 }),
    { matches: 0, differs: 0, 'insufficient-evidence': 0, 'not-applicable': 0 },
  );

  return {
    source: SOURCE_ID,
    parityRecords: orderedParityRecords,
    summary,
  };
};
