import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classifyNamingBridgeFolderKinds,
  collectNamingSemanticFamilyBridgeFindings,
  toNamingBridgePlacementRecord,
} from '../src/contributors/tree-naming-semantic-family-bridge-contributor.logic.mjs';
import { runTreeStructureAdvisor } from '../src/tree-structure-advisor.logic.mjs';

const createPreparedTreeCoreInputs = (findingContributors = []) => ({
  selectedPaths: [],
  topLevelDirectoryNames: [],
  targets: [],
  findingContributors,
});

test('tree naming bridge contributor consumes naming-owned semantic-family evidence', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/shared/build/build-surface.logic.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/features/build/build-surface.results.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/features/build/build-surface.knowledge.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/features/build/build-surface.build.tsx',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
    ],
  });

  assert.deepEqual(
    findings.map((finding) => finding.code).sort((left, right) => left.localeCompare(right)),
    ['TREE_FAMILY_SCATTERED'],
  );
});

test('tree naming bridge contributor does not derive semantic-family when naming-owned fields are absent', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/features/odd/file.logic.ts',
        semanticName: 'would-need-local-derivation',
        familyRoot: 'would',
      },
    ],
  });

  assert.deepEqual(findings, []);
});

test('tree naming bridge placement model resolves structural home and semantic container separately', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'calculogic-validator/tree/src/contributors/tree-occurrence.logic.mjs',
    semanticName: 'tree-occurrence',
    familyRoot: 'tree',
    semanticFamily: 'tree-occurrence',
  });

  assert.equal(placement.structuralHome, 'calculogic-validator/src');
  assert.deepEqual(placement.structuralSurfaceChain, ['calculogic-validator', 'src']);
  assert.equal(placement.semanticContainerIdentity, 'calculogic-validator/tree');
  assert.equal(placement.semanticHome, 'calculogic-validator/tree');
  assert.equal(placement.localStructuralHome, 'contributors');
  assert.equal(placement.localPlacementCoherence, 'divergent-local-placement');
  assert.equal(placement.localPlacementCoherenceDetails.reason, 'semantic-home-diverges-from-structural-home');
});

test('tree naming bridge placement model derives semantic placement from naming-owned signals and path alignment', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'tools/report-capture/runtime/report-capture.logic.mjs',
    semanticName: 'report-capture',
    familyRoot: 'report',
    semanticFamily: 'report-capture',
  });

  assert.equal(placement.semanticContainerIdentity, 'tools/report-capture');
  assert.equal(placement.semanticHome, 'tools/report-capture');
  assert.equal(placement.semanticAlignmentDetails.alignments.familyRoot.signal, 'report');
  assert.equal(placement.semanticAlignmentDetails.alignments.semanticFamily.signal, 'report-capture');
  assert.equal(placement.semanticAlignmentDetails.folderDerivedAlignments.familyRoot.pathPrefix, 'tools/report-capture');
  assert.equal(placement.semanticAlignmentDetails.inferredFromPathStructure, true);
});

test('tree naming bridge placement model classifies divergent local placement when semantic home differs from structural home', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'src/features/report-capture/runtime/report-capture.logic.ts',
    semanticName: 'report-capture',
    familyRoot: 'report',
    semanticFamily: 'report-capture',
  });

  assert.equal(placement.structuralHome, 'src/features');
  assert.equal(placement.semanticHome, 'src/features/report-capture');
  assert.equal(placement.localPlacementCoherence, 'divergent-local-placement');
  assert.equal(placement.localPlacementCoherenceDetails.reason, 'semantic-home-diverges-from-structural-home');
});

test('tree naming bridge placement model can represent semantic subhome from family subgroup signals', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'calculogic-validator/naming/src/lane/naming-lane.logic.mjs',
    semanticName: 'naming-lane',
    familyRoot: 'naming',
    semanticFamily: 'naming-lane',
    familySubgroup: 'lane',
  });

  assert.equal(placement.semanticContainerIdentity, 'calculogic-validator/naming');
  assert.equal(placement.semanticRoot, 'calculogic-validator/naming');
  assert.equal(placement.semanticSubhome, 'calculogic-validator/naming/src/lane');
  assert.equal(placement.localPlacementCoherence, 'divergent-local-placement');
  assert.equal(
    placement.localPlacementCoherenceDetails.reason,
    'semantic-home-diverges-from-structural-home',
  );
});

