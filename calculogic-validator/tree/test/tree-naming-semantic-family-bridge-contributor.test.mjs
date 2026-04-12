import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
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

  assert.equal(placement.structuralHome, 'calculogic-validator/tree');
  assert.equal(placement.semanticContainerIdentity, 'calculogic-validator/tree');
  assert.equal(placement.semanticHome, 'calculogic-validator/tree');
  assert.equal(placement.localStructuralHome, 'src');
  assert.equal(placement.localPlacementCoherence, 'aligned-local-home');
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
  assert.equal(placement.semanticSubhome, 'calculogic-validator/naming/src/lane');
  assert.equal(placement.localPlacementCoherence, 'divergent-local-placement');
  assert.equal(
    placement.localPlacementCoherenceDetails.reason,
    'semantic-subhome-signals-lower-local-placement',
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

  const sharedRootFindingCodes = findings
    .filter((finding) => finding.code === 'TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES')
    .map((finding) => finding.code);

  assert.deepEqual(sharedRootFindingCodes, ['TREE_SHARED_FAMILY_SCATTERED_ACROSS_LANES']);
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
        path: 'calculogic-validator/tree/test/tree-family.test.mjs',
        semanticName: 'tree-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-family',
      },
    ],
  });

  assert.equal(findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
});

test('tree naming bridge contributor evaluates lower-level density in one semantic container before broad scatter', () => {
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
  assert.equal(findings.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'), true);
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
});


test('tree naming bridge contributor emits one cluster finding for dense family in one semantic container', () => {
  const findings = collectNamingSemanticFamilyBridgeFindings({
    observations: [
      {
        path: 'calculogic-validator/tree/src/cluster/tree-observed-family.logic.mjs',
        semanticName: 'tree-observed-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-observed-family',
      },
      {
        path: 'calculogic-validator/tree/src/cluster/tree-observed-family.results.mjs',
        semanticName: 'tree-observed-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-observed-family',
      },
      {
        path: 'calculogic-validator/tree/src/cluster/tree-observed-family.knowledge.mjs',
        semanticName: 'tree-observed-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-observed-family',
      },
      {
        path: 'calculogic-validator/tree/test/tree-observed-family.test.mjs',
        semanticName: 'tree-observed-family',
        familyRoot: 'tree',
        semanticFamily: 'tree-observed-family',
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
  assert.equal(clusterFindings.length, 2);
  assert.deepEqual(
    clusterFindings.map((finding) => finding.details.semanticContainerIdentity),
    ['calculogic-validator/naming/tree-multi-container', 'calculogic-validator/tree'],
  );
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

test('tree naming bridge contributor emits deterministic cluster count and ordering for same input', () => {
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
  assert.equal(first.length, 2);
  assert.deepEqual(first.map((entry) => entry.container), ['calculogic-validator/naming/tree-ordering-family', 'calculogic-validator/tree']);
});
