import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  runTreeStructureAdvisor,
  summarizeFindings,
} from '../src/tree-structure-advisor.host.mjs';
import { prepareTreeStructureAdvisorInputs } from '../src/tree-structure-advisor.wiring.mjs';
import { runTreeStructureAdvisor as runTreeStructureAdvisorRuntime } from '../src/tree-structure-advisor.logic.mjs';
import { collectShimCompatFindings } from '../src/tree-shim-detection.logic.mjs';
import { prepareTreeStructuralHomeEvidence } from '../src/tree-structural-home-evidence.logic.mjs';
import { prepareTreeSemanticHomeEvidence } from '../src/tree-semantic-home-evidence.logic.mjs';
import { prepareTreeSemanticNamingFolderTypeRelationshipEvidence } from '../src/tree-semantic-naming-folder-type-relationship.logic.mjs';
import { prepareTreeFolderKindEvidence } from '../src/tree-folder-kind-evidence.logic.mjs';
import {
  prepareTreeOccurrenceClassificationReplacementRuntime,
} from '../src/tree-occurrence-classification.logic.mjs';
import { prepareTreeOccurrenceClassificationParityEvidence } from '../src/tree-occurrence-classification-parity-evidence.logic.mjs';
import { summarizeTreeOccurrenceClassificationParityEvidence } from '../src/tree-occurrence-classification-parity-summary.logic.mjs';
import { prepareTreeOccurrenceClassificationShadowReport } from '../src/tree-occurrence-classification-shadow-report.logic.mjs';
import { evaluateTreeOccurrenceClassificationReplacementReadiness } from '../src/tree-occurrence-classification-replacement-readiness.logic.mjs';
import { recommendTreeOccurrenceClassificationReplacement } from '../src/tree-occurrence-classification-replacement-recommendation.logic.mjs';
import { planTreeOccurrenceClassificationRuntimeEvaluation } from '../src/tree-occurrence-classification-runtime-evaluation-plan.logic.mjs';
import { planTreeOccurrenceClassificationRuntimeExecutionContract } from '../src/tree-occurrence-classification-runtime-execution-contract.logic.mjs';
import { getBuiltinStructuralHomesRegistry } from '../src/registries/tree-structural-homes-registry.logic.mjs';
import { getBuiltinFolderKindsRegistry } from '../src/registries/tree-folder-kinds-registry.logic.mjs';
import { getBuiltinTreeRepoShapePolicy } from '../src/registries/tree-repo-shape-policy-registry.logic.mjs';
import { getBuiltinSemanticNamingFolderTypeRelationshipsRegistry } from '../src/registries/tree-semantic-naming-folder-type-relationships-registry.logic.mjs';
import { prepareNamingSemanticEvidenceBridge } from '../../naming/src/naming-semantic-evidence-bridge.logic.mjs';
import { runNamingValidator, projectNamingSemanticFamilyBridge } from '../../naming/src/naming-validator.wiring.mjs';
import { listRegisteredValidators } from '../../src/core/validator-registry.knowledge.mjs';
import { getValidatorScopeProfile } from '../../src/core/validator-scopes.logic.mjs';
import { runValidatorRunner } from '../../src/core/validator-runner.logic.mjs';

const writeJson = async (filePath, value) => {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES = [
  'bin',
  'calculogic-doc-engine',
  'calculogic-validator',
  'doc',
  'docs',
  'public',
  'scripts',
  'src',
  'test',
  'tools',
];

const READY_OCCURRENCE_CLASSIFICATION_EXECUTION_CONTRACT = {
  source: 'tree-occurrence-classification-runtime-execution-contract',
  executionMode: 'execution-candidate',
  executionStatus: 'ready-for-future-execution-contract',
  requiredGuards: [],
  summary: {},
  rationale: 'Test fixture marks prepared replacement classification ready for active execution.',
};

const READY_OCCURRENCE_CLASSIFICATION_REPLACEMENT_READINESS = {
  source: 'tree-occurrence-classification-replacement-readiness',
  replacementDecision: 'candidate-ready',
  gates: {},
  summary: {},
  rationale: 'Test fixture marks replacement readiness as candidate-ready.',
};

const createReadyClassificationPreparedInputs = ({ topLevelDirectoryNames, classificationsByName }) => {
  const occurrenceRecords = topLevelDirectoryNames.map((directoryName) => ({
    path: directoryName,
    name: directoryName,
    actualName: directoryName,
    resolvedPath: directoryName,
    occurrenceType: 'folder',
  }));

  return {
    scope: 'repo',
    selectedPaths: [],
    topLevelDirectoryNames,
    targets: [],
    occurrenceSnapshot: {
      scopeRoots: ['.'],
      occurrenceRecords,
    },
    preparedDependencies: {
      treeOccurrenceClassificationRuntimeExecutionContract: READY_OCCURRENCE_CLASSIFICATION_EXECUTION_CONTRACT,
      treeOccurrenceClassificationReplacementReadiness: READY_OCCURRENCE_CLASSIFICATION_REPLACEMENT_READINESS,
      treeOccurrenceClassificationReplacementRuntime: {
        source: 'test-ready-tree-occurrence-classification-replacement-runtime',
        classifyOccurrenceRecords: (records = []) => records.map((record) => ({
          ...record,
          isRepoTopOccurrence: record.occurrenceType === 'folder' && !record.resolvedPath.includes('/'),
          isRepoShapeAllowedTopLevelDirectory: classificationsByName.get(record.resolvedPath) ?? false,
        })),
        collectUnexpectedTopLevelDirectoryNames: (directoryNames = []) => directoryNames
          .filter((directoryName) => typeof directoryName === 'string' && directoryName.length > 0)
          .filter((directoryName) => !EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES.includes(directoryName))
          .sort((left, right) => left.localeCompare(right)),
      },
    },
  };
};

const collectExpectedPathsFromScopeProfile = async (fixtureDir, scope) => {
  const profile = getValidatorScopeProfile(scope);

  if (!profile) {
    throw new Error(`Expected known scope profile: ${scope}`);
  }

  const collected = new Set();

  for (const scopeRoot of profile.includeRoots) {
    const absoluteRoot = path.join(fixtureDir, scopeRoot);

    try {
      const rootStat = await fs.stat(absoluteRoot);
      if (!rootStat.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    const walk = async (absoluteDirectoryPath) => {
      const entries = await fs.readdir(absoluteDirectoryPath, { withFileTypes: true });
      entries.sort((left, right) => left.name.localeCompare(right.name));

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
          }

          await walk(path.join(absoluteDirectoryPath, entry.name));
          continue;
        }

        collected.add(path.relative(fixtureDir, path.join(absoluteDirectoryPath, entry.name)).replace(/\\/gu, '/'));
      }
    };

    await walk(absoluteRoot);
  }

  for (const rootFilePath of profile.includeRootFiles) {
    const absolutePath = path.join(fixtureDir, rootFilePath);

    if (path.dirname(absolutePath) !== fixtureDir) {
      continue;
    }

    try {
      const rootFileStat = await fs.stat(absolutePath);
      if (!rootFileStat.isFile()) {
        continue;
      }
    } catch {
      continue;
    }

    collected.add(path.relative(fixtureDir, absolutePath).replace(/\\/gu, '/'));
  }

  return [...collected].sort((left, right) => left.localeCompare(right));
};


const writeBaseFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'doc'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'calculogic-doc-engine', 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src'), { recursive: true });

  await writeJson(path.join(fixtureDir, 'package.json'), {
    name: 'tree-structure-advisor-fixture',
    version: '1.0.0',
  });
  await fs.writeFile(path.join(fixtureDir, 'src', 'app-shell.logic.ts'), 'export const app = true\n', 'utf8');
  await fs.writeFile(path.join(fixtureDir, 'doc', 'README.md'), '# fixture\n', 'utf8');
  await fs.writeFile(
    path.join(fixtureDir, 'calculogic-doc-engine', 'src', 'doc-engine.logic.mjs'),
    'export const docEngine = true\n',
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'calculogic-validator', 'src', 'naming-validator.logic.mjs'),
    'export const fixture = true\n',
    'utf8',
  );
};

test('tree-structure-advisor is registered as a validator slice', () => {
  assert.deepEqual(listRegisteredValidators(), ['naming', 'tree-structure-advisor']);
});

