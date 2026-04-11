import path from 'node:path';

const FAMILY_SCATTER_MIN_STRUCTURAL_HOMES = 2;
const FAMILY_SCATTER_MIN_FILES = 3;
const FAMILY_CLUSTER_INFO_MIN_FILES = 4;
const TREE_STRUCTURAL_ROOT_SURFACES = ['src', 'test', 'doc', 'docs', 'scripts', 'tools', 'bin', 'public', 'calculogic-validator'];
const TREE_STRUCTURAL_ROOT_SURFACE_SET = new Set(TREE_STRUCTURAL_ROOT_SURFACES);
const ALLOWED_STRUCTURAL_ROOT_PAIRINGS = [
  ['src', 'test'],
  ['doc', 'docs'],
];
const ALLOWED_STRUCTURAL_ROOT_PAIRING_SET = new Set(
  ALLOWED_STRUCTURAL_ROOT_PAIRINGS.map((pair) => pair.slice().sort((left, right) => left.localeCompare(right)).join('::')),
);
const CANONICAL_DOC_AUTHORITY_ROOT_PREFIX = 'calculogic-validator/doc/';
const CANONICAL_VALIDATOR_ROOT_PREFIX = 'calculogic-validator/';
const SHARED_ROOT_SEMANTIC_GROUPING_SUPPORTED_ROOTS = ['src/shared'];
const SHARED_ROOT_LANE_FIRST_PARTITIONS = ['build', 'build-style', 'logic', 'knowledge', 'results', 'results-style', 'tests', 'docs'];
const SHARED_ROOT_LANE_FIRST_PARTITION_SET = new Set(SHARED_ROOT_LANE_FIRST_PARTITIONS);
const SHARED_ROOT_MIN_DISTINCT_LANE_PARTITIONS = 2;
const SHARED_ROOT_MIN_FAMILY_FILES = 3;

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

const toSemanticIdentityTokens = (observation) =>
  toSortedUnique(
    [observation.familyRoot, observation.semanticFamily, observation.familySubgroup]
      .filter((value) => typeof value === 'string' && value.length > 0)
      .flatMap((value) => value.split('-').filter(Boolean).concat(value)),
  );

const toSemanticAlignmentHits = ({ path: normalizedPath }, semanticIdentityTokens) => {
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  const semanticIdentityTokenSet = new Set(semanticIdentityTokens);

  return pathSegments.flatMap((segment, index) => {
    if (
      semanticIdentityTokenSet.has(segment) ||
      semanticIdentityTokens.some((token) => segment.startsWith(`${token}-`))
    ) {
      return [{ segment, index }];
    }

    return [];
  });
};

const classifyScatterPlacement = (observation) => {
  const pathSegments = observation.path.split('/').filter(Boolean);
  const structuralRoot = pathSegments[0] ?? '.';
  const structuralSurface = pathSegments.slice(0, 2).join('/') || structuralRoot;
  const semanticIdentityTokens = toSemanticIdentityTokens(observation);
  const semanticAlignmentHits = toSemanticAlignmentHits(observation, semanticIdentityTokens);
  const firstSemanticAlignmentHit = semanticAlignmentHits[0] ?? null;
  const semanticContainerIdentity = firstSemanticAlignmentHit
    ? pathSegments.slice(0, firstSemanticAlignmentHit.index + 1).join('/')
    : null;

  return {
    path: observation.path,
    structuralRoot,
    structuralHome: toNormalizedStructuralHome(observation.path),
    structuralSurface,
    structuralRootKind: TREE_STRUCTURAL_ROOT_SURFACE_SET.has(structuralRoot) ? 'structural-surface' : 'non-structural-surface',
    semanticContainerRole: semanticContainerIdentity ? 'naming-aligned-semantic-container' : 'none',
    semanticContainerIdentity,
    semanticIdentityTokens,
    semanticAlignmentHits,
  };
};

const isAllowedStructuralRootPairing = (leftPlacement, rightPlacement) => {
  const key = [leftPlacement.structuralRoot, rightPlacement.structuralRoot]
    .sort((left, right) => left.localeCompare(right))
    .join('::');
  return ALLOWED_STRUCTURAL_ROOT_PAIRING_SET.has(key);
};

