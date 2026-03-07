import test from 'node:test';
import assert from 'node:assert/strict';

import * as canonicalRunner from '../src/core/validator-runner.logic.mjs';
import * as legacyRunnerShim from '../src/validator-runner.logic.mjs';
import * as canonicalRegistry from '../src/core/validator-registry.knowledge.mjs';
import * as legacyRegistryShim from '../src/validator-registry.knowledge.mjs';
import * as canonicalScopes from '../src/core/validator-scopes.runtime.mjs';
import * as legacyScopesShim from '../src/validator-scopes.runtime.mjs';
import * as canonicalTreeHost from '../tree/src/tree-structure-advisor.host.mjs';
import * as legacyTreeHostShim from '../src/tree-structure-advisor.host.mjs';
import * as canonicalTreeLogic from '../tree/src/tree-structure-advisor.logic.mjs';
import * as legacyTreeLogicShim from '../src/tree-structure-advisor.logic.mjs';

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

test('tree advisor host module and legacy shim expose the same runtime API', () => {
  assert.equal(typeof canonicalTreeHost.runTreeStructureAdvisor, 'function');
  assert.equal(typeof legacyTreeHostShim.runTreeStructureAdvisor, 'function');
  assert.equal(
    legacyTreeHostShim.runTreeStructureAdvisor,
    canonicalTreeHost.runTreeStructureAdvisor,
  );
});

test('tree advisor logic module and legacy shim expose the same runtime API', () => {
  assert.equal(typeof canonicalTreeLogic.runTreeStructureAdvisor, 'function');
  assert.equal(typeof legacyTreeLogicShim.runTreeStructureAdvisor, 'function');
  assert.equal(
    legacyTreeLogicShim.runTreeStructureAdvisor,
    canonicalTreeLogic.runTreeStructureAdvisor,
  );
});
