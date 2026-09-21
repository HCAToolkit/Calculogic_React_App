import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  resolveLinkedValidatorCheckout,
  resolveNpmInvocation,
  checkValidatorCheckoutCompatibility,
} from '../scripts/run-validator-dev-command.mjs';

const wrapperScriptPath = path.resolve('scripts/run-validator-dev-command.mjs');

// Locates a real, working npm CLI entry script for the dispatch integration tests below, so they
// exercise genuine end-to-end npm behavior (real arg parsing, real --prefix handling) rather than
// an arbitrary placeholder path. Prefers the inherited npm_execpath (set when this test suite
// itself runs via `npm test`); falls back to the two conventional relative-to-node layouts every
// official Node.js distribution bundles npm under, since these tests may also run via a bare
// `node --test`, which does not set npm_execpath. Returns null (tests below then skip) rather than
// hardcoding a single OS's layout, since this is test-fixture bootstrapping, not production logic.
const findRealNpmExecPath = () => {
  if (process.env.npm_execpath && fs.existsSync(process.env.npm_execpath)) {
    return process.env.npm_execpath;
  }

  const nodeBinDir = path.dirname(process.execPath);
  const candidates = [
    path.join(nodeBinDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'), // Unix layout
    path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'), // Windows layout
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};

const realNpmExecPath = findRealNpmExecPath();

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

const createFakeStandaloneCheckout = ({
  parentDir,
  withTestDir = true,
  packageName = '@calculogic/validator',
  extraScripts = {},
}) => {
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
          ...extraScripts,
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

// Writes minimal stand-ins for the two standalone scripts checkValidatorCheckoutCompatibility
// inspects, in either their real pre-#24/#25 (broken) or fixed shape - just enough source text to
// exercise the substring checks, not functioning implementations (checkValidatorCheckoutCompatibility
// never executes them). Mirrors the exact statements the real fix commits introduced/removed:
// resolveValidatorDevelopmentContext being imported at all (PR #24), and the old embedded-nested
// "calculogic-validator/" path prefix being absent (PR #25).
const writeCompatibilityFixtureScripts = (
  checkoutRoot,
  { addressingGetTreeFixed = true, reportVerifyFixed = true } = {},
) => {
  fs.mkdirSync(path.join(checkoutRoot, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(checkoutRoot, 'scripts', 'addressing-get-tree.host.mjs'),
    addressingGetTreeFixed
      ? "import { resolveValidatorDevelopmentContext } from '../src/core/validator-development-context.logic.mjs';\n"
      : '// pre-#24 stub: does not wire in the identity contract from src/core\n',
  );
  fs.writeFileSync(
    path.join(checkoutRoot, 'scripts', 'report-capture-verify.host.mjs'),
    reportVerifyFixed
      ? "const hostPath = path.resolve(repositoryRoot, 'tools/report-capture/src/report-capture.host.mjs');\n"
      : "const hostPath = path.resolve(repositoryRoot, 'calculogic-validator/tools/report-capture/src/report-capture.host.mjs');\n",
  );
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

// Compatibility coverage (Refs #716 review discussion_r4058819696): resolveLinkedValidatorCheckout
// alone proves the link points at a complete, correctly-named standalone checkout - it says nothing
// about whether that checkout's own addressing-get-tree.host.mjs / report-capture-verify.host.mjs
// actually carry the PR #24 / #25 root-resolution fixes. The devcontainer's checkout helper leaves a
// pre-existing sibling checkout untouched, so an older, structurally-valid checkout can stay linked
// indefinitely. These tests use writeCompatibilityFixtureScripts's stand-ins directly (no real
// standalone dependency graph needed) to exercise checkValidatorCheckoutCompatibility's own accept/
// reject logic in isolation, then the dispatch-level tests below confirm the same distinction holds
// through the real CLI entrypoint.
const withTempCheckout = (callback) => {
  const parentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'checkout-compatibility-'));
  try {
    return callback(parentDir);
  } finally {
    fs.rmSync(parentDir, { recursive: true, force: true });
  }
};

test('checkValidatorCheckoutCompatibility has no requirement for a script name outside its known list', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    // No scripts/ directory written at all - proves this is a no-op for unrelated commands,
    // not merely "passes because the right files happen to be present".
    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'echo-args' });
    assert.equal(result.ok, true);
  });
});

