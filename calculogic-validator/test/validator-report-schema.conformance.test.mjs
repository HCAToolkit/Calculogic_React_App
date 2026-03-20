import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const runScript = (scriptPath, args = []) =>
  spawnSync(process.execPath, ['--experimental-strip-types', scriptPath, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

const assertIsoString = (value) => {
  assert.equal(typeof value, 'string');
  assert.ok(!Number.isNaN(Date.parse(value)));
};

test('validate-naming emits current slice report envelope and finding identifier contract', () => {
  const result = runScript('calculogic-validator/scripts/validate-naming.host.mjs', ['--scope=system']);

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.mode, 'report');
  assert.equal(report.validatorId, 'naming');
  assert.equal(typeof report.toolVersion, 'string');
  assert.equal(report.validatorVersion, report.toolVersion);
  assert.ok(report.sourceSnapshot);
  assert.equal(report.sourceSnapshot.source, 'fs');
  assertIsoString(report.startedAt);
  assertIsoString(report.endedAt);
  assert.equal(typeof report.durationMs, 'number');
  assert.equal(typeof report.scope, 'string');
  assert.equal(typeof report.totalFilesScanned, 'number');
  assert.ok(report.counts && typeof report.counts === 'object');
  assert.ok(report.codeCounts && typeof report.codeCounts === 'object');
  assert.ok(report.familyRootCounts && typeof report.familyRootCounts === 'object');
  assert.ok(report.familySubgroupCounts && typeof report.familySubgroupCounts === 'object');
  assert.ok(report.semanticFamilyCounts && typeof report.semanticFamilyCounts === 'object');
  assert.ok(Array.isArray(report.findings));

  for (const finding of report.findings) {
    assert.equal(typeof finding.code, 'string');
    assert.equal(finding.ruleId, undefined);
  }
});

test('validate-all emits current runner report envelope and forwards configDigest', () => {
  const result = runScript('calculogic-validator/scripts/validate-all.host.mjs', [
    '--scope=system',
    '--validators=naming',
    '--config=calculogic-validator/test/fixtures/validator-config.roles.contracts.json',
  ]);

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);

  assert.equal(report.version, '0.1.0');
  assert.equal(report.mode, 'report');
  assert.equal(report.validatorId, 'runner');
  assert.equal(typeof report.toolVersion, 'string');
  assert.equal(report.validatorVersion, report.toolVersion);
  assert.equal(typeof report.configDigest, 'string');
  assert.match(report.configDigest, /^[a-f0-9]{64}$/u);
  assert.ok(report.sourceSnapshot);
  assert.equal(report.sourceSnapshot.source, 'fs');
  assertIsoString(report.startedAt);
  assertIsoString(report.endedAt);
  assert.equal(typeof report.durationMs, 'number');
  assert.ok(Array.isArray(report.validators));
  assert.equal(report.validators.length, 1);

  const namingEntry = report.validators[0];
  assert.equal(namingEntry.id, 'naming');
  assert.equal(namingEntry.validatorId, 'naming');
  assert.equal(typeof namingEntry.description, 'string');
  assert.equal(typeof namingEntry.totalFilesScanned, 'number');
  assert.ok(namingEntry.familyRootCounts && typeof namingEntry.familyRootCounts === 'object');
  assert.ok(namingEntry.familySubgroupCounts && typeof namingEntry.familySubgroupCounts === 'object');
  assert.ok(namingEntry.semanticFamilyCounts && typeof namingEntry.semanticFamilyCounts === 'object');
  assert.ok(Array.isArray(namingEntry.findings));

  for (const finding of namingEntry.findings) {
    assert.equal(typeof finding.code, 'string');
    assert.equal(finding.ruleId, undefined);
  }
});
