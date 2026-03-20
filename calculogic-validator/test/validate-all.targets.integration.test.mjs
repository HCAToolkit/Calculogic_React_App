import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = process.cwd();
const validateAllScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-all.host.mjs',
);

const runValidateAll = (fixtureDir, args) =>
  spawnSync(process.execPath, ['--experimental-strip-types', validateAllScriptPath, ...args], {
    cwd: fixtureDir,
    encoding: 'utf8',
  });

const writeFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.mkdir(path.join(fixtureDir, 'test'), { recursive: true });

  await fs.writeFile(
    path.join(fixtureDir, 'package.json'),
    JSON.stringify({ name: 'validate-all-targets-fixture', version: '1.0.0' }, null, 2),
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'src/right-panel.widget.ts'),
    'export const widget = {}\n',
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'src/app-shell.logic.ts'),
    'export const logic = {}\n',
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'test/unit.spec.ts'),
    'export const spec = true\n',
    'utf8',
  );
};

test('validate-all accepts --target and emits naming validator filter metadata', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-all-targets-'));

  try {
    await writeFixtureRepo(fixtureDir);

    const result = runValidateAll(fixtureDir, [
      '--validators=naming',
      '--scope=app',
      '--target',
      'src',
    ]);

    assert.equal(result.status, 2);

    const report = JSON.parse(result.stdout);
    assert.equal(report.validators[0].id, 'naming');
    assert.equal(report.validators[0].meta.filters.isFiltered, true);
    assert.deepEqual(report.validators[0].meta.filters.targets, ['src']);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-all returns deterministic error for nonexistent --target', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-all-targets-'));

  try {
    await writeFixtureRepo(fixtureDir);

    const result = runValidateAll(fixtureDir, [
      '--validators=naming',
      '--scope=app',
      '--target',
      'does-not-exist',
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Target path does not exist: does-not-exist/u);
    assert.match(result.stderr, /Usage: npm run validate:all/u);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('validate-all forwards target filtering contract to tree-structure-advisor', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-all-targets-tree-'));

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'naming-validator.logic.mjs'),
      'export const misplaced = true\n',
      'utf8',
    );

    const result = runValidateAll(fixtureDir, [
      '--validators=tree-structure-advisor',
      '--scope=repo',
      '--target',
      'calculogic-validator',
    ]);

    assert.equal(result.status, 0);

    const report = JSON.parse(result.stdout);
    assert.equal(report.validators[0].id, 'tree-structure-advisor');
    assert.equal(report.validators[0].meta.filters.isFiltered, true);
    assert.deepEqual(report.validators[0].meta.filters.targets, ['calculogic-validator']);
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code === 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});


test('validate-all target filtering suppresses shim findings outside selected target', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-all-targets-tree-shim-'));

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'validator-runner.logic.mjs'),
      'export const core = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const unfiltered = runValidateAll(fixtureDir, [
      '--validators=tree-structure-advisor',
      '--scope=repo',
    ]);
    assert.equal(unfiltered.status, 2);
    const unfilteredReport = JSON.parse(unfiltered.stdout);
    assert.equal(
      unfilteredReport.validators[0].findings.some((finding) => finding.code === 'TREE_SHIM_SURFACE_PRESENT'),
      true,
    );

    const filtered = runValidateAll(fixtureDir, [
      '--validators=tree-structure-advisor',
      '--scope=repo',
      '--target',
      'calculogic-validator',
    ]);

    assert.equal(filtered.status, 0);

    const filteredReport = JSON.parse(filtered.stdout);
    assert.equal(filteredReport.validators[0].meta.filters.isFiltered, true);
    assert.deepEqual(filteredReport.validators[0].meta.filters.targets, ['calculogic-validator']);
    assert.equal(
      filteredReport.validators[0].findings.some((finding) => finding.code === 'TREE_SHIM_SURFACE_PRESENT'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