test('tree naming bridge placement model keeps structural and semantic placement distinct when they differ', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'src/features/tree/validator-cli.logic.ts',
    semanticName: 'validator-cli',
    familyRoot: 'validator',
    semanticFamily: 'validator-cli',
    familySubgroup: 'cli',
  });

  assert.equal(placement.structuralHome, 'src/features');
  assert.equal(placement.semanticContainerIdentity, null);
  assert.equal(placement.structuralHome === placement.semanticContainerIdentity, false);
  assert.equal(placement.localPlacementCoherence, 'structural-home-only');
  assert.equal(placement.semanticAlignmentDetails.alignments.semanticFamily.segment, 'validator-cli.logic.ts');
  assert.equal(placement.semanticAlignmentDetails.folderDerivedAlignments.semanticFamily, null);
});

test('tree naming bridge placement model does not elevate filename-only semantic hits into semantic container/home', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'src/features/tree/validator-cli.logic.ts',
    semanticName: 'validator-cli',
    familyRoot: 'validator',
    semanticFamily: 'validator-cli',
  });

  assert.equal(placement.semanticContainerIdentity, null);
  assert.equal(placement.semanticHome, null);
  assert.equal(placement.localPlacementCoherence, 'structural-home-only');
  assert.equal(
    placement.localPlacementCoherenceDetails.reason,
    'semantic-hits-without-folder-derived-semantic-home',
  );
  assert.equal(placement.semanticAlignmentDetails.alignments.familyRoot.segment, 'validator-cli.logic.ts');
  assert.equal(placement.semanticAlignmentDetails.alignments.semanticFamily.segment, 'validator-cli.logic.ts');
  assert.equal(placement.semanticAlignmentHits.some((hit) => hit.segment === 'validator-cli.logic.ts'), true);
});

test('tree naming bridge placement model classifies no semantic home when no semantic token alignment is present', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'src/features/tree/unrelated.logic.ts',
    semanticName: 'validator-cli',
    familyRoot: 'validator',
    semanticFamily: 'validator-cli',
  });

  assert.equal(placement.semanticContainerIdentity, null);
  assert.equal(placement.semanticHome, null);
  assert.equal(placement.semanticAlignmentHits.length, 0);
  assert.equal(placement.localPlacementCoherence, 'no-semantic-home');
});

test('tree naming bridge placement model stays deterministic for identical inputs', () => {
  const observation = {
    path: 'calculogic-validator/naming/src/lanes/naming-lane.logic.mjs',
    semanticName: 'naming-lane',
    familyRoot: 'naming',
    semanticFamily: 'naming-lane',
    familySubgroup: 'lane',
  };

  const first = toNamingBridgePlacementRecord(observation);
  const second = toNamingBridgePlacementRecord(observation);
  assert.deepEqual(first, second);
});

test('tree naming bridge folder-kind interpretation classifies structural semantic and unspecified folders deterministically', () => {
  const observation = {
    path: 'calculogic-validator/tree/src/contributors/registry/tree-structure-advisor.logic.mjs',
    semanticName: 'tree-structure-advisor',
    familyRoot: 'tree',
    semanticFamily: 'tree-structure-advisor',
    familySubgroup: 'registry',
  };

  const first = classifyNamingBridgeFolderKinds(observation);
  const second = classifyNamingBridgeFolderKinds(observation);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.folderKinds.map(({ segment, folderKind }) => ({ segment, folderKind })),
    [
      { segment: 'calculogic-validator', folderKind: 'structural-folder' },
      { segment: 'tree', folderKind: 'semantic-folder' },
      { segment: 'src', folderKind: 'structural-folder' },
      { segment: 'contributors', folderKind: 'unspecified-folder' },
      { segment: 'registry', folderKind: 'semantic-folder' },
    ],
  );
});

test('tree naming bridge placement model keeps semantic roots out of structural-home derivation by position', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'calculogic-validator/naming/src/registry/naming-registry.logic.mjs',
    semanticName: 'naming-registry',
    familyRoot: 'naming',
    semanticFamily: 'naming-registry',
    familySubgroup: 'registry',
  });

  assert.equal(placement.structuralHome, 'calculogic-validator/src');
  assert.equal(placement.semanticRoot, 'calculogic-validator/naming');
  assert.equal(placement.semanticHome, 'calculogic-validator/naming');
  assert.equal(placement.semanticSubhome, 'calculogic-validator/naming/src/registry');
});

