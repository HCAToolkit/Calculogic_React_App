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
