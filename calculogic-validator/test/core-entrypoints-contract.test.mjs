import test from 'node:test';
import assert from 'node:assert/strict';

import packageJson from '../package.json' with { type: 'json' };
import * as validatorIndex from '../src/index.mjs';
import * as runnerCore from '../src/core/validator-runner.logic.mjs';
import * as registryCore from '../src/core/validator-registry.knowledge.mjs';
import * as scopesCore from '../src/core/validator-scopes.runtime.mjs';
import * as treeHost from '../tree/src/tree-structure-advisor.host.mjs';
import * as namingHost from '../naming/src/naming-validator.host.mjs';

test('package exports subpaths target canonical module ownership paths', () => {
  assert.equal(packageJson.exports['./runner'], './src/core/validator-runner.logic.mjs');
  assert.equal(packageJson.exports['./registry'], './src/core/validator-registry.knowledge.mjs');
  assert.equal(packageJson.exports['./scopes'], './src/core/validator-scopes.runtime.mjs');
  assert.equal(packageJson.exports['./tree'], './tree/src/tree-structure-advisor.host.mjs');
  assert.equal(packageJson.exports['./naming'], './naming/src/naming-validator.host.mjs');
});

test('canonical core modules expose expected runtime contracts', () => {
  assert.equal(typeof runnerCore.runValidatorRunner, 'function');
  assert.equal(typeof registryCore.listRegisteredValidators, 'function');
  assert.equal(typeof scopesCore.getValidatorScopeProfile, 'function');
});

test('canonical slice hosts remain available and wired through the root index surface', () => {
  assert.equal(typeof treeHost.runTreeStructureAdvisor, 'function');
  assert.equal(typeof namingHost.runNamingValidator, 'function');
  assert.equal(typeof validatorIndex.runValidatorRunner, 'function');
  assert.equal(typeof validatorIndex.naming.runNamingValidator, 'function');
  assert.equal(typeof validatorIndex.treeStructureAdvisor.runTreeStructureAdvisor, 'function');
});