test('tree naming bridge placement model represents family-root and semantic-family as root plus lower semantic grouping', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'calculogic-validator/tree/src/tree-structure-advisor/report-capture.logic.mjs',
    semanticName: 'report-capture',
    familyRoot: 'tree',
    semanticFamily: 'tree-structure-advisor',
  });

  assert.equal(placement.semanticRoot, 'calculogic-validator/tree');
  assert.equal(placement.semanticHome, 'calculogic-validator/tree/src/tree-structure-advisor');
  assert.equal(placement.semanticContainerIdentity, 'calculogic-validator/tree');
  assert.equal(placement.semanticHome === placement.semanticRoot, false);
});

test('tree naming bridge placement model keeps unresolved segments visible in placement record', () => {
  const placement = toNamingBridgePlacementRecord({
    path: 'tools/validator-config/runtime/registry/validator-config.logic.mjs',
    semanticName: 'validator-config',
    familyRoot: 'validator',
    semanticFamily: 'validator-config',
    familySubgroup: 'registry',
  });

  assert.deepEqual(placement.unresolvedFolderContext, ['runtime']);
  assert.equal(
    placement.folderKindBreakdown.some((entry) => entry.folderKind === 'unspecified-folder' && entry.segment === 'runtime'),
    true,
  );
});

test('tree naming bridge contributor does not emit naming validity judgments', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/a/build-surface.logic.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/b/build-surface.results.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/c/build-surface.knowledge.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code.startsWith('NAMING_')), false);
});

test('tree runtime keeps naming bridge contributor output deterministic for identical prepared inputs', () => {
  const namingBridgePayload = {
    observations: [
      {
        path: 'src/a/build-surface.logic.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/c/build-surface.knowledge.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
      {
        path: 'src/b/build-surface.results.ts',
        semanticName: 'build-surface',
        familyRoot: 'build',
        semanticFamily: 'build-surface',
      },
    ],
  };

  const namingBridgeContributor = () => collectNamingSemanticFamilyBridgeFindings(namingBridgePayload);
  const preparedInputs = createPreparedTreeCoreInputs([namingBridgeContributor]);

  const first = runTreeStructureAdvisor(preparedInputs);
  const second = runTreeStructureAdvisor(preparedInputs);

  assert.deepEqual(first.findings, second.findings);
  assert.equal(first.findings.length, 1);
  assert.equal(first.findings[0].code, 'TREE_FAMILY_SCATTERED');
});

test('tree naming bridge contributor excludes ambiguity-flagged observations from stronger family advisories', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/a/alpha-beta-gamma-delta.logic.ts',
        semanticName: 'alpha-beta-gamma-delta',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-beta',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'src/b/alpha-beta-gamma-delta.results.ts',
        semanticName: 'alpha-beta-gamma-delta',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-beta',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'src/c/alpha-beta-gamma-delta.knowledge.ts',
        semanticName: 'alpha-beta-gamma-delta',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-beta',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'src/d/alpha-beta-gamma-delta.build.tsx',
        semanticName: 'alpha-beta-gamma-delta',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-beta',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
    ],
  });

  assert.deepEqual(findings, []);
});

test('tree naming bridge contributor emits bounded shared-root lane scatter advisory only in supported shared root context', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/shared/logic/shared-family.logic.ts',
        semanticName: 'shared-family',
        familyRoot: 'shared',
        semanticFamily: 'shared-family',
      },
      {
        path: 'src/shared/knowledge/shared-family.knowledge.ts',
        semanticName: 'shared-family',
        familyRoot: 'shared',
        semanticFamily: 'shared-family',
      },
      {
        path: 'src/shared/results/shared-family.results.ts',
        semanticName: 'shared-family',
        familyRoot: 'shared',
        semanticFamily: 'shared-family',
      },
      {
        path: 'src/features/logic/shared-family.logic.ts',
        semanticName: 'shared-family',
        familyRoot: 'shared',
        semanticFamily: 'shared-family',
      },
    ],
  });

  const sharedRootFindings = findings.filter((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES');

  assert.equal(sharedRootFindings.length, 1);
  assert.equal(sharedRootFindings[0].details.localFirstInterpretation.classification, 'local-divergence-needs-broader-review');
  assert.equal(sharedRootFindings[0].details.broaderSpreadInterpretation.classification, 'unresolved-broader-spread');
  assert.equal(sharedRootFindings[0].details.familySharedSpineRouting.model, 'shared-local-first-family-interpretation');
  assert.equal(
    sharedRootFindings[0].details.sharedRootLaneInterpretation.classification,
    'select-shared-root-lane-spread',
  );
  assert.equal(sharedRootFindings[0].details.sharedRootLaneInterpretation.details.thresholdQualified, true);
});

