import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const digestPattern = /^[a-f0-9]{64}$/u;

const assertRegistryDigestShape = registryDigests => {
  assert.ok(registryDigests);
  assert.match(registryDigests.builtin, digestPattern);
  assert.match(registryDigests.custom, digestPattern);
  assert.match(registryDigests.resolved, digestPattern);
};

test('validate-naming script report includes registry metadata fields', () => {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'calculogic-validator/scripts/validate-naming.mjs', '--scope=system'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.validatorId, 'naming');
  assert.ok(report.sourceSnapshot);
  assert.match(report.registryState, /^(builtin|custom)$/u);
  assert.match(report.registrySource, /^(builtin|custom|config)$/u);
  assertRegistryDigestShape(report.registryDigests);
});

test('validate-naming bin report aligns envelope and includes registry metadata fields', () => {
  const result = spawnSync(
    process.execPath,
    ['calculogic-validator/bin/calculogic-validate-naming.mjs', '--scope=system'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.validatorId, 'naming');
  assert.ok(report.sourceSnapshot);

  if (report.toolVersion) {
    assert.equal(typeof report.validatorVersion, 'string');
    assert.ok(report.validatorVersion.length > 0);
  }

  assert.match(report.registryState, /^(builtin|custom)$/u);
  assert.match(report.registrySource, /^(builtin|custom|config)$/u);
  assertRegistryDigestShape(report.registryDigests);
});