test('checkValidatorCheckoutCompatibility rejects addressing:get-tree against a pre-#24 checkout', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    writeCompatibilityFixtureScripts(checkoutRoot, { addressingGetTreeFixed: false });

    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'addressing:get-tree' });
    assert.equal(result.ok, false);
    assert.match(result.reason, /predates the addressing:get-tree standalone-root fix \(PR #24/u);
    assert.match(result.reason, /resolveValidatorDevelopmentContext/u);
  });
});

test('checkValidatorCheckoutCompatibility accepts addressing:get-tree against a post-#24 checkout', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    writeCompatibilityFixtureScripts(checkoutRoot, { addressingGetTreeFixed: true });

    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'addressing:get-tree' });
    assert.equal(result.ok, true);
  });
});

test('checkValidatorCheckoutCompatibility rejects report:verify against a pre-#25 checkout', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    writeCompatibilityFixtureScripts(checkoutRoot, { reportVerifyFixed: false });

    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'report:verify' });
    assert.equal(result.ok, false);
    assert.match(result.reason, /predates the report:verify standalone-root fix \(PR #25/u);
    assert.match(result.reason, /old embedded-nested "calculogic-validator\/" prefix/u);
  });
});

test('checkValidatorCheckoutCompatibility accepts report:verify against a post-#25 checkout', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    writeCompatibilityFixtureScripts(checkoutRoot, { reportVerifyFixed: true });

    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'report:verify' });
    assert.equal(result.ok, true);
  });
});

test('checkValidatorCheckoutCompatibility rejects when the required script is missing entirely', () => {
  withTempCheckout((parentDir) => {
    const checkoutRoot = createFakeStandaloneCheckout({ parentDir });
    // No scripts/ directory at all - simulates a checkout old or restructured enough that the
    // dispatched script does not exist yet at its expected path.
    const result = checkValidatorCheckoutCompatibility({ realPath: checkoutRoot, scriptName: 'report:verify' });
    assert.equal(result.ok, false);
    assert.match(result.reason, /could not be read/u);
  });
});

const runWrapper = ({ cwd, args, env = process.env }) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [wrapperScriptPath, ...args], {
      cwd,
      env,
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

test('dispatch rejects clearly, without invoking npm, when linked to a structurally-valid but pre-#24 checkout', async () => {
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    writeCompatibilityFixtureScripts(realRoot, { addressingGetTreeFixed: false });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['addressing:get-tree', '--', 'should-not-run'],
    });

    assert.notEqual(result.exitCode, 0);
    // Empty stdout - not just "no should-not-run" - proves npm itself was never invoked (no
    // "> fake-standalone-checkout@... addressing:get-tree" banner), not just that the dispatched
    // script happened not to run.
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /predates the addressing:get-tree standalone-root fix \(PR #24/u);
  } finally {
    fixture.cleanup();
  }
});

test('dispatch reaches real npm dispatch when linked to a post-#24/#25 checkout', async (t) => {
  if (!realNpmExecPath) {
    t.skip('No real npm CLI entry script could be located in this environment.');
    return;
  }
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({
      parentDir: fixture.consumerRoot,
      extraScripts: { 'addressing:get-tree': 'node echo-args.mjs' },
    });
    writeCompatibilityFixtureScripts(realRoot, { addressingGetTreeFixed: true, reportVerifyFixed: true });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['addressing:get-tree', '--', '--scope=validator'],
      env: { ...process.env, npm_execpath: realNpmExecPath },
    });

    assert.equal(result.exitCode, 0, result.stderr);
    const jsonLine = result.stdout.split(/\r?\n/u).find((line) => line.trim().startsWith('['));
    assert.deepEqual(JSON.parse(jsonLine), ['--scope=validator']);
  } finally {
    fixture.cleanup();
  }
});