test('tree naming bridge contributor does not emit shared-root lane scatter advisory when family evidence is outside supported shared root', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/features/logic/feature-family.logic.ts',
        semanticName: 'feature-family',
        familyRoot: 'feature',
        semanticFamily: 'feature-family',
      },
      {
        path: 'src/features/knowledge/feature-family.knowledge.ts',
        semanticName: 'feature-family',
        familyRoot: 'feature',
        semanticFamily: 'feature-family',
      },
      {
        path: 'src/features/results/feature-family.results.ts',
        semanticName: 'feature-family',
        familyRoot: 'feature',
        semanticFamily: 'feature-family',
      },
    ],
  });

  assert.equal(
    findings.some((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES'),
    false,
  );
});

test('tree naming bridge contributor keeps shared-root advisory deterministic for ordering and counts', () => {
  const payload = {
    observations: [
      {
        path: 'src/shared/results/alpha-family.results.ts',
        semanticName: 'alpha-family',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-family',
      },
      {
        path: 'src/shared/logic/alpha-family.logic.ts',
        semanticName: 'alpha-family',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-family',
      },
      {
        path: 'src/shared/knowledge/alpha-family.knowledge.ts',
        semanticName: 'alpha-family',
        familyRoot: 'alpha',
        semanticFamily: 'alpha-family',
      },
    ],
  };

  const first = collectNamingSemanticFamilyBridgeFindings(payload);
  const second = collectNamingSemanticFamilyBridgeFindings(payload);
  const firstSharedRootFindings = first.filter((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES');
  const secondSharedRootFindings = second.filter((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES');

  assert.deepEqual(firstSharedRootFindings, secondSharedRootFindings);
  assert.equal(firstSharedRootFindings.length, 1);
  assert.equal(
    firstSharedRootFindings[0].details.familySharedSpineRouting.sharedRootOutcome,
    'select-shared-root-lane-spread',
  );
});

test('tree naming bridge contributor keeps non-shared families on shared family spine without emitting shared-root lane spread', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/logic/tree-spine.logic.mjs',
        semanticName: 'tree-spine',
        familyRoot: 'tree',
        semanticFamily: 'tree-spine',
      },
      {
        path: 'calculogic-validator/tree/src/results/tree-spine.results.mjs',
        semanticName: 'tree-spine',
        familyRoot: 'tree',
        semanticFamily: 'tree-spine',
      },
      {
        path: 'calculogic-validator/tree/test/tree-spine.test.mjs',
        semanticName: 'tree-spine',
        familyRoot: 'tree',
        semanticFamily: 'tree-spine',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor does not emit shared-root lane spread when thresholds match but shared spine resolves local expected presence', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/shared/logic/shared-local.logic.ts',
        semanticName: 'shared-local',
        familyRoot: 'shared',
        semanticFamily: 'shared-local',
      },
      {
        path: 'src/shared/knowledge/shared-local.knowledge.ts',
        semanticName: 'shared-local',
        familyRoot: 'shared',
        semanticFamily: 'shared-local',
      },
      {
        path: 'src/shared/results/shared-local.results.ts',
        semanticName: 'shared-local',
        familyRoot: 'shared',
        semanticFamily: 'shared-local',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES'), false);
});

test('tree naming bridge contributor treats one naming-aligned semantic container as expected presence, not broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/contributors/tree-family.logic.mjs',
        semanticName: 'tree-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-family',
      },
      {
        path: 'calculogic-validator/tree/src/tree-family.results.mjs',
        semanticName: 'tree-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-family',
      },
      {
        path: 'calculogic-validator/tree/src/tests/tree-family.test.mjs',
        semanticName: 'tree-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-family',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), false);
});

test('tree naming bridge contributor treats local-subgroup-first as the primary local signal before broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/naming/src/lanes/naming-lane.logic.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/src/families/naming-lane.results.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/test/naming-lane.test.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/src/naming-lane.knowledge.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), true);
});

