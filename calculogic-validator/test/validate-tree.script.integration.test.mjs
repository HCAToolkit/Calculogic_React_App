import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = process.cwd();
const validateTreeScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-tree.mjs',
);

const runValidateTree = (cwd, args, extraEnv = {}) =>
  spawnSync(process.execPath, ['--experimental-strip-types', validateTreeScriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
  });

const writeFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(fixtureDir, 'package.json'),
    JSON.stringify({ name: 'validate-tree-script-fixture', version: '1.0.0' }, null, 2),
    'utf8',
  );
  await fs.writeFile(path.join(fixtureDir, 'src', 'App.tsx'), 'export const App = () => null;\n', 'utf8');
};

test('validate-tree runs tree-structure-advisor only and preserves target filter metadata', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-tree-script-'));

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'calculogic-validator', 'src', 'core'), { recursive: true });
    await fs.writeFile(
      path.join(fixtureDir, 'calculogic-validator', 'src', 'core', 'validator-runner.logic.mjs'),
      'export const runner = true\n',
      'utf8',
    );
    await fs.writeFile(
      path.join(fixtureDir, 'src', 'validator-runner.logic.mjs'),
      "export * from '../calculogic-validator/src/core/validator-runner.logic.mjs';\n",
      'utf8',
    );

    const result = runValidateTree(fixtureDir, ['--scope=repo', '--target', 'calculogic-validator']);
    assert.equal(result.status, 0);

    const report = JSON.parse(result.stdout);
    assert.equal(Array.isArray(report.validators), true);
    assert.equal(report.validators.length, 1);
    assert.equal(report.validators[0].id, 'tree-structure-advisor');
    assert.equal(report.validators[0].meta.filters.isFiltered, true);
    assert.deepEqual(report.validators[0].meta.filters.targets, ['calculogic-validator']);
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code === 'TREE_SHIM_SURFACE_PRESENT'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-tree prints usage when npm args are not forwarded', () => {
  const result = runValidateTree(repositoryRoot, [], {
    npm_lifecycle_event: 'validate:tree',
    npm_config_argv: JSON.stringify({
      original: ['run', 'validate:tree', '--scope=app'],
      cooked: [],
      remain: [],
    }),
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Detected npm argument forwarding issue/);
  assert.match(result.stderr, /Usage: npm run validate:tree --/);
});
