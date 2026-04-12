import path from 'node:path';

const FAMILY_SCATTER_MIN_STRUCTURAL_HOMES = 2;
const FAMILY_SCATTER_MIN_FILES = 3;
const FAMILY_CLUSTER_INFO_MIN_FILES = 4;
const FAMILY_SUBGROUP_OPPORTUNITY_MIN_FILES_IN_CONTAINER = 4;
const FAMILY_SUBGROUP_OPPORTUNITY_MIN_DISTINCT_CONTAINER_LOCAL_HOMES = 2;
const FAMILY_SUBGROUP_OPPORTUNITY_REQUIRES_LOWER_LEVEL_GROUPING_SIGNAL = true;
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
const LOCAL_FIRST_FAMILY_INTERPRETATION = Object.freeze({
  EXPECTED_LOCAL_PRESENCE: 'expected-local-presence',
  LOCAL_DENSITY_FIRST: 'local-density-first',
  LOCAL_SUBGROUP_FIRST: 'local-subgroup-first',
  LOCAL_DIVERGENCE_NEEDS_BROADER_REVIEW: 'local-divergence-needs-broader-review',
  NO_LOCAL_SEMANTIC_EXPLANATION: 'no-local-semantic-explanation',
});
const BROADER_SPREAD_INTERPRETATION = Object.freeze({
  ALLOWED_BROADER_SPREAD: 'allowed-broader-spread',
  DOCS_RUNTIME_PAIRED_SPREAD: 'docs-runtime-paired-spread',
  CROSS_CONCERN_BUT_EXPLAINABLE: 'cross-concern-but-explainable',
  UNRESOLVED_BROADER_SPREAD: 'unresolved-broader-spread',
});
const SHARED_ROOT_LANE_INTERPRETATION = Object.freeze({
  SELECT_SHARED_ROOT_LANE_SPREAD: 'select-shared-root-lane-spread',
  BELOW_SHARED_ROOT_LANE_THRESHOLD: 'below-shared-root-lane-threshold',
  LOCAL_FIRST_SUPPRESSED: 'local-first-suppressed',
  BROADER_SPREAD_SUPPRESSED: 'broader-spread-suppressed',
});

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

