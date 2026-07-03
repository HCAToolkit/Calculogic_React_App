import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveContextualValidatorScopeProfile } from '../src/core/validator-scopes.logic.mjs';

const makeTempRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'validator-scopes-'));

for (const scope of ['repo', 'app', 'docs', 'system']) {
  test(`${scope} remains available in installed consumer context`, () => {
    const target = makeTempRoot();
    const packageRoot = path.join(target, 'node_modules', '@calculogic', 'validator');
    fs.mkdirSync(packageRoot, { recursive: true });
    const result = resolveContextualValidatorScopeProfile(scope, { targetRepositoryRoot: target, packageRoot });
    assert.equal(result.status, 'available');
    assert.ok(result.profile);
  });
}

test('embedded validator scope resolves calculogic-validator subtree only', () => {
  const target = makeTempRoot();
  const packageRoot = path.join(target, 'calculogic-validator');
  fs.mkdirSync(packageRoot);
  const result = resolveContextualValidatorScopeProfile('validator', { targetRepositoryRoot: target, packageRoot });
  assert.equal(result.status, 'available');
  assert.deepEqual(result.profile.includeRoots, ['calculogic-validator']);
});

test('standalone validator scope resolves repository root from context', () => {
  const target = makeTempRoot();
  const result = resolveContextualValidatorScopeProfile('validator', { targetRepositoryRoot: target, packageRoot: target });
  assert.equal(result.status, 'available');
  assert.deepEqual(result.profile.includeRoots, ['.']);
});

test('installed consumer validator scope is unavailable and does not resolve fallback roots', () => {
  const target = makeTempRoot();
  const packageRoot = path.join(target, 'node_modules', '@calculogic', 'validator');
  fs.mkdirSync(packageRoot, { recursive: true });
  const result = resolveContextualValidatorScopeProfile('validator', { targetRepositoryRoot: target, packageRoot });
  assert.equal(result.status, 'unavailable-scope');
  assert.equal(result.profile, null);
  assert.match(result.message, /validator-development-root-unavailable/);
});