test('tree-structure-advisor is conservative for normal known repository shape', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-safe-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(result.scope, 'repo');
    assert.equal(result.findings.length, 0);
    assert.equal(typeof result.totalFilesScanned, 'number');
    assert.equal(result.filters.isFiltered, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor wiring carries neutral structural-address snapshot as internal evidence', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-handoff-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo' });
    const snapshot = preparedInputs.structuralAddressSnapshot;

    assert.ok(snapshot);
    assert.deepEqual(Object.keys(snapshot).sort(), ['occurrenceRecords', 'scope', 'scopeRoots']);
    assert.deepEqual(Object.keys(snapshot.scope).sort(), ['scopeRootPath', 'source', 'targetKind']);
    assert.equal(Array.isArray(snapshot.scopeRoots), true);
    assert.equal(Array.isArray(snapshot.occurrenceRecords), true);
    assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'occurrenceMarker')), true);
    assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'resolvedPath')), true);
    assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'placementConfidence')), false);
    assert.equal(snapshot.occurrenceRecords.some((record) => Object.hasOwn(record, 'severity')), false);
    assert.equal(snapshot.scopeRoots, preparedInputs.occurrenceSnapshot.scopeRoots);
    assert.equal(snapshot.occurrenceRecords === preparedInputs.occurrenceSnapshot.occurrenceRecords, false);
    assert.deepEqual(
      snapshot.occurrenceRecords.map((record) => record.resolvedPath),
      preparedInputs.occurrenceSnapshot.occurrenceRecords.map((record) => record.resolvedPath),
    );
    assert.ok(preparedInputs.preparedDependencies);
    assert.ok(preparedInputs.preparedDependencies.treeStructuralHomeEvidence);
    assert.ok(preparedInputs.preparedDependencies.treeSemanticHomeEvidence);
    assert.ok(preparedInputs.preparedDependencies.treeFolderKindEvidence);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationParityEvidence);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeEvaluationPlan);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeExecutionContract);
    assert.ok(preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRuntime);
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeStructuralHomeEvidence,
      prepareTreeStructuralHomeEvidence({
        addressedOccurrenceRecords: snapshot.occurrenceRecords,
        structuralHomesRegistry: getBuiltinStructuralHomesRegistry(),
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeSemanticHomeEvidence,
      prepareTreeSemanticHomeEvidence({
        addressedOccurrenceRecords: snapshot.occurrenceRecords,
        namingSemanticEvidenceRecords: [],
      }),
    );

    assert.deepEqual(
      preparedInputs.preparedDependencies.treeFolderKindEvidence,
      prepareTreeFolderKindEvidence({
        addressedOccurrenceRecords: snapshot.occurrenceRecords,
        treeStructuralHomeEvidence: preparedInputs.preparedDependencies.treeStructuralHomeEvidence,
        treeSemanticHomeEvidence: preparedInputs.preparedDependencies.treeSemanticHomeEvidence,
        folderKindsRegistry: getBuiltinFolderKindsRegistry(),
      }),
    );
    const expectedOccurrenceClassificationReplacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
      treeStructuralHomeEvidence: preparedInputs.preparedDependencies.treeStructuralHomeEvidence,
      treeSemanticHomeEvidence: preparedInputs.preparedDependencies.treeSemanticHomeEvidence,
      treeFolderKindEvidence: preparedInputs.preparedDependencies.treeFolderKindEvidence,
      treeRepoShapePolicy: preparedInputs.preparedDependencies.treeRepoShapePolicy,
    });
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationParityEvidence,
      prepareTreeOccurrenceClassificationParityEvidence({
        addressedOccurrenceRecords: snapshot.occurrenceRecords,
        currentOccurrenceClassificationRecords: expectedOccurrenceClassificationReplacementRuntime.classifyOccurrenceRecords(
          snapshot.occurrenceRecords,
        ),
        treeStructuralHomeEvidence: preparedInputs.preparedDependencies.treeStructuralHomeEvidence,
        treeSemanticHomeEvidence: preparedInputs.preparedDependencies.treeSemanticHomeEvidence,
        treeFolderKindEvidence: preparedInputs.preparedDependencies.treeFolderKindEvidence,
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      summarizeTreeOccurrenceClassificationParityEvidence(preparedInputs.preparedDependencies.treeOccurrenceClassificationParityEvidence),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
      prepareTreeOccurrenceClassificationShadowReport({
        treeOccurrenceClassificationParityEvidence: preparedInputs.preparedDependencies.treeOccurrenceClassificationParityEvidence,
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness,
      evaluateTreeOccurrenceClassificationReplacementReadiness({
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
        treeOccurrenceClassificationShadowReport: preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation,
      recommendTreeOccurrenceClassificationReplacement({
        treeOccurrenceClassificationReplacementReadiness: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness,
        treeOccurrenceClassificationShadowReport: preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeEvaluationPlan,
      planTreeOccurrenceClassificationRuntimeEvaluation({
        treeOccurrenceClassificationReplacementRecommendation: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation,
        treeOccurrenceClassificationReplacementReadiness: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness,
        treeOccurrenceClassificationShadowReport: preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      }),
    );
    assert.deepEqual(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeExecutionContract,
      planTreeOccurrenceClassificationRuntimeExecutionContract({
        treeOccurrenceClassificationRuntimeEvaluationPlan: preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeEvaluationPlan,
        treeOccurrenceClassificationReplacementRecommendation: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation,
        treeOccurrenceClassificationReplacementReadiness: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness,
        treeOccurrenceClassificationShadowReport: preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      }),
    );
    assert.equal(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRuntime.source,
      expectedOccurrenceClassificationReplacementRuntime.source,
    );
    const omitClassificationExplanation = (records) => records.map(({ classificationExplanation: _classificationExplanation, ...record }) => record);
    assert.deepEqual(
      omitClassificationExplanation(
        preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRuntime.classifyOccurrenceRecords(snapshot.occurrenceRecords),
      ),
      expectedOccurrenceClassificationReplacementRuntime.classifyOccurrenceRecords(snapshot.occurrenceRecords),
    );
    const runtimeExecutionContract = preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeExecutionContract;
    assert.deepEqual(Object.keys(runtimeExecutionContract).sort(), ['executionMode', 'executionStatus', 'rationale', 'requiredGuards', 'source', 'summary']);
    assert.equal(
      ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(runtimeExecutionContract, key)),
      false,
    );
    assert.equal(
      ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(runtimeExecutionContract.summary, key)),
      false,
    );
    assert.equal(
      runtimeExecutionContract.requiredGuards.some((guard) =>
        ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(guard, key))),
      false,
    );
    const {
      treeOccurrenceClassificationRuntimeExecutionContract: _omittedRuntimeExecutionContract,
      ...preparedDependenciesWithoutRuntimeExecutionContract
    } = preparedInputs.preparedDependencies;
    assert.deepEqual(
      runTreeStructureAdvisorRuntime(preparedInputs),
      runTreeStructureAdvisorRuntime({
        ...preparedInputs,
        preparedDependencies: preparedDependenciesWithoutRuntimeExecutionContract,
      }),
    );
    const runtimeEvaluationPlan = preparedInputs.preparedDependencies.treeOccurrenceClassificationRuntimeEvaluationPlan;
    assert.deepEqual(Object.keys(runtimeEvaluationPlan).sort(), ['evaluationMode', 'evaluationStatus', 'rationale', 'source', 'summary']);
    assert.equal(
      ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(runtimeEvaluationPlan, key)),
      false,
    );
    assert.equal(
      ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(runtimeEvaluationPlan.summary, key)),
      false,
    );
    assert.deepEqual(
      runtimeEvaluationPlan,
      planTreeOccurrenceClassificationRuntimeEvaluation({
        treeOccurrenceClassificationReplacementRecommendation: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation,
        treeOccurrenceClassificationReplacementReadiness: preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementReadiness,
        treeOccurrenceClassificationShadowReport: preparedInputs.preparedDependencies.treeOccurrenceClassificationShadowReport,
        treeOccurrenceClassificationParitySummary: preparedInputs.preparedDependencies.treeOccurrenceClassificationParitySummary,
      }),
    );
    const replacementRecommendation = preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRecommendation;
    assert.deepEqual(Object.keys(replacementRecommendation).sort(), ['confidence', 'rationale', 'recommendation', 'source', 'summary']);
    assert.equal(
      ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) => Object.hasOwn(replacementRecommendation, key)),
      false,
    );
    const structuralHomeEvidenceRecords = preparedInputs.preparedDependencies.treeStructuralHomeEvidence.evidenceRecords;
    assert.equal(Array.isArray(structuralHomeEvidenceRecords), true);
    assert.equal(structuralHomeEvidenceRecords.some((record) => record.path === 'src'), true);
    assert.equal(structuralHomeEvidenceRecords.some((record) => record.path === 'calculogic-validator/src'), false);
    assert.equal(
      structuralHomeEvidenceRecords.some((record) =>
        ['findingCode', 'severity', 'placementVerdict', 'confidenceScore', 'report', 'isRepoShapeAllowedTopLevelDirectory', 'isStructuralRoot', 'isSemanticRoot', 'structuralClass', 'structuralKind'].some((key) => Object.hasOwn(record, key))),
      false,
    );
    assert.deepEqual(preparedInputs.preparedDependencies.treeSemanticHomeEvidence.evidenceRecords, []);
    const parityEvidence = preparedInputs.preparedDependencies.treeOccurrenceClassificationParityEvidence;
    assert.equal(Array.isArray(parityEvidence.parityRecords), true);
    assert.equal(typeof parityEvidence.summary, 'object');
    assert.equal(
      parityEvidence.parityRecords.some((record) =>
        ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'].some((key) =>
          Object.hasOwn(record, key))),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor wiring prepares semantic-home evidence using naming semantic bridge inputs without changing runtime output', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-semantic-home-evidence-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'semantic-family.topic-core.logic.mjs'),
      'export const semantic = true\n',
      'utf8',
    );

    const namingSemanticFamilyBridge = {
      observations: [
        {
          path: 'src',
          occurrenceType: 'folder',
          semanticName: 'src',
          semanticFamily: 'workspace-root',
          familyRoot: 'workspace',
          familySubgroup: 'root',
        },
        {
          path: 'src/semantic-family.topic-core.logic.mjs',
          occurrenceType: 'file',
          semanticName: 'semantic-family',
          semanticFamily: 'topic-core',
          familyRoot: 'topic',
        },
      ],
    };

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo', namingSemanticFamilyBridge });
    const namingSemanticEvidenceBridge = prepareNamingSemanticEvidenceBridge(namingSemanticFamilyBridge);
    const expectedSemanticHomeEvidence = prepareTreeSemanticHomeEvidence({
      addressedOccurrenceRecords: preparedInputs.structuralAddressSnapshot.occurrenceRecords,
      namingSemanticEvidenceRecords: namingSemanticEvidenceBridge.observations,
    });

    assert.deepEqual(preparedInputs.preparedDependencies.treeSemanticHomeEvidence, expectedSemanticHomeEvidence);
    assert.equal(
      preparedInputs.preparedDependencies.treeSemanticHomeEvidence.evidenceRecords.some((record) => record.path === 'src'),
      false,
    );
    assert.equal(
      preparedInputs.preparedDependencies.treeSemanticHomeEvidence.evidenceRecords.some(
        (record) => record.path === 'src/semantic-family.topic-core.logic.mjs',
      ),
      true,
    );
    assert.equal(
      preparedInputs.preparedDependencies.treeSemanticHomeEvidence.evidenceRecords.some(
        (record) => !Object.hasOwn(record, 'addressPath') || !Object.hasOwn(record, 'parentAddressPath'),
      ),
      false,
    );
    assert.equal(
      preparedInputs.preparedDependencies.treeSemanticHomeEvidence.evidenceRecords.some(
        (record) =>
          ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision', 'isRepoShapeAllowedTopLevelDirectory', 'isStructuralRoot', 'isSemanticRoot', 'structuralClass', 'structuralKind'].some((key) =>
            Object.hasOwn(record, key)),
      ),
      false,
    );

    const runtimeWithBridge = runTreeStructureAdvisorRuntime(preparedInputs);
    const runtimeWithoutBridge = runTreeStructureAdvisorRuntime(
      prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo' }),
    );
    assert.deepEqual(runtimeWithBridge, runtimeWithoutBridge);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});



