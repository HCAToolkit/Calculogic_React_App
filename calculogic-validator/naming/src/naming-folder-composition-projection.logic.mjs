const SOURCE_ID = 'naming-folder-composition-projection';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toActivePatternsByFolderName = (registry) => {
  const patternsByFolderName = new Map();
  for (const pattern of registry?.folderCompositionPatterns ?? []) {
    if (!isPlainObject(pattern) || pattern.status !== 'active') continue;
    if (pattern.compositionKind !== 'semantic-qualified-structural-container') continue;
    if (typeof pattern.folderName !== 'string' || pattern.folderName.length === 0) continue;
    if (typeof pattern.semanticQualifier !== 'string' || pattern.semanticQualifier.length === 0) continue;
    if (typeof pattern.structuralRoleToken !== 'string' || pattern.structuralRoleToken.length === 0) continue;
    if (!patternsByFolderName.has(pattern.folderName)) patternsByFolderName.set(pattern.folderName, pattern);
  }
  return patternsByFolderName;
};

export const projectNamingFolderCompositionBridge = ({ folderOccurrenceRecords = [], folderCompositionPatternsRegistry = {} } = {}) => {
  const patternsByFolderName = toActivePatternsByFolderName(folderCompositionPatternsRegistry);
  const observations = [];

  for (const occurrenceRecord of folderOccurrenceRecords) {
    if (!isPlainObject(occurrenceRecord) || occurrenceRecord.occurrenceType !== 'folder') continue;
    const folderName = occurrenceRecord.name ?? occurrenceRecord.actualName;
    if (typeof folderName !== 'string' || folderName.length === 0) continue;
    const pattern = patternsByFolderName.get(folderName);
    if (!pattern) continue;

    observations.push({
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
    });
  }

  return { observations: observations.sort((left, right) => left.path.localeCompare(right.path)) };
};
