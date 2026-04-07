import path from 'node:path';

const FAMILY_SCATTER_MIN_STRUCTURAL_HOMES = 2;
const FAMILY_SCATTER_MIN_FILES = 3;
const FAMILY_CLUSTER_INFO_MIN_FILES = 4;

const toSortedUnique = (values) => Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));

const toSortedUniqueStringFlags = (flags) =>
  toSortedUnique(flags.filter((flag) => typeof flag === 'string' && flag.length > 0));

const toNormalizedStructuralHome = (normalizedPath) => {
  const parentDirectory = path.posix.dirname(normalizedPath);
  if (parentDirectory === '.') {
    return '.';
  }

  const segments = parentDirectory.split('/').filter(Boolean);
  if (segments.length < 2) {
    return parentDirectory;
  }

  return segments.slice(0, 2).join('/');
};

const toNormalizedBridgeObservation = (observation) => {
  if (!observation || typeof observation !== 'object' || Array.isArray(observation)) {
    return null;
  }

  const requiredFields = ['path', 'semanticName', 'familyRoot', 'semanticFamily'];
  for (const requiredField of requiredFields) {
    if (typeof observation[requiredField] !== 'string' || observation[requiredField].length === 0) {
      return null;
    }
  }

  return {
    path: observation.path,
    semanticName: observation.semanticName,
    familyRoot: observation.familyRoot,
    semanticFamily: observation.semanticFamily,
    ...(typeof observation.familySubgroup === 'string' && observation.familySubgroup.length > 0
      ? { familySubgroup: observation.familySubgroup }
      : {}),
    ...(Array.isArray(observation.ambiguityFlags)
      ? { ambiguityFlags: toSortedUniqueStringFlags(observation.ambiguityFlags) }
      : {}),
    ...(Array.isArray(observation.splitFamilyFlags)
      ? { splitFamilyFlags: toSortedUniqueStringFlags(observation.splitFamilyFlags) }
      : {}),
  };
};

export const prepareNamingSemanticFamilyBridge = (bridgePayload) => {
  if (!bridgePayload || typeof bridgePayload !== 'object' || Array.isArray(bridgePayload)) {
    return { observations: [] };
  }

  if (!Array.isArray(bridgePayload.observations)) {
    throw new Error('Tree naming semantic-family bridge requires observations[] when payload is provided.');
  }

  const normalizedObservations = bridgePayload.observations
    .map(toNormalizedBridgeObservation)
    .filter(Boolean)
    .sort((left, right) => left.path.localeCompare(right.path));

  return {
    observations: normalizedObservations,
  };
};

const isSingularFamilyEvidence = (observation) => (observation.ambiguityFlags ?? []).length === 0;

const collectFamilyScatterFindings = (observations) => {
  const observationsBySemanticFamily = new Map();

  for (const observation of observations) {
    if (!isSingularFamilyEvidence(observation)) {
      continue;
    }

    if (!observationsBySemanticFamily.has(observation.semanticFamily)) {
      observationsBySemanticFamily.set(observation.semanticFamily, []);
    }

    observationsBySemanticFamily.get(observation.semanticFamily).push(observation);
  }

  return Array.from(observationsBySemanticFamily.entries())
    .sort(([leftFamily], [rightFamily]) => leftFamily.localeCompare(rightFamily))
    .flatMap(([semanticFamily, familyObservations]) => {
      const sortedPaths = familyObservations.map(({ path: normalizedPath }) => normalizedPath).sort((a, b) => a.localeCompare(b));
      const structuralHomes = toSortedUnique(
        familyObservations.map(({ path: normalizedPath }) => toNormalizedStructuralHome(normalizedPath)),
      );

      if (
        sortedPaths.length < FAMILY_SCATTER_MIN_FILES ||
        structuralHomes.length < FAMILY_SCATTER_MIN_STRUCTURAL_HOMES
      ) {
        return [];
      }

      return [
        {
          code: 'TREE_FAMILY_SCATTERED',
          severity: 'info',
          path: sortedPaths[0],
          classification: 'advisory-structure',
          message:
            'Naming-owned semantic-family evidence is spread across multiple structural homes and may benefit from clearer semantic-first grouping.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            semanticFamily,
            observedPaths: sortedPaths,
            observedStructuralHomes: structuralHomes,
            thresholds: {
              minFamilyFiles: FAMILY_SCATTER_MIN_FILES,
              minStructuralHomes: FAMILY_SCATTER_MIN_STRUCTURAL_HOMES,
            },
          },
        },
      ];
    });
};

const collectFamilyClusterFindings = (observations) => {
  const familyCounts = new Map();

  for (const observation of observations) {
    if (!isSingularFamilyEvidence(observation)) {
      continue;
    }

    familyCounts.set(observation.semanticFamily, (familyCounts.get(observation.semanticFamily) ?? 0) + 1);
  }

  return observations
    .filter((observation) => isSingularFamilyEvidence(observation))
    .filter((observation) => (familyCounts.get(observation.semanticFamily) ?? 0) >= FAMILY_CLUSTER_INFO_MIN_FILES)
    .sort((left, right) => left.path.localeCompare(right.path))
    .filter((observation, index, sorted) => index === 0 || sorted[index - 1].semanticFamily !== observation.semanticFamily)
    .map((observation) => ({
      code: 'TREE_OBSERVED_FAMILY_CLUSTER',
      severity: 'info',
      path: observation.path,
      classification: 'advisory-structure',
      message:
        'Naming-owned semantic-family cluster size is high enough to consider a clearer structural grouping surface.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
      details: {
        semanticFamily: observation.semanticFamily,
        observedCount: familyCounts.get(observation.semanticFamily),
        threshold: {
          minFamilyFilesForClusterObservation: FAMILY_CLUSTER_INFO_MIN_FILES,
        },
      },
    }));
};

export const collectNamingSemanticFamilyBridgeFindings = (bridgePayload) => {
  const namingSemanticFamilyBridge = prepareNamingSemanticFamilyBridge(bridgePayload);
  const observations = namingSemanticFamilyBridge.observations;

  if (observations.length === 0) {
    return [];
  }

  return [
    ...collectFamilyScatterFindings(observations),
    ...collectFamilyClusterFindings(observations),
  ];
};
