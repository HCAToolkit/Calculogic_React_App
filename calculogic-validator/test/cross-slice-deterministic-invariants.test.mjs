import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  DEFAULT_VALIDATOR_SCOPE,
  getValidatorScopeProfile,
  listValidatorScopes,
} from '../src/core/validator-scopes.runtime.mjs';
import { deriveExitCodeFromFindings } from '../src/core/validator-exit-code.logic.mjs';
import { getBuiltinExitPolicies } from '../src/registries/validator-exit-policy.registry.runtime.mjs';
import {
  collectRepositoryPaths,
  summarizeFindings as summarizeNamingFindings,
} from '../naming/src/naming-validator.host.mjs';
import {
  prepareTreeStructureAdvisorInputs,
  summarizeFindings as summarizeTreeFindings,
} from '../tree/src/tree-structure-advisor.host.mjs';

test('cross-slice invariant: exit policy evaluation remains deterministic first-match', () => {
  assert.deepEqual(
    getBuiltinExitPolicies().map((policy) => policy.id),
    ['warn-findings', 'strict-legacy-exception', 'default-success'],
  );

  assert.equal(
    deriveExitCodeFromFindings([{ severity: 'warn', classification: 'legacy-exception' }], {
      strict: true,
    }),
    2,
  );
});

test('cross-slice invariant: naming and tree summary buckets remain deterministically ordered', () => {
  const namingSummary = summarizeNamingFindings([
    {
      classification: 'invalid-ambiguous',
      code: 'Z_CODE',
      severity: 'warn',
      details: { roleStatus: 'deprecated', roleCategory: 'documentation' },
    },
    {
      classification: 'allowed-special-case',
      code: 'A_CODE',
      severity: 'info',
      details: { specialCaseType: 'ecosystem-required' },
    },
    {
      classification: 'invalid-ambiguous',
      code: 'A_CODE',
      severity: 'warn',
      details: { roleStatus: 'active', roleCategory: 'architecture-support' },
    },
  ]);

  assert.deepEqual(Object.keys(namingSummary.counts), [
    'canonical',
    'allowed-special-case',
    'legacy-exception',
    'invalid-ambiguous',
  ]);
  assert.deepEqual(Object.keys(namingSummary.codeCounts), ['A_CODE', 'Z_CODE']);
  assert.deepEqual(Object.keys(namingSummary.specialCaseTypeCounts), ['ecosystem-required']);
  assert.deepEqual(Object.keys(namingSummary.warningRoleStatusCounts), ['active', 'deprecated']);
  assert.deepEqual(Object.keys(namingSummary.warningRoleCategoryCounts), [
    'architecture-support',
    'documentation',
  ]);

  const treeSummary = summarizeTreeFindings([
    { classification: 'advisory-structure', code: 'TREE_Z_LAST' },
    { classification: 'advisory-structure', code: 'TREE_A_FIRST' },
  ]);

  assert.deepEqual(Object.keys(treeSummary.codeCounts), ['TREE_A_FIRST', 'TREE_Z_LAST']);
});

test('cross-slice invariant: scoped path sets stay sorted and stable across naming/tree surfaces', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-slice-path-order-'));

  try {
    fs.mkdirSync(path.join(tempRoot, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempRoot, 'test'), { recursive: true });

    fs.writeFileSync(path.join(tempRoot, 'src', 'z-last.logic.ts'), '');
    fs.writeFileSync(path.join(tempRoot, 'src', 'a-first.logic.ts'), '');
    fs.writeFileSync(path.join(tempRoot, 'test', 'm-middle.test.mjs'), '');

    const namingPaths = collectRepositoryPaths(tempRoot, { scope: 'app' });
    const treePrepared = prepareTreeStructureAdvisorInputs(tempRoot, { scope: 'app' });

    assert.deepEqual(namingPaths, [...namingPaths].sort((left, right) => left.localeCompare(right)));
    assert.deepEqual(treePrepared.selectedPaths, [
      ...treePrepared.selectedPaths,
    ].sort((left, right) => left.localeCompare(right)));
    assert.deepEqual(treePrepared.selectedPaths, namingPaths);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('cross-slice invariant: scope fallback/default/unknown behavior remains stable', () => {
  const implicitDefaultProfile = getValidatorScopeProfile(undefined);
  const explicitDefaultProfile = getValidatorScopeProfile(DEFAULT_VALIDATOR_SCOPE);

  assert.equal(DEFAULT_VALIDATOR_SCOPE, 'repo');
  assert.ok(implicitDefaultProfile);
  assert.deepEqual(implicitDefaultProfile, explicitDefaultProfile);
  assert.equal(getValidatorScopeProfile('definitely-not-a-real-scope'), null);

  const sortedScopeIds = [...listValidatorScopes()].sort((left, right) => left.localeCompare(right));
  assert.deepEqual(listValidatorScopes(), sortedScopeIds);
});