const spawnAndCollect = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => resolve({ exitCode: code ?? 1, stdout, stderr }));
  });

// End-to-end regression coverage (Refs #716 review discussion_r4058875446): npm's own
// "> pkg@ver script\n> command\n\n" lifecycle banner used to land, verbatim, in the same stdout
// stream a wrapping `calculogic-report-capture` invocation captures into its report .txt file -
// ahead of the dispatched standalone script's own JSON - making the whole captured file invalid
// JSON for report-capture-summarize.host.mjs (report:summarize) to parse. This test does not settle
// for "the report file exists" or "the capture command exited 0" - it JSON.parse's the captured
// file's exact byte content directly, then separately proves the real, unmodified
// report-capture-summarize.host.mjs (not a reimplementation of its parsing) can read it back
// through its own --strict CLI, driven through the real calculogic-report-capture binary and the
// real npm CLI end to end, the same path report:naming:validator:* actually takes.
test('end-to-end: a live-linked report preset produces a JSON capture that report:summarize can parse', async (t) => {
  if (!realNpmExecPath) {
    t.skip('No real npm CLI entry script could be located in this environment.');
    return;
  }
  const fixture = createConsumerFixture();
  const reportsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-capture-e2e-'));
  try {
    const fixtureReport = { mode: 'report', scope: 'validator', findings: [], totalFilesScanned: 3 };
    const realRoot = createFakeStandaloneCheckout({
      parentDir: fixture.consumerRoot,
      extraScripts: { 'naming-json': 'node naming-json.mjs' },
    });
    fs.writeFileSync(
      path.join(realRoot, 'naming-json.mjs'),
      `process.stdout.write(${JSON.stringify(JSON.stringify(fixtureReport))} + '\\n');\n`,
    );
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const reportCaptureScriptPath = fs.realpathSync(path.resolve('node_modules/.bin/calculogic-report-capture'));
    const summarizeScriptPath = path.resolve('calculogic-validator/scripts/report-capture-summarize.host.mjs');
    const prefix = 'e2e-naming-json';

    const captureResult = await spawnAndCollect(
      process.execPath,
      [
        reportCaptureScriptPath,
        '--json',
        '--dir',
        reportsDir,
        '--keep',
        '20',
        '--prefix',
        prefix,
        '--',
        process.execPath,
        wrapperScriptPath,
        'naming-json',
      ],
      { cwd: fixture.consumerRoot, env: { ...process.env, npm_execpath: realNpmExecPath } },
    );
    assert.equal(captureResult.exitCode, 0, captureResult.stderr);

    const reportFiles = fs.readdirSync(reportsDir).filter((name) => name.startsWith(`${prefix}-`));
    assert.equal(reportFiles.length, 1, `expected exactly one captured report, found: ${reportFiles.join(', ')}`);
    const rawReport = fs.readFileSync(path.join(reportsDir, reportFiles[0]), 'utf8');
    assert.deepEqual(JSON.parse(rawReport), fixtureReport);

    const summarizeResult = await spawnAndCollect(process.execPath, [
      summarizeScriptPath,
      `--dir=${reportsDir}`,
      `--prefixes=${prefix}`,
      '--strict',
    ]);
    assert.equal(summarizeResult.exitCode, 0, summarizeResult.stderr);
    assert.doesNotMatch(summarizeResult.stderr, /FAIL/u);
    assert.match(summarizeResult.stdout, new RegExp(`=== ${prefix} \\(latest\\) ===`, 'u'));
  } finally {
    fixture.cleanup();
    fs.rmSync(reportsDir, { recursive: true, force: true });
  }
});

