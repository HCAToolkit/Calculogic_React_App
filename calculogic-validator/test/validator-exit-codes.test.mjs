import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const repositoryRoot = process.cwd();
const namingScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-naming.mjs',
);
const validateAllScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-all.mjs',
);
const validateTreeScriptPath = path.resolve(
  repositoryRoot,
  'calculogic-validator/scripts/validate-tree.mjs',
);

const writeFixtureRepo = async (fixtureDir) => {
  await fs.mkdir(path.join(fixtureDir, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(fixtureDir, 'package.json'),
    JSON.stringify({ name: 'validator-exit-codes-fixture', version: '1.0.0' }, null, 2),
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'src/App.tsx'),
    'export const App = () => null;\n',
    'utf8',
  );
};

const runNodeScript = (scriptPath, args, cwd, extraEnv = {}) =>
  spawnSync(process.execPath, ['--experimental-strip-types', scriptPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
  });

const parseJsonStdout = (result) => {
  assert.equal(typeof result.stdout, 'string');
  return JSON.parse(result.stdout);
};

test('validate-naming exits 2 by default when warnings are present', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src/rightpanel.widget.ts'),
      'export const widget = {};\n',
      'utf8',
    );

    const result = runNodeScript(namingScriptPath, [], fixtureDir);
    assert.equal(result.status, 2);

    const report = parseJsonStdout(result);
    assert.ok(Array.isArray(report.findings));
    assert.ok(report.findings.some((finding) => finding?.severity === 'warn'));
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-naming exits 0 by default and 1 in strict mode for legacy-exception-only findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);

    const defaultResult = runNodeScript(namingScriptPath, [], fixtureDir);
    assert.equal(defaultResult.status, 0);
    const defaultReport = parseJsonStdout(defaultResult);
    assert.ok(
      defaultReport.findings.some((finding) => finding?.classification === 'legacy-exception'),
    );
    assert.equal(
      defaultReport.findings.some((finding) => finding?.severity === 'warn'),
      false,
    );

    const strictResult = runNodeScript(namingScriptPath, ['--strict'], fixtureDir);
    assert.equal(strictResult.status, 1);
    const strictReport = parseJsonStdout(strictResult);
    assert.ok(
      strictReport.findings.some((finding) => finding?.classification === 'legacy-exception'),
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});



test('validate-naming stays default-success for legacy-exception-only findings when config strictExit is absent or false', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);

    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-config-'));
    const absentConfigPath = path.join(configDir, 'validator-config.absent-strict.json');
    await fs.writeFile(
      absentConfigPath,
      JSON.stringify({ version: '0.1' }, null, 2),
      'utf8',
    );

    const absentStrictResult = runNodeScript(
      namingScriptPath,
      [`--config=${absentConfigPath}`],
      fixtureDir,
    );
    assert.equal(absentStrictResult.status, 0);

    const falseConfigPath = path.join(configDir, 'validator-config.strict-false.json');
    await fs.writeFile(
      falseConfigPath,
      JSON.stringify({ version: '0.1', strictExit: false }, null, 2),
      'utf8',
    );

    const falseStrictResult = runNodeScript(
      namingScriptPath,
      [`--config=${falseConfigPath}`],
      fixtureDir,
    );
    assert.equal(falseStrictResult.status, 0);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    if (typeof configDir === 'string') {
      await fs.rm(configDir, { recursive: true, force: true });
    }
  }
});

test('validate-naming exits 1 for legacy-exception-only findings when config strictExit is true', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);

    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-config-'));
    const configPath = path.join(configDir, 'validator-config.strict-true.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: '0.1', strictExit: true }, null, 2),
      'utf8',
    );

    const result = runNodeScript(namingScriptPath, [`--config=${configPath}`], fixtureDir);
    assert.equal(result.status, 1);

    const report = parseJsonStdout(result);
    assert.ok(
      report.findings.some((finding) => finding?.classification === 'legacy-exception'),
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    if (typeof configDir === 'string') {
      await fs.rm(configDir, { recursive: true, force: true });
    }
  }
});

