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
  for (const record of records) {
    for (const key of toIdentityKeys(record)) {
      if (!lookup.has(key)) lookup.set(key, record);
    }
  }
  return lookup;
};

const lookupEvidence = (lookup, occurrenceRecord) => {
  for (const key of toIdentityKeys(occurrenceRecord)) {
    if (lookup.has(key)) return lookup.get(key);
  }
  return null;
};

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

const hasSemanticFamilyRootEvidence = (namingRecord) => (
  namingRecord &&
  typeof namingRecord === 'object' &&
  !Array.isArray(namingRecord) &&
  typeof namingRecord.semanticName === 'string' && namingRecord.semanticName.length > 0 &&
  typeof namingRecord.semanticFamily === 'string' && namingRecord.semanticFamily.length > 0 &&
  typeof namingRecord.familyRoot === 'string' && namingRecord.familyRoot.length > 0
);

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
  if (!rule) return { source: SOURCE_ID, relationshipRecords: [] };

  const namingLookup = toEvidenceLookup(input.namingSemanticEvidenceRecords);
  const structuralLookup = toEvidenceLookup(input.treeStructuralHomeEvidence.evidenceRecords);
  const allowedTopLevelDirectorySet = toAllowedTopLevelDirectorySet(input.treeRepoShapePolicy);
  const relationshipRecords = [];

  for (const occurrenceRecord of input.addressedOccurrenceRecords) {
    if (!isRepoTopFolder(occurrenceRecord)) continue;
    if (structuralLookup.has(`path:${occurrenceRecord.path}`) || lookupEvidence(structuralLookup, occurrenceRecord)) continue;
    if (rule.repoShapeCondition === 'allowed-top-level-directory' && !allowedTopLevelDirectorySet.has(occurrenceRecord.path)) continue;

    const namingRecord = lookupEvidence(namingLookup, occurrenceRecord);
    if (!hasSemanticFamilyRootEvidence(namingRecord)) continue;

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
      rationale: 'Tree interpreted Naming semantic-family-root evidence against repository-top folder context and retained structural-home evidence.',
    });
  }

  return { source: SOURCE_ID, relationshipRecords };
};
