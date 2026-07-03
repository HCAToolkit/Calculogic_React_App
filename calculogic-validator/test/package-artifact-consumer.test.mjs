import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testFilePath = fileURLToPath(import.meta.url);
const validatorPackageRoot = path.resolve(path.dirname(testFilePath), '..');

const runCommand = (command, args, { cwd, env = {} } = {}) =>
  spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });

const formatCommandFailure = ({ command, args, cwd, result }) =>
  [
    `command: ${[command, ...args].join(' ')}`,
    `working directory: ${cwd}`,
    `exit status: ${result.status}`,
    `stdout:\n${result.stdout}`,
    `stderr:\n${result.stderr}`,
  ].join('\n\n');

const assertSuccessfulCommand = ({ command, args, cwd, result }) => {
  assert.equal(result.error, undefined, formatCommandFailure({ command, args, cwd, result }));
  assert.equal(result.status, 0, formatCommandFailure({ command, args, cwd, result }));
};

const parseJsonStdout = ({ command, args, cwd, result }) => {
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    assert.fail(`${formatCommandFailure({ command, args, cwd, result })}\n\nJSON parse error: ${error.message}`);
  }
};

const writeConsumerHost = async (hostRoot) => {
  await fs.mkdir(path.join(hostRoot, 'src', 'configs', 'sampleConfig'), { recursive: true });
  await fs.mkdir(path.join(hostRoot, 'doc'), { recursive: true });
  await fs.writeFile(
    path.join(hostRoot, 'package.json'),
    `${JSON.stringify({ name: 'calculogic-validator-artifact-consumer', version: '1.0.0', private: true, type: 'module' }, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(path.join(hostRoot, 'README.md'), '# Temporary Validator Consumer\n', 'utf8');
  await fs.writeFile(path.join(hostRoot, 'doc', 'sample.spec.md'), '# Sample Spec\n', 'utf8');
  await fs.writeFile(
    path.join(hostRoot, 'src', 'configs', 'sampleConfig', 'Sample.build.tsx'),
    'export const Sample = () => null;\n',
    'utf8',
  );
};

const assertReportReachedHostRoot = ({ report, hostRoot, installedPackageRoot, commandContext }) => {
  assert.equal(
    report.sourceSnapshot?.repositoryRoot,
    hostRoot,
    `${commandContext}\nExpected report sourceSnapshot.repositoryRoot to prove the temporary host target.\nActual report:\n${JSON.stringify(report, null, 2)}`,
  );
  assert.notEqual(report.sourceSnapshot.repositoryRoot, validatorPackageRoot, commandContext);
  assert.notEqual(report.sourceSnapshot.repositoryRoot, installedPackageRoot, commandContext);
  assert.equal(report.sourceSnapshot.repositoryRoot.includes('node_modules'), false, commandContext);
};

const assertPublicBinReport = ({ binName, hostRoot, installedPackageRoot, args = ['--scope=repo'] }) => {
  const binPath = path.join(hostRoot, 'node_modules', '.bin', binName);
  assert.equal(fsSync.existsSync(binPath), true, `${binName} bin should be installed in the consumer host.`);

  const result = runCommand(binPath, args, { cwd: hostRoot });
  assert.equal(result.error, undefined, formatCommandFailure({ command: binPath, args, cwd: hostRoot, result }));
  assert.ok([0, 1, 2].includes(result.status), formatCommandFailure({ command: binPath, args, cwd: hostRoot, result }));

  const report = parseJsonStdout({ command: binPath, args, cwd: hostRoot, result });
  assertReportReachedHostRoot({
    report,
    hostRoot,
    installedPackageRoot,
    commandContext: formatCommandFailure({ command: binPath, args, cwd: hostRoot, result }),
  });

  return { result, report };
};

test('packed validator artifact installs into a clean consumer host and runs public bins against that host', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'calculogic-validator-artifact-'));
  const packRoot = path.join(tempRoot, 'pack');
  const hostRoot = path.join(tempRoot, 'temporary-host');

  try {
    await fs.mkdir(packRoot, { recursive: true });
    await fs.mkdir(hostRoot, { recursive: true });
    await writeConsumerHost(hostRoot);

    const packArgs = ['pack', '--json', '--pack-destination', packRoot];
    const packResult = runCommand('npm', packArgs, { cwd: validatorPackageRoot });
    assertSuccessfulCommand({ command: 'npm', args: packArgs, cwd: validatorPackageRoot, result: packResult });
    const packOutput = parseJsonStdout({ command: 'npm', args: packArgs, cwd: validatorPackageRoot, result: packResult });
    const tarballName = packOutput[0]?.filename;
    assert.match(tarballName, /^calculogic-validator-.*\.tgz$/u);
    const tarballPath = path.join(packRoot, tarballName);
    assert.equal(fsSync.existsSync(tarballPath), true, `Expected package tarball at ${tarballPath}`);

    const installArgs = ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarballPath];
    const installResult = runCommand('npm', installArgs, { cwd: hostRoot });
    assertSuccessfulCommand({ command: 'npm', args: installArgs, cwd: hostRoot, result: installResult });

    const installedPackageRoot = path.join(hostRoot, 'node_modules', '@calculogic', 'validator');
    assert.equal(fsSync.existsSync(path.join(installedPackageRoot, 'package.json')), true);
    assert.equal(fsSync.existsSync(path.join(installedPackageRoot, 'test')), false);
    assert.equal(fsSync.existsSync(path.join(installedPackageRoot, 'naming', 'test')), false);
    assert.equal(fsSync.existsSync(path.join(installedPackageRoot, 'tree', 'test')), false);
    assert.equal(fsSync.existsSync(path.join(installedPackageRoot, 'structural-addressing', 'test')), false);

    const allReport = assertPublicBinReport({
      binName: 'calculogic-validate',
      hostRoot,
      installedPackageRoot,
      args: ['--scope=repo'],
    }).report;
    assert.equal(allReport.validators.some((entry) => entry.id === 'naming'), true);
    assert.equal(allReport.validators.some((entry) => entry.id === 'tree-structure-advisor'), true);

    const namingReport = assertPublicBinReport({
      binName: 'calculogic-validate-naming',
      hostRoot,
      installedPackageRoot,
      args: ['--scope=repo', '--target=src'],
    }).report;
    assert.equal(namingReport.validatorId, 'naming');
    assert.equal(namingReport.filters.targets[0], 'src');

    const treeReport = assertPublicBinReport({
      binName: 'calculogic-validate-tree',
      hostRoot,
      installedPackageRoot,
      args: ['--scope=repo', '--target=src'],
    }).report;
    assert.equal(treeReport.validators[0].id, 'tree-structure-advisor');
    assert.equal(treeReport.validators[0].meta.filters.targets[0], 'src');

    const validatorScopeBinPath = path.join(hostRoot, 'node_modules', '.bin', 'calculogic-validate-naming');
    const validatorScopeResult = runCommand(validatorScopeBinPath, ['--scope=validator'], { cwd: hostRoot });
    assert.equal(validatorScopeResult.error, undefined, formatCommandFailure({ command: validatorScopeBinPath, args: ['--scope=validator'], cwd: hostRoot, result: validatorScopeResult }));
    assert.equal(validatorScopeResult.status, 1, formatCommandFailure({ command: validatorScopeBinPath, args: ['--scope=validator'], cwd: hostRoot, result: validatorScopeResult }));
    assert.equal(validatorScopeResult.stdout.trim(), '');
    assert.match(validatorScopeResult.stderr, /validator-development-root-unavailable/u);
    assert.match(validatorScopeResult.stderr, /repo, app, docs, system/u);
    assert.equal(validatorScopeResult.stderr.includes(installedPackageRoot), false);

    const healthBinPath = path.join(hostRoot, 'node_modules', '.bin', 'calculogic-validator-health');
    const healthResult = runCommand(healthBinPath, [], { cwd: hostRoot });
    assertSuccessfulCommand({ command: healthBinPath, args: [], cwd: hostRoot, result: healthResult });
    assert.match(healthResult.stdout, /OK: naming validator deterministic/u);
    assert.match(healthResult.stdout, /OK: docs check skipped outside embedded repository docs host/u);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});
