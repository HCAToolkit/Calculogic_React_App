const SOURCE_ID = 'tree-semantic-naming-folder-type-relationship';

const toIdentityKeys = (record) => {
  const keys = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return keys;
  if (typeof record.addressPath === 'string' && record.addressPath.length > 0) keys.push(`address:${record.addressPath}`);
  if (typeof record.path === 'string' && record.path.length > 0 && typeof record.occurrenceType === 'string') {
    keys.push(`path-type:${record.path}::${record.occurrenceType}`);
  }
  if (typeof record.path === 'string' && record.path.length > 0) keys.push(`path:${record.path}`);
  return keys;
};

const toEvidenceLookup = (records) => {
  const lookup = new Map();
  const ambiguousKeys = new Set();
  for (const record of records) {
    for (const key of toIdentityKeys(record)) {
      if (lookup.has(key)) {
        ambiguousKeys.add(key);
        continue;
      }
      lookup.set(key, record);
    }
  }
  return { lookup, ambiguousKeys };
};

const lookupEvidence = (evidenceLookup, occurrenceRecord) => {
  for (const key of toIdentityKeys(occurrenceRecord)) {
    if (evidenceLookup.lookup.has(key)) return evidenceLookup.lookup.get(key);
  }
  return null;
};

const hasAmbiguousEvidence = (evidenceLookup, occurrenceRecord) =>
  toIdentityKeys(occurrenceRecord).some((key) => evidenceLookup.ambiguousKeys.has(key));

const isRepoTopFolder = (occurrenceRecord) => (
  occurrenceRecord?.occurrenceType === 'folder' &&
  typeof occurrenceRecord.path === 'string' &&
  occurrenceRecord.path.length > 0 &&
  !occurrenceRecord.path.includes('/') &&
  !occurrenceRecord.path.includes('\\')
);

const toAllowedTopLevelDirectorySet = (treeRepoShapePolicy) => new Set(
  (treeRepoShapePolicy?.allowedTopLevelDirectories ?? [])
    .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0),
);

const toActiveRepositoryTopFamilyHomeRule = (registry) => (
  registry.semanticNamingFolderTypeRelationships ?? []
).find((rule) => (
  rule?.status === 'active' &&
  rule.relationshipPerspective === 'semantic-repository-top-family-home' &&
  rule.namingPerspective === 'semantic-family-root' &&
  rule.treeFolderType === 'repository-top-folder' &&
  rule.structuralHomeCondition === 'not-structural-home'
));

const hasRequiredSemanticFields = (namingRecord) => (
  namingRecord &&
  typeof namingRecord === 'object' &&
  !Array.isArray(namingRecord) &&
  typeof namingRecord.semanticName === 'string' && namingRecord.semanticName.length > 0 &&
  typeof namingRecord.semanticFamily === 'string' && namingRecord.semanticFamily.length > 0 &&
  typeof namingRecord.familyRoot === 'string' && namingRecord.familyRoot.length > 0
);

const isQualifiedSemanticFamilyRootObservation = (namingRecord) => (
  hasRequiredSemanticFields(namingRecord) &&
  namingRecord.occurrenceType === 'folder' &&
  namingRecord.semanticEvidenceKind === 'semantic-family-root-folder' &&
  namingRecord.familyRootQualification === 'package-root-folder'
);

const toUnclassifiedRelationshipRecord = ({ occurrenceRecord, reason, diagnostic }) => ({
  addressPath: occurrenceRecord.addressPath ?? null,
  parentAddressPath: occurrenceRecord.parentAddressPath ?? null,
  path: occurrenceRecord.path ?? null,
  name: occurrenceRecord.name ?? null,
  occurrenceType: occurrenceRecord.occurrenceType ?? null,
  relationshipPerspective: null,
  relationshipSource: SOURCE_ID,
  classificationExplanation: { reason, diagnostic },
});

const assertValidInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Tree semantic naming folder-type relationship input must be an object.');
  if (!Array.isArray(input.addressedOccurrenceRecords)) throw new Error('Tree semantic naming folder-type relationship input addressedOccurrenceRecords must be an array.');
  if (!Array.isArray(input.namingSemanticEvidenceRecords)) throw new Error('Tree semantic naming folder-type relationship input namingSemanticEvidenceRecords must be an array.');
  if (!input.treeStructuralHomeEvidence || !Array.isArray(input.treeStructuralHomeEvidence.evidenceRecords)) throw new Error('Tree semantic naming folder-type relationship input treeStructuralHomeEvidence.evidenceRecords must be an array.');
  if (!input.relationshipsRegistry || !Array.isArray(input.relationshipsRegistry.semanticNamingFolderTypeRelationships)) throw new Error('Tree semantic naming folder-type relationship input relationshipsRegistry.semanticNamingFolderTypeRelationships must be an array.');
};

