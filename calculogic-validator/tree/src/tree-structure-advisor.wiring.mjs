import fs from 'node:fs';
import {
  runTreeStructureAdvisor as runTreeStructureAdvisorRuntime,
  summarizeFindings,
} from './tree-structure-advisor.logic.mjs';
import {
  collectDefaultTreeStructureAdvisorContributors,
} from './tree-structure-advisor-contributors-assembly.wiring.mjs';
import {
  collectSuiteScopedSnapshotInputs,
} from '../../src/core/suite-scoped-snapshot-input.logic.mjs';
import { prepareTreeOccurrenceSnapshot } from './tree-occurrence-snapshot.logic.mjs';
import { prepareTreeStructuralAddressSnapshot } from './tree-structural-address-snapshot.logic.mjs';
import { prepareTreeKnownRootsCompatibilityEvidence } from './tree-known-roots-compatibility-evidence.logic.mjs';
import { prepareTreeStructuralHomeEvidence } from './tree-structural-home-evidence.logic.mjs';
import { prepareTreeSemanticHomeEvidence } from './tree-semantic-home-evidence.logic.mjs';
import { prepareTreeFolderKindEvidence } from './tree-folder-kind-evidence.logic.mjs';
import { classifyTreeOccurrenceRecords } from './tree-occurrence-classification.logic.mjs';
import { prepareTreeOccurrenceClassificationParityEvidence } from './tree-occurrence-classification-parity-evidence.logic.mjs';
import { summarizeTreeOccurrenceClassificationParityEvidence } from './tree-occurrence-classification-parity-summary.logic.mjs';
import { prepareNamingSemanticEvidenceBridge } from '../../naming/src/naming-semantic-evidence-bridge.logic.mjs';
import { getBuiltinTreeKnownRoots } from './registries/tree-known-roots-registry.logic.mjs';
import { getBuiltinStructuralHomesRegistry } from './registries/tree-structural-homes-registry.logic.mjs';
import { getBuiltinFolderKindsRegistry } from './registries/tree-folder-kinds-registry.logic.mjs';

const TOP_LEVEL_SCAN_EXCLUSIONS = new Set(['.git', 'node_modules']);
const WALK_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.reports',
  '.turbo',
  '.yarn',
  'coverage',
  'dist',
  'node_modules',
]);

const collectTopLevelDirectoryNames = (repositoryRoot) =>
  fs
    .readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((directoryName) => !TOP_LEVEL_SCAN_EXCLUSIONS.has(directoryName))
    .filter((directoryName) => !directoryName.startsWith('.'))
    .sort((left, right) => left.localeCompare(right));

export const prepareTreeStructureAdvisorInputs = (
  repositoryRoot,
  { scope, targets, namingSemanticFamilyBridge } = {},
) => {
  const scopedSnapshotInputs = collectSuiteScopedSnapshotInputs(repositoryRoot, {
    scope,
    targets,
    walkExcludedDirectories: WALK_EXCLUDED_DIRECTORIES,
    skipDotDirectories: true,
  });
  const selectedPaths = scopedSnapshotInputs.selectedPaths;
  const structuralAddressTargets = scopedSnapshotInputs.targetDescriptors ?? scopedSnapshotInputs.targets;
  const occurrenceSnapshot = prepareTreeOccurrenceSnapshot({
    selectedPaths,
    targets: structuralAddressTargets,
    includeRoots: scopedSnapshotInputs.includeRoots,
  });
  const structuralAddressSnapshot = prepareTreeStructuralAddressSnapshot({
    occurrenceSnapshot,
    selectedPaths,
    targets: structuralAddressTargets,
    includeRoots: scopedSnapshotInputs.includeRoots,
    scope: {
      source: 'tree-structure-advisor.wiring',
    },
  });
  const treeKnownRootsRegistry = getBuiltinTreeKnownRoots();
  const structuralHomesRegistry = getBuiltinStructuralHomesRegistry();
  const folderKindsRegistry = getBuiltinFolderKindsRegistry();
  const namingSemanticEvidenceBridge = namingSemanticFamilyBridge
    ? prepareNamingSemanticEvidenceBridge(namingSemanticFamilyBridge)
    : { observations: [] };

  const treeStructuralHomeEvidence = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    structuralHomesRegistry,
  });
  const treeSemanticHomeEvidence = prepareTreeSemanticHomeEvidence({
    addressedOccurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    namingSemanticEvidenceRecords: namingSemanticEvidenceBridge.observations,
  });
  const treeFolderKindEvidence = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    treeStructuralHomeEvidence,
    treeSemanticHomeEvidence,
    folderKindsRegistry,
  });
  const currentOccurrenceClassificationRecords = classifyTreeOccurrenceRecords({
    occurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    treeKnownRoots: treeKnownRootsRegistry,
  });

  const treeOccurrenceClassificationParityEvidence = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    currentOccurrenceClassificationRecords,
    treeStructuralHomeEvidence,
    treeSemanticHomeEvidence,
    treeFolderKindEvidence,
  });

  return {
    scope: scopedSnapshotInputs.scope,
    selectedPaths,
    occurrenceSnapshot,
    topLevelDirectoryNames: collectTopLevelDirectoryNames(repositoryRoot),
    targets: scopedSnapshotInputs.targets,
    structuralAddressSnapshot,
    preparedDependencies: {
      treeKnownRootsCompatibilityEvidence: prepareTreeKnownRootsCompatibilityEvidence({
        addressedTreeSnapshot: structuralAddressSnapshot,
        knownRootsRegistry: treeKnownRootsRegistry,
      }),
      treeStructuralHomeEvidence,
      treeSemanticHomeEvidence,
      treeFolderKindEvidence,
      treeOccurrenceClassificationParityEvidence,
      treeOccurrenceClassificationParitySummary: summarizeTreeOccurrenceClassificationParityEvidence(treeOccurrenceClassificationParityEvidence),
    },
    findingContributors: collectDefaultTreeStructureAdvisorContributors({
      repositoryRoot,
      selectedPaths,
      namingSemanticFamilyBridge,
    }),
  };
};

export const runTreeStructureAdvisor = (repositoryRoot, { scope, targets, namingSemanticFamilyBridge } = {}) => {
  const preparedInputs = prepareTreeStructureAdvisorInputs(repositoryRoot, {
    scope,
    targets,
    namingSemanticFamilyBridge,
  });
  return runTreeStructureAdvisorRuntime(preparedInputs);
};

export { summarizeFindings };
