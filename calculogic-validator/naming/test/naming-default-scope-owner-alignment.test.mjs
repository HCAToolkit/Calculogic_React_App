import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULT_VALIDATOR_SCOPE, getValidatorScopeProfile } from '../../src/core/validator-scopes.runtime.mjs';
import { parseNamingCliArguments } from '../src/cli/naming-cli-args.logic.mjs';
import { prepareNamingValidatorInputs } from '../src/naming-validator.wiring.mjs';

test('suite-owned default scope remains repo', () => {
  assert.equal(DEFAULT_VALIDATOR_SCOPE, 'repo');
  assert.ok(getValidatorScopeProfile(undefined));
  assert.deepEqual(
    getValidatorScopeProfile(undefined),
    getValidatorScopeProfile(DEFAULT_VALIDATOR_SCOPE),
  );
});

test('naming CLI parser defaults to suite-owned default scope', () => {
  const parsed = parseNamingCliArguments([]);
  assert.equal(parsed.selectedScope, DEFAULT_VALIDATOR_SCOPE);
});

test('naming runtime wiring defaults to suite-owned default scope', () => {
  const inputs = prepareNamingValidatorInputs(process.cwd());
  assert.equal(inputs.scope, DEFAULT_VALIDATOR_SCOPE);
});

test('naming CLI and runtime paths do not hardcode repo fallback', () => {
  const cliSource = fs.readFileSync(
    'calculogic-validator/naming/src/cli/naming-cli-args.logic.mjs',
    'utf8',
  );
  const wiringSource = fs.readFileSync(
    'calculogic-validator/naming/src/naming-validator.wiring.mjs',
    'utf8',
  );

  assert.match(cliSource, /DEFAULT_VALIDATOR_SCOPE/u);
  assert.match(wiringSource, /DEFAULT_VALIDATOR_SCOPE/u);
  assert.equal(cliSource.includes("'repo'"), false);
  assert.equal(wiringSource.includes("?? 'repo'"), false);
});
