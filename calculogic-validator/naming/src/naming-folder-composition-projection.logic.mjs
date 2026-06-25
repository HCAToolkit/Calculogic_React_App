const SOURCE_ID = 'naming-folder-composition-projection';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toActivePatternsByFolderName = (patterns = [], { expectedKind } = {}) => {
  const patternsByFolderName = new Map();
  for (const pattern of patterns) {
    if (!isPlainObject(pattern) || pattern.status !== 'active') continue;
    if (expectedKind && pattern.compositionKind !== expectedKind) continue;
    if (typeof pattern.folderName !== 'string' || pattern.folderName.length === 0) continue;
    if (!patternsByFolderName.has(pattern.folderName)) patternsByFolderName.set(pattern.folderName, pattern);
  }
  return patternsByFolderName;
};

const toFolderCompositionObservation = ({ occurrenceRecord, pattern }) => {
  if (typeof pattern.semanticQualifier !== 'string' || pattern.semanticQualifier.length === 0) return null;
  if (typeof pattern.structuralRoleToken !== 'string' || pattern.structuralRoleToken.length === 0) return null;

  return {
    path: occurrenceRecord.path,
    repoRelativePath: occurrenceRecord.path,
    occurrenceType: 'folder',
    semanticName: pattern.semanticQualifier,
    semanticFamily: pattern.semanticQualifier,
    familyRoot: pattern.semanticQualifier,
    semanticEvidenceKind: 'folder-semantic-structural-composition',
    folderCompositionKind: pattern.compositionKind,
    semanticQualifier: pattern.semanticQualifier,
    structuralRoleToken: pattern.structuralRoleToken,
    tokenOrder: [...(pattern.tokenOrder ?? [])],
    compositionQualification: pattern.qualification ?? 'explicit-supported-folder-composition',
    compositionConfidence: pattern.confidence ?? 'bounded',
    evidenceSource: SOURCE_ID,
    evidenceProvenance: {
      patternId: pattern.patternId ?? null,
      sourceRegistry: 'naming-folder-composition-patterns',
      occurrenceType: 'folder',
    },
  };
};

const toFolderSemanticContextObservation = ({ occurrenceRecord, pattern }) => {
  if (typeof pattern.semanticContext !== 'string' || pattern.semanticContext.length === 0) return null;

  return {
    path: occurrenceRecord.path,
    repoRelativePath: occurrenceRecord.path,
    occurrenceType: 'folder',
    semanticName: pattern.semanticContext,
    semanticFamily: pattern.semanticContext,
    familyRoot: pattern.semanticContext,
    semanticEvidenceKind: 'folder-semantic-context',
    semanticContext: pattern.semanticContext,
    semanticContextQualification: pattern.qualification ?? 'explicit-supported-folder-semantic-context',
    semanticContextConfidence: pattern.confidence ?? 'bounded',
    evidenceSource: SOURCE_ID,
    evidenceProvenance: {
      patternId: pattern.patternId ?? null,
      sourceRegistry: 'naming-folder-composition-patterns',
      occurrenceType: 'folder',
    },
  };
};

export const projectNamingFolderCompositionBridge = ({ folderOccurrenceRecords = [], folderCompositionPatternsRegistry = {} } = {}) => {
  const compositionPatternsByFolderName = toActivePatternsByFolderName(
    folderCompositionPatternsRegistry.folderCompositionPatterns,
    { expectedKind: 'semantic-qualified-structural-container' },
  );
  const semanticContextPatternsByFolderName = toActivePatternsByFolderName(
    folderCompositionPatternsRegistry.folderSemanticContextPatterns,
  );
  const observations = [];

  for (const occurrenceRecord of folderOccurrenceRecords) {
    if (!isPlainObject(occurrenceRecord) || occurrenceRecord.occurrenceType !== 'folder') continue;
    const folderName = occurrenceRecord.name ?? occurrenceRecord.actualName;
    if (typeof folderName !== 'string' || folderName.length === 0) continue;

    const compositionPattern = compositionPatternsByFolderName.get(folderName);
    const compositionObservation = compositionPattern ? toFolderCompositionObservation({ occurrenceRecord, pattern: compositionPattern }) : null;
    if (compositionObservation) observations.push(compositionObservation);

    const semanticContextPattern = semanticContextPatternsByFolderName.get(folderName);
    const semanticContextObservation = semanticContextPattern ? toFolderSemanticContextObservation({ occurrenceRecord, pattern: semanticContextPattern }) : null;
    if (semanticContextObservation) observations.push(semanticContextObservation);
  }

  return {
    observations: observations.sort((left, right) =>
      left.path.localeCompare(right.path) || left.semanticEvidenceKind.localeCompare(right.semanticEvidenceKind),
    ),
  };
};
