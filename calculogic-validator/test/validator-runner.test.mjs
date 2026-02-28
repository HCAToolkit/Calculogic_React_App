import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  listRegisteredValidators,
} from '../src/validator-registry.knowledge.mjs';
import {
  runValidatorRunner,
} from '../src/validator-runner.logic.mjs';

test('registry lists validators deterministically', () => {
  assert.deepEqual(listRegisteredValidators(), ['naming']);
});

test('runner report includes naming validator in deterministic order', () => {
  const report = runValidatorRunner(process.cwd(), { scope: 'app' });

  assert.ok(report.version);
  assert.ok(Array.isArray(report.validators));
  assert.equal(report.validators.length, 1);
  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].scope, 'app');
  assert.equal(typeof report.validators[0].totalFilesScanned, 'number');
  assert.ok(Array.isArray(report.validators[0].findings));
});

test('validate-all CLI runs and returns naming validator report', () => {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'calculogic-validator/scripts/validate-all.mjs', '--scope=docs'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].scope, 'docs');
});

test('runner forwards targets and includes naming filter meta when filtering is active', () => {
  const report = runValidatorRunner(process.cwd(), { scope: 'app', validators: ['naming'], targets: ['src'] });

  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].meta?.filters?.isFiltered, true);
  assert.deepEqual(report.validators[0].meta?.filters?.targets, ['src']);
});

test('runner omits naming filter meta when no targets are provided', () => {
  const report = runValidatorRunner(process.cwd(), { scope: 'app', validators: ['naming'] });

  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].meta?.filters, undefined);
});
