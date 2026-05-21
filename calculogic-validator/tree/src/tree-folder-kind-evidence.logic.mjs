const SOURCE_ID = 'tree-folder-kind-evidence';

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Tree folder-kind evidence input must be an object.');
  }

  if (!Array.isArray(input.addressedOccurrenceRecords)) {
    throw new Error('Tree folder-kind evidence input addressedOccurrenceRecords must be an array.');
  }

  if (!input.folderKindsRegistry || typeof input.folderKindsRegistry !== 'object' || Array.isArray(input.folderKindsRegistry)) {
    throw new Error('Tree folder-kind evidence input must include folderKindsRegistry object.');
  }

  if (!Array.isArray(input.folderKindsRegistry.folderKinds)) {
    throw new Error('Tree folder-kind evidence folderKindsRegistry.folderKinds must be an array.');
  }

  if (!input.treeStructuralHomeEvidence || typeof input.treeStructuralHomeEvidence !== 'object' || Array.isArray(input.treeStructuralHomeEvidence)) {
    throw new Error('Tree folder-kind evidence input must include treeStructuralHomeEvidence object.');
  }

  if (!Array.isArray(input.treeStructuralHomeEvidence.evidenceRecords)) {
    throw new Error('Tree folder-kind evidence treeStructuralHomeEvidence.evidenceRecords must be an array.');
  }

  if (!input.treeSemanticHomeEvidence || typeof input.treeSemanticHomeEvidence !== 'object' || Array.isArray(input.treeSemanticHomeEvidence)) {
    throw new Error('Tree folder-kind evidence input must include treeSemanticHomeEvidence object.');
  }

  if (!Array.isArray(input.treeSemanticHomeEvidence.evidenceRecords)) {
    throw new Error('Tree folder-kind evidence treeSemanticHomeEvidence.evidenceRecords must be an array.');
  }
};

const toSupportedFolderKindSet = (folderKinds) =>
  new Set(
    folderKinds
      .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
      .map((entry) => entry.folderKind)
      .filter((folderKind) => typeof folderKind === 'string' && folderKind.length > 0),
  );

const toPathLookup = (evidenceRecords, evidenceKey) => {
  const lookup = new Map();

  for (const evidenceRecord of evidenceRecords) {
    if (!evidenceRecord || typeof evidenceRecord !== 'object' || Array.isArray(evidenceRecord)) {
      continue;
    }

    if (typeof evidenceRecord.path !== 'string' || evidenceRecord.path.length === 0) {
      continue;
    }

    if (lookup.has(evidenceRecord.path)) {
      continue;
    }

    lookup.set(evidenceRecord.path, evidenceRecord[evidenceKey] ?? null);
  }

  return lookup;
};

const toEvidenceRecord = ({ occurrenceRecord, folderKind, folderKindSource, folderKindEvidenceStrength, structuralHome, semanticHome, rationale }) => ({
  addressPath: occurrenceRecord.addressPath ?? null,
  parentAddressPath: occurrenceRecord.parentAddressPath ?? null,
  path: occurrenceRecord.path ?? null,
  name: occurrenceRecord.name ?? null,
  occurrenceType: occurrenceRecord.occurrenceType ?? null,
  folderKind,
  folderKindSource,
  folderKindEvidenceStrength,
  structuralHome,
  semanticHome,
  rationale,
});

export const prepareTreeFolderKindEvidence = (input) => {
  assertValidInput(input);

  const supportedFolderKinds = toSupportedFolderKindSet(input.folderKindsRegistry.folderKinds);
  const structuralHomeByPath = toPathLookup(input.treeStructuralHomeEvidence.evidenceRecords, 'structuralHome');
  const semanticHomeByPath = toPathLookup(input.treeSemanticHomeEvidence.evidenceRecords, 'semanticHome');

  const evidenceRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    if (!occurrenceRecord || typeof occurrenceRecord !== 'object' || Array.isArray(occurrenceRecord)) {
      continue;
    }

    if (occurrenceRecord.occurrenceType !== 'folder') {
      continue;
    }

    if (typeof occurrenceRecord.path !== 'string' || occurrenceRecord.path.length === 0) {
      continue;
    }

    const structuralHome = structuralHomeByPath.get(occurrenceRecord.path) ?? null;
    const semanticHome = semanticHomeByPath.get(occurrenceRecord.path) ?? null;

    if (structuralHome && supportedFolderKinds.has('structural')) {
      evidenceRecords.push(
        toEvidenceRecord({
          occurrenceRecord,
          folderKind: 'structural',
          folderKindSource: SOURCE_ID,
          folderKindEvidenceStrength: 'derived-from-structural-home-evidence',
          structuralHome,
          semanticHome,
          rationale: 'Tree structural-home evidence linked this folder path to a structural home.',
        }),
      );
      continue;
    }

    if (semanticHome && supportedFolderKinds.has('semantic')) {
      evidenceRecords.push(
        toEvidenceRecord({
          occurrenceRecord,
          folderKind: 'semantic',
          folderKindSource: SOURCE_ID,
          folderKindEvidenceStrength: 'derived-from-semantic-home-evidence',
          structuralHome,
          semanticHome,
          rationale: 'Tree semantic-home evidence linked this folder path to a semantic home.',
        }),
      );
      continue;
    }

    if (supportedFolderKinds.has('unspecified')) {
      evidenceRecords.push(
        toEvidenceRecord({
          occurrenceRecord,
          folderKind: 'unspecified',
          folderKindSource: SOURCE_ID,
          folderKindEvidenceStrength: 'insufficient-tree-owned-evidence',
          structuralHome,
          semanticHome,
          rationale: 'Tree-owned structural-home and semantic-home evidence did not resolve a stronger folder kind.',
        }),
      );
    }
  }

  return {
    source: SOURCE_ID,
    evidenceRecords,
  };
};