test('validate-naming CLI --strict takes precedence over config strictExit false', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);

    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-config-'));
    const configPath = path.join(configDir, 'validator-config.strict-false.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: '0.1', strictExit: false }, null, 2),
      'utf8',
    );

    const result = runNodeScript(
      namingScriptPath,
      ['--strict', `--config=${configPath}`],
      fixtureDir,
    );
    assert.equal(result.status, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    if (typeof configDir === 'string') {
      await fs.rm(configDir, { recursive: true, force: true });
    }
  }
});
test('validate-all mirrors exit policy from aggregated findings', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));

  try {
    await writeFixtureRepo(fixtureDir);
    await fs.writeFile(
      path.join(fixtureDir, 'src/rightpanel.widget.ts'),
      'export const widget = {};\n',
      'utf8',
    );

    const warningResult = runNodeScript(validateAllScriptPath, [], fixtureDir);
    assert.equal(warningResult.status, 2);
    const warningReport = parseJsonStdout(warningResult);
    assert.ok(Array.isArray(warningReport.validators));

    await fs.rm(path.join(fixtureDir, 'src/rightpanel.widget.ts'));

    const defaultLegacyResult = runNodeScript(validateAllScriptPath, [], fixtureDir);
    assert.equal(defaultLegacyResult.status, 0);

    const strictLegacyResult = runNodeScript(validateAllScriptPath, ['--strict'], fixtureDir);
    assert.equal(strictLegacyResult.status, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('validate-all strictness is CLI-driven and does not use config strictExit', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-exit-codes-'));
  let configDir;

  try {
    await writeFixtureRepo(fixtureDir);

    configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'validator-config-'));
    const configPath = path.join(configDir, 'validator-config.strict-true.json');
    await fs.writeFile(
      configPath,
      JSON.stringify({ version: '0.1', strictExit: true }, null, 2),
      'utf8',
    );

    const configOnlyResult = runNodeScript(validateAllScriptPath, [`--config=${configPath}`], fixtureDir);
    assert.equal(configOnlyResult.status, 0);

    const cliStrictResult = runNodeScript(
      validateAllScriptPath,
      ['--strict', `--config=${configPath}`],
      fixtureDir,
    );
    assert.equal(cliStrictResult.status, 1);
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
    if (typeof configDir === 'string') {
      await fs.rm(configDir, { recursive: true, force: true });
    }
  }
});

test('deferred mode labels are rejected as invalid CLI arguments', () => {
  const namingResult = runNodeScript(namingScriptPath, ['--mode=soft-fail'], repositoryRoot);
  const allResult = runNodeScript(validateAllScriptPath, ['--mode=hard-fail'], repositoryRoot);
  const treeResult = runNodeScript(validateTreeScriptPath, ['--mode=correct'], repositoryRoot);

  assert.equal(namingResult.status, 1);
  assert.equal(allResult.status, 1);
  assert.equal(treeResult.status, 1);

  assert.match(namingResult.stderr, /Invalid argument: --mode=soft-fail/u);
  assert.match(allResult.stderr, /Invalid argument: --mode=hard-fail/u);
  assert.match(treeResult.stderr, /Invalid argument: --mode=correct/u);
});

test('validate-naming fails fast when npm script args are not forwarded', () => {
  const result = runNodeScript(namingScriptPath, [], repositoryRoot, {
    npm_lifecycle_event: 'validate:naming',
    npm_config_argv: JSON.stringify({
      original: ['run', 'validate:naming', '--scope=app'],
      cooked: [],
      remain: [],
    }),
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Detected npm argument forwarding issue/);
  assert.match(result.stderr, /Usage: npm run validate:naming --/);
});

test('validate-all fails fast when npm script args are not forwarded', () => {
  const result = runNodeScript(validateAllScriptPath, [], repositoryRoot, {
    npm_lifecycle_event: 'validate:all',
    npm_config_argv: JSON.stringify({
      original: ['run', 'validate:all', '--validators=naming'],
      cooked: [],
      remain: [],
    }),
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Detected npm argument forwarding issue/);
  assert.match(result.stderr, /Usage: npm run validate:all --/);
});

test('validate-naming fails fast in env-only npm v7+ style forwarding footgun case', () => {
  const result = runNodeScript(namingScriptPath, [], repositoryRoot, {
    npm_lifecycle_event: 'validate:naming',
    npm_config_scope: 'app',
    npm_config_argv: undefined,
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Detected npm argument forwarding issue/);
  assert.match(result.stderr, /Usage: npm run validate:naming --/);
});

test('validate-all fails fast in env-only npm v7+ style forwarding footgun case', () => {
  const result = runNodeScript(validateAllScriptPath, [], repositoryRoot, {
    npm_lifecycle_event: 'validate:all',
    npm_config_validators: 'naming',
    npm_config_argv: undefined,
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Detected npm argument forwarding issue/);
  assert.match(result.stderr, /Usage: npm run validate:all --/);
});
