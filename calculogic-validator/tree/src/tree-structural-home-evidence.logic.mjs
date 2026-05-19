const SOURCE_ID = 'tree-structural-home-evidence';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree structural-home evidence input must be an object.');
  }

  if (!Array.isArray(input.addressedOccurrenceRecords)) {
    throw new Error('Tree structural-home evidence input addressedOccurrenceRecords must be an array.');
  }

  if (!input.structuralHomesRegistry || typeof input.structuralHomesRegistry !== 'object' || Array.isArray(input.structuralHomesRegistry)) {
    throw new Error('Tree structural-home evidence input must include structuralHomesRegistry object.');
  }

  if (!Array.isArray(input.structuralHomesRegistry.structuralHomes)) {
    throw new Error('Tree structural-home evidence structuralHomesRegistry.structuralHomes must be an array.');
  }
};

const toStructuralHomeLookup = (structuralHomes) => {
  const lookup = new Map();

  for (const structuralHomeEntry of structuralHomes) {
    if (!structuralHomeEntry || typeof structuralHomeEntry !== 'object' || Array.isArray(structuralHomeEntry)) {
      continue;
    }

    if (typeof structuralHomeEntry.structuralHome !== 'string' || structuralHomeEntry.structuralHome.length === 0) {
      continue;
    }

    if (lookup.has(structuralHomeEntry.structuralHome)) {
      continue;
    }

    lookup.set(structuralHomeEntry.structuralHome, {
      structuralHome: structuralHomeEntry.structuralHome,
      structuralHomeStatus: structuralHomeEntry.status ?? null,
      structuralHomeDefinition: structuralHomeEntry.definition ?? null,
    });
  }

  return lookup;
};

const toRepoTopToken = (pathValue) => {
  if (typeof pathValue !== 'string' || pathValue.length === 0) {
    return null;
  }

  if (pathValue.includes('/') || pathValue.includes('\\')) {
    return null;
  }

  return pathValue;
};

const toEvidenceRecord = (occurrenceRecord, structuralHomeMetadata) => ({
  addressPath: occurrenceRecord.addressPath ?? null,
  parentAddressPath: occurrenceRecord.parentAddressPath ?? null,
  path: occurrenceRecord.path ?? null,
  name: occurrenceRecord.name ?? null,
  occurrenceType: occurrenceRecord.occurrenceType ?? null,
  structuralHome: structuralHomeMetadata.structuralHome,
  structuralHomeSource: SOURCE_ID,
  structuralHomeEvidenceStrength: 'direct-repo-top-match',
  rationale: 'Repo-top folder token matches a Tree structural-home registry entry.',
  structuralHomeStatus: structuralHomeMetadata.structuralHomeStatus,
  structuralHomeDefinition: structuralHomeMetadata.structuralHomeDefinition,
});

export const prepareTreeStructuralHomeEvidence = (input) => {
  assertValidInput(input);

  const structuralHomeLookup = toStructuralHomeLookup(input.structuralHomesRegistry.structuralHomes);
  const evidenceRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    if (!occurrenceRecord || typeof occurrenceRecord !== 'object' || Array.isArray(occurrenceRecord)) {
      continue;
    }

    if (occurrenceRecord.occurrenceType !== 'folder') {
      continue;
    }

    const repoTopToken = toRepoTopToken(occurrenceRecord.path);
    if (!repoTopToken) {
      continue;
    }

    const structuralHomeMetadata = structuralHomeLookup.get(repoTopToken);
    if (!structuralHomeMetadata) {
      continue;
    }

    evidenceRecords.push(toEvidenceRecord(occurrenceRecord, structuralHomeMetadata));
  }

  return {
    source: SOURCE_ID,
    evidenceRecords,
  };
};
