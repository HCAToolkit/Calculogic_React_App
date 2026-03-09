import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_VALIDATOR_SCOPE,
  getValidatorScopeProfile,
} from '../src/core/validator-scopes.runtime.mjs';
import { ROOT_APP_FILES } from '../src/core/validator-root-files.knowledge.mjs';

const SYSTEM_SCOPE = 'system';

const expectedSystemScopeRootFiles = [
  'eslint.config.js',
  'eslint.config.mjs',
  'package-lock.json',
  'package.json',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.js',
  'vite.config.mjs',
  'vite.config.ts',
];

test('system scope compatibility wildcards are fully resolved and never leak literal tokens', () => {
  const systemProfile = getValidatorScopeProfile(SYSTEM_SCOPE);

  assert.ok(systemProfile);
  assert.deepEqual(systemProfile.includeRootFiles, expectedSystemScopeRootFiles);
  assert.equal(systemProfile.includeRootFiles.some((rootFile) => rootFile.includes('*')), false);
});

test('system scope compatibility expansion output is deterministic and sorted', () => {
  const firstSystemScope = getValidatorScopeProfile(SYSTEM_SCOPE);
  const secondSystemScope = getValidatorScopeProfile(SYSTEM_SCOPE);

  assert.ok(firstSystemScope);
  assert.ok(secondSystemScope);
  assert.deepEqual(firstSystemScope.includeRootFiles, secondSystemScope.includeRootFiles);

  const sortedRootFiles = [...firstSystemScope.includeRootFiles].sort((left, right) =>
    left.localeCompare(right),
  );
  assert.deepEqual(firstSystemScope.includeRootFiles, sortedRootFiles);
});

test('system scope compatibility expansion remains bounded to ROOT_APP_FILES', () => {
  const systemProfile = getValidatorScopeProfile(SYSTEM_SCOPE);

  assert.ok(systemProfile);
  assert.equal(systemProfile.includeRootFiles.every((rootFile) => ROOT_APP_FILES.has(rootFile)), true);
});

test('default scope fallback behavior remains unchanged', () => {
  const implicitDefaultProfile = getValidatorScopeProfile(undefined);
  const explicitDefaultProfile = getValidatorScopeProfile(DEFAULT_VALIDATOR_SCOPE);

  assert.ok(implicitDefaultProfile);
  assert.ok(explicitDefaultProfile);
  assert.deepEqual(implicitDefaultProfile, explicitDefaultProfile);
});