test('tree naming bridge contributor suppresses broad scatter for bounded allowed cross-container pairing', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-model.spec.md',
        semanticName: 'tree-model',
        familyRoot: 'tree',
        semanticFamily: 'tree-model',
      },
      {
        path: 'calculogic-validator/tree/src/tree-model.logic.mjs',
        semanticName: 'tree-model',
        familyRoot: 'tree',
        semanticFamily: 'tree-model',
      },
      {
        path: 'calculogic-validator/tree/test/tree-model.test.mjs',
        semanticName: 'tree-model',
        familyRoot: 'tree',
        semanticFamily: 'tree-model',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor applies broader-spread review and keeps explainable src/test spread out of final scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/validator-cli/core/validator-cli.logic.ts',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'src/validator-cli/runtime/validator-cli.results.ts',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'test/validator-cli/validator-cli.test.ts',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor treats canonical docs/runtime pairings as broader explainable spread before scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-router.spec.md',
        semanticName: 'tree-router',
        familyRoot: 'tree',
        semanticFamily: 'tree-router',
      },
      {
        path: 'calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-router.audit.md',
        semanticName: 'tree-router',
        familyRoot: 'tree',
        semanticFamily: 'tree-router',
      },
      {
        path: 'calculogic-validator/tree/src/tree-router.logic.mjs',
        semanticName: 'tree-router',
        familyRoot: 'tree',
        semanticFamily: 'tree-router',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor keeps cross-concern but explainable spread out of final scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/tree-occurrence/tree-occurrence.logic.mjs',
        semanticName: 'tree-occurrence',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
      },
      {
        path: 'calculogic-validator/tree/test/tree-occurrence/tree-occurrence.test.mjs',
        semanticName: 'tree-occurrence',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
      },
      {
        path: 'calculogic-validator/tree/validator-cli/tree-occurrence.host.mjs',
        semanticName: 'tree-occurrence',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor still emits broad scatter for unrelated cross-container spread', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/features/validator/validator-summary.logic.ts',
        semanticName: 'validator-summary',
        familyRoot: 'validator',
        semanticFamily: 'validator-summary',
      },
      {
        path: 'tools/validator/validator-summary.wiring.mjs',
        semanticName: 'validator-summary',
        familyRoot: 'validator',
        semanticFamily: 'validator-summary',
      },
      {
        path: 'doc/validator/validator-summary.spec.md',
        semanticName: 'validator-summary',
        familyRoot: 'validator',
        semanticFamily: 'validator-summary',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), true);
  const scatterFinding = findings.find((finding) => finding.code === 'TREE_FAMILY_SCATTERED');
  assert.equal(scatterFinding.details.broaderSpreadInterpretation.classification, 'unresolved-broader-spread');
});

test('tree naming bridge contributor keeps locally aligned family observations in local-first lanes before broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/placements/tree-placement.logic.mjs',
        semanticName: 'tree-placement',
        familyRoot: 'tree',
        semanticFamily: 'tree-placement',
      },
      {
        path: 'calculogic-validator/tree/src/placements/tree-placement.results.mjs',
        semanticName: 'tree-placement',
        familyRoot: 'tree',
        semanticFamily: 'tree-placement',
      },
      {
        path: 'calculogic-validator/tree/src/placements/tree-placement.knowledge.mjs',
        semanticName: 'tree-placement',
        familyRoot: 'tree',
        semanticFamily: 'tree-placement',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor keeps local-density-first families out of broad scatter and retains deterministic finding behavior', () => {
  const payload = {
    observations: [
      {
        path: 'calculogic-validator/tree/src/local-density/density-pack.logic.mjs',
        semanticName: 'density-pack',
        familyRoot: 'tree',
        semanticFamily: 'density-pack',
      },
      {
        path: 'calculogic-validator/tree/src/local-density/density-pack.results.mjs',
        semanticName: 'density-pack',
        familyRoot: 'tree',
        semanticFamily: 'density-pack',
      },
      {
        path: 'calculogic-validator/tree/test/local-density/density-pack.test.mjs',
        semanticName: 'density-pack',
        familyRoot: 'tree',
        semanticFamily: 'density-pack',
      },
      {
        path: 'calculogic-validator/tree/src/local-density/density-pack.knowledge.mjs',
        semanticName: 'density-pack',
        familyRoot: 'tree',
        semanticFamily: 'density-pack',
      },
    ],
  };

  const first = collectNamingSemanticFamilyBridgeFindings(payload);
  const second = collectNamingSemanticFamilyBridgeFindings(payload);
  assert.deepEqual(first, second);
  assert.equal(first.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
  assert.equal(first.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'), true);
  assert.equal(first.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), false);
});

