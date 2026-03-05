import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('validate runner includes naming meta.registry with digest metadata', () => {
  const result = spawnSync(
    process.execPath,
    ['calculogic-validator/bin/calculogic-validate.mjs', '--scope=system', '--validators=naming'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);
  const namingEntry = report.validators.find(entry => entry.id === 'naming' || entry.validatorId === 'naming');

  assert.ok(namingEntry);
  assert.ok(namingEntry.meta?.registry);
  assert.match(namingEntry.meta.registry.registryDigests?.resolved, /^[a-f0-9]{64}$/u);
});
