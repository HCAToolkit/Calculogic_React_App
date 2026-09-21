import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { resolveLinkedValidatorCheckout, resolveWindowsCommand } from '../scripts/run-validator-dev-command.mjs';

const wrapperScriptPath = path.resolve('scripts/run-validator-dev-command.mjs');

// Isolated fixture: a consumer directory with its own node_modules/@calculogic/validator,
// so guard behavior never depends on this repo's own real dependency state (Refs #715, #714).
const createConsumerFixture = () => {
  const consumerRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'run-validator-dev-command-'));
  fs.mkdirSync(path.join(consumerRoot, 'node_modules', '@calculogic'), { recursive: true });
  return {
    consumerRoot,
    linkPath: path.join(consumerRoot, 'node_modules', '@calculogic', 'validator'),
    cleanup: () => fs.rmSync(consumerRoot, { recursive: true, force: true }),
  };
};

const createFakeStandaloneCheckout = ({ parentDir, withTestDir = true, packageName = '@calculogic/validator' }) => {
  const checkoutRoot = path.join(parentDir, 'fake-standalone-checkout');
  fs.mkdirSync(checkoutRoot, { recursive: true });
  fs.writeFileSync(
    path.join(checkoutRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: packageName,
        version: '0.0.0',
        scripts: {
          'echo-args': 'node echo-args.mjs',
        },
      },
      null,
      2,
    )}\n`,
  );
  fs.writeFileSync(
    path.join(checkoutRoot, 'echo-args.mjs'),
    "process.stdout.write(JSON.stringify(process.argv.slice(2)) + '\\n');\n" +
      "process.exit(Number(process.env.FAKE_EXIT_CODE || 0));\n",
  );
  if (withTestDir) {
    fs.mkdirSync(path.join(checkoutRoot, 'test'), { recursive: true });
  }
  return checkoutRoot;
};

test('resolveLinkedValidatorCheckout rejects when node_modules/@calculogic/validator does not exist', () => {
  const fixture = createConsumerFixture();
  try {
    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /does not exist/u);
  } finally {
    fixture.cleanup();
  }
});

test('resolveLinkedValidatorCheckout rejects an ordinary installed (non-symlink) package', () => {
  const fixture = createConsumerFixture();
  try {
    fs.mkdirSync(fixture.linkPath, { recursive: true });
    fs.writeFileSync(
      path.join(fixture.linkPath, 'package.json'),
      `${JSON.stringify({ name: '@calculogic/validator' }, null, 2)}\n`,
    );
    fs.mkdirSync(path.join(fixture.linkPath, 'test'), { recursive: true });

    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /ordinary installed package, not a live link/u);
  } finally {
    fixture.cleanup();
  }
});

test('resolveLinkedValidatorCheckout rejects a broken (dangling) symlink', () => {
  const fixture = createConsumerFixture();
  try {
    fs.symlinkSync(path.join(fixture.consumerRoot, 'does-not-exist'), fixture.linkPath, 'dir');

    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /broken symlink/u);
  } finally {
    fixture.cleanup();
  }
});

test('resolveLinkedValidatorCheckout rejects a symlink to an unrelated package', () => {
  const fixture = createConsumerFixture();
  try {
    const unrelatedRoot = createFakeStandaloneCheckout({
      parentDir: fixture.consumerRoot,
      packageName: 'some-other-package',
    });
    fs.symlinkSync(unrelatedRoot, fixture.linkPath, 'dir');

    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /not "@calculogic\/validator"/u);
  } finally {
    fixture.cleanup();
  }
});

test('resolveLinkedValidatorCheckout rejects a symlink to a correctly-named but incomplete (packaged-looking) copy', () => {
  const fixture = createConsumerFixture();
  try {
    const strippedRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot, withTestDir: false });
    fs.symlinkSync(strippedRoot, fixture.linkPath, 'dir');

    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, false);
    assert.match(result.reason, /missing its own test\/ directory/u);
  } finally {
    fixture.cleanup();
  }
});

test('resolveLinkedValidatorCheckout accepts a symlink to a correctly-named, complete checkout', () => {
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = resolveLinkedValidatorCheckout({ cwd: fixture.consumerRoot });
    assert.equal(result.ok, true);
    assert.equal(fs.realpathSync(result.realPath), fs.realpathSync(realRoot));
  } finally {
    fixture.cleanup();
  }
});

const runWrapper = ({ cwd, args }) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [wrapperScriptPath, ...args], {
      cwd,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });

test('dispatch rejects before running anything when not linked, with no downstream side effect', async () => {
  const fixture = createConsumerFixture();
  try {
    fs.mkdirSync(fixture.linkPath, { recursive: true });
    fs.writeFileSync(
      path.join(fixture.linkPath, 'package.json'),
      `${JSON.stringify({ name: '@calculogic/validator', scripts: { 'echo-args': 'node echo-args.mjs' } }, null, 2)}\n`,
    );

    const result = await runWrapper({ cwd: fixture.consumerRoot, args: ['echo-args', '--', 'should-not-run'] });

    assert.notEqual(result.exitCode, 0);
    assert.doesNotMatch(result.stdout, /should-not-run/u);
    assert.match(result.stderr, /ordinary installed package, not a live link/u);
  } finally {
    fixture.cleanup();
  }
});

test('dispatch forwards the standalone script name and all args after -- when linked, and preserves exit code', async () => {
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['echo-args', '--', '--scope=validator', '--target', 'bin', '--target', 'scripts'],
    });

    assert.equal(result.exitCode, 0, result.stderr);
    // npm's own "> pkg@ver script-name" banner precedes the script's actual stdout.
    const jsonLine = result.stdout.split(/\r?\n/u).find((line) => line.trim().startsWith('['));
    const forwarded = JSON.parse(jsonLine);
    assert.deepEqual(forwarded, ['--scope=validator', '--target', 'bin', '--target', 'scripts']);
  } finally {
    fixture.cleanup();
  }
});

test('dispatch preserves a nonzero exit code from the dispatched standalone script', async () => {
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['echo-args'],
    });
    // Re-run with a forced nonzero exit from the fake script.
    const child = spawn(process.execPath, [wrapperScriptPath, 'echo-args'], {
      cwd: fixture.consumerRoot,
      env: { ...process.env, FAKE_EXIT_CODE: '2' },
    });
    const forcedResult = await new Promise((resolve, reject) => {
      let stdout = '';
      child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
      child.on('error', reject);
      child.on('close', (code) => resolve({ exitCode: code, stdout }));
    });

    assert.equal(result.exitCode, 0);
    assert.equal(forcedResult.exitCode, 2);
  } finally {
    fixture.cleanup();
  }
});

// Windows regression coverage (Refs #716 review discussion_r4058498470): child_process.spawn
// with shell:false cannot execute a bare `npm` on Windows, where npm is backed by a `.cmd` (or
// `.bat`/`.exe`) file - Node's own docs describe this exact ENOENT failure mode
// ("Spawning .bat and .cmd files on Windows"). These tests exercise resolveWindowsCommand's
// resolution LOGIC deterministically via injected `platform`/`env`, without mutating the real
// global `process.platform` (which node/npm/the test runner itself depend on) and without an
// actual Windows machine. This proves the resolution algorithm is correct; it does NOT prove the
// resulting path is genuinely spawnable by Windows' CreateProcess/cmd.exe - that requires an
// actual Windows smoke test (documented in the PR, not run here and not claimed as verified here).
test('resolveWindowsCommand is a no-op on non-Windows platforms, regardless of PATH contents', () => {
  const result = resolveWindowsCommand('npm', {
    platform: 'linux',
    env: { PATH: '/usr/bin', PATHEXT: '.COM;.EXE;.BAT;.CMD' },
  });
  assert.equal(result, 'npm');
});

test('resolveWindowsCommand is a no-op when the command already has an extension', () => {
  const result = resolveWindowsCommand('npm.cmd', { platform: 'win32', env: { PATH: '', PATHEXT: '.CMD' } });
  assert.equal(result, 'npm.cmd');
});

test('resolveWindowsCommand resolves a bare command to its .cmd file by searching PATH + PATHEXT on win32', () => {
  const fakePathDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-windows-command-'));
  try {
    const npmCmdPath = path.join(fakePathDir, 'npm.cmd');
    fs.writeFileSync(npmCmdPath, '@echo off\r\n');

    const result = resolveWindowsCommand('npm', {
      platform: 'win32',
      env: { PATH: fakePathDir, PATHEXT: '.COM;.EXE;.BAT;.CMD' },
    });

    assert.equal(result, npmCmdPath);
  } finally {
    fs.rmSync(fakePathDir, { recursive: true, force: true });
  }
});

test('resolveWindowsCommand falls back to the bare command when no PATHEXT candidate exists on win32', () => {
  const emptyPathDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-windows-command-empty-'));
  try {
    const result = resolveWindowsCommand('npm', {
      platform: 'win32',
      env: { PATH: emptyPathDir, PATHEXT: '.COM;.EXE;.BAT;.CMD' },
    });
    assert.equal(result, 'npm');
  } finally {
    fs.rmSync(emptyPathDir, { recursive: true, force: true });
  }
});