test('tree naming bridge contributor keeps local-subgroup-first families out of broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/naming/src/lane/naming-lane.logic.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/src/family/naming-lane.results.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/test/lane/naming-lane.test.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
      {
        path: 'calculogic-validator/naming/src/naming-lane.knowledge.mjs',
        semanticName: 'naming-lane',
        familyRoot: 'naming',
        semanticFamily: 'naming-lane',
        familySubgroup: 'lane',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), true);
});

test('tree naming bridge contributor keeps divergent local placement eligible for broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/features/report-capture/runtime/report-capture.logic.ts',
        semanticName: 'report-capture',
        familyRoot: 'report',
        semanticFamily: 'report-capture',
      },
      {
        path: 'tools/report-capture/runtime/report-capture.results.mjs',
        semanticName: 'report-capture',
        familyRoot: 'report',
        semanticFamily: 'report-capture',
      },
      {
        path: 'doc/report-capture/report-capture.spec.md',
        semanticName: 'report-capture',
        familyRoot: 'report',
        semanticFamily: 'report-capture',
      },
    ],
  });
  const scatterFinding = findings.find((finding) => finding.code === 'TREE_FAMILY_SCATTERED');
  assert.equal(Boolean(scatterFinding), true);
  assert.equal(
    scatterFinding.details.localFirstInterpretation.classification,
    'local-divergence-needs-broader-review',
  );
});

test('tree naming bridge contributor keeps no-local-semantic-explanation families eligible for broad scatter', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'src/alpha/unrelated.logic.ts',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'tools/beta/unrelated.results.mjs',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'doc/gamma/unrelated.spec.md',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
    ],
  });
  const scatterFinding = findings.find((finding) => finding.code === 'TREE_FAMILY_SCATTERED');
  assert.equal(Boolean(scatterFinding), true);
  assert.equal(
    scatterFinding.details.localFirstInterpretation.classification,
    'no-local-semantic-explanation',
  );
  assert.equal(scatterFinding.details.broaderSpreadInterpretation.classification, 'unresolved-broader-spread');
});

test('tree naming bridge contributor keeps broader-spread interpretation deterministic for identical unresolved inputs', () => {
  const payload = {
    observations: [
      {
        path: 'src/alpha/unrelated.logic.ts',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'tools/beta/unrelated.results.mjs',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
      {
        path: 'doc/gamma/unrelated.spec.md',
        semanticName: 'validator-cli',
        familyRoot: 'validator',
        semanticFamily: 'validator-cli',
      },
    ],
  };
  const first = collectNamingSemanticFamilyBridgeFindings(payload);
  const second = collectNamingSemanticFamilyBridgeFindings(payload);
  const firstScatter = first.find((finding) => finding.code === 'TREE_FAMILY_SCATTERED');
  const secondScatter = second.find((finding) => finding.code === 'TREE_FAMILY_SCATTERED');

  assert.deepEqual(
    firstScatter.details.broaderSpreadInterpretation,
    secondScatter.details.broaderSpreadInterpretation,
  );
});


test('tree naming bridge contributor emits one cluster finding for local-density-first family in one semantic container', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/cluster/observed-family.logic.mjs',
        semanticName: 'observed-family',
        familyRoot: 'tree',
        semanticFamily: 'observed-family',
      },
      {
        path: 'calculogic-validator/tree/src/cluster/observed-family.results.mjs',
        semanticName: 'observed-family',
        familyRoot: 'tree',
        semanticFamily: 'observed-family',
      },
      {
        path: 'calculogic-validator/tree/src/cluster/observed-family.knowledge.mjs',
        semanticName: 'observed-family',
        familyRoot: 'tree',
        semanticFamily: 'observed-family',
      },
      {
        path: 'calculogic-validator/tree/test/observed-family.test.mjs',
        semanticName: 'observed-family',
        familyRoot: 'tree',
        semanticFamily: 'observed-family',
      },
    ],
  });

  const clusterFindings = findings.filter((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER');
  assert.equal(clusterFindings.length, 1);
  assert.equal(clusterFindings[0].details.aggregationUnit, 'semanticFamily-in-container');
  assert.equal(clusterFindings[0].details.semanticContainerIdentity, 'calculogic-validator/tree');
});

