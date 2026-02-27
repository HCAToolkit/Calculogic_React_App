import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const runBin = args =>
  spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

test('calculogic-validate bin prints help', () => {
  const result = runBin(['calculogic-validator/bin/calculogic-validate.mjs', '--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: calculogic-validate/);
});

test('calculogic-validate bin runs naming validator and returns JSON', () => {
  const result = runBin([
    'calculogic-validator/bin/calculogic-validate.mjs',
    '--scope=app',
    '--validators=naming',
  ]);

  assert.ok([0, 1, 2].includes(result.status), result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(Array.isArray(report.validators));
});

test('calculogic-validate-naming bin returns naming report JSON', () => {
  const result = runBin([
    'calculogic-validator/bin/calculogic-validate-naming.mjs',
    '--scope=app',
  ]);

  assert.ok([0, 1, 2].includes(result.status), result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.scope, 'app');
  assert.equal(typeof report.totalFilesScanned, 'number');
});


test('calculogic-validate bin accepts --config path', () => {
  const result = runBin([
    'calculogic-validator/bin/calculogic-validate.mjs',
    '--scope=app',
    '--validators=naming',
    '--config=calculogic-validator/test/fixtures/validator-config.extensions.contracts.json',
  ]);

  assert.ok([0, 1, 2].includes(result.status), result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.validators[0].id, 'naming');
});

test('calculogic-validate-naming bin fails deterministically on invalid config', () => {
  const result = runBin([
    'calculogic-validator/bin/calculogic-validate-naming.mjs',
    '--scope=app',
    '--config=calculogic-validator/test/fixtures/not-found.json',
  ]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Failed to read validator config file:/u);
  assert.match(result.stderr, /Usage: calculogic-validate-naming/u);
});