const toLocalStructuralHome = (normalizedPath, structuralHome) => {
  const parentSegments = path.posix.dirname(normalizedPath).split('/').filter(Boolean);
  const structuralHomeSegments = structuralHome.split('/').filter(Boolean);
  const [firstLocalSegment] = parentSegments.slice(structuralHomeSegments.length);
  return firstLocalSegment ?? '.';
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

const toSignalAlignment = (pathSegments, semanticSignal) => {
  if (typeof semanticSignal !== 'string' || semanticSignal.length === 0) {
    return null;
  }

  const signalTokens = toSortedUnique(semanticSignal.split('-').filter(Boolean).concat(semanticSignal));
  const hit = pathSegments.findIndex(
    (segment) => signalTokens.includes(segment) || signalTokens.some((token) => segment.startsWith(`${token}-`)),
  );
  if (hit < 0) {
    return null;
  }

  return {
    signal: semanticSignal,
    tokenSet: signalTokens,
    segment: pathSegments[hit],
    segmentIndex: hit,
    pathPrefix: pathSegments.slice(0, hit + 1).join('/'),
  };
};

const toFirstSegmentAfterPrefix = (fullPath, prefixPath) => {
  if (typeof fullPath !== 'string' || fullPath.length === 0) {
    return null;
  }

  if (typeof prefixPath !== 'string' || prefixPath.length === 0) {
    return null;
  }

  if (fullPath === prefixPath) {
    return '.';
  }

  const prefix = `${prefixPath}/`;
  if (!fullPath.startsWith(prefix)) {
    return null;
  }

  const [firstSegment] = fullPath.slice(prefix.length).split('/').filter(Boolean);
  return firstSegment ?? '.';
};

const classifyLocalPlacementCoherence = ({
  structuralHome,
  localStructuralHome,
  semanticContainerIdentity,
  semanticHome,
  semanticSubhome,
  semanticAlignmentHits,
}) => {
  if (!semanticHome) {
    return {
      classification: semanticAlignmentHits.length > 0 ? 'structural-home-only' : 'no-semantic-home',
      details: {
        reason: semanticAlignmentHits.length > 0 ? 'semantic-hits-without-folder-derived-semantic-home' : 'no-folder-derived-semantic-home',
        semanticAlignmentHitCount: semanticAlignmentHits.length,
      },
    };
  }

  if (!structuralHome) {
    return {
      classification: 'semantic-home-only',
      details: {
        reason: 'semantic-home-present-while-structural-home-missing',
      },
    };
  }

  const semanticLocalHome =
    toFirstSegmentAfterPrefix(semanticSubhome, semanticHome) ??
    toFirstSegmentAfterPrefix(semanticHome, semanticContainerIdentity) ??
    '.';
  const semanticSubhomeDepthFromSemanticHome =
    typeof semanticSubhome === 'string' && semanticSubhome.startsWith(`${semanticHome}/`)
      ? semanticSubhome
          .slice(`${semanticHome}/`.length)
          .split('/')
          .filter(Boolean).length
      : 0;
  const homesAligned = structuralHome === semanticHome;
  const localHomesAligned = semanticLocalHome === '.' || semanticLocalHome === localStructuralHome;

  if (homesAligned && semanticSubhomeDepthFromSemanticHome > 1) {
    return {
      classification: 'divergent-local-placement',
      details: {
        reason: 'semantic-subhome-signals-lower-local-placement',
        semanticLocalHome,
        semanticSubhomeDepthFromSemanticHome,
      },
    };
  }

  if (homesAligned && localHomesAligned) {
    return {
      classification: 'aligned-local-home',
      details: {
        reason: 'structural-home-and-semantic-home-align-locally',
        semanticLocalHome,
      },
    };
  }

  return {
    classification: 'divergent-local-placement',
    details: {
      reason: homesAligned ? 'semantic-local-home-diverges-from-structural-local-home' : 'semantic-home-diverges-from-structural-home',
      semanticLocalHome,
      localStructuralHome,
      structuralHome,
      semanticHome,
    },
  };
};

export const toNamingBridgePlacementRecord = (observation) => {
  const pathSegments = observation.path.split('/').filter(Boolean);
  const directorySegments = path.posix.dirname(observation.path).split('/').filter(Boolean);
  const structuralRoot = pathSegments[0] ?? '.';
  const structuralSurface = pathSegments.slice(0, 2).join('/') || structuralRoot;
  const structuralHome = toNormalizedStructuralHome(observation.path);
  const localStructuralHome = toLocalStructuralHome(observation.path, structuralHome);
  const semanticIdentityTokens = toSemanticIdentityTokens(observation);
  const semanticAlignmentHits = toSemanticAlignmentHits(observation, semanticIdentityTokens);
  const familyRootDirectoryAlignment = toSignalAlignment(directorySegments, observation.familyRoot);
  const semanticFamilyDirectoryAlignment = toSignalAlignment(directorySegments, observation.semanticFamily);
  const familySubgroupDirectoryAlignment = toSignalAlignment(directorySegments, observation.familySubgroup);
  const familyRootAlignment = toSignalAlignment(pathSegments, observation.familyRoot);
  const semanticFamilyAlignment = toSignalAlignment(pathSegments, observation.semanticFamily);
  const familySubgroupAlignment = toSignalAlignment(pathSegments, observation.familySubgroup);
  const semanticContainerIdentity = familyRootDirectoryAlignment?.pathPrefix ?? null;
  const semanticHome = semanticFamilyDirectoryAlignment?.pathPrefix ?? semanticContainerIdentity;
  const semanticSubhome =
    familySubgroupDirectoryAlignment &&
    semanticHome &&
    familySubgroupDirectoryAlignment.pathPrefix !== semanticHome
      ? familySubgroupDirectoryAlignment.pathPrefix
      : null;
  const localPlacementCoherence = classifyLocalPlacementCoherence({
    structuralHome,
    localStructuralHome,
    semanticContainerIdentity,
    semanticHome,
    semanticSubhome,
    semanticAlignmentHits,
  });

  return {
    path: observation.path,
    structuralRoot,
    structuralSurface,
    structuralHome,
    localStructuralHome,
    structuralRootKind: TREE_STRUCTURAL_ROOT_SURFACE_SET.has(structuralRoot) ? 'structural-surface' : 'non-structural-surface',
    semanticContainerRole: semanticContainerIdentity ? 'naming-aligned-semantic-container' : 'none',
    semanticContainerIdentity,
    semanticHome,
    semanticSubhome,
    localPlacementCoherence: localPlacementCoherence.classification,
    localPlacementCoherenceDetails: localPlacementCoherence.details,
    semanticIdentityTokens,
    semanticAlignmentHits,
    semanticAlignmentDetails: {
      consumedSignals: {
        familyRoot: observation.familyRoot,
        semanticFamily: observation.semanticFamily,
        familySubgroup: observation.familySubgroup ?? null,
      },
      alignments: {
        familyRoot: familyRootAlignment,
        semanticFamily: semanticFamilyAlignment,
        familySubgroup: familySubgroupAlignment,
      },
      folderDerivedAlignments: {
        familyRoot: familyRootDirectoryAlignment,
        semanticFamily: semanticFamilyDirectoryAlignment,
        familySubgroup: familySubgroupDirectoryAlignment,
      },
      inferredFromPathStructure: true,
    },
  };
};

const classifyScatterPlacement = (observation) => toNamingBridgePlacementRecord(observation);

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

const toBroaderSpreadPairInterpretation = (leftPlacement, rightPlacement) => {
  if (
    leftPlacement.semanticContainerRole === 'naming-aligned-semantic-container' &&
    rightPlacement.semanticContainerRole === 'naming-aligned-semantic-container' &&
    leftPlacement.semanticContainerIdentity === rightPlacement.semanticContainerIdentity
  ) {
    return 'same-semantic-container';
  }

  if (isAllowedStructuralRootPairing(leftPlacement, rightPlacement)) {
    return 'allowed-structural-root-pairing';
  }

  if (isAllowedCanonicalDocAuthorityRuntimePairing(leftPlacement, rightPlacement)) {
    return 'canonical-docs-runtime-pairing';
  }

  return 'unresolved-pair';
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

const toContainerLocalHome = (placement) => {
  if (placement.semanticContainerRole !== 'naming-aligned-semantic-container' || !placement.semanticContainerIdentity) {
    return placement.structuralHome;
  }

  const containerPrefix = `${placement.semanticContainerIdentity}/`;
  if (!placement.path.startsWith(containerPrefix)) {
    return placement.structuralHome;
  }

  const containerRelativePath = placement.path.slice(containerPrefix.length);
  const containerRelativeSegments = path.posix.dirname(containerRelativePath).split('/').filter(Boolean);
  const [firstLocalHome] = containerRelativeSegments;

  return firstLocalHome ?? '.';
};

const hasLowerLevelGroupingSignal = (observation) => {
  if (typeof observation.familySubgroup === 'string' && observation.familySubgroup.length > 0) {
    return true;
  }

  return observation.semanticFamily.startsWith(`${observation.familyRoot}-`);
};

const interpretFamilyLocalFirst = (familyEntries) => {
  const sortedPaths = familyEntries
    .map(({ observation }) => observation.path)
    .sort((left, right) => left.localeCompare(right));
  const localPlacementCoherenceClasses = toSortedUnique(
    familyEntries.map(({ placement }) => placement.localPlacementCoherence),
  );
  const semanticContainerIdentities = toSortedUnique(
    familyEntries
      .filter(({ placement }) => placement.semanticContainerRole === 'naming-aligned-semantic-container')
      .map(({ placement }) => placement.semanticContainerIdentity),
  );
  const allEntriesInsideOneSemanticContainer =
    semanticContainerIdentities.length === 1 &&
    familyEntries.every(({ placement }) => placement.semanticContainerRole === 'naming-aligned-semantic-container');
  const observedContainerLocalHomes = allEntriesInsideOneSemanticContainer
    ? toSortedUnique(familyEntries.map(({ placement }) => toContainerLocalHome(placement)))
    : [];
  const lowerLevelGroupingSignalPresent = familyEntries.some(({ observation }) => hasLowerLevelGroupingSignal(observation));
  const localDivergencePresent = familyEntries.some(
    ({ placement }) =>
      placement.localPlacementCoherence === 'divergent-local-placement' ||
      placement.localPlacementCoherence === 'semantic-home-only',
  );
  const localSemanticExplanationAbsent = familyEntries.every(
    ({ placement }) =>
      placement.localPlacementCoherence === 'structural-home-only' ||
      placement.localPlacementCoherence === 'no-semantic-home',
  );

  if (allEntriesInsideOneSemanticContainer) {
    const hasContainerLocalDensity =
      sortedPaths.length >= FAMILY_CLUSTER_INFO_MIN_FILES ||
      observedContainerLocalHomes.length >= FAMILY_SUBGROUP_OPPORTUNITY_MIN_DISTINCT_CONTAINER_LOCAL_HOMES;
    const hasContainerLocalSubgroupOpportunity =
      sortedPaths.length >= FAMILY_SUBGROUP_OPPORTUNITY_MIN_FILES_IN_CONTAINER &&
      observedContainerLocalHomes.length >= FAMILY_SUBGROUP_OPPORTUNITY_MIN_DISTINCT_CONTAINER_LOCAL_HOMES &&
      lowerLevelGroupingSignalPresent;

    if (hasContainerLocalSubgroupOpportunity) {
      return {
        classification: LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_SUBGROUP_FIRST,
        details: {
          semanticContainerIdentity: semanticContainerIdentities[0],
          observedContainerLocalHomes,
          lowerLevelGroupingSignalPresent,
          localPlacementCoherence: localPlacementCoherenceClasses,
        },
      };
    }

    if (hasContainerLocalDensity) {
      return {
        classification: LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DENSITY_FIRST,
        details: {
          semanticContainerIdentity: semanticContainerIdentities[0],
          observedContainerLocalHomes,
          lowerLevelGroupingSignalPresent,
          localPlacementCoherence: localPlacementCoherenceClasses,
        },
      };
    }

    return {
      classification: LOCAL_FIRST_FAMILY_INTERPRETATION.EXPECTED_LOCAL_PRESENCE,
      details: {
        semanticContainerIdentity: semanticContainerIdentities[0],
        observedContainerLocalHomes,
        localPlacementCoherence: localPlacementCoherenceClasses,
      },
    };
  }

  if (localDivergencePresent) {
    return {
      classification: LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DIVERGENCE_NEEDS_BROADER_REVIEW,
      details: {
        semanticContainerIdentities,
        localPlacementCoherence: localPlacementCoherenceClasses,
      },
    };
  }

  if (localSemanticExplanationAbsent) {
    return {
      classification: LOCAL_FIRST_FAMILY_INTERPRETATION.NO_LOCAL_SEMANTIC_EXPLANATION,
      details: {
        semanticContainerIdentities,
        localPlacementCoherence: localPlacementCoherenceClasses,
      },
    };
  }

  return {
    classification: LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DIVERGENCE_NEEDS_BROADER_REVIEW,
    details: {
      semanticContainerIdentities,
      localPlacementCoherence: localPlacementCoherenceClasses,
      reason: 'mixed-local-placement-coherence-outside-one-semantic-container',
    },
  };
};

const toSingularFamilyEntriesBySemanticFamily = (observations) => {
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

  return observationsBySemanticFamily;
};

const toFamilyLocalFirstAnalysis = (semanticFamily, familyEntries) => {
  const sortedPaths = familyEntries.map(({ observation }) => observation.path).sort((left, right) => left.localeCompare(right));
  const placements = familyEntries.map(({ placement }) => placement);
  const structuralHomes = toSortedUnique(placements.map((placement) => placement.structuralHome));
  const semanticContainerIdentities = toSortedUnique(
    placements
      .filter((placement) => placement.semanticContainerRole === 'naming-aligned-semantic-container')
      .map((placement) => placement.semanticContainerIdentity),
  );
  const allEntriesInsideOneSemanticContainer =
    semanticContainerIdentities.length === 1 &&
    placements.every((placement) => placement.semanticContainerRole === 'naming-aligned-semantic-container');
  const observedContainerLocalHomes = allEntriesInsideOneSemanticContainer
    ? toSortedUnique(familyEntries.map(({ placement }) => toContainerLocalHome(placement)))
    : [];
  const lowerLevelGroupingSignalPresent = familyEntries.some(({ observation }) => hasLowerLevelGroupingSignal(observation));
  const localFirstInterpretation = interpretFamilyLocalFirst(familyEntries);

  return {
    semanticFamily,
    familyEntries,
    sortedPaths,
    placements,
    structuralHomes,
    semanticContainerIdentities,
    allEntriesInsideOneSemanticContainer,
    observedContainerLocalHomes,
    lowerLevelGroupingSignalPresent,
    localFirstInterpretation,
  };
};

const toFamilySharedSpineAnalysisEntries = (observations) => {
  const observationsBySemanticFamily = toSingularFamilyEntriesBySemanticFamily(observations);

  return Array.from(observationsBySemanticFamily.entries())
    .sort(([leftFamily], [rightFamily]) => leftFamily.localeCompare(rightFamily))
    .map(([semanticFamily, familyEntries]) => {
      const familyAnalysis = toFamilyLocalFirstAnalysis(semanticFamily, familyEntries);
      const broaderSpreadInterpretation = toFamilyBroaderSpreadInterpretation(familyAnalysis);

      return {
        familyAnalysis,
        broaderSpreadInterpretation,
      };
    });
};

const toFamilyBroaderSpreadInterpretation = (familyAnalysis) => {
  const requiresBroaderSpreadReview =
    familyAnalysis.localFirstInterpretation.classification ===
      LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DIVERGENCE_NEEDS_BROADER_REVIEW ||
    familyAnalysis.localFirstInterpretation.classification ===
      LOCAL_FIRST_FAMILY_INTERPRETATION.NO_LOCAL_SEMANTIC_EXPLANATION;
  if (!requiresBroaderSpreadReview) {
    return null;
  }

  const pairInterpretations = familyAnalysis.placements.flatMap((leftPlacement, leftIndex) =>
    familyAnalysis.placements.slice(leftIndex + 1).map((rightPlacement) => ({
      pair: [leftPlacement.path, rightPlacement.path].sort((left, right) => left.localeCompare(right)),
      interpretation: toBroaderSpreadPairInterpretation(leftPlacement, rightPlacement),
    })),
  );
  const pairInterpretationSummary = toSortedUnique(pairInterpretations.map(({ interpretation }) => interpretation));
  const hasUnresolvedPairs = pairInterpretationSummary.includes('unresolved-pair');
  const hasCanonicalDocsRuntimePairing = pairInterpretationSummary.includes('canonical-docs-runtime-pairing');
  const hasAllowedStructuralRootPairing = pairInterpretationSummary.includes('allowed-structural-root-pairing');

  if (hasUnresolvedPairs) {
    return {
      classification: BROADER_SPREAD_INTERPRETATION.UNRESOLVED_BROADER_SPREAD,
      details: {
        pairInterpretationSummary,
        pairInterpretations,
      },
    };
  }

  if (hasCanonicalDocsRuntimePairing) {
    return {
      classification: BROADER_SPREAD_INTERPRETATION.DOCS_RUNTIME_PAIRED_SPREAD,
      details: {
        pairInterpretationSummary,
        pairInterpretations,
      },
    };
  }

  if (hasAllowedStructuralRootPairing) {
    return {
      classification: BROADER_SPREAD_INTERPRETATION.ALLOWED_BROADER_SPREAD,
      details: {
        pairInterpretationSummary,
        pairInterpretations,
      },
    };
  }

  return {
    classification: BROADER_SPREAD_INTERPRETATION.CROSS_CONCERN_BUT_EXPLAINABLE,
    details: {
      pairInterpretationSummary,
      pairInterpretations,
    },
  };
};

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

const toSharedRootLaneInterpretation = ({
  sharedRootObservations,
  localFirstInterpretation,
  broaderSpreadInterpretation,
}) => {
  const sortedPaths = sharedRootObservations
    .map(({ path: normalizedPath }) => normalizedPath)
    .sort((left, right) => left.localeCompare(right));
  const observedLanePartitions = toSortedUnique(sharedRootObservations.map(({ lanePartition }) => lanePartition));
  const thresholdQualified =
    observedLanePartitions.length >= SHARED_ROOT_MIN_DISTINCT_LANE_PARTITIONS &&
    sortedPaths.length >= SHARED_ROOT_MIN_FAMILY_FILES;

  if (!thresholdQualified) {
    return {
      classification: SHARED_ROOT_LANE_INTERPRETATION.BELOW_SHARED_ROOT_LANE_THRESHOLD,
      shouldEmit: false,
      details: {
        thresholdQualified,
        localFirstClassification: localFirstInterpretation.classification,
        broaderSpreadClassification: broaderSpreadInterpretation?.classification ?? null,
      },
    };
  }

  const localFirstAllowsSharedRootLaneSpread =
    localFirstInterpretation.classification ===
      LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DIVERGENCE_NEEDS_BROADER_REVIEW ||
    localFirstInterpretation.classification === LOCAL_FIRST_FAMILY_INTERPRETATION.NO_LOCAL_SEMANTIC_EXPLANATION;
  if (!localFirstAllowsSharedRootLaneSpread) {
    return {
      classification: SHARED_ROOT_LANE_INTERPRETATION.LOCAL_FIRST_SUPPRESSED,
      shouldEmit: false,
      details: {
        thresholdQualified,
        localFirstClassification: localFirstInterpretation.classification,
        broaderSpreadClassification: broaderSpreadInterpretation?.classification ?? null,
      },
    };
  }

  const broaderSpreadAllowsSharedRootLaneSpread =
    broaderSpreadInterpretation?.classification === BROADER_SPREAD_INTERPRETATION.UNRESOLVED_BROADER_SPREAD;
  if (!broaderSpreadAllowsSharedRootLaneSpread) {
    return {
      classification: SHARED_ROOT_LANE_INTERPRETATION.BROADER_SPREAD_SUPPRESSED,
      shouldEmit: false,
      details: {
        thresholdQualified,
        localFirstClassification: localFirstInterpretation.classification,
        broaderSpreadClassification: broaderSpreadInterpretation?.classification ?? null,
      },
    };
  }

  return {
    classification: SHARED_ROOT_LANE_INTERPRETATION.SELECT_SHARED_ROOT_LANE_SPREAD,
    shouldEmit: true,
    details: {
      thresholdQualified,
      localFirstClassification: localFirstInterpretation.classification,
      broaderSpreadClassification: broaderSpreadInterpretation.classification,
    },
  };
};

const collectFamilyScatterFindings = (familySharedSpineAnalysisEntries) =>
  familySharedSpineAnalysisEntries.flatMap(({ familyAnalysis, broaderSpreadInterpretation }) => {
      const semanticFamily = familyAnalysis.semanticFamily;
      const broaderSpreadResolved =
        broaderSpreadInterpretation &&
        broaderSpreadInterpretation.classification !== BROADER_SPREAD_INTERPRETATION.UNRESOLVED_BROADER_SPREAD;
      const allCrossContainerPlacementsCoveredByAllowedRules = familyAnalysis.placements.every((leftPlacement, leftIndex) =>
        familyAnalysis.placements
          .slice(leftIndex + 1)
          .every((rightPlacement) => isAllowedCrossContainerPlacementPair(leftPlacement, rightPlacement)),
      );

      if (
        familyAnalysis.sortedPaths.length < FAMILY_SCATTER_MIN_FILES ||
        familyAnalysis.structuralHomes.length < FAMILY_SCATTER_MIN_STRUCTURAL_HOMES ||
        familyAnalysis.localFirstInterpretation.classification === LOCAL_FIRST_FAMILY_INTERPRETATION.EXPECTED_LOCAL_PRESENCE ||
        familyAnalysis.localFirstInterpretation.classification === LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DENSITY_FIRST ||
        familyAnalysis.localFirstInterpretation.classification === LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_SUBGROUP_FIRST ||
        familyAnalysis.allEntriesInsideOneSemanticContainer ||
        broaderSpreadResolved ||
        allCrossContainerPlacementsCoveredByAllowedRules
      ) {
        return [];
      }

      return [
        {
          code: 'TREE_FAMILY_SCATTERED',
          severity: 'info',
          path: familyAnalysis.sortedPaths[0],
          classification: 'advisory-structure',
          message:
            'Naming-owned semantic-family evidence is spread across multiple structural homes and may benefit from clearer semantic-first grouping.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            semanticFamily,
            observedPaths: familyAnalysis.sortedPaths,
            observedStructuralHomes: familyAnalysis.structuralHomes,
            observedStructuralRoots: toSortedUnique(familyAnalysis.placements.map((placement) => placement.structuralRoot)),
            observedContainerIdentities: familyAnalysis.semanticContainerIdentities,
            observedStructuralRootKinds: toSortedUnique(familyAnalysis.placements.map((placement) => placement.structuralRootKind)),
            localFirstInterpretation: familyAnalysis.localFirstInterpretation,
            broaderSpreadInterpretation,
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

const collectFamilyClusterFindings = (familySharedSpineAnalysisEntries) =>
  familySharedSpineAnalysisEntries.flatMap(({ familyAnalysis }) => {
      const semanticFamily = familyAnalysis.semanticFamily;
      if (familyAnalysis.localFirstInterpretation.classification !== LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_DENSITY_FIRST) {
        return [];
      }

      return [
        {
          code: 'TREE_OBSERVED_FAMILY_CLUSTER',
          severity: 'info',
          path: familyAnalysis.sortedPaths[0],
          classification: 'advisory-structure',
          message:
            'Naming-owned semantic-family cluster size is high enough to consider a clearer structural grouping surface.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            semanticFamily,
            semanticContainerIdentity: familyAnalysis.semanticContainerIdentities[0] ?? null,
            aggregationUnit: familyAnalysis.semanticContainerIdentities.length === 1 ? 'semanticFamily-in-container' : 'semanticFamily',
            observedCount: familyAnalysis.sortedPaths.length,
            observedPaths: familyAnalysis.sortedPaths,
            localFirstInterpretation: familyAnalysis.localFirstInterpretation,
            threshold: {
              minFamilyFilesForClusterObservation: FAMILY_CLUSTER_INFO_MIN_FILES,
            },
          },
        },
      ];
    });

const collectFamilySubgroupOpportunityFindings = (familySharedSpineAnalysisEntries) =>
  familySharedSpineAnalysisEntries.flatMap(({ familyAnalysis }) => {
      const semanticFamily = familyAnalysis.semanticFamily;
      if (familyAnalysis.localFirstInterpretation.classification !== LOCAL_FIRST_FAMILY_INTERPRETATION.LOCAL_SUBGROUP_FIRST) {
        return [];
      }

      return [
        {
          code: 'TREE_FAMILY_SUBGROUP_OPPORTUNITY',
          severity: 'info',
          path: familyAnalysis.sortedPaths[0],
          classification: 'advisory-structure',
          message:
            'Naming-owned semantic-family evidence is dense inside one naming-aligned semantic container and may benefit from a lower-level subgroup folder.',
          ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
          details: {
            semanticFamily,
            semanticContainerIdentity: familyAnalysis.semanticContainerIdentities[0],
            observedCount: familyAnalysis.sortedPaths.length,
            observedPaths: familyAnalysis.sortedPaths,
            observedContainerLocalHomes: familyAnalysis.observedContainerLocalHomes,
            lowerLevelGroupingSignalPresent: familyAnalysis.lowerLevelGroupingSignalPresent,
            localFirstInterpretation: familyAnalysis.localFirstInterpretation,
            thresholds: {
              minFilesInContainer: FAMILY_SUBGROUP_OPPORTUNITY_MIN_FILES_IN_CONTAINER,
              minDistinctContainerLocalHomes: FAMILY_SUBGROUP_OPPORTUNITY_MIN_DISTINCT_CONTAINER_LOCAL_HOMES,
              requireLowerLevelGroupingSignal: FAMILY_SUBGROUP_OPPORTUNITY_REQUIRES_LOWER_LEVEL_GROUPING_SIGNAL,
            },
            scopeBoundary: 'container-local subgroup opportunity; broad cross-container spread remains TREE_FAMILY_SCATTERED',
          },
        },
      ];
    });

const collectSharedRootFamilyScatterAcrossLanesFindings = (familySharedSpineAnalysisEntries) =>
  familySharedSpineAnalysisEntries.flatMap(({ familyAnalysis, broaderSpreadInterpretation }) => {
    const sharedFamilyObservations = familyAnalysis.familyEntries
      .map(({ observation }) => toSharedRootLaneObservation(observation))
      .filter(Boolean);
    const observationsBySharedRoot = new Map();

    for (const sharedFamilyObservation of sharedFamilyObservations) {
      if (!observationsBySharedRoot.has(sharedFamilyObservation.sharedRoot)) {
        observationsBySharedRoot.set(sharedFamilyObservation.sharedRoot, []);
      }

      observationsBySharedRoot.get(sharedFamilyObservation.sharedRoot).push(sharedFamilyObservation);
    }

    return Array.from(observationsBySharedRoot.entries())
      .sort(([leftSharedRoot], [rightSharedRoot]) => leftSharedRoot.localeCompare(rightSharedRoot))
      .flatMap(([sharedRoot, sharedRootObservations]) => {
        const semanticFamily = familyAnalysis.semanticFamily;
        const localFirstInterpretation = familyAnalysis.localFirstInterpretation;
        const sortedPaths = sharedRootObservations
          .map(({ path: normalizedPath }) => normalizedPath)
          .sort((left, right) => left.localeCompare(right));
        const observedLanePartitions = toSortedUnique(
          sharedRootObservations.map(({ lanePartition }) => lanePartition),
        );
        const sharedRootLaneInterpretation = toSharedRootLaneInterpretation({
          sharedRootObservations,
          localFirstInterpretation,
          broaderSpreadInterpretation,
        });

        if (!sharedRootLaneInterpretation.shouldEmit) {
          return [];
        }

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
              localFirstInterpretation,
              broaderSpreadInterpretation,
              sharedRootLaneInterpretation,
              familySharedSpineRouting: {
                model: 'shared-local-first-family-interpretation',
                sharedRootOutcome: sharedRootLaneInterpretation.classification,
              },
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
  });

export const collectNamingSemanticFamilyBridgeFindings = (bridgePayload) => {
  const namingSemanticFamilyBridge = prepareNamingSemanticFamilyBridge(bridgePayload);
  const observations = namingSemanticFamilyBridge.observations;

  if (observations.length === 0) {
    return [];
  }

  const familySharedSpineAnalysisEntries = toFamilySharedSpineAnalysisEntries(observations);

  return [
    ...collectFamilyScatterFindings(familySharedSpineAnalysisEntries),
    ...collectFamilySubgroupOpportunityFindings(familySharedSpineAnalysisEntries),
    ...collectFamilyClusterFindings(familySharedSpineAnalysisEntries),
    ...collectSharedRootFamilyScatterAcrossLanesFindings(familySharedSpineAnalysisEntries),
  ];
};