test('tree semantic naming folder-type relationship classifies only repository-top family roots through Naming evidence', () => {
  const addressedOccurrenceRecords = [
    { addressPath: 'A.1', parentAddressPath: null, path: 'src', resolvedPath: 'src', actualName: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'A.2', parentAddressPath: null, path: 'calculogic-validator', resolvedPath: 'calculogic-validator', actualName: 'calculogic-validator', name: 'calculogic-validator', occurrenceType: 'folder' },
    { addressPath: 'A.2.1', parentAddressPath: 'A.2', path: 'calculogic-validator/tree', resolvedPath: 'calculogic-validator/tree', actualName: 'tree', name: 'tree', occurrenceType: 'folder' },
    { addressPath: 'A.2.1.1', parentAddressPath: 'A.2.1', path: 'calculogic-validator/tree/src', resolvedPath: 'calculogic-validator/tree/src', actualName: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'A.3', parentAddressPath: null, path: 'calculogic-doc-engine', resolvedPath: 'calculogic-doc-engine', actualName: 'calculogic-doc-engine', name: 'calculogic-doc-engine', occurrenceType: 'folder' },
    { addressPath: 'A.4', parentAddressPath: null, path: 'unmatched-package', resolvedPath: 'unmatched-package', actualName: 'unmatched-package', name: 'unmatched-package', occurrenceType: 'folder' },
  ];
  const namingSemanticEvidenceRecords = [
    { path: 'calculogic-validator', occurrenceType: 'folder', semanticName: 'calculogic-validator', semanticFamily: 'calculogic-validator', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
    { path: 'calculogic-validator/tree', occurrenceType: 'folder', semanticName: 'tree', semanticFamily: 'tree', familyRoot: 'tree' },
    { path: 'calculogic-validator/tree/src', occurrenceType: 'folder', semanticName: 'src', semanticFamily: 'src', familyRoot: 'src' },
    { path: 'calculogic-doc-engine', occurrenceType: 'folder', semanticName: 'calculogic-doc-engine', semanticFamily: 'calculogic-doc-engine', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
  ];
  const structuralHomeEvidence = prepareTreeStructuralHomeEvidence({
    addressedOccurrenceRecords,
    structuralHomesRegistry: getBuiltinStructuralHomesRegistry(),
  });

  const relationshipEvidence = prepareTreeSemanticNamingFolderTypeRelationshipEvidence({
    addressedOccurrenceRecords,
    namingSemanticEvidenceRecords,
    treeStructuralHomeEvidence: structuralHomeEvidence,
    treeRepoShapePolicy: getBuiltinTreeRepoShapePolicy(),
    relationshipsRegistry: getBuiltinSemanticNamingFolderTypeRelationshipsRegistry(),
  });
  const semanticHomeEvidence = prepareTreeSemanticHomeEvidence({
    addressedOccurrenceRecords,
    namingSemanticEvidenceRecords,
    treeSemanticNamingFolderTypeRelationshipEvidence: relationshipEvidence,
  });
  const folderKindEvidence = prepareTreeFolderKindEvidence({
    addressedOccurrenceRecords,
    treeStructuralHomeEvidence: structuralHomeEvidence,
    treeSemanticHomeEvidence: semanticHomeEvidence,
    folderKindsRegistry: getBuiltinFolderKindsRegistry(),
  });
  const replacementRuntime = prepareTreeOccurrenceClassificationReplacementRuntime({
    treeStructuralHomeEvidence: structuralHomeEvidence,
    treeSemanticHomeEvidence: semanticHomeEvidence,
    treeFolderKindEvidence: folderKindEvidence,
    treeRepoShapePolicy: getBuiltinTreeRepoShapePolicy(),
  });
  const recordsByPath = Object.fromEntries(replacementRuntime.classifyOccurrenceRecords(addressedOccurrenceRecords).map((record) => [record.path, record]));

  assert.equal(structuralHomeEvidence.evidenceRecords.some((record) => record.path === 'src'), true);
  assert.equal(structuralHomeEvidence.evidenceRecords.some((record) => record.path === 'calculogic-validator'), false);
  assert.equal(structuralHomeEvidence.evidenceRecords.some((record) => record.path === 'calculogic-doc-engine'), false);
  assert.deepEqual(relationshipEvidence.relationshipRecords.map((record) => record.path), ['calculogic-validator', 'calculogic-doc-engine']);
  assert.equal(relationshipEvidence.relationshipRecords.every((record) => record.relationshipPerspective === 'semantic-repository-top-family-home'), true);
  assert.equal(
    JSON.stringify(getBuiltinSemanticNamingFolderTypeRelationshipsRegistry()).includes('calculogic-validator'),
    false,
  );
  assert.equal(
    JSON.stringify(getBuiltinSemanticNamingFolderTypeRelationshipsRegistry()).includes('calculogic-doc-engine'),
    false,
  );
  assert.equal(recordsByPath.src.structuralClass, 'repo-top-structural-root');
  assert.equal(recordsByPath.src.isStructuralRoot, true);
  assert.equal(recordsByPath['calculogic-validator'].structuralClass, 'repo-top-semantic-root');
  assert.equal(recordsByPath['calculogic-validator'].isSemanticRoot, true);
  assert.equal(recordsByPath['calculogic-doc-engine'].structuralClass, 'repo-top-semantic-root');
  assert.equal(recordsByPath['calculogic-doc-engine'].isSemanticRoot, true);
  assert.equal(recordsByPath['calculogic-validator/tree'].structuralClass, 'unclassified');
  assert.equal(Object.hasOwn(recordsByPath['calculogic-validator/tree'], 'classificationExplanation'), false);
  assert.equal(recordsByPath['calculogic-validator/tree/src'].structuralClass, 'unclassified');
  assert.equal(Object.hasOwn(recordsByPath['calculogic-validator/tree/src'], 'classificationExplanation'), false);
  assert.equal(recordsByPath['unmatched-package'].structuralClass, 'unclassified');
  assert.equal(recordsByPath['unmatched-package'].isRepoShapeAllowedTopLevelDirectory, false);
  assert.deepEqual(
    replacementRuntime.collectUnexpectedTopLevelDirectoryNames(['src', 'calculogic-validator', 'calculogic-doc-engine', 'unmatched-package']),
    ['unmatched-package'],
  );

  const missingNamingRelationshipEvidence = prepareTreeSemanticNamingFolderTypeRelationshipEvidence({
    addressedOccurrenceRecords,
    namingSemanticEvidenceRecords: [],
    treeStructuralHomeEvidence: structuralHomeEvidence,
    treeRepoShapePolicy: getBuiltinTreeRepoShapePolicy(),
    relationshipsRegistry: getBuiltinSemanticNamingFolderTypeRelationshipsRegistry(),
  });
  const missingReasonsByPath = Object.fromEntries(
    missingNamingRelationshipEvidence.unclassifiedRelationshipRecords.map((record) => [
      record.path,
      record.classificationExplanation.reason,
    ]),
  );

  assert.equal(missingReasonsByPath['calculogic-validator'], 'missing-required-naming-observation');

  const unqualifiedRelationshipEvidence = prepareTreeSemanticNamingFolderTypeRelationshipEvidence({
    addressedOccurrenceRecords,
    namingSemanticEvidenceRecords: [
      {
        path: 'calculogic-validator',
        occurrenceType: 'folder',
        semanticName: 'calculogic-validator',
        semanticFamily: 'calculogic-validator',
        familyRoot: 'calculogic',
      },
    ],
    treeStructuralHomeEvidence: structuralHomeEvidence,
    treeRepoShapePolicy: getBuiltinTreeRepoShapePolicy(),
    relationshipsRegistry: getBuiltinSemanticNamingFolderTypeRelationshipsRegistry(),
  });
  const unqualifiedCalculogicValidatorRecord = unqualifiedRelationshipEvidence.unclassifiedRelationshipRecords.find(
    (record) => record.path === 'calculogic-validator',
  );
  assert.equal(
    unqualifiedCalculogicValidatorRecord.classificationExplanation.reason,
    'naming-observation-not-qualified-as-family-root',
  );
  assert.equal(Object.hasOwn(missingReasonsByPath, 'calculogic-validator/tree'), false);
  assert.equal(Object.hasOwn(missingReasonsByPath, 'calculogic-validator/tree/src'), false);
  assert.equal(missingReasonsByPath['unmatched-package'], 'unknown-or-unmodeled-folder-relationship');
});

test('tree-structure-advisor runtime report output remains unchanged by structural-address handoff presence', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-neutrality-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const preparedWithHandoff = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo' });
    const {
      structuralAddressSnapshot: _omittedSnapshot,
      ...preparedWithoutHandoff
    } = preparedWithHandoff;

    const withHandoff = runTreeStructureAdvisorRuntime(preparedWithHandoff);
    const withoutHandoff = runTreeStructureAdvisorRuntime(preparedWithoutHandoff);

    assert.deepEqual(withHandoff, withoutHandoff);
    assert.equal(
      withHandoff.findings.some((finding) => Object.hasOwn(finding, 'placementConfidence')),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor structural-address handoff keeps target-derived scope root in targeted runs', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-targeted-root-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, {
      scope: 'repo',
      targets: ['calculogic-validator/src'],
    });
    const snapshot = preparedInputs.structuralAddressSnapshot;

    assert.ok(snapshot);
    assert.equal(snapshot.scope.scopeRootPath, snapshot.scopeRoots[0]);
    assert.equal(snapshot.scope.scopeRootPath, 'calculogic-validator/src');
    assert.equal(snapshot.scope.source, 'tree-structure-advisor.wiring');
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor structural-address handoff preserves file target kind when target is outside active scope', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-targeted-file-kind-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, {
      scope: 'validator',
      targets: ['package.json'],
    });
    const snapshot = preparedInputs.structuralAddressSnapshot;

    assert.ok(snapshot);
    assert.equal(preparedInputs.selectedPaths.length, 0);
    assert.equal(snapshot.scope.targetKind, 'file');
    assert.equal(snapshot.scope.source, 'tree-structure-advisor.wiring');
    assert.deepEqual(snapshot.scopeRoots, ['.']);
    assert.equal(snapshot.occurrenceRecords.length, 0);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor runtime fallback preserves unexpected top-level folder findings without replacement runtime', () => {
  const result = runTreeStructureAdvisorRuntime({
    selectedPaths: [],
    topLevelDirectoryNames: ['src', 'experiments'],
    targets: [],
  });

  const advisory = result.findings.find(
    (finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'experiments',
  );

  assert.ok(advisory);
  assert.deepEqual(advisory.details.allowedTopLevelDirectories, EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES);
  assert.equal(advisory.details.allowedTopLevelDirectories.includes('doc'), true);
  assert.equal(advisory.details.allowedTopLevelDirectories.includes('calculogic-validator'), true);
  assert.equal(advisory.details.allowedTopLevelDirectories.includes('src'), true);
  assert.notDeepEqual(advisory.details.allowedTopLevelDirectories, ['src']);
  assert.equal(Object.hasOwn(advisory.details, 'knownRoots'), false);
});

