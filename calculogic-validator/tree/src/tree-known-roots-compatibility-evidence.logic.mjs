const SOURCE_ID = 'tree-known-roots-compatibility';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree known-roots compatibility evidence input must be an object.');
  }

  if (!input.addressedTreeSnapshot || typeof input.addressedTreeSnapshot !== 'object' || Array.isArray(input.addressedTreeSnapshot)) {
    throw new Error('Tree known-roots compatibility evidence input must include addressedTreeSnapshot object.');
  }

  if (!Array.isArray(input.addressedTreeSnapshot.occurrenceRecords)) {
    throw new Error('Tree known-roots compatibility evidence addressedTreeSnapshot.occurrenceRecords must be an array.');
  }

  if (!input.knownRootsRegistry || typeof input.knownRootsRegistry !== 'object' || Array.isArray(input.knownRootsRegistry)) {
    throw new Error('Tree known-roots compatibility evidence input must include knownRootsRegistry object.');
  }

  if (!Array.isArray(input.knownRootsRegistry.topRoots)) {
    throw new Error('Tree known-roots compatibility evidence knownRootsRegistry.topRoots must be an array.');
  }
};

const toTopRootLookup = (topRoots) => {
  const lookup = new Map();
  for (const topRoot of topRoots) {
    if (!topRoot || typeof topRoot !== 'object' || Array.isArray(topRoot)) {
      continue;
    }

    if (typeof topRoot.root !== 'string' || topRoot.root.length === 0 || lookup.has(topRoot.root)) {
      continue;
    }

    lookup.set(topRoot.root, {
      knownRoot: topRoot.root,
      knownRootKind: topRoot.kind ?? null,
      knownRootOwnershipSource: topRoot.ownershipSource ?? null,
      ...(typeof topRoot.styleClass === 'string' && topRoot.styleClass.length > 0
        ? { knownRootStyleClass: topRoot.styleClass }
        : {}),
    });
  }

  return lookup;
};

const toEvidenceRecord = (occurrenceRecord, knownRootMetadata) => ({
  addressPath: occurrenceRecord.addressPath,
  path: occurrenceRecord.path,
  name: occurrenceRecord.name,
  occurrenceType: occurrenceRecord.occurrenceType,
  knownRoot: knownRootMetadata.knownRoot,
  knownRootKind: knownRootMetadata.knownRootKind,
  knownRootOwnershipSource: knownRootMetadata.knownRootOwnershipSource,
  compatibilityRole: 'known-root',
  evidenceStrength: 'compatibility',
  rationale: 'Matched current Tree known-roots compatibility vocabulary.',
  ...(Object.hasOwn(knownRootMetadata, 'knownRootStyleClass')
    ? { knownRootStyleClass: knownRootMetadata.knownRootStyleClass }
    : {}),
});

export const prepareTreeKnownRootsCompatibilityEvidence = (input) => {
  assertValidInput(input);

  const topRootLookup = toTopRootLookup(input.knownRootsRegistry.topRoots);
  const evidenceRecords = [];

  for (const occurrenceRecord of input.addressedTreeSnapshot.occurrenceRecords) {
    if (!occurrenceRecord || typeof occurrenceRecord !== 'object' || Array.isArray(occurrenceRecord)) {
      continue;
    }

    if (occurrenceRecord.occurrenceType !== 'folder') {
      continue;
    }

    const knownRootMetadata = topRootLookup.get(occurrenceRecord.name);
    if (!knownRootMetadata) {
      continue;
    }

    evidenceRecords.push(toEvidenceRecord(occurrenceRecord, knownRootMetadata));
  }

  return {
    source: SOURCE_ID,
    evidenceRecords,
  };
};
