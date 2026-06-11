import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = process.cwd();
const validateTreeScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-tree.host.mjs',
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

test('validate-tree emits report JSON and exits 2 for warning-level advisory findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-tree-script-warn-'));

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

    const result = runValidateTree(fixtureDir, ['--scope=repo']);
    assert.equal(result.status, 2);

    const report = JSON.parse(result.stdout);
    assert.equal(report.mode, 'report');
    assert.equal(report.validators.length, 1);
    assert.equal(report.validators[0].id, 'tree-structure-advisor');
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code === 'TREE_SHIM_OUTSIDE_COMPAT'),
      true,
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


test('validate-tree help keeps current command usage surface', () => {
  const result = runValidateTree(repositoryRoot, ['--help']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(
    result.stdout,
    [
      'Usage: npm run validate:tree -- [--scope=<repo|app|docs|validator|system>] [--target=<path>]... [--config=<path>]',
      'Scopes:',
      '  - app: Application-only scan (src/** and test/**).',
      '  - docs: Documentation-focused scan (doc/docs and root conventional docs: README.md).',
      '  - repo: Repository-wide scan of all reportable files.',
      '  - system: System/tooling files scan (root package/tsconfig/eslint/vite files).',
      '  - validator: Validator-only scan (calculogic-validator/**).',
      'Default scope: validator default (repo for tree-structure-advisor)',
      'Validator: tree-structure-advisor',
      'Examples:',
      '  ✅ npm run validate:tree -- --scope=repo',
      '  ✅ npm run validate:tree -- --scope=app --target src/tree',
      '  ✅ npm run validate:tree -- --target calculogic-validator/tree/src',
      '  ✅ npm run validate:all -- --validators=tree-structure-advisor --scope=repo',
      '',
    ].join('\n'),
  );
});

test('validate-tree direct report entry preserves no-finding shape against runner tree selection', () => {
  const directResult = runValidateTree(repositoryRoot, [
    '--scope=validator',
    '--target=calculogic-validator/src/core',
  ]);
  const runnerResult = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      path.resolve(repositoryRoot, 'calculogic-validator/scripts/validate-all.host.mjs'),
      '--scope=validator',
      '--validators=tree-structure-advisor',
      '--target=calculogic-validator/src/core',
    ],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );

  assert.equal(directResult.status, 0);
  assert.equal(runnerResult.status, 0);

  const directReport = JSON.parse(directResult.stdout);
  const runnerReport = JSON.parse(runnerResult.stdout);

  assert.equal(directReport.mode, 'report');
  assert.equal(directReport.validatorId, 'runner');
  assert.equal(directReport.validators.length, 1);
  assert.deepEqual(directReport.validators[0], runnerReport.validators[0]);
  assert.deepEqual(directReport.validators[0].findings, []);
  assert.deepEqual(directReport.validators[0].counts, { 'advisory-structure': 0 });
  assert.deepEqual(directReport.validators[0].codeCounts, {});
});

test('validate-tree direct report entry preserves finding codes severities and summaries against runner tree selection', () => {
  const args = ['--scope=validator', '--target=calculogic-validator/tree'];
  const directResult = runValidateTree(repositoryRoot, args);
  const runnerResult = spawnSync(
    process.execPath,
    [
      '--experimental-strip-types',
      path.resolve(repositoryRoot, 'calculogic-validator/scripts/validate-all.host.mjs'),
      '--scope=validator',
      '--validators=tree-structure-advisor',
      '--target=calculogic-validator/tree',
    ],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );

  assert.equal(directResult.status, 0);
  assert.equal(runnerResult.status, 0);

  const directEntry = JSON.parse(directResult.stdout).validators[0];
  const runnerEntry = JSON.parse(runnerResult.stdout).validators[0];
  const findingSignature = (finding) => ({
    code: finding.code,
    severity: finding.severity,
    path: finding.path,
    classification: finding.classification,
  });

  assert.deepEqual(directEntry.counts, runnerEntry.counts);
  assert.deepEqual(directEntry.codeCounts, runnerEntry.codeCounts);
  assert.deepEqual(
    directEntry.findings.map(findingSignature),
    runnerEntry.findings.map(findingSignature),
  );
  assert.ok(directEntry.findings.length > 0);
});

test('validate-tree does not expose strict-mode toggling', () => {
  const result = runValidateTree(repositoryRoot, ['--strict']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid argument: --strict/u);
  assert.match(result.stderr, /Usage: npm run validate:tree --/u);
});

test('validate-tree config strictExit does not act as a tree strict-mode toggle', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-tree-script-strict-exit-'));
  const configPath = path.join(fixtureDir, 'validator-config.strict-true.json');

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.mkdir(path.join(fixtureDir, 'experiments'), { recursive: true });
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: '0.1', strictExit: true }, null, 2),
      'utf8',
    );

    const result = runValidateTree(fixtureDir, ['--scope=repo', `--config=${configPath}`]);
    assert.equal(result.status, 0);

    const report = JSON.parse(result.stdout);
    assert.equal(report.mode, 'report');
    assert.equal(typeof report.configDigest, 'string');
    assert.equal(
      report.validators[0].findings.some((finding) => finding.code === 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER'),
      true,
    );
    assert.equal(
      report.validators[0].findings.some((finding) => finding.severity === 'warn'),
      false,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-tree rejects unsupported tree-specific config surfaces', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-tree-script-invalid-config-'));
  const configPath = path.join(fixtureDir, 'validator-config.tree-unsupported.json');

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: '0.1', treeStructureAdvisor: { thresholds: {} } }, null, 2),
      'utf8',
    );

    const result = runValidateTree(fixtureDir, ['--scope=repo', `--config=${configPath}`]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid validator config:/u);
    assert.match(result.stderr, /contains unknown key "treeStructureAdvisor"/u);
    assert.equal(result.stdout, '');
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-tree accepts --config and includes configDigest in runner report envelope', () => {
  const result = runValidateTree(repositoryRoot, [
    '--scope=system',
    '--config=calculogic-validator/test/fixtures/validator-config.extensions.contracts.json',
  ]);

  assert.ok([0, 1, 2].includes(result.status));
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'report');
  assert.equal(typeof report.configDigest, 'string');
  assert.match(report.configDigest, /^[a-f0-9]{64}$/u);
});
