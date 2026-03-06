import test from 'node:test';
import assert from 'node:assert/strict';

import * as canonicalRunner from '../src/core/validator-runner.logic.mjs';
import * as legacyRunnerShim from '../src/validator-runner.logic.mjs';
import * as canonicalRegistry from '../src/core/validator-registry.knowledge.mjs';
import * as legacyRegistryShim from '../src/validator-registry.knowledge.mjs';
import * as canonicalScopes from '../src/core/validator-scopes.runtime.mjs';
import * as legacyScopesShim from '../src/validator-scopes.runtime.mjs';

test('validator runner core module and legacy shim expose the same runtime API', () => {
  assert.equal(typeof canonicalRunner.runValidatorRunner, 'function');
  assert.equal(typeof legacyRunnerShim.runValidatorRunner, 'function');
  assert.equal(legacyRunnerShim.runValidatorRunner, canonicalRunner.runValidatorRunner);
});

test('validator registry core module and legacy shim expose the same runtime API', () => {
  assert.equal(typeof canonicalRegistry.listRegisteredValidators, 'function');
  assert.equal(typeof legacyRegistryShim.listRegisteredValidators, 'function');
  assert.equal(
    legacyRegistryShim.listRegisteredValidators,
    canonicalRegistry.listRegisteredValidators,
  );
});

test('validator scopes core module and legacy shim expose the same runtime API', () => {
  assert.equal(typeof canonicalScopes.getValidatorScopeProfile, 'function');
  assert.equal(typeof legacyScopesShim.getValidatorScopeProfile, 'function');
  assert.equal(
    legacyScopesShim.getValidatorScopeProfile,
    canonicalScopes.getValidatorScopeProfile,
  );
});
