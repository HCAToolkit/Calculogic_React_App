import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const runExampleGenerator = (outDir) =>
  spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      'calculogic-validator/scripts/generate-validator-report-examples.mjs',
      `--out-dir=${outDir}`,
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const assertCommonEnvelope = (report) => {
  assert.equal(report.mode, 'report');
  assert.equal(report.startedAt, '<iso-startedAt>');
  assert.equal(report.endedAt, '<iso-endedAt>');
  assert.equal(report.durationMs, 0);
  assert.ok(report.sourceSnapshot && typeof report.sourceSnapshot === 'object');

  if (typeof report.sourceSnapshot.gitHeadSha === 'string') {
    assert.equal(report.sourceSnapshot.gitHeadSha, '<git-head-sha>');
  }

  if (report.sourceSnapshot.diagnostics) {
    assert.deepEqual(report.sourceSnapshot.diagnostics, {
      isDirty: false,
      changedCount: 0,
      untrackedCount: 0,
    });
  }
};

test('validator report example generator emits deterministic naming and runner examples', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-report-examples-'));

  const result = runExampleGenerator(outDir);
  assert.equal(result.status, 0, result.stderr);

  const namingFile = path.join(outDir, 'validate-naming.system.report.example.json');
  const runnerFile = path.join(outDir, 'validate-all.system.naming.report.example.json');

  assert.ok(fs.existsSync(namingFile));
  assert.ok(fs.existsSync(runnerFile));

  const namingReport = readJson(namingFile);
  const runnerReport = readJson(runnerFile);

  assertCommonEnvelope(namingReport);
  assert.equal(namingReport.validatorId, 'naming');
  assert.ok(Array.isArray(namingReport.findings));

  assertCommonEnvelope(runnerReport);
  assert.equal(runnerReport.validatorId, 'runner');
  assert.ok(Array.isArray(runnerReport.validators));
  assert.equal(runnerReport.validators.length, 1);
  assert.equal(runnerReport.validators[0].validatorId, 'naming');

  const secondResult = runExampleGenerator(outDir);
  assert.equal(secondResult.status, 0, secondResult.stderr);

  const namingReportSecond = readJson(namingFile);
  const runnerReportSecond = readJson(runnerFile);

  assert.deepEqual(namingReportSecond, namingReport);
  assert.deepEqual(runnerReportSecond, runnerReport);
});

test('checked-in generated report examples match current generator output', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-report-examples-checked-in-'));

  const result = runExampleGenerator(outDir);
  assert.equal(result.status, 0, result.stderr);

  const generatedNaming = readJson(path.join(outDir, 'validate-naming.system.report.example.json'));
  const generatedRunner = readJson(path.join(outDir, 'validate-all.system.naming.report.example.json'));

  const checkedInNaming = readJson(
    'calculogic-validator/test/fixtures/report-examples/validate-naming.system.report.example.json',
  );
  const checkedInRunner = readJson(
    'calculogic-validator/test/fixtures/report-examples/validate-all.system.naming.report.example.json',
  );

  assert.deepEqual(checkedInNaming, generatedNaming);
  assert.deepEqual(checkedInRunner, generatedRunner);
});