test('dispatch forwards the standalone script name and all args after -- when linked, and preserves exit code', async (t) => {
  if (!realNpmExecPath) {
    t.skip('No real npm CLI entry script could be located in this environment.');
    return;
  }
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['echo-args', '--', '--scope=validator', '--target', 'bin', '--target', 'scripts'],
      env: { ...process.env, npm_execpath: realNpmExecPath },
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

test('dispatch preserves a nonzero exit code from the dispatched standalone script', async (t) => {
  if (!realNpmExecPath) {
    t.skip('No real npm CLI entry script could be located in this environment.');
    return;
  }
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['echo-args'],
      env: { ...process.env, npm_execpath: realNpmExecPath },
    });
    // Re-run with a forced nonzero exit from the fake script.
    const child = spawn(process.execPath, [wrapperScriptPath, 'echo-args'], {
      cwd: fixture.consumerRoot,
      env: { ...process.env, npm_execpath: realNpmExecPath, FAKE_EXIT_CODE: '2' },
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

// Cross-platform dispatch coverage (Refs #716 review discussion_r4058498470, second pass):
// locating npm.cmd (the prior fix) does not make it spawnable - child_process.spawn with
// shell:false cannot execute a .cmd/.bat file at all, on any path; only cmd.exe can (Node's own
// "Spawning .bat and .cmd files on Windows" doc). The actual fix re-invokes npm's own CLI
// JavaScript entry point through node itself (`process.execPath <npm_execpath>`), which is always
// a real, natively executable binary - the same code path runs on every platform, with no
// .cmd/.bat/shell resolution and no shell quoting surface at all. These unit tests prove
// resolveNpmInvocation's LOGIC is correct on this platform. Combined with the dispatch-level
// integration tests above (which use this exact mechanism to run a real npm subprocess
// end-to-end) and below (which prove the correct, non-silent failure when npm_execpath is
// absent), this demonstrates the mechanism itself is genuinely platform-independent - the only
// per-platform variable is the npm_execpath value npm supplies, not this code's own behavior.
// What is NOT verified here, and is not claimed as verified: that Windows' own CreateProcess can
// actually launch `process.execPath` with a Windows-style npm_execpath value end-to-end. A focused
// Windows smoke test is documented in the PR for that.
test('resolveNpmInvocation rejects with a clear, actionable reason when npm_execpath is absent', () => {
  const result = resolveNpmInvocation({ env: {} });
  assert.equal(result.ok, false);
  assert.match(result.reason, /npm_execpath was not found/u);
  assert.match(result.reason, /npm run <script>/u);
});

test('resolveNpmInvocation resolves to a node-direct invocation of the given npm_execpath when present', () => {
  const result = resolveNpmInvocation({ env: { npm_execpath: '/fake/path/to/npm-cli.js' } });
  assert.equal(result.ok, true);
  assert.equal(result.command, process.execPath);
  assert.deepEqual(result.prefixArgs, ['/fake/path/to/npm-cli.js']);
});

test('dispatch rejects clearly, without running the standalone script, when linked but npm_execpath is absent', async () => {
  const fixture = createConsumerFixture();
  try {
    const realRoot = createFakeStandaloneCheckout({ parentDir: fixture.consumerRoot });
    fs.symlinkSync(realRoot, fixture.linkPath, 'dir');

    const envWithoutNpmExecpath = { ...process.env };
    delete envWithoutNpmExecpath.npm_execpath;

    const result = await runWrapper({
      cwd: fixture.consumerRoot,
      args: ['echo-args', '--', 'should-not-run'],
      env: envWithoutNpmExecpath,
    });

    assert.notEqual(result.exitCode, 0);
    assert.doesNotMatch(result.stdout, /should-not-run/u);
    assert.match(result.stderr, /npm_execpath was not found/u);
  } finally {
    fixture.cleanup();
  }
});