test('tree-structure-advisor top-level advisory uses ready replacement classification for delta cases', () => {
  const result = runTreeStructureAdvisorRuntime(createReadyClassificationPreparedInputs({
    topLevelDirectoryNames: ['doc', 'src'],
    classificationsByName: new Map([
      ['doc', false],
      ['src', true],
    ]),
  }));

  const unexpectedTopLevelPaths = result.findings
    .filter((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER')
    .map((finding) => finding.path);

  assert.deepEqual(unexpectedTopLevelPaths, ['doc']);
  assert.deepEqual(result.findings[0], {
    code: 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER',
    severity: 'info',
    path: 'doc',
    classification: 'advisory-structure',
    message: 'Top-level folder is outside the known project shape for this repository and may indicate structural drift.',
    ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
    details: {
      allowedTopLevelDirectories: EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES,
    },
  });
});

test('tree-structure-advisor top-level advisory keeps repo-shape policy ahead of structural-home classification', () => {
  const result = runTreeStructureAdvisorRuntime(createReadyClassificationPreparedInputs({
    topLevelDirectoryNames: ['data', 'src'],
    classificationsByName: new Map([
      ['data', true],
      ['src', true],
    ]),
  }));

  const unexpectedTopLevelPaths = result.findings
    .filter((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER')
    .map((finding) => finding.path);

  assert.deepEqual(unexpectedTopLevelPaths, ['data']);
  assert.equal(result.findings[0].details.allowedTopLevelDirectories.includes('data'), false);
});

test('tree-structure-advisor top-level advisory stays stable when fallback and ready classification agree', () => {
  const replacementReadyResult = runTreeStructureAdvisorRuntime(createReadyClassificationPreparedInputs({
    topLevelDirectoryNames: ['doc', 'experiments', 'src'],
    classificationsByName: new Map([
      ['doc', true],
      ['experiments', false],
      ['src', true],
    ]),
  }));
  const fallbackResult = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [],
    topLevelDirectoryNames: ['doc', 'experiments', 'src'],
    targets: [],
  });

  assert.deepEqual(replacementReadyResult, fallbackResult);
});

test('tree-structure-advisor top-level advisory falls back when replacement evidence is missing or not ready', () => {
  const preparedInputs = createReadyClassificationPreparedInputs({
    topLevelDirectoryNames: ['experiments', 'src'],
    classificationsByName: new Map([
      ['experiments', true],
      ['src', true],
    ]),
  });

  const withoutExecutionContract = runTreeStructureAdvisorRuntime({
    ...preparedInputs,
    preparedDependencies: {
      ...preparedInputs.preparedDependencies,
      treeOccurrenceClassificationRuntimeExecutionContract: undefined,
    },
  });
  const withoutOccurrenceEvidence = runTreeStructureAdvisorRuntime({
    ...preparedInputs,
    occurrenceSnapshot: undefined,
  });

  assert.deepEqual(
    withoutExecutionContract.findings.map((finding) => `${finding.path}|${finding.code}`),
    ['experiments|TREE_UNEXPECTED_TOP_LEVEL_FOLDER'],
  );
  assert.deepEqual(withoutOccurrenceEvidence, withoutExecutionContract);
});

test('tree-structure-advisor top-level advisory falls back when ready replacement classification is malformed', () => {
  const preparedInputs = createReadyClassificationPreparedInputs({
    topLevelDirectoryNames: ['experiments', 'src'],
    classificationsByName: new Map([
      ['experiments', true],
      ['src', true],
    ]),
  });
  const result = runTreeStructureAdvisorRuntime({
    ...preparedInputs,
    preparedDependencies: {
      ...preparedInputs.preparedDependencies,
      treeOccurrenceClassificationReplacementRuntime: {
        source: 'test-malformed-tree-occurrence-classification-replacement-runtime',
        classifyOccurrenceRecords: () => 'malformed',
        collectUnexpectedTopLevelDirectoryNames: preparedInputs.preparedDependencies
          .treeOccurrenceClassificationReplacementRuntime.collectUnexpectedTopLevelDirectoryNames,
      },
    },
  });

  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].path, 'experiments');
  assert.equal(result.findings[0].code, 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER');
  assert.equal(result.totalFilesScanned, 0);
});





test('tree-structure-advisor runner staging receives addressed Naming package-root observations', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-runner-package-root-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'naming', 'naming-src'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'calculogic-validator', 'naming', 'naming-src', 'fixture.logic.mjs'), 'export const fixture = true\n', 'utf8');
    await writeJson(path.join(fixtureDir, 'calculogic-validator', 'package.json'), { name: '@calculogic/validator' });
    await writeJson(path.join(fixtureDir, 'calculogic-doc-engine', 'package.json'), { name: '@calculogic/doc-engine' });
    await fs.mkdir(path.join(fixtureDir, 'unmatched-package'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'unmatched-package', 'index.logic.mjs'), 'export const unmatched = true\n', 'utf8');

    const runnerReport = runValidatorRunner(fixtureDir, {
      scope: 'repo',
      validators: ['tree-structure-advisor'],
    });
    const treeReport = runnerReport.validators.find((entry) => entry.id === 'tree-structure-advisor');
    const unexpectedTopLevelPaths = treeReport.findings
      .filter((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER')
      .map((finding) => finding.path);

    assert.deepEqual(unexpectedTopLevelPaths, ['unmatched-package']);

    const namingResult = runNamingValidator(fixtureDir, { scope: 'repo' });
    const namingSemanticFamilyBridge = projectNamingSemanticFamilyBridge(namingResult);
    assert.deepEqual(
      namingSemanticFamilyBridge.observations
        .filter((observation) => observation.semanticEvidenceKind === 'semantic-family-root-folder')
        .map((observation) => [observation.path, observation.familyRootQualification]),
      [
        ['calculogic-doc-engine', 'package-root-folder'],
        ['calculogic-validator', 'package-root-folder'],
      ],
    );

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo', namingSemanticFamilyBridge });
    const addressedFolderObservations = preparedInputs.preparedDependencies.addressedNamingSemanticEvidenceBridge.observations
      .filter((observation) => observation.semanticEvidenceKind === 'semantic-family-root-folder');
    const addressedCompositionObservation = preparedInputs.preparedDependencies.addressedNamingSemanticEvidenceBridge.observations
      .find((observation) => observation.path === 'calculogic-validator/naming/naming-src');
    const addressedAncestorContextObservation = preparedInputs.preparedDependencies.addressedNamingSemanticEvidenceBridge.observations
      .find((observation) => observation.path === 'calculogic-validator/naming');

    assert.equal(addressedFolderObservations.every((observation) => observation.occurrenceAddress), true);
    assert.equal(addressedCompositionObservation.semanticEvidenceKind, 'folder-semantic-structural-composition');
    assert.equal(addressedCompositionObservation.occurrenceAddress, addressedCompositionObservation.addressPath);
    assert.equal(addressedAncestorContextObservation.semanticEvidenceKind, 'folder-semantic-context');
    assert.equal(addressedAncestorContextObservation.semanticContext, 'naming');

    const relationshipRecordsByPath = Object.fromEntries(
      preparedInputs.preparedDependencies.treeSemanticNamingFolderTypeRelationshipEvidence.relationshipRecords
        .map((record) => [record.path, record]),
    );
    assert.deepEqual(
      Object.values(relationshipRecordsByPath)
        .filter((record) => record.relationshipPerspective === 'semantic-repository-top-family-home')
        .map((record) => [record.path, record.relationshipPerspective, record.familyRootQualification])
        .sort((left, right) => left[0].localeCompare(right[0])),
      [
        ['calculogic-doc-engine', 'semantic-repository-top-family-home', 'package-root-folder'],
        ['calculogic-validator', 'semantic-repository-top-family-home', 'package-root-folder'],
      ],
    );
    assert.equal(
      relationshipRecordsByPath['calculogic-validator/naming/naming-src'].relationshipInterpretation,
      'semantic-qualified-structural-container-aligned',
    );
    assert.equal(
      relationshipRecordsByPath['calculogic-validator/naming/naming-src'].semanticContextEvidenceAddressPath,
      addressedAncestorContextObservation.addressPath,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor ready route keeps semantic package roots non-unexpected through active classification', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-semantic-ready-route-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'unmatched-package'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'unmatched-package', 'index.logic.mjs'), 'export const unmatched = true\n', 'utf8');

    const namingSemanticFamilyBridge = {
      observations: [
        { path: 'calculogic-validator', occurrenceType: 'folder', semanticName: 'calculogic-validator', semanticFamily: 'calculogic-validator', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
        { path: 'calculogic-doc-engine', occurrenceType: 'folder', semanticName: 'calculogic-doc-engine', semanticFamily: 'calculogic-doc-engine', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
      ],
    };

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo', namingSemanticFamilyBridge });
    const classificationsByPath = Object.fromEntries(
      preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRuntime
        .classifyOccurrenceRecords(preparedInputs.structuralAddressSnapshot.occurrenceRecords)
        .filter((record) => record.occurrenceType === 'folder')
        .map((record) => [record.path, record]),
    );

    assert.equal(classificationsByPath.src.structuralClass, 'repo-top-structural-root');
    assert.equal(classificationsByPath['calculogic-validator'].structuralClass, 'repo-top-semantic-root');
    assert.equal(classificationsByPath['calculogic-doc-engine'].structuralClass, 'repo-top-semantic-root');
    assert.equal(classificationsByPath['calculogic-validator'].isRepoShapeAllowedTopLevelDirectory, true);
    assert.equal(classificationsByPath['calculogic-doc-engine'].isRepoShapeAllowedTopLevelDirectory, true);
    assert.equal(classificationsByPath['unmatched-package'].structuralClass, 'unclassified');

    const fallbackUnexpected = preparedInputs.preparedDependencies.treeOccurrenceClassificationReplacementRuntime
      .collectUnexpectedTopLevelDirectoryNames(preparedInputs.topLevelDirectoryNames);
    assert.deepEqual(fallbackUnexpected, ['unmatched-package']);

    const readyInputs = {
      ...preparedInputs,
      preparedDependencies: {
        ...preparedInputs.preparedDependencies,
        treeOccurrenceClassificationRuntimeExecutionContract: READY_OCCURRENCE_CLASSIFICATION_EXECUTION_CONTRACT,
        treeOccurrenceClassificationReplacementReadiness: READY_OCCURRENCE_CLASSIFICATION_REPLACEMENT_READINESS,
      },
    };
    const readyResult = runTreeStructureAdvisorRuntime(readyInputs);
    const unexpectedTopLevelPaths = readyResult.findings
      .filter((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER')
      .map((finding) => finding.path);

    assert.deepEqual(unexpectedTopLevelPaths, ['unmatched-package']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor non-empty structural-home repo-top folder remains unexpected when repo-shape disallows it', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-non-empty-repo-top-policy-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'data'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'data', 'some-file.logic.mjs'), 'export const data = true\n', 'utf8');

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const dataAdvisory = result.findings.find(
      (finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'data',
    );

    assert.ok(dataAdvisory);
    assert.equal(dataAdvisory.details.allowedTopLevelDirectories.includes('data'), false);
    assert.deepEqual(dataAdvisory.details.allowedTopLevelDirectories, EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor replacement root policy comes from bounded structural-home evidence without behavior drift', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-root-policy-registry-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const advisory = result.findings.find(
      (finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'experiments',
    );

    assert.equal(
      result.findings.some(
        (finding) =>
          finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER' && finding.path === 'calculogic-doc-engine',
      ),
      false,
    );
    assert.ok(advisory);
    assert.deepEqual(advisory.details.allowedTopLevelDirectories, EXPECTED_TREE_REPO_SHAPE_ALLOWED_TOP_LEVEL_DIRECTORIES);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor keeps general structural-home top-level folders unexpected unless repo-shape policy allows them', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-repo-shape-policy-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'data'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'vendor'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'assets'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'ops'), { recursive: true });

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const unexpectedPaths = result.findings
      .filter((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER')
      .map((finding) => finding.path)
      .sort((left, right) => left.localeCompare(right));

    assert.deepEqual(unexpectedPaths, ['assets', 'data', 'ops', 'vendor']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor findings are deterministic and summary-stable', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-deterministic-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const first = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const second = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.deepEqual(first.findings, second.findings);

    const findingKeys = first.findings.map((finding) => `${finding.path}|${finding.code}`);
    const sortedFindingKeys = [...findingKeys].sort((left, right) => left.localeCompare(right));
    assert.deepEqual(findingKeys, sortedFindingKeys);

    const summary = summarizeFindings(first.findings);
    assert.deepEqual(summary.counts, { 'advisory-structure': 2 });
    assert.deepEqual(summary.codeCounts, {
      TREE_UNEXPECTED_TOP_LEVEL_FOLDER: 1,
      TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE: 1,
    });
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor detects flat thin re-export shim deterministically', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-reexport-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const findings = result.findings.filter(
      (finding) => finding.path === 'src/validator-runner.logic.mjs' && finding.code.startsWith('TREE_SHIM_'),
    );

    assert.deepEqual(
      findings.map((finding) => finding.code),
      ['TREE_SHIM_OUTSIDE_COMPAT', 'TREE_SHIM_SURFACE_PRESENT'],
    );
    const shimSurface = findings.find((finding) => finding.code === 'TREE_SHIM_SURFACE_PRESENT');
    assert.ok(shimSurface);
    assert.equal(shimSurface.details.matchedShimSignals.thinReexportShim, true);
    assert.equal(
      shimSurface.details.canonicalTargetPath,
      '../calculogic-validator/src/core/validator-runner.logic.mjs',
    );
    assert.equal(shimSurface.details.insideCompatSurface, false);
    assert.equal('suppressedAsIntentionalPassThrough' in shimSurface.details, false);
    assert.equal('suppressedBySurfaceContext' in shimSurface.details, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor detects shim-like path inside compat surface without outside warning', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-compat-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) =>
          finding.path === 'src/compat/legacy-api.logic.mjs' && finding.code === 'TREE_SHIM_SURFACE_PRESENT',
      ),
      true,
    );
    assert.equal(
      result.findings.some(
        (finding) =>
          finding.path === 'src/compat/legacy-api.logic.mjs' && finding.code === 'TREE_SHIM_OUTSIDE_COMPAT',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor suppresses token-only shim signals on quality surfaces', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-quality-suppressed-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'test'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'test', 'core-entrypoints-contract.test.mjs'),
      'export const testCase = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/test/core-entrypoints-contract.test.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor keeps runtime token-only shim path as informational signal only', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-runtime-token-only-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'bridges'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'bridges', 'legacy-api.logic.mjs'),
      'export const maybeBridge = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const shimFindings = result.findings.filter((finding) => finding.path === 'src/bridges/legacy-api.logic.mjs');

    assert.deepEqual(
      shimFindings.map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );
    assert.equal(shimFindings[0].details.artifactSurface, 'runtimeish');
    assert.equal(shimFindings[0].details.matchedShimSignals.thinReexportShim, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor suppresses weak token-only shim signal for tree shim detector implementation file', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-detector-impl-suppressed-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-shim-detection.logic.mjs'),
      'export const collectShimEvidence = () => null\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/tree/src/tree-shim-detection.logic.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not treat canonical host-to-wiring pass-through as shim debt', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-host-wiring-pass-through-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.host.mjs'),
      "export * from './tree-structure-advisor.wiring.mjs';\n",
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.wiring.mjs'),
      'export const treeAdvisor = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some(
        (finding) => finding.path === 'calculogic-validator/tree/src/tree-structure-advisor.host.mjs',
      ),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not treat public index entrypoint barrel as shim debt', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-public-entrypoint-pass-through-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'index.mjs'),
      [
        "export * from './core/validator-runner.logic.mjs';",
        "export * as naming from '../naming/src/naming-validator.host.mjs';",
        "export * as treeStructureAdvisor from '../src/tree-structure-advisor.host.mjs';",
      ].join('\n'),
      'utf8',
    );
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'naming', 'src'), { recursive: true });
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'tree', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'validator-runner.logic.mjs'),
      'export const validatorRunner = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'naming', 'src', 'naming-validator.host.mjs'),
      'export const namingHost = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'tree', 'src', 'tree-structure-advisor.host.mjs'),
      'export const treeHost = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.path === 'calculogic-validator/src/index.mjs'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor does not flag normal non-shim files for shim findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-shim-non-shim-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(result.findings.some((finding) => finding.code.startsWith('TREE_SHIM_')), false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});



test('tree shim detection stages content reads and skips non-candidate runtime files', () => {
  const selectedPaths = [
    'src/app-shell.logic.ts',
    'src/compat/legacy-api.logic.mjs',
    'src/bridge-runtime.logic.mjs',
  ];
  const readCalls = [];
  const contentByPath = new Map([
    [
      'src/compat/legacy-api.logic.mjs',
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
    ],
    ['src/bridge-runtime.logic.mjs', 'export const bridge = true\n'],
  ]);

  const findings = collectShimCompatFindings(selectedPaths, (relativePath) => {
    readCalls.push(relativePath);
    return contentByPath.get(relativePath) ?? 'export const noop = true\n';
  });

  assert.deepEqual(readCalls, ['src/compat/legacy-api.logic.mjs', 'src/bridge-runtime.logic.mjs']);
  assert.equal(readCalls.includes('src/app-shell.logic.ts'), false);
  assert.deepEqual(
    findings.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
    ['TREE_SHIM_SURFACE_PRESENT'],
  );
  assert.deepEqual(
    findings.filter((finding) => finding.path === 'src/bridge-runtime.logic.mjs').map((finding) => finding.code),
    ['TREE_SHIM_SURFACE_PRESENT'],
  );
});

test('tree shim detection emits outside-compat warning only for thin re-export evidence outside compat', () => {
  const selectedPaths = [
    'src/bridge-runtime.logic.mjs',
    'src/compat/legacy-api.logic.mjs',
    'src/validator-runner.logic.mjs',
  ];
  const contentByPath = new Map([
    ['src/bridge-runtime.logic.mjs', 'export const bridge = true\n'],
    ['src/compat/legacy-api.logic.mjs', "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\n"],
    ['src/validator-runner.logic.mjs', "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n"],
  ]);

  const findings = collectShimCompatFindings(selectedPaths, (relativePath) => contentByPath.get(relativePath));
  const outsideCompatCodes = findings
    .filter((finding) => finding.code === 'TREE_SHIM_OUTSIDE_COMPAT')
    .map((finding) => finding.path);

  assert.deepEqual(outsideCompatCodes, ['src/validator-runner.logic.mjs']);
});
test('tree-structure-advisor flags validator-owned-looking file outside validator tree', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-misplaced-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'naming-validator.wiring.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const advisory = result.findings.find(
      (finding) => finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE',
    );

    assert.ok(advisory);
    assert.equal(advisory.severity, 'info');
    assert.equal(advisory.classification, 'advisory-structure');
    assert.equal(advisory.path, 'src/naming-validator.wiring.mjs');
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor boundary drift keeps suite-core shared infra carveouts quiet', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-shared-infra-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming', 'naming-validator.logic.mjs'),
      'export const namingCore = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'naming', 'naming-validator.wiring.mjs'),
      'export const namingWiring = true\n',
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor emits owned-slice boundary drift for clear subsystem growth under suite-core', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-drift-owned-growth-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'tree-structure-advisor'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(
        fixtureDir,
        'calculogic-validator',
        'src',
        'tree-structure-advisor',
        'tree-structure-advisor.logic.mjs',
      ),
      'export const treeLogic = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(
        fixtureDir,
        'calculogic-validator',
        'src',
        'tree-structure-advisor',
        'tree-structure-advisor.wiring.mjs',
      ),
      'export const treeWiring = true\n',
      'utf8',
    );

    const first = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const second = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const firstDriftFindings = first.findings.filter(
      (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
    );
    const secondDriftFindings = second.findings.filter(
      (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
    );

    assert.equal(firstDriftFindings.length, 1);
    assert.deepEqual(firstDriftFindings, secondDriftFindings);
    assert.equal(firstDriftFindings[0].path, 'calculogic-validator/src/tree-structure-advisor/');
    assert.deepEqual(firstDriftFindings[0].details.matchedOwnedSignalPaths, [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ]);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor boundary drift preserves compat and public-entry carveouts', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-boundary-drift-carveouts-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'compat', 'legacy-validator.logic.mjs'),
      'export const compatLogic = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'compat', 'legacy-validator.wiring.mjs'),
      'export const compatWiring = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'index.mjs'),
      "export * from './core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });

    assert.equal(
      result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor directory target narrows analyzed paths/findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-dir-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const unfiltered = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const filtered = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      targets: ['calculogic-validator'],
    });

    assert.equal(filtered.filters.isFiltered, true);
    assert.deepEqual(filtered.filters.targets, ['calculogic-validator']);
    assert.equal(
      unfiltered.findings.some((finding) => finding.path === 'src/validator-runner.logic.mjs'),
      true,
    );
    assert.equal(filtered.findings.some((finding) => finding.path === 'src/validator-runner.logic.mjs'), false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor file target narrows analyzed paths/findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'naming-validator.wiring.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const filtered = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      targets: ['src/app-shell.logic.ts'],
    });

    assert.equal(filtered.filters.isFiltered, true);
    assert.deepEqual(filtered.filters.targets, ['src/app-shell.logic.ts']);
    assert.equal(
      filtered.findings.some((finding) => finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE'),
      false,
    );
    assert.equal(filtered.totalFilesScanned, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor throws for invalid target path', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-invalid-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: ['does-not-exist'] }),
      /Target path does not exist: does-not-exist/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor throws for target path escaping repository root', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-escape-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: ['..'] }),
      /Target path escapes repository root: ../u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor no-target behavior remains unchanged for findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-target-compat-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const withoutTargets = runTreeStructureAdvisor(fixtureDir, { scope: 'repo' });
    const explicitEmptyTargets = runTreeStructureAdvisor(fixtureDir, { scope: 'repo', targets: [] });

    assert.deepEqual(withoutTargets.findings, explicitEmptyTargets.findings);
    assert.equal(withoutTargets.filters.isFiltered, false);
    assert.equal(explicitEmptyTargets.filters.isFiltered, false);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});



test('tree-structure-advisor docs scope includes declared root README when present', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-docs-root-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'docs' });

    assert.deepEqual(prepared.selectedPaths, ['doc/README.md', 'README.md']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor system scope includes present root files and ignores missing declarations', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-system-root-files-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'eslint.config.mjs'), 'export default []\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8');

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'system' });

    assert.deepEqual(prepared.selectedPaths, ['eslint.config.mjs', 'package.json', 'tsconfig.json']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor root-file target filtering works for docs scope target', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-docs-target-root-file-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');

    const result = runTreeStructureAdvisor(fixtureDir, {
      scope: 'docs',
      targets: ['README.md'],
    });

    assert.equal(result.filters.isFiltered, true);
    assert.deepEqual(result.filters.targets, ['README.md']);
    assert.equal(result.totalFilesScanned, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('tree-structure-advisor scope collection follows suite profiles uniformly, including repo', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-uniform-suite-profile-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.writeFile(path.join(fixtureDir, 'README.md'), '# root readme\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'eslint.config.mjs'), 'export default []\n', 'utf8');
    await fs.writeFile(path.join(fixtureDir, 'tsconfig.json'), '{"compilerOptions":{}}\n', 'utf8');

    for (const scope of ['repo', 'docs', 'system']) {
      const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope });
      const expectedPaths = await collectExpectedPathsFromScopeProfile(fixtureDir, scope);

      assert.deepEqual(prepared.selectedPaths, expectedPaths);
    }
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor keeps current symlinked scope-root traversal behavior', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-symlink-'));
  const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-scope-symlink-outside-'));

  try {
    await fs.mkdir(path.join(fixtureDir, 'test'), { recursive: true });
    await fs.writeFile(path.join(fixtureDir, 'test', 'inside.test.js'), 'export const inside = true;\n', 'utf8');
    await fs.writeFile(
      path.join(outsideDir, 'outside.logic.ts'),
      'export const outside = true;\n',
      'utf8',
    );
    await fs.symlink(outsideDir, path.join(fixtureDir, 'src'), 'dir');

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'app' });

    assert.deepEqual(prepared.selectedPaths, ['src/outside.logic.ts', 'test/inside.test.js']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    await fs.rm(outsideDir, { recursive: true, force: true });
  }
});

