import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  parseAddressingGetTreeArgs,
  runAddressingGetTreeHost,
} from '../../scripts/addressing-get-tree.host.mjs';

const makeWritableBuffer = () => {
  let value = '';
  return {
    write: (chunk) => {
      value += chunk;
    },
    read: () => value,
  };
};

const createFixtureRepo = async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'addressing-get-tree-host-'));
  const validatorRoot = path.join(fixtureRoot, 'calculogic-validator');

  await fs.mkdir(path.join(validatorRoot, 'structural-addressing', 'src'), { recursive: true });
  await fs.mkdir(path.join(validatorRoot, '.git'), { recursive: true });
  await fs.mkdir(path.join(validatorRoot, 'node_modules', 'x'), { recursive: true });

  await fs.writeFile(path.join(validatorRoot, 'README.md'), 'readme\n');
  await fs.writeFile(path.join(validatorRoot, 'structural-addressing', 'src', 'alpha.mjs'), 'export const a = 1;\n');
  await fs.writeFile(path.join(validatorRoot, '.git', 'ignored.txt'), 'ignored\n');
  await fs.writeFile(path.join(validatorRoot, 'node_modules', 'x', 'ignored.js'), 'ignored\n');

  return fixtureRoot;
};

test('--help exits 0 and prints usage', async () => {
  const stdout = makeWritableBuffer();
  const stderr = makeWritableBuffer();
  const exitCode = await runAddressingGetTreeHost({ argv: ['--help'], cwd: process.cwd(), stdout, stderr });

  assert.equal(exitCode, 0);
  assert.match(stdout.read(), /Usage: node --experimental-strip-types .*--scope=validator/u);
  assert.equal(stderr.read(), '');
});

test('-h exits 0 and prints usage', async () => {
  const stdout = makeWritableBuffer();
  const stderr = makeWritableBuffer();
  const exitCode = await runAddressingGetTreeHost({ argv: ['-h'], cwd: process.cwd(), stdout, stderr });

  assert.equal(exitCode, 0);
  assert.match(stdout.read(), /--format text\|json\|both/u);
  assert.equal(stderr.read(), '');
});

test('parse errors are deterministic for missing scope, unsupported scope/format, unknown flag and missing values', () => {
  assert.throws(() => parseAddressingGetTreeArgs([]), /Missing required --scope/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope=repo']), /Unsupported scope: repo/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope=validator', '--format=yaml']), /Unsupported format: yaml/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope=validator', '--bad']), /Unknown flag: --bad/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope']), /Missing required value for --scope/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope=validator', '--target']), /Missing required value for --target/u);
  assert.throws(() => parseAddressingGetTreeArgs(['--scope=validator', '--format']), /Missing required value for --format/u);
});

test('--scope=validator --format=text emits rendered tree text only', async () => {
  const cwd = await createFixtureRepo();
  const stdout = makeWritableBuffer();
  const stderr = makeWritableBuffer();

  const exitCode = await runAddressingGetTreeHost({ argv: ['--scope=validator', '--format=text'], cwd, stdout, stderr });

  assert.equal(exitCode, 0);
  assert.match(stdout.read(), /^A: calculogic-validator\//mu);
  assert.doesNotMatch(stdout.read(), /"addressedTreeSnapshot"/u);
  assert.equal(stderr.read(), '');
  await fs.rm(cwd, { recursive: true, force: true });
});

test('--scope=validator --format=json emits valid JSON; both emits deterministic combined JSON; repeatable targets accepted', async () => {
  const cwd = await createFixtureRepo();

  const jsonOut = makeWritableBuffer();
  const jsonErr = makeWritableBuffer();
  const jsonExitCode = await runAddressingGetTreeHost({ argv: ['--scope=validator', '--format=json'], cwd, stdout: jsonOut, stderr: jsonErr });
  assert.equal(jsonExitCode, 0);
  const parsedJson = JSON.parse(jsonOut.read());
  assert.equal(parsedJson.addressedTreeSnapshot.scope, 'validator');
  assert.equal(parsedJson.addressedTreeSnapshot.sourceNamespace, 'calculogic-validator');
  assert.equal(parsedJson.addressedTreeSnapshot.target, null);
  assert.equal(jsonErr.read(), '');

  const bothOut = makeWritableBuffer();
  const bothErr = makeWritableBuffer();
  const bothExitCode = await runAddressingGetTreeHost({
    argv: ['--scope=validator', '--target', 'calculogic-validator/structural-addressing', '--target=calculogic-validator/README.md', '--format', 'both'],
    cwd,
    stdout: bothOut,
    stderr: bothErr,
  });

  assert.equal(bothExitCode, 0);
  const parsedBoth = JSON.parse(bothOut.read());
  assert.deepEqual(parsedBoth.addressedTreeSnapshot.target, [
    'calculogic-validator/structural-addressing',
    'calculogic-validator/README.md',
  ]);
  assert.match(parsedBoth.renderedTree, /structural-addressing\//u);
  assert.match(parsedBoth.renderedTree, /README\.md/u);
  assert.equal(bothErr.read(), '');
  await fs.rm(cwd, { recursive: true, force: true });
});

test('nonexistent target exits non-zero and host output does not include validator findings/severity/report-shaped output', async () => {
  const cwd = await createFixtureRepo();
  const stdout = makeWritableBuffer();
  const stderr = makeWritableBuffer();

  const missingExitCode = await runAddressingGetTreeHost({
    argv: ['--scope=validator', '--target', 'calculogic-validator/missing-path'],
    cwd,
    stdout,
    stderr,
  });

  assert.equal(missingExitCode, 1);
  assert.match(stderr.read(), /Target path does not exist/u);

  const okStdout = makeWritableBuffer();
  const okStderr = makeWritableBuffer();
  const okExitCode = await runAddressingGetTreeHost({ argv: ['--scope=validator', '--format=both'], cwd, stdout: okStdout, stderr: okStderr });
  assert.equal(okExitCode, 0);
  assert.doesNotMatch(okStdout.read(), /findings|severity|report/u);
  assert.equal(okStderr.read(), '');

  await fs.rm(cwd, { recursive: true, force: true });
});
