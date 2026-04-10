import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  collectNamingSemanticFamilyBridgeFindings,
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
    ['TREE_FAMILY_SCATTERED', 'TREE_OBSERVED_FAMILY_CLUSTER'],
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
