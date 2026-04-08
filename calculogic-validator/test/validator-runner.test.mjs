import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { listRegisteredValidators } from '../src/core/validator-registry.knowledge.mjs';
import { runValidatorRunner } from '../src/core/validator-runner.logic.mjs';

test('registry lists validators deterministically', () => {
  assert.deepEqual(listRegisteredValidators(), ['naming', 'tree-structure-advisor']);
});

test('runner report includes naming validator in deterministic order', () => {
  const report = runValidatorRunner(process.cwd(), { scope: 'app' });

  assert.ok(report.version);
  assert.equal(report.mode, 'report');
  assert.equal(report.validatorId, 'runner');
  assert.equal(report.sourceSnapshot?.source, 'fs');
  assert.equal(typeof report.startedAt, 'string');
  assert.equal(typeof report.endedAt, 'string');
  assert.equal(typeof report.durationMs, 'number');
  assert.ok(Array.isArray(report.validators));
  assert.equal(report.validators.length, 2);
  assert.deepEqual(
    report.validators.map((validator) => validator.id),
    ['naming', 'tree-structure-advisor'],
  );

  const namingValidator = report.validators.find((validator) => validator.id === 'naming');
  const treeValidator = report.validators.find((validator) => validator.id === 'tree-structure-advisor');

  assert.ok(namingValidator);
  assert.ok(treeValidator);
  assert.equal(namingValidator.validatorId, 'naming');
  assert.equal(treeValidator.validatorId, 'tree-structure-advisor');
  assert.equal(namingValidator.scope, 'app');
  assert.equal(treeValidator.scope, 'app');
  assert.equal(typeof namingValidator.totalFilesScanned, 'number');
  assert.equal(typeof treeValidator.totalFilesScanned, 'number');
  assert.ok(Array.isArray(namingValidator.findings));
  assert.ok(Array.isArray(treeValidator.findings));
});

test('validate-all CLI runs and returns naming validator report', () => {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'calculogic-validator/scripts/validate-all.host.mjs', '--scope=docs'],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  const namingValidator = report.validators.find((validator) => validator.id === 'naming');
  assert.ok(namingValidator);
  assert.equal(namingValidator.id, 'naming');
  assert.equal(namingValidator.validatorId, 'naming');
  assert.equal(namingValidator.scope, 'docs');
});

test('runner forwards targets and includes naming filter meta when filtering is active', () => {
  const report = runValidatorRunner(process.cwd(), {
    scope: 'app',
    validators: ['naming'],
    targets: ['src'],
  });

  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].validatorId, 'naming');
  assert.equal(report.validators[0].meta?.filters?.isFiltered, true);
  assert.deepEqual(report.validators[0].meta?.filters?.targets, ['src']);
});

test('runner omits naming filter meta when no targets are provided', () => {
  const report = runValidatorRunner(process.cwd(), { scope: 'app', validators: ['naming'] });

  assert.equal(report.validators[0].id, 'naming');
  assert.equal(report.validators[0].validatorId, 'naming');
  assert.equal(report.validators[0].meta?.filters, undefined);
});

test('runner stages naming-owned bridge evidence before tree in tree-only runs', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-runner-tree-bridge-'));

  try {
    await fs.mkdir(path.join(fixtureRoot, 'src', 'a'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'b'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'c'), { recursive: true });
    await fs.writeFile(path.join(fixtureRoot, 'src', 'a', 'build-surface.logic.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'b', 'build-surface.results.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'c', 'build-surface.knowledge.ts'), 'export {};\n', 'utf8');

    const report = runValidatorRunner(fixtureRoot, {
      validators: ['tree-structure-advisor'],
      scope: 'repo',
    });

    assert.deepEqual(report.validators.map((validator) => validator.id), ['tree-structure-advisor']);
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'),
      true,
    );
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code.startsWith('NAMING_')),
      false,
    );
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('runner tree output remains deterministic for identical staged naming bridge inputs', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-runner-tree-deterministic-'));

  try {
    await fs.mkdir(path.join(fixtureRoot, 'src', 'a'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'b'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'c'), { recursive: true });
    await fs.writeFile(path.join(fixtureRoot, 'src', 'a', 'build-surface.logic.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'b', 'build-surface.results.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'c', 'build-surface.knowledge.ts'), 'export {};\n', 'utf8');

    const first = runValidatorRunner(fixtureRoot, {
      validators: ['tree-structure-advisor'],
      scope: 'repo',
    });
    const second = runValidatorRunner(fixtureRoot, {
      validators: ['tree-structure-advisor'],
      scope: 'repo',
    });

    assert.deepEqual(first.validators[0].findings, second.validators[0].findings);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('runner excludes ambiguity-flagged naming observations from stronger tree bridge advisories', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-runner-tree-ambiguity-'));

  try {
    await fs.mkdir(path.join(fixtureRoot, 'src', 'a'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'b'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'c'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'd'), { recursive: true });
    await fs.writeFile(path.join(fixtureRoot, 'src', 'a', 'alpha-beta-gamma-delta.logic.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'b', 'alpha-beta-gamma-delta.results.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'c', 'alpha-beta-gamma-delta.knowledge.ts'), 'export {};\n', 'utf8');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'd', 'alpha-beta-gamma-delta.build.tsx'), 'export {};\n', 'utf8');

    const report = runValidatorRunner(fixtureRoot, {
      validators: ['tree-structure-advisor'],
      scope: 'repo',
    });

    const treeFindings = report.validators[0].findings;
    assert.equal(treeFindings.some((finding) => finding.code === 'TREE_FAMILY_SCATTERED'), false);
    assert.equal(
      treeFindings.some((finding) => finding.code === 'TREE_OBSERVED_FAMILY_CLUSTER'),
      false,
    );
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});