test('tree-structure-advisor rejects invalid scope deterministically', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-invalid-scope-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    assert.throws(
      () => prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'unknown-scope' }),
      /Invalid scope profile: unknown-scope/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});




test('tree-structure-advisor computes occurrence-derived file reasoning input once per runtime run', () => {
  let occurrenceRecordReads = 0;
  const occurrenceSnapshot = {};

  Object.defineProperty(occurrenceSnapshot, 'occurrenceRecords', {
    get() {
      occurrenceRecordReads += 1;
      return [
        {
          resolvedPath: 'src/validator-runner.logic.mjs',
          occurrenceType: 'file',
        },
      ];
    },
  });

  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot,
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.equal(occurrenceRecordReads, 1);
  assert.equal(result.totalFilesScanned, 1);
  assert.equal(
    result.findings.some(
      (finding) =>
        finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE' &&
        finding.path === 'src/validator-runner.logic.mjs',
    ),
    true,
  );
});
test('tree-structure-advisor consumes occurrence snapshot file records for validator-owned outside-tree reasoning', () => {
  const fromOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['calculogic-validator/tree/src/tree-structure-advisor.logic.mjs'],
    occurrenceSnapshot: {
      scopeRoots: ['src'],
      occurrenceRecords: [
        {
          resolvedPath: 'src/validator-runner.logic.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const withoutOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['src/validator-runner.logic.mjs'],
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.deepEqual(fromOccurrenceSnapshot.findings, withoutOccurrenceSnapshot.findings);
  assert.equal(fromOccurrenceSnapshot.totalFilesScanned, 1);
});



test('tree-structure-advisor consumes occurrence-derived file paths for owned-slice boundary drift reasoning', () => {
  const fromOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
          occurrenceType: 'file',
        },
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const withoutOccurrenceSnapshot = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ],
    topLevelDirectoryNames: [],
    targets: [],
  });

  const fromSnapshotBoundaryDrift = fromOccurrenceSnapshot.findings.filter(
    (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
  );
  const fromSelectedPathsBoundaryDrift = withoutOccurrenceSnapshot.findings.filter(
    (finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT',
  );

  assert.deepEqual(fromSnapshotBoundaryDrift, fromSelectedPathsBoundaryDrift);
  assert.equal(fromSnapshotBoundaryDrift.length, 1);
});

test('tree-structure-advisor occurrence-derived boundary drift reasoning remains stable for repeated-name subtree paths', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/src-helper/src-helper.logic.mjs',
          occurrenceType: 'file',
        },
        {
          resolvedPath: 'calculogic-validator/src/src-helper/src-helper.wiring.mjs',
          occurrenceType: 'file',
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  const driftFinding = result.findings.find((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT');

  assert.ok(driftFinding);
  assert.equal(driftFinding.path, 'calculogic-validator/src/src-helper/');
  assert.deepEqual(driftFinding.details.matchedOwnedSignalPaths, [
    'calculogic-validator/src/src-helper/src-helper.logic.mjs',
    'calculogic-validator/src/src-helper/src-helper.wiring.mjs',
  ]);
});

test('tree-structure-advisor occurrence-derived boundary drift reasoning remains stable for rebased scope roots', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'validator',
    selectedPaths: ['doc/README.md'],
    occurrenceSnapshot: {
      scopeRoots: ['calculogic-validator/tree'],
      occurrenceRecords: [
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
          occurrenceType: 'file',
          scopeRootPath: 'calculogic-validator/tree',
          isScopeTopOccurrence: false,
        },
        {
          resolvedPath: 'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
          occurrenceType: 'file',
          scopeRootPath: 'calculogic-validator/tree',
          isScopeTopOccurrence: false,
        },
      ],
    },
    topLevelDirectoryNames: [],
    targets: ['calculogic-validator/tree'],
  });

  const driftFinding = result.findings.find((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT');

  assert.ok(driftFinding);
  assert.equal(driftFinding.path, 'calculogic-validator/src/tree-structure-advisor/');
});