test('tree naming bridge contributor keeps dense family files in one container from inflating cluster count', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/a/tree-density.logic.mjs',
        semanticName: 'tree-density',
        familyRoot: 'tree',
        semanticFamily: 'tree-density',
      },
      {
        path: 'calculogic-validator/tree/src/b/tree-density.results.mjs',
        semanticName: 'tree-density',
        familyRoot: 'tree',
        semanticFamily: 'tree-density',
      },
      {
        path: 'calculogic-validator/tree/src/c/tree-density.knowledge.mjs',
        semanticName: 'tree-density',
        familyRoot: 'tree',
        semanticFamily: 'tree-density',
      },
      {
        path: 'calculogic-validator/tree/src/d/tree-density.wiring.mjs',
        semanticName: 'tree-density',
        familyRoot: 'tree',
        semanticFamily: 'tree-density',
      },
      {
        path: 'calculogic-validator/tree/src/e/tree-density.host.mjs',
        semanticName: 'tree-density',
        familyRoot: 'tree',
        semanticFamily: 'tree-density',
      },
    ],
  });

  assert.equal(findings.filter((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER').length, 1);
});

test('tree naming bridge contributor can emit distinct cluster observations across semantic containers', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/tree-multi-container/src/first/component.logic.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/tree/tree-multi-container/src/first/component.results.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/tree/tree-multi-container/src/first/component.knowledge.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/tree/tree-multi-container/test/component.test.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/naming/tree-multi-container/src/first/component.logic.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/naming/tree-multi-container/src/first/component.results.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/naming/tree-multi-container/src/first/component.knowledge.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
      {
        path: 'calculogic-validator/naming/tree-multi-container/test/component.test.mjs',
        semanticName: 'tree-multi-container',
        familyRoot: 'tree',
        semanticFamily: 'tree-multi-container',
      },
    ],
  });

  const clusterFindings = findings.filter((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER');
  assert.equal(clusterFindings.length, 0);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), true);
});

test('tree naming bridge contributor emits subgroup opportunity for dense lower-level family inside one semantic container', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/tree-occurrence/tree-occurrence-observed.logic.mjs',
        semanticName: 'tree-occurrence-observed',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
      {
        path: 'calculogic-validator/tree/src/tree-shim/tree-occurrence-observed.wiring.mjs',
        semanticName: 'tree-occurrence-observed',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
      {
        path: 'calculogic-validator/tree/test/tree-occurrence/tree-occurrence-observed.test.mjs',
        semanticName: 'tree-occurrence-observed',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
      {
        path: 'calculogic-validator/tree/validator-cli/tree-occurrence-observed.host.mjs',
        semanticName: 'tree-occurrence-observed',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
    ],
  });

  const subgroupFindings = findings.filter((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY');
  assert.equal(subgroupFindings.length, 1);
  assert.equal(subgroupFindings[0].details.semanticContainerIdentity, 'calculogic-validator/tree');
  assert.deepEqual(subgroupFindings[0].details.observedContainerLocalHomes, ['src', 'test', 'validator-cli']);
});

test('tree naming bridge contributor does not emit subgroup opportunity for ordinary family presence below subgroup threshold', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/tree-occurrence/tree-occurrence-lower.logic.mjs',
        semanticName: 'tree-occurrence-lower',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
      {
        path: 'calculogic-validator/tree/test/tree-occurrence/tree-occurrence-lower.test.mjs',
        semanticName: 'tree-occurrence-lower',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
      {
        path: 'calculogic-validator/tree/validator-cli/tree-occurrence-lower.host.mjs',
        semanticName: 'tree-occurrence-lower',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), false);
});

test('tree naming bridge contributor keeps broad cross-container spread as TREE_FAMILY_SCATTERED instead of subgroup opportunity', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/tree-shim/tree-shim-family.logic.mjs',
        semanticName: 'tree-shim-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-shim',
        familySubgroup: 'shim',
      },
      {
        path: 'calculogic-validator/naming/src/naming-lane/tree-shim-family.wiring.mjs',
        semanticName: 'tree-shim-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-shim',
        familySubgroup: 'shim',
      },
      {
        path: 'tools/tree/tree-shim-family.host.mjs',
        semanticName: 'tree-shim-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-shim',
        familySubgroup: 'shim',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), true);
  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), false);
});

test('tree naming bridge contributor does not emit subgroup opportunity from ambiguity-flagged observations', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/tree-occurrence/tree-occurrence-ambiguous.logic.mjs',
        semanticName: 'tree-occurrence-ambiguous',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/src/tree-shim/tree-occurrence-ambiguous.wiring.mjs',
        semanticName: 'tree-occurrence-ambiguous',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/test/tree-occurrence/tree-occurrence-ambiguous.test.mjs',
        semanticName: 'tree-occurrence-ambiguous',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/validator-cli/tree-occurrence-ambiguous.host.mjs',
        semanticName: 'tree-occurrence-ambiguous',
        familyRoot: 'tree',
        semanticFamily: 'tree-occurrence',
        familySubgroup: 'occurrence',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY'), false);
});