const isAllowedCanonicalDocAuthorityRuntimePairing = (leftPlacement, rightPlacement) => {
  const placementPair = [leftPlacement, rightPlacement];
  const docPlacement = placementPair.find((placement) => placement.path.startsWith(CANONICAL_DOC_AUTHORITY_ROOT_PREFIX));
  const runtimePlacement = placementPair.find(
    (placement) =>
      placement.path.startsWith(CANONICAL_VALIDATOR_ROOT_PREFIX) &&
      !placement.path.startsWith(CANONICAL_DOC_AUTHORITY_ROOT_PREFIX),
  );
  if (!docPlacement || !runtimePlacement) {
    return false;
  }

  if (runtimePlacement.semanticContainerRole !== 'naming-aligned-semantic-container') {
    return false;
  }

  const runtimeContainerSegment = runtimePlacement.semanticContainerIdentity?.split('/')[1];
  if (!runtimeContainerSegment) {
    return false;
  }

  return docPlacement.semanticAlignmentHits.some(
    (hit) => hit.segment === runtimeContainerSegment || hit.segment.startsWith(`${runtimeContainerSegment}-`),
  );
};

const isAllowedCrossContainerPlacementPair = (leftPlacement, rightPlacement) => {
  if (
    leftPlacement.semanticContainerRole === 'naming-aligned-semantic-container' &&
    rightPlacement.semanticContainerRole === 'naming-aligned-semantic-container' &&
    leftPlacement.semanticContainerIdentity === rightPlacement.semanticContainerIdentity
  ) {
    return true;
  }

  if (isAllowedStructuralRootPairing(leftPlacement, rightPlacement)) {
    return true;
  }

  return isAllowedCanonicalDocAuthorityRuntimePairing(leftPlacement, rightPlacement);
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

const toSharedRootLaneObservation = (observation) => {
  for (const sharedRoot of SHARED_ROOT_SEMANTIC_GROUPING_SUPPORTED_ROOTS) {
    const sharedRootPrefix = `${sharedRoot}/`;
    if (!observation.path.startsWith(sharedRootPrefix)) {
      continue;
    }

    const remainder = observation.path.slice(sharedRootPrefix.length);
    const [lanePartition] = remainder.split('/').filter(Boolean);
    if (!lanePartition || !SHARED_ROOT_LANE_FIRST_PARTITION_SET.has(lanePartition)) {
      return null;
    }

    return {
      sharedRoot,
      lanePartition,
      path: observation.path,
      semanticFamily: observation.semanticFamily,
    };
  }

  return null;
};

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
      const placements = familyObservations.map(classifyScatterPlacement);
      const structuralHomes = toSortedUnique(placements.map((placement) => placement.structuralHome));
      const semanticContainerIdentities = toSortedUnique(
        placements
          .filter((placement) => placement.semanticContainerRole === 'naming-aligned-semantic-container')
          .map((placement) => placement.semanticContainerIdentity),
      );
      const allPlacementsInOneSemanticContainer =
        semanticContainerIdentities.length === 1 &&
        placements.every((placement) => placement.semanticContainerRole === 'naming-aligned-semantic-container');

      const allCrossContainerPlacementsCoveredByAllowedRules = placements.every((leftPlacement, leftIndex) =>
        placements
          .slice(leftIndex + 1)
          .every((rightPlacement) => isAllowedCrossContainerPlacementPair(leftPlacement, rightPlacement)),
      );

      if (
        sortedPaths.length < FAMILY_SCATTER_MIN_FILES ||
        structuralHomes.length < FAMILY_SCATTER_MIN_STRUCTURAL_HOMES ||
        allPlacementsInOneSemanticContainer ||
        allCrossContainerPlacementsCoveredByAllowedRules
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
            observedStructuralRoots: toSortedUnique(placements.map((placement) => placement.structuralRoot)),
            observedContainerIdentities: semanticContainerIdentities,
            observedStructuralRootKinds: toSortedUnique(placements.map((placement) => placement.structuralRootKind)),
            allowedCrossContainerPatterns: {
              structuralRootPairings: ALLOWED_STRUCTURAL_ROOT_PAIRINGS,
              canonicalDocAuthorityRuntimePairing: 'calculogic-validator/doc/** <-> calculogic-validator/<semantic-container>/**',
            },
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
  const singularObservations = observations
    .filter((observation) => isSingularFamilyEvidence(observation))
    .map((observation) => ({
      observation,
      placement: classifyScatterPlacement(observation),
    }));

  const observationsBySemanticFamily = new Map();
  for (const entry of singularObservations) {
    if (!observationsBySemanticFamily.has(entry.observation.semanticFamily)) {
      observationsBySemanticFamily.set(entry.observation.semanticFamily, []);
    }

    observationsBySemanticFamily.get(entry.observation.semanticFamily).push(entry);
  }

  return Array.from(observationsBySemanticFamily.entries())
    .sort(([leftFamily], [rightFamily]) => leftFamily.localeCompare(rightFamily))
    .flatMap(([semanticFamily, familyEntries]) => {
      const allEntriesHaveSemanticContainer = familyEntries.every(
        ({ placement }) => placement.semanticContainerRole === 'naming-aligned-semantic-container',
      );

      const aggregationBuckets = new Map();
      for (const familyEntry of familyEntries) {
        const bucketKey = allEntriesHaveSemanticContainer
          ? `container::${familyEntry.placement.semanticContainerIdentity}`
          : `family::${semanticFamily}`;
        if (!aggregationBuckets.has(bucketKey)) {
          aggregationBuckets.set(bucketKey, []);
        }

        aggregationBuckets.get(bucketKey).push(familyEntry);
      }

      return Array.from(aggregationBuckets.entries())
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .flatMap(([, bucketEntries]) => {
          if (bucketEntries.length < FAMILY_CLUSTER_INFO_MIN_FILES) {
            return [];
          }

          const sortedPaths = bucketEntries
            .map(({ observation }) => observation.path)
            .sort((left, right) => left.localeCompare(right));
          const semanticContainerIdentity = bucketEntries[0].placement.semanticContainerIdentity ?? null;

          return [
            {
              code: 'TREE_OBSERVED_FAMILY_CLUSTER',
              severity: 'info',
              path: sortedPaths[0],
              classification: 'advisory-structure',
              message:
                'Naming-owned semantic-family cluster size is high enough to consider a clearer structural grouping surface.',
              ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
              details: {
                semanticFamily,
                semanticContainerIdentity,
                aggregationUnit: semanticContainerIdentity ? 'semanticFamily-in-container' : 'semanticFamily',
                observedCount: bucketEntries.length,
                observedPaths: sortedPaths,
                threshold: {
                  minFamilyFilesForClusterObservation: FAMILY_CLUSTER_INFO_MIN_FILES,
                },
              },
            },
          ];
        });
    });
};

const collectSharedRootFamilyScatterAcrossLanesFindings = (observations) => {
  const observationsBySharedRootAndFamily = new Map();

  for (const observation of observations) {
    if (!isSingularFamilyEvidence(observation)) {
      continue;
    }

    const sharedRootLaneObservation = toSharedRootLaneObservation(observation);
    if (!sharedRootLaneObservation) {
      continue;
    }

    const mapKey = `${sharedRootLaneObservation.sharedRoot}::${sharedRootLaneObservation.semanticFamily}`;
    if (!observationsBySharedRootAndFamily.has(mapKey)) {
      observationsBySharedRootAndFamily.set(mapKey, []);
    }

    observationsBySharedRootAndFamily.get(mapKey).push(sharedRootLaneObservation);
  }

  return Array.from(observationsBySharedRootAndFamily.entries())
    .sort(([leftMapKey], [rightMapKey]) => leftMapKey.localeCompare(rightMapKey))
    .flatMap(([, sharedFamilyObservations]) => {
      const sortedPaths = sharedFamilyObservations.map(({ path: normalizedPath }) => normalizedPath).sort((a, b) => a.localeCompare(b));
      const observedLanePartitions = toSortedUnique(
        sharedFamilyObservations.map(({ lanePartition }) => lanePartition),
      );

      if (
        observedLanePartitions.length < SHARED_ROOT_MIN_DISTINCT_LANE_PARTITIONS ||
        sortedPaths.length < SHARED_ROOT_MIN_FAMILY_FILES
      ) {
        return [];
      }

      const { sharedRoot, semanticFamily } = sharedFamilyObservations[0];
      return [
        {
          code: 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES',
          severity: 'info',
          path: sortedPaths[0],
          classification: 'advisory-structure',
          message:
            'Naming-owned semantic-family evidence is spread across lane-first partitions under a shared root and may benefit from semantic-first grouping.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            sharedRootPath: sharedRoot,
            semanticFamily,
            observedLanePartitions,
            observedPaths: sortedPaths,
            thresholds: {
              supportedSharedRoots: SHARED_ROOT_SEMANTIC_GROUPING_SUPPORTED_ROOTS,
              allowedLaneFirstPartitions: SHARED_ROOT_LANE_FIRST_PARTITIONS,
              minDistinctLanePartitions: SHARED_ROOT_MIN_DISTINCT_LANE_PARTITIONS,
              minFamilyFiles: SHARED_ROOT_MIN_FAMILY_FILES,
            },
            suggestedSemanticTargetRoot: `${sharedRoot}/${semanticFamily}`,
          },
        },
      ];
    });
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
    ...collectSharedRootFamilyScatterAcrossLanesFindings(observations),
  ];
};
