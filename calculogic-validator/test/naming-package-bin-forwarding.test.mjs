import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = process.cwd();
const namingBinPath = path.resolve(repositoryRoot, 'node_modules/.bin/calculogic-validate-naming');

const extractJsonReport = (stdout) => {
  const jsonStartIndex = stdout.indexOf('{');
  assert.notEqual(jsonStartIndex, -1, `missing JSON report in stdout: ${stdout}`);
  return JSON.parse(stdout.slice(jsonStartIndex));
};

const runNamingBin = ({ args = [], extraEnv = {} } = {}) =>
  spawnSync(namingBinPath, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
  });

const runRootNpmValidateNaming = (args) =>
  spawnSync('npm', ['run', 'validate:naming', ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: process.env,
  });

test('public naming bin fails fast for npm env-only argument forwarding footgun', () => {
  const result = runNamingBin({
    extraEnv: {
      npm_lifecycle_event: 'validate:naming',
      npm_config_scope: 'app',
      npm_config_argv: undefined,
    },
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Detected npm argument forwarding issue/u);
  assert.match(result.stderr, /Right: npm run validate:naming -- --scope=<value>/u);
  assert.match(result.stderr, /Usage: calculogic-validate-naming/u);
});

test('root validate:naming npm script fails before validation when -- separator is omitted', () => {
  const result = runRootNpmValidateNaming(['--scope=app']);
  const combinedOutput = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(combinedOutput, /Detected npm argument forwarding issue/u);
  assert.match(combinedOutput, /npm run validate:naming -- --scope/u);
  assert.doesNotMatch(combinedOutput, /"scope":\s*"repo"/u);
  assert.doesNotMatch(combinedOutput, /"scope":\s*"app"/u);
});

test('root validate:naming npm script accepts correctly forwarded app scope', () => {
  const result = runRootNpmValidateNaming(['--', '--scope=app']);

  assert.equal(result.status, 0);
  assert.equal(result.stderr.includes('Detected npm argument forwarding issue'), false);

  const report = extractJsonReport(result.stdout);
  assert.equal(report.scope, 'app');
  assert.equal(report.scopeSummary.scope, 'app');
});

test('direct public naming bin accepts app scope without npm lifecycle guard', () => {
  const result = runNamingBin({ args: ['--scope=app'] });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');

  const report = extractJsonReport(result.stdout);
  assert.equal(report.scope, 'app');
  assert.equal(report.scopeSummary.scope, 'app');
});