test('tree naming bridge contributor emits deterministic subgroup opportunity finding count and ordering for identical inputs', () => {
  const payload = {
    observations: [
      {
        path: 'calculogic-validator/tree/validator-cli/tree-subgroup-deterministic.host.mjs',
        semanticName: 'tree-subgroup-deterministic',
        familyRoot: 'tree',
        semanticFamily: 'tree-subgroup',
        familySubgroup: 'subgroup',
      },
      {
        path: 'calculogic-validator/tree/test/tree-subgroup/tree-subgroup-deterministic.test.mjs',
        semanticName: 'tree-subgroup-deterministic',
        familyRoot: 'tree',
        semanticFamily: 'tree-subgroup',
        familySubgroup: 'subgroup',
      },
      {
        path: 'calculogic-validator/tree/src/tree-shim/tree-subgroup-deterministic.wiring.mjs',
        semanticName: 'tree-subgroup-deterministic',
        familyRoot: 'tree',
        semanticFamily: 'tree-subgroup',
        familySubgroup: 'subgroup',
      },
      {
        path: 'calculogic-validator/tree/src/tree-occurrence/tree-subgroup-deterministic.logic.mjs',
        semanticName: 'tree-subgroup-deterministic',
        familyRoot: 'tree',
        semanticFamily: 'tree-subgroup',
        familySubgroup: 'subgroup',
      },
    ],
  };

  const first = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY')
    .map((finding) => finding.path);
  const second = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_FAMILY_SUBGROUP_OPPORTUNITY')
    .map((finding) => finding.path);

  assert.deepEqual(first, second);
  assert.equal(first.length, 1);
});

test('tree naming bridge contributor keeps ambiguity-only dense families as non-cluster observability', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/a/tree-ambiguous-cluster.logic.mjs',
        semanticName: 'tree-ambiguous-cluster',
        familyRoot: 'tree',
        semanticFamily: 'tree-ambiguous-cluster',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/src/b/tree-ambiguous-cluster.results.mjs',
        semanticName: 'tree-ambiguous-cluster',
        familyRoot: 'tree',
        semanticFamily: 'tree-ambiguous-cluster',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/src/c/tree-ambiguous-cluster.knowledge.mjs',
        semanticName: 'tree-ambiguous-cluster',
        familyRoot: 'tree',
        semanticFamily: 'tree-ambiguous-cluster',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
      {
        path: 'calculogic-validator/tree/src/d/tree-ambiguous-cluster.wiring.mjs',
        semanticName: 'tree-ambiguous-cluster',
        familyRoot: 'tree',
        semanticFamily: 'tree-ambiguous-cluster',
        ambiguityFlags: ['family-boundary-heuristic'],
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'), false);
  assert.equal(findings.some((finding) => finding.severity === 'warn'), false);
});

test('tree naming bridge contributor keeps local-first routing deterministic when dense evidence spans multiple semantic containers', () => {
  const payload = {
    observations: [
      {
        path: 'calculogic-validator/tree/tree-ordering-family/test/component.test.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/tree/tree-ordering-family/src/c/component.knowledge.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/tree/tree-ordering-family/src/b/component.results.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/tree/tree-ordering-family/src/a/component.logic.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/naming/tree-ordering-family/test/component.test.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/naming/tree-ordering-family/src/c/component.knowledge.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/naming/tree-ordering-family/src/b/component.results.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
      {
        path: 'calculogic-validator/naming/tree-ordering-family/src/a/component.logic.mjs',
        semanticName: 'tree-ordering-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-ordering-family',
      },
    ],
  };

  const first = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER')
    .map((finding) => ({ path: finding.path, container: finding.details.semanticContainerIdentity }));
  const second = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER')
    .map((finding) => ({ path: finding.path, container: finding.details.semanticContainerIdentity }));

  assert.deepEqual(first, second);
  assert.equal(first.length, 0);
  const firstScatter = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_FAMILY_SCATTERED')
    .map((finding) => finding.path);
  const secondScatter = collectNamingSemanticFamilyBridgeFindings(payload)
    .filter((finding) => finding.code === 'TREE_FAMILY_SCATTERED')
    .map((finding) => finding.path);
  assert.deepEqual(firstScatter, secondScatter);
  assert.equal(firstScatter.length, 1);
});
