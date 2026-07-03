import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = fs.realpathSync(process.cwd());
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const ordinaryPublicRoutes = {
  'validate:naming': 'calculogic-validate-naming',
  'validate:all': 'calculogic-validate',
  'validate:tree': 'calculogic-validate-tree',
  'health:validator': 'calculogic-validator-health',
};

const reportCommands = [
  {
    label: 'Naming public route for repo scope',
    command: ['npm', 'run', '--silent', 'validate:naming', '--', '--scope=repo'],
    expectedScope: 'repo',
  },
  {
    label: 'generic/all public route for app scope',
    command: ['npm', 'run', '--silent', 'validate:all', '--', '--scope=app'],
    expectedScope: 'app',
  },
  {
    label: 'Tree public route for docs scope',
    command: ['npm', 'run', '--silent', 'validate:tree', '--', '--scope=docs'],
    expectedScope: 'docs',
  },
  {
    label: 'generic/all public route for system scope',
    command: ['npm', 'run', '--silent', 'validate:all', '--', '--scope=system'],
    expectedScope: 'system',
  },
];

const reportExitStatuses = new Set([0, 1, 2]);

function commandDiagnostic({ command, status, stdout, stderr }) {
  return JSON.stringify(
    { command: command.join(' '), cwd: repoRoot, status, stdout, stderr },
    null,
    2,
  );
}

function runCommand(command) {
  const result = spawnSync(command[0], command.slice(1), {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  assert.ifError(result.error);

  return {
    command,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function parseReport(commandResult) {
  try {
    return JSON.parse(commandResult.stdout);
  } catch (error) {
    assert.fail(`Expected validator JSON report output.\n${commandDiagnostic(commandResult)}\n${error}`);
  }
}

test('root public validator workflows route through package command names', () => {
  for (const [scriptName, expectedPublicCommand] of Object.entries(ordinaryPublicRoutes)) {
    const script = packageJson.scripts?.[scriptName];

    assert.equal(script, expectedPublicCommand, `${scriptName} should route to the public package command`);
    assert.doesNotMatch(script, /calculogic-validator\/(scripts|bin)\//);
  }
});

test('root test script keeps app-owned consumer tests separate from validator-owned tests', () => {
  const testScript = packageJson.scripts?.test ?? '';

  assert.match(testScript, /test\/\*\*\/\*\.test\.mjs/);
  assert.doesNotMatch(testScript, /calculogic-validator\/.*test/);
  assert.doesNotMatch(testScript, /npm\s+--prefix\s+calculogic-validator\s+test/);
});

for (const { label, command, expectedScope } of reportCommands) {
  test(`${label} validates the React app repository root as target`, () => {
    const commandResult = runCommand(command);
    const report = parseReport(commandResult);

    assert.ok(
      reportExitStatuses.has(commandResult.status),
      `Unexpected validator report exit status.\n${commandDiagnostic(commandResult)}`,
    );
    assert.equal(report.scope, expectedScope, commandDiagnostic(commandResult));

    const reportedRoot = fs.realpathSync(report.sourceSnapshot.repositoryRoot);
    assert.equal(reportedRoot, repoRoot, commandDiagnostic(commandResult));
    const relativeReportedRoot = path.relative(repoRoot, reportedRoot).replaceAll('\\', '/');
    assert.notEqual(relativeReportedRoot, 'calculogic-validator');
    assert.equal(relativeReportedRoot.startsWith('calculogic-validator/'), false);
    assert.doesNotMatch(reportedRoot, /(?:^|[\\/])node_modules(?:[\\/]|$)/);
    assert.doesNotMatch(reportedRoot, /(?:^|[\\/])node_modules[\\/]@calculogic[\\/]validator(?:[\\/]|$)/);
  });
}

test('health public route reports embedded source-host docs coverage', () => {
  const commandResult = runCommand(['npm', 'run', '--silent', 'health:validator']);

  assert.equal(commandResult.status, 0, commandDiagnostic(commandResult));
  assert.match(commandResult.stdout, /OK: docs match app scope roots/);
  assert.doesNotMatch(commandResult.stdout, /docs skipped/i);
});