test('tree-structure-advisor falls back to selectedPaths when occurrence snapshot is malformed', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.logic.mjs',
      'calculogic-validator/src/tree-structure-advisor/tree-structure-advisor.wiring.mjs',
    ],
    occurrenceSnapshot: {
      occurrenceRecords: 'malformed',
    },
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.equal(
    result.findings.some((finding) => finding.code === 'TREE_OWNED_SLICE_BOUNDARY_DRIFT'),
    true,
  );
});

test('tree-structure-advisor prepared runtime contract accepts tree-core inputs without contributors', () => {
  const result = runTreeStructureAdvisorRuntime({
    scope: 'repo',
    selectedPaths: [],
    topLevelDirectoryNames: [],
    targets: [],
  });

  assert.deepEqual(result.findings, []);
  assert.equal(result.totalFilesScanned, 0);
});

test('tree-structure-advisor wiring composes shim contributor with lazy staged content reads', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-lazy-content-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'src', 'compat'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      "export * from '../../calculogic-validator/src/core/validator-runner.logic.mjs';\\n",
      'utf8',
    );

    const prepared = prepareTreeStructureAdvisorInputs(fixtureDir, { scope: 'repo' });

    assert.equal(Array.isArray(prepared.findingContributors), true);
    assert.equal(prepared.findingContributors.length, 1);

    const shimFindingsFirst = prepared.findingContributors[0](prepared);
    assert.deepEqual(
      shimFindingsFirst.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );

    await fs.writeFile(
      path.join(fixtureDir, 'src', 'compat', 'legacy-api.logic.mjs'),
      'export const changed = true\\n',
      'utf8',
    );

    const shimFindingsSecond = prepared.findingContributors[0](prepared);
    assert.deepEqual(
      shimFindingsSecond.filter((finding) => finding.path === 'src/compat/legacy-api.logic.mjs').map((finding) => finding.code),
      ['TREE_SHIM_SURFACE_PRESENT'],
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

const createCleanPreparedAddressKeyedJoinEvidence = (semanticFamily) => ({
  boundary: 'tree-naming-occurrence-address-join',
  status: 'joined',
  usedForCurrentTreeJoins: true,
  identityTupleFields: ['addressProfileId', 'addressedSnapshotId', 'occurrenceAddress'],
  diagnostics: [],
  skippedJoins: [],
  joinedEvidence: [
    ['A.1', 'src/shared/build'],
    ['A.2', 'src/features/build'],
    ['A.3', 'src/features/build'],
    ['A.4', 'src/features/build'],
  ].map(([occurrenceAddress, directoryPath], index) => ({
    evidenceType: 'tree-prepared-naming-occurrence-address-join',
    identityTuple: {
      addressProfileId: 'tree-codebase',
      addressedSnapshotId: 'snapshot-001',
      occurrenceAddress,
    },
    namingObservation: {
      path: `stale/${semanticFamily}-${index}.logic.ts`,
      semanticName: semanticFamily,
      familyRoot: semanticFamily.split('-')[0],
      semanticFamily,
    },
    occurrenceRecord: {
      occurrenceAddress,
      path: `${directoryPath}/${semanticFamily}-${index}.logic.ts`,
      resolvedPath: `${directoryPath}/${semanticFamily}-${index}.logic.ts`,
    },
  })),
});

const createPathKeyedFamilyBridge = (semanticFamily) => ({
  observations: [
    `src/shared/build/${semanticFamily}.logic.ts`,
    `src/features/build/${semanticFamily}.results.ts`,
    `src/features/build/${semanticFamily}.knowledge.ts`,
    `src/features/build/${semanticFamily}.build.tsx`,
  ].map((pathValue) => ({
    path: pathValue,
    semanticName: semanticFamily,
    familyRoot: semanticFamily.split('-')[0],
    semanticFamily,
  })),
});

const scatteredFamilyFindings = (result) =>
  result.findings
    .filter((finding) => finding.code === 'TREE_FAMILY_SCATTERED')
    .map((finding) => finding.details.semanticFamily)
    .sort((left, right) => left.localeCompare(right));

test('tree structure advisor wiring forwards prepared address-keyed semantic-family evidence to default contributors', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-keyed-contributor-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const namingSemanticFamilyBridge = createPathKeyedFamilyBridge('path-keyed');
    const preparedAddressKeyedJoinEvidence = createCleanPreparedAddressKeyedJoinEvidence('address-keyed');

    const preparedInputs = prepareTreeStructureAdvisorInputs(fixtureDir, {
      scope: 'repo',
      namingSemanticFamilyBridge,
      preparedAddressKeyedJoinEvidence,
    });
    const preparedResult = runTreeStructureAdvisorRuntime(preparedInputs);
    const runResult = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      namingSemanticFamilyBridge,
      preparedAddressKeyedJoinEvidence,
    });

    assert.deepEqual(scatteredFamilyFindings(preparedResult), ['address-keyed']);
    assert.deepEqual(scatteredFamilyFindings(runResult), ['address-keyed']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree structure advisor wiring preserves path-keyed fallback when prepared address evidence is absent or not clean', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-structure-address-keyed-fallback-'));

  try {
    await writeBaseFixtureRepo(fixtureDir);

    const namingSemanticFamilyBridge = createPathKeyedFamilyBridge('path-keyed');
    const cleanPreparedAddressKeyedJoinEvidence = createCleanPreparedAddressKeyedJoinEvidence('address-keyed');
    const notCleanPreparedAddressKeyedJoinEvidence = {
      ...cleanPreparedAddressKeyedJoinEvidence,
      status: 'joined-with-skips',
      usedForCurrentTreeJoins: false,
      skippedJoins: [
        {
          reason: 'no-matching-occurrence-record-identity-tuple',
          identityTuple: {
            addressProfileId: 'tree-codebase',
            addressedSnapshotId: 'snapshot-001',
            occurrenceAddress: 'Z.9',
          },
        },
      ],
    };

    const absentResult = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      namingSemanticFamilyBridge,
    });
    const notCleanResult = runTreeStructureAdvisor(fixtureDir, {
      scope: 'repo',
      namingSemanticFamilyBridge,
      preparedAddressKeyedJoinEvidence: notCleanPreparedAddressKeyedJoinEvidence,
    });

    assert.deepEqual(scatteredFamilyFindings(absentResult), ['path-keyed']);
    assert.deepEqual(scatteredFamilyFindings(notCleanResult), ['path-keyed']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('semantic-qualified structural-container relationship uses addressed semantic-context evidence instead of ancestor names', () => {
  const addressedOccurrenceRecords = [
    { addressPath: 'A.1', parentAddressPath: null, path: 'src', name: 'src', occurrenceType: 'folder' },
    { addressPath: 'A.2', parentAddressPath: null, path: 'calculogic-validator', name: 'calculogic-validator', occurrenceType: 'folder' },
    { addressPath: 'A.2.1', parentAddressPath: 'A.2', path: 'calculogic-validator/naming', name: 'naming', occurrenceType: 'folder' },
    { addressPath: 'A.2.1.1', parentAddressPath: 'A.2.1', path: 'calculogic-validator/naming/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    { addressPath: 'A.2.1.2', parentAddressPath: 'A.2.1', path: 'calculogic-validator/naming/naming-src.logic.mjs', name: 'naming-src.logic.mjs', occurrenceType: 'file' },
    { addressPath: 'A.2.1.3', parentAddressPath: 'A.2.1', path: 'calculogic-validator/naming/naming-tools', name: 'naming-tools', occurrenceType: 'folder' },
    { addressPath: 'A.2.2', parentAddressPath: 'A.2', path: 'calculogic-validator/tree', name: 'tree', occurrenceType: 'folder' },
    { addressPath: 'A.2.2.1', parentAddressPath: 'A.2.2', path: 'calculogic-validator/tree/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    { addressPath: 'A.2.3', parentAddressPath: 'A.2', path: 'calculogic-validator/naming-without-context', name: 'naming', occurrenceType: 'folder' },
    { addressPath: 'A.2.3.1', parentAddressPath: 'A.2.3', path: 'calculogic-validator/naming-without-context/naming-src', name: 'naming-src', occurrenceType: 'folder' },
    { addressPath: 'A.3', parentAddressPath: null, path: 'calculogic-doc-engine', name: 'calculogic-doc-engine', occurrenceType: 'folder' },
  ];
  const namingSemanticEvidenceRecords = [
    { addressPath: 'A.2', path: 'calculogic-validator', occurrenceType: 'folder', semanticName: 'calculogic-validator', semanticFamily: 'calculogic-validator', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
    { addressPath: 'A.3', path: 'calculogic-doc-engine', occurrenceType: 'folder', semanticName: 'calculogic-doc-engine', semanticFamily: 'calculogic-doc-engine', familyRoot: 'calculogic', semanticEvidenceKind: 'semantic-family-root-folder', familyRootQualification: 'package-root-folder' },
    { addressPath: 'A.2.1', path: 'calculogic-validator/naming', occurrenceType: 'folder', semanticName: 'naming', semanticFamily: 'naming', familyRoot: 'naming', semanticEvidenceKind: 'folder-semantic-context', semanticContext: 'naming', semanticContextQualification: 'explicit-supported-folder-semantic-context', semanticContextConfidence: 'bounded' },
    { addressPath: 'A.2.2', path: 'calculogic-validator/tree', occurrenceType: 'folder', semanticName: 'tree', semanticFamily: 'tree', familyRoot: 'tree', semanticEvidenceKind: 'folder-semantic-context', semanticContext: 'tree', semanticContextQualification: 'explicit-supported-folder-semantic-context', semanticContextConfidence: 'bounded' },
    { addressPath: 'A.2.1.1', path: 'calculogic-validator/naming/naming-src', occurrenceType: 'folder', semanticName: 'naming', semanticFamily: 'naming', familyRoot: 'naming', semanticEvidenceKind: 'folder-semantic-structural-composition', folderCompositionKind: 'semantic-qualified-structural-container', semanticQualifier: 'naming', structuralRoleToken: 'src', compositionQualification: 'explicit-supported-folder-composition', compositionConfidence: 'bounded' },
    { addressPath: 'A.2.2.1', path: 'calculogic-validator/tree/naming-src', occurrenceType: 'folder', semanticName: 'naming', semanticFamily: 'naming', familyRoot: 'naming', semanticEvidenceKind: 'folder-semantic-structural-composition', folderCompositionKind: 'semantic-qualified-structural-container', semanticQualifier: 'naming', structuralRoleToken: 'src', compositionQualification: 'explicit-supported-folder-composition', compositionConfidence: 'bounded' },
    { addressPath: 'A.2.3.1', path: 'calculogic-validator/naming-without-context/naming-src', occurrenceType: 'folder', semanticName: 'naming', semanticFamily: 'naming', familyRoot: 'naming', semanticEvidenceKind: 'folder-semantic-structural-composition', folderCompositionKind: 'semantic-qualified-structural-container', semanticQualifier: 'naming', structuralRoleToken: 'src', compositionQualification: 'explicit-supported-folder-composition', compositionConfidence: 'bounded' },
    { addressPath: 'A.2.1.2', path: 'calculogic-validator/naming/naming-src.logic.mjs', occurrenceType: 'file', semanticName: 'naming', semanticFamily: 'naming', familyRoot: 'naming', semanticEvidenceKind: 'folder-semantic-structural-composition', folderCompositionKind: 'semantic-qualified-structural-container', semanticQualifier: 'naming', structuralRoleToken: 'src' },
  ];
  const treeStructuralHomeEvidence = prepareTreeStructuralHomeEvidence({ addressedOccurrenceRecords, structuralHomesRegistry: getBuiltinStructuralHomesRegistry() });
  const relationshipEvidence = prepareTreeSemanticNamingFolderTypeRelationshipEvidence({
    addressedOccurrenceRecords,
    namingSemanticEvidenceRecords,
    treeStructuralHomeEvidence,
    treeRepoShapePolicy: { allowedTopLevelDirectories: ['calculogic-doc-engine', 'calculogic-validator', 'src'] },
    relationshipsRegistry: getBuiltinSemanticNamingFolderTypeRelationshipsRegistry(),
    structuralRoleTokensRegistry: { structuralRoleTokens: [{ token: 'src', status: 'active', structuralRole: 'implementation-container', relationshipPerspective: 'semantic-qualified-structural-container' }] },
  });

  const byPath = Object.fromEntries(relationshipEvidence.relationshipRecords.map((record) => [record.path, record]));
  assert.equal(byPath['calculogic-validator/naming/naming-src'].relationshipPerspective, 'semantic-qualified-structural-container');
  assert.equal(byPath['calculogic-validator/naming/naming-src'].relationshipInterpretation, 'semantic-qualified-structural-container-aligned');
  assert.equal(byPath['calculogic-validator/naming/naming-src'].semanticContextEvidenceAddressPath, 'A.2.1');
  assert.equal(byPath['calculogic-validator/naming/naming-src'].structuralRole, 'implementation-container');
  assert.equal(byPath['calculogic-validator/tree/naming-src'].relationshipInterpretation, 'semantic-qualified-structural-container-semantic-context-mismatch');
  assert.equal(byPath['calculogic-validator/tree/naming-src'].establishedSemanticContext, 'tree');
  assert.equal(byPath['calculogic-validator/tree/naming-src'].semanticContextEvidenceAddressPath, 'A.2.2');
  assert.equal(byPath['calculogic-validator/naming-without-context/naming-src'].relationshipInterpretation, 'semantic-qualified-structural-container-context-unresolved');
  assert.equal(byPath['calculogic-validator/naming-without-context/naming-src'].establishedSemanticContext, null);
  assert.equal(Object.hasOwn(byPath, 'calculogic-validator/naming/naming-src.logic.mjs'), false);
  assert.equal(Object.hasOwn(byPath, 'calculogic-validator/naming/naming-tools'), false);
  assert.equal(treeStructuralHomeEvidence.evidenceRecords.some((record) => record.path === 'calculogic-validator/naming/naming-src'), false);
  assert.equal(treeStructuralHomeEvidence.evidenceRecords.some((record) => record.path === 'src' && record.structuralHome === 'src'), true);
  assert.deepEqual(
    relationshipEvidence.relationshipRecords
      .filter((record) => record.relationshipPerspective === 'semantic-repository-top-family-home')
      .map((record) => record.path)
      .sort(),
    ['calculogic-doc-engine', 'calculogic-validator'],
  );
});