export const prepareTreeSemanticNamingFolderTypeRelationshipEvidence = (input) => {
  assertValidInput(input);

  const rule = toActiveRepositoryTopFamilyHomeRule(input.relationshipsRegistry);


  const namingLookup = toEvidenceLookup(input.namingSemanticEvidenceRecords);
  const structuralLookup = toEvidenceLookup(input.treeStructuralHomeEvidence.evidenceRecords);
  const allowedTopLevelDirectorySet = toAllowedTopLevelDirectorySet(input.treeRepoShapePolicy);
  const relationshipRecords = [];
  const unclassifiedRelationshipRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    if (occurrenceRecord?.occurrenceType !== 'folder') continue;
    if (!isRepoTopFolder(occurrenceRecord)) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: 'non-repository-top-descendant',
        diagnostic: 'The repository-top family-root relationship applies only to repository-top folder occurrences.',
      }));
      continue;
    }
    if (lookupEvidence(structuralLookup, occurrenceRecord)) continue;
    if (!rule) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: 'no-active-relationship-perspective-match',
        diagnostic: 'No active Tree relationship perspective matched this Naming and folder-type evidence combination.',
      }));
      continue;
    }
    if (rule.repoShapeCondition === 'allowed-top-level-directory' && !allowedTopLevelDirectorySet.has(occurrenceRecord.path)) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: 'unknown-or-unmodeled-folder-relationship',
        diagnostic: 'The folder is not allowed by repo-shape policy and has no registered semantic repository-top relationship.',
      }));
      continue;
    }
    if (hasAmbiguousEvidence(namingLookup, occurrenceRecord)) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: 'ambiguous-or-conflicting-evidence',
        diagnostic: 'Multiple Naming evidence records matched this folder occurrence, so Tree did not choose a semantic repository-top relationship.',
      }));
      continue;
    }

    const namingRecord = lookupEvidence(namingLookup, occurrenceRecord);
    if (!namingRecord) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: 'missing-required-naming-observation',
        diagnostic: 'No semantic repository-top family-home relationship was established because Tree received no addressed Naming semantic-family-root observation for this folder occurrence.',
      }));
      continue;
    }
    if (!isQualifiedSemanticFamilyRootObservation(namingRecord)) {
      unclassifiedRelationshipRecords.push(toUnclassifiedRelationshipRecord({
        occurrenceRecord,
        reason: hasRequiredSemanticFields(namingRecord) ? 'naming-observation-not-qualified-as-family-root' : 'missing-required-naming-observation',
        diagnostic: hasRequiredSemanticFields(namingRecord)
          ? 'Naming evidence exists for this folder, but it does not identify the folder occurrence itself as a semantic-family-root observation.'
          : 'Naming evidence for this folder is missing required semantic-family-root fields.',
      }));
      continue;
    }

    relationshipRecords.push({
      addressPath: occurrenceRecord.addressPath ?? null,
      parentAddressPath: occurrenceRecord.parentAddressPath ?? null,
      path: occurrenceRecord.path,
      name: occurrenceRecord.name ?? null,
      occurrenceType: occurrenceRecord.occurrenceType ?? null,
      relationshipPerspective: rule.relationshipPerspective,
      relationshipSource: SOURCE_ID,
      relationshipEvidenceStrength: namingRecord.evidenceStrength ?? 'bounded',
      namingPerspective: rule.namingPerspective,
      treeFolderType: rule.treeFolderType,
      structuralHomeCondition: rule.structuralHomeCondition,
      repoShapeCondition: rule.repoShapeCondition ?? null,
      semanticName: namingRecord.semanticName,
      semanticFamily: namingRecord.semanticFamily,
      familyRoot: namingRecord.familyRoot,
      ...(typeof namingRecord.familySubgroup === 'string' && namingRecord.familySubgroup.length > 0 ? { familySubgroup: namingRecord.familySubgroup } : {}),
      namingEvidenceSource: namingRecord.evidenceSource ?? 'namingSemanticFamilyBridge',
      semanticEvidenceKind: namingRecord.semanticEvidenceKind,
      familyRootQualification: namingRecord.familyRootQualification,
      ...(namingRecord.addressProfileId ? { addressProfileId: namingRecord.addressProfileId } : {}),
      ...(namingRecord.addressedSnapshotId ? { addressedSnapshotId: namingRecord.addressedSnapshotId } : {}),
      ...(namingRecord.occurrenceAddress ? { occurrenceAddress: namingRecord.occurrenceAddress } : {}),
      ...(namingRecord.evidenceProvenance ? { evidenceProvenance: { ...namingRecord.evidenceProvenance } } : {}),
      rationale: 'Tree interpreted an explicitly qualified Naming semantic-family-root folder observation against repository-top folder context and retained structural-home evidence.',
    });
  }

  return { source: SOURCE_ID, relationshipRecords, unclassifiedRelationshipRecords };
};
