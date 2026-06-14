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
import { prepareTreeStructuralHomeEvidence } from './tree-structural-home-evidence.logic.mjs';
import { prepareTreeSemanticHomeEvidence } from './tree-semantic-home-evidence.logic.mjs';
import { prepareTreeFolderKindEvidence } from './tree-folder-kind-evidence.logic.mjs';
import {
  prepareTreeOccurrenceClassificationReplacementRuntime,
} from './tree-occurrence-classification.logic.mjs';
import { prepareTreeOccurrenceClassificationParityEvidence } from './tree-occurrence-classification-parity-evidence.logic.mjs';
import { summarizeTreeOccurrenceClassificationParityEvidence } from './tree-occurrence-classification-parity-summary.logic.mjs';
import { prepareTreeOccurrenceClassificationShadowReport } from './tree-occurrence-classification-shadow-report.logic.mjs';
import { evaluateTreeOccurrenceClassificationReplacementReadiness } from './tree-occurrence-classification-replacement-readiness.logic.mjs';
import { recommendTreeOccurrenceClassificationReplacement } from './tree-occurrence-classification-replacement-recommendation.logic.mjs';
import { planTreeOccurrenceClassificationRuntimeEvaluation } from './tree-occurrence-classification-runtime-evaluation-plan.logic.mjs';
import { planTreeOccurrenceClassificationRuntimeExecutionContract } from './tree-occurrence-classification-runtime-execution-contract.logic.mjs';
import { prepareNamingSemanticEvidenceBridge } from '../../naming/src/naming-semantic-evidence-bridge.logic.mjs';
import { prepareTreeNamingOccurrenceBridgeIntake } from './tree-naming-occurrence-intake.logic.mjs';
import { getBuiltinStructuralHomesRegistry } from './registries/tree-structural-homes-registry.logic.mjs';
import { getBuiltinFolderKindsRegistry } from './registries/tree-folder-kinds-registry.logic.mjs';
import { getBuiltinTreeRepoShapePolicy } from './registries/tree-repo-shape-policy-registry.logic.mjs';

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
  { scope, targets, namingSemanticFamilyBridge, namingOccurrenceBridge } = {},
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
  const structuralHomesRegistry = getBuiltinStructuralHomesRegistry();
  const folderKindsRegistry = getBuiltinFolderKindsRegistry();
  const treeRepoShapePolicy = getBuiltinTreeRepoShapePolicy();
  const namingSemanticEvidenceBridge = namingSemanticFamilyBridge
    ? prepareNamingSemanticEvidenceBridge(namingSemanticFamilyBridge)
    : { observations: [] };
  const treeNamingOccurrenceBridgeIntake = prepareTreeNamingOccurrenceBridgeIntake({
    namingOccurrenceBridge,
    namingSemanticFamilyBridge,
  });

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
  const treeOccurrenceClassificationReplacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence,
    treeSemanticHomeEvidence,
    treeFolderKindEvidence,
    treeRepoShapePolicy,
  });
  const currentOccurrenceClassificationRecords = treeOccurrenceClassificationReplacementRuntime.classifyOccurrenceRecords(
    structuralAddressSnapshot.occurrenceRecords,
  );

  const treeOccurrenceClassificationParityEvidence = prepareTreeOccurrenceClassificationParityEvidence({
    addressedOccurrenceRecords: structuralAddressSnapshot.occurrenceRecords,
    currentOccurrenceClassificationRecords,
    treeStructuralHomeEvidence,
    treeSemanticHomeEvidence,
    treeFolderKindEvidence,
  });

  const treeOccurrenceClassificationParitySummary = summarizeTreeOccurrenceClassificationParityEvidence(treeOccurrenceClassificationParityEvidence);
  const treeOccurrenceClassificationShadowReport = prepareTreeOccurrenceClassificationShadowReport({
    treeOccurrenceClassificationParityEvidence,
    treeOccurrenceClassificationParitySummary,
  });
  const treeOccurrenceClassificationReplacementReadiness = evaluateTreeOccurrenceClassificationReplacementReadiness({
    treeOccurrenceClassificationParitySummary,
    treeOccurrenceClassificationShadowReport,
  });
  const treeOccurrenceClassificationReplacementRecommendation = recommendTreeOccurrenceClassificationReplacement({
    treeOccurrenceClassificationReplacementReadiness,
    treeOccurrenceClassificationShadowReport,
    treeOccurrenceClassificationParitySummary,
  });
  const treeOccurrenceClassificationRuntimeEvaluationPlan = planTreeOccurrenceClassificationRuntimeEvaluation({
    treeOccurrenceClassificationReplacementRecommendation,
    treeOccurrenceClassificationReplacementReadiness,
    treeOccurrenceClassificationShadowReport,
    treeOccurrenceClassificationParitySummary,
  });
  const treeOccurrenceClassificationRuntimeExecutionContract = planTreeOccurrenceClassificationRuntimeExecutionContract({
    treeOccurrenceClassificationRuntimeEvaluationPlan,
    treeOccurrenceClassificationReplacementRecommendation,
    treeOccurrenceClassificationReplacementReadiness,
    treeOccurrenceClassificationShadowReport,
    treeOccurrenceClassificationParitySummary,
  });
  return {
    scope: scopedSnapshotInputs.scope,
    selectedPaths,
    occurrenceSnapshot,
    topLevelDirectoryNames: collectTopLevelDirectoryNames(repositoryRoot),
    targets: scopedSnapshotInputs.targets,
    structuralAddressSnapshot,
    preparedDependencies: {
      treeStructuralHomeEvidence,
      treeSemanticHomeEvidence,
      treeFolderKindEvidence,
      treeRepoShapePolicy,
      treeOccurrenceClassificationParityEvidence,
      treeOccurrenceClassificationParitySummary,
      treeOccurrenceClassificationShadowReport,
      treeOccurrenceClassificationReplacementReadiness,
      treeOccurrenceClassificationReplacementRecommendation,
      treeOccurrenceClassificationRuntimeEvaluationPlan,
      treeOccurrenceClassificationRuntimeExecutionContract,
      treeOccurrenceClassificationReplacementRuntime,
      treeNamingOccurrenceBridgeIntake,
    },
    findingContributors: collectDefaultTreeStructureAdvisorContributors({
      repositoryRoot,
      selectedPaths,
      namingSemanticFamilyBridge,
    }),
  };
};

export const runTreeStructureAdvisor = (repositoryRoot, { scope, targets, namingSemanticFamilyBridge, namingOccurrenceBridge } = {}) => {
  const preparedInputs = prepareTreeStructureAdvisorInputs(repositoryRoot, {
    scope,
    targets,
    namingSemanticFamilyBridge,
    namingOccurrenceBridge,
  });
  return runTreeStructureAdvisorRuntime(preparedInputs);
};

export { summarizeFindings };
