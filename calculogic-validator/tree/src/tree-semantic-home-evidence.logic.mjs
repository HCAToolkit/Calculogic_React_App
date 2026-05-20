const SOURCE_ID = 'tree-semantic-home-evidence';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree semantic-home evidence input must be an object.');
  }

  if (!Array.isArray(input.addressedOccurrenceRecords)) {
    throw new Error('Tree semantic-home evidence input addressedOccurrenceRecords must be an array.');
  }

  if (!Array.isArray(input.namingSemanticEvidenceRecords)) {
    throw new Error('Tree semantic-home evidence input namingSemanticEvidenceRecords must be an array.');
  }
};

const toDeterministicNamingRecordsByPath = (namingSemanticEvidenceRecords) => {
  const recordsByPath = new Map();

  for (const record of namingSemanticEvidenceRecords) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      continue;
    }

    if (typeof record.path !== 'string' || record.path.length === 0) {
      continue;
    }

    if (
      typeof record.semanticName !== 'string' ||
      record.semanticName.length === 0 ||
      typeof record.semanticFamily !== 'string' ||
      record.semanticFamily.length === 0 ||
      typeof record.familyRoot !== 'string' ||
      record.familyRoot.length === 0
    ) {
      continue;
    }

    if (!recordsByPath.has(record.path)) {
      recordsByPath.set(record.path, []);
    }

    recordsByPath.get(record.path).push(record);
  }

  for (const pathRecords of recordsByPath.values()) {
    pathRecords.sort((left, right) => {
      if ((left.occurrenceType ?? '') !== (right.occurrenceType ?? '')) {
        return (left.occurrenceType ?? '').localeCompare(right.occurrenceType ?? '');
      }
      if (left.semanticName !== right.semanticName) {
        return left.semanticName.localeCompare(right.semanticName);
      }
      return left.semanticFamily.localeCompare(right.semanticFamily);
    });
  }

  return recordsByPath;
};

const pickSafePathMatch = (occurrenceRecord, pathMatches) => {
  if (!Array.isArray(pathMatches) || pathMatches.length === 0) {
    return null;
  }

  const occurrenceTypeMatches = pathMatches.filter(
    (record) => typeof record.occurrenceType === 'string' && record.occurrenceType === occurrenceRecord.occurrenceType,
  );

  if (occurrenceTypeMatches.length > 0) {
    return occurrenceTypeMatches[0];
  }

  return pathMatches[0];
};

const toEvidenceRecord = (occurrenceRecord, namingRecord) => ({
  addressPath: occurrenceRecord.addressPath ?? null,
  parentAddressPath: occurrenceRecord.parentAddressPath ?? null,
  path: occurrenceRecord.path,
  name: occurrenceRecord.name ?? null,
  occurrenceType: occurrenceRecord.occurrenceType ?? null,
  semanticHome: namingRecord.semanticFamily,
  semanticHomeSource: SOURCE_ID,
  semanticHomeEvidenceStrength: namingRecord.evidenceStrength ?? 'bounded',
  semanticName: namingRecord.semanticName,
  semanticFamily: namingRecord.semanticFamily,
  familyRoot: namingRecord.familyRoot,
  ...(typeof namingRecord.familySubgroup === 'string' && namingRecord.familySubgroup.length > 0
    ? { familySubgroup: namingRecord.familySubgroup }
    : {}),
  namingEvidenceSource: namingRecord.evidenceSource ?? 'namingSemanticFamilyBridge',
  rationale: 'Tree joined addressed occurrence path with Naming-prepared semantic evidence path.',
});

export const prepareTreeSemanticHomeEvidence = (input) => {
  assertValidInput(input);

  const namingRecordsByPath = toDeterministicNamingRecordsByPath(input.namingSemanticEvidenceRecords);
  const evidenceRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    if (!occurrenceRecord || typeof occurrenceRecord !== 'object' || Array.isArray(occurrenceRecord)) {
      continue;
    }

    if (typeof occurrenceRecord.path !== 'string' || occurrenceRecord.path.length === 0) {
      continue;
    }

    const safeMatch = pickSafePathMatch(occurrenceRecord, namingRecordsByPath.get(occurrenceRecord.path));
    if (!safeMatch) {
      continue;
    }

    evidenceRecords.push(toEvidenceRecord(occurrenceRecord, safeMatch));
  }

  return {
    source: SOURCE_ID,
    evidenceRecords,
  };
};
