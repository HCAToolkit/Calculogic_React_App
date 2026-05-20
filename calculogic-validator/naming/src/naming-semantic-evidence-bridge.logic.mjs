const toSortedUniqueStringValues = (values) =>
  Array.from(
    new Set(values.filter((value) => typeof value === 'string' && value.length > 0)),
  ).sort((left, right) => left.localeCompare(right));

const toNamingSemanticEvidenceRecord = (observation) => {
  if (!observation || typeof observation !== 'object' || Array.isArray(observation)) {
    return null;
  }

  if (typeof observation.path !== 'string' || observation.path.length === 0) {
    return null;
  }

  if (
    typeof observation.semanticName !== 'string' ||
    observation.semanticName.length === 0 ||
    typeof observation.semanticFamily !== 'string' ||
    observation.semanticFamily.length === 0 ||
    typeof observation.familyRoot !== 'string' ||
    observation.familyRoot.length === 0
  ) {
    return null;
  }

  const splitMarkers = toSortedUniqueStringValues([
    ...(Array.isArray(observation.ambiguityFlags) ? observation.ambiguityFlags : []),
    ...(Array.isArray(observation.splitFamilyFlags) ? observation.splitFamilyFlags : []),
  ]);

  return {
    path: observation.path,
    semanticName: observation.semanticName,
    semanticFamily: observation.semanticFamily,
    familyRoot: observation.familyRoot,
    ...(typeof observation.familySubgroup === 'string' && observation.familySubgroup.length > 0
      ? { familySubgroup: observation.familySubgroup }
      : {}),
    semanticNameSource: 'naming-canonical-finding',
    semanticFamilySource: 'naming-family-derivation',
    evidenceSource: 'namingSemanticFamilyBridge',
    evidenceStrength: splitMarkers.length === 0 ? 'high' : 'bounded',
    ambiguityStatus: splitMarkers.length === 0 ? 'none' : 'present',
    ...(splitMarkers.length > 0 ? { splitMarkers } : {}),
  };
};

export const prepareNamingSemanticEvidenceBridge = (namingSemanticFamilyBridge = {}) => {
  if (
    !namingSemanticFamilyBridge ||
    typeof namingSemanticFamilyBridge !== 'object' ||
    Array.isArray(namingSemanticFamilyBridge)
  ) {
    throw new Error('Naming semantic evidence bridge requires an object payload.');
  }

  const observations = Array.isArray(namingSemanticFamilyBridge.observations)
    ? namingSemanticFamilyBridge.observations
    : [];

  return {
    observations: observations
      .map(toNamingSemanticEvidenceRecord)
      .filter(Boolean)
      .sort((left, right) => left.path.localeCompare(right.path) || left.semanticName.localeCompare(right.semanticName)),
  };
};
