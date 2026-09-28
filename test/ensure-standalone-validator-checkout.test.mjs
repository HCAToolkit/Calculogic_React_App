// Tests for the devcontainer checkout helper (Refs #713).
// Contract: doc/nl-shell/shell-devcontainerBaseline.md §2.2 and §5.2.3.
//
// Each test runs the real helper script inside a temporary React-app fixture repository. The
// helper's GitHub remote is redirected to a local bare repository through Git's environment
// configuration (url.<local>.insteadOf), so first-time clones are exercised without network access
// and without changing the helper.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HELPER_NAME = 'ensure-standalone-validator-checkout.sh';
const helperSourcePath = path.resolve('.devcontainer', HELPER_NAME);
const VALIDATOR_REMOTE = fs
  .readFileSync(helperSourcePath, 'utf8')
  .match(/^VALIDATOR_REMOTE="([^"]+)"$/mu)[1];
const INSIDE_APP_MESSAGE = /is inside the React app checkout/u;

// The helper is a bash script; hosts without bash (for example plain Windows) cannot run it.
const bashUnavailable =
  spawnSync('bash', ['--version']).status !== 0 && 'bash is not available on this host';

const git = (cwd, ...args) => {
  const result = spawnSync(
    'git',
    ['-c', 'user.name=fixture', '-c', 'user.email=fixture@invalid', ...args],
    { cwd, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
};

const createRepository = (directory, packageName) => {
  fs.mkdirSync(directory, { recursive: true });
  git(directory, 'init', '-q');
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    `${JSON.stringify({ name: packageName })}\n`,
  );
  git(directory, 'add', '.');
  git(directory, 'commit', '-qm', 'fixture');
};

// Builds <root>/workspaces/Calculogic_React_App (a committed Git repository holding the helper) and
// a local bare repository standing in for the standalone validator remote.
const createWorkspace = (t) => {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'ensure-validator-checkout-')),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const workspaces = path.join(root, 'workspaces');
  const app = path.join(workspaces, 'Calculogic_React_App');
  fs.mkdirSync(path.join(app, '.devcontainer'), { recursive: true });
  fs.copyFileSync(helperSourcePath, path.join(app, '.devcontainer', HELPER_NAME));
  createRepository(app, 'calculogic-react-app');

  const remoteSource = path.join(root, 'remote-source');
  createRepository(remoteSource, '@calculogic/validator');
  const remote = path.join(root, 'remote.git');
  git(root, 'clone', '-q', '--bare', remoteSource, remote);
  return {
    root,
    workspaces,
    app,
    remote,
    defaultCheckout: path.join(workspaces, 'calculogic-validator'),
  };
};

const runHelper = (workspace, { override, cwd = workspace.app } = {}) =>
  spawnSync('bash', [path.join(workspace.app, '.devcontainer', HELPER_NAME)], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      // An empty value makes the helper use its default sibling location.
      CALCULOGIC_VALIDATOR_CHECKOUT: override ?? '',
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: `url.${workspace.remote}.insteadOf`,
      GIT_CONFIG_VALUE_0: VALIDATOR_REMOTE,
    },
  });

const packageNameAt = (directory) =>
  JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')).name;
const appStatus = (workspace) =>
  git(workspace.app, 'status', '--porcelain', '--untracked-files=all');

const assertClonedCheckout = (result, checkout) => {
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Standalone validator checkout ready\./u);
  assert.equal(git(checkout, 'rev-parse', '--show-toplevel'), checkout);
  assert.equal(packageNameAt(checkout), '@calculogic/validator');
};

const assertRejectedInsideApp = (workspace, result, { mustNotExist } = {}) => {
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, INSIDE_APP_MESSAGE);
  assert.doesNotMatch(result.stdout, /Cloning/u);
  assert.equal(appStatus(workspace), '', 'the React app checkout must be left unchanged');
  if (mustNotExist) {
    assert.equal(fs.existsSync(mustNotExist), false, `${mustNotExist} must not be created`);
  }
};

// --- Positive cases: default sibling checkout and valid external overrides.

test(
  'default sibling checkout: clones beside the React app when absent',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    assertClonedCheckout(runHelper(workspace), workspace.defaultCheckout);
    assert.equal(appStatus(workspace), '');
  },
);

test(
  'default sibling checkout: an existing valid checkout is accepted and left unchanged',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    assertClonedCheckout(runHelper(workspace), workspace.defaultCheckout);
    const headBefore = git(workspace.defaultCheckout, 'rev-parse', 'HEAD');

    const rerun = runHelper(workspace);
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.match(rerun.stdout, /Standalone validator checkout already available at:/u);
    assert.equal(git(workspace.defaultCheckout, 'rev-parse', 'HEAD'), headBefore);
  },
);

test(
  'external override: clones to an absent location outside the React app',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const checkout = path.join(workspace.root, 'elsewhere', 'validator');
    assertClonedCheckout(runHelper(workspace, { override: checkout }), checkout);
    assert.equal(fs.existsSync(workspace.defaultCheckout), false);
  },
);

test(
  'external override: an existing valid checkout outside the React app is accepted',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const checkout = path.join(workspace.root, 'existing-validator');
    createRepository(checkout, '@calculogic/validator');

    const result = runHelper(workspace, { override: checkout });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /already available at:/u);
  },
);

test(
  'external override: a sibling whose name only starts with the app directory name is outside the app',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const checkout = `${workspace.app}-validator`;
    assertClonedCheckout(runHelper(workspace, { override: checkout }), checkout);
  },
);

// --- Rejected: locations that resolve to the React app root or inside it.

test(
  'override inside the app: the retired embedded path is rejected instead of cloned into the app',
  { skip: bashUnavailable },
  (t) => {
    // The formerly untested scenario: with no embedded tree present, the helper used to clone the
    // standalone repository to <app>/calculogic-validator.
    const workspace = createWorkspace(t);
    const nested = path.join(workspace.app, 'calculogic-validator');
    assertRejectedInsideApp(workspace, runHelper(workspace, { override: nested }), {
      mustNotExist: nested,
    });
  },
);

test(
  'override inside the app: an existing embedded package directory is rejected and left unchanged',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const embedded = path.join(workspace.app, 'calculogic-validator');
    fs.mkdirSync(embedded);
    fs.writeFileSync(
      path.join(embedded, 'package.json'),
      `${JSON.stringify({ name: '@calculogic/validator' })}\n`,
    );
    git(workspace.app, 'add', '.');
    git(workspace.app, 'commit', '-qm', 'embedded fixture');

    assertRejectedInsideApp(workspace, runHelper(workspace, { override: embedded }));
  },
);

test(
  'override inside the app: the React app root itself is rejected',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    assertRejectedInsideApp(workspace, runHelper(workspace, { override: workspace.app }));
  },
);

test(
  'override inside the app: relative paths are resolved from the current directory',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    assertRejectedInsideApp(workspace, runHelper(workspace, { override: 'calculogic-validator' }), {
      mustNotExist: path.join(workspace.app, 'calculogic-validator'),
    });
    assertRejectedInsideApp(
      workspace,
      runHelper(workspace, { override: 'nested/deeper/validator' }),
      {
        mustNotExist: path.join(workspace.app, 'nested'),
      },
    );
    assertRejectedInsideApp(
      workspace,
      runHelper(workspace, { override: '../Calculogic_React_App/validator', cwd: workspace.app }),
      {
        mustNotExist: path.join(workspace.app, 'validator'),
      },
    );
  },
);

test(
  'override inside the app: a symbolic link outside the app that points into it is followed and rejected',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const link = path.join(workspace.root, 'link-into-app');
    fs.symlinkSync(workspace.app, link, 'dir');
    assertRejectedInsideApp(
      workspace,
      runHelper(workspace, { override: path.join(link, 'validator') }),
      {
        mustNotExist: path.join(workspace.app, 'validator'),
      },
    );
  },
);

// --- Preserved: the existing standalone-checkout validation outside the app.

test(
  'existing validation: a non-Git directory outside the app is rejected rather than overwritten',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const directory = path.join(workspace.root, 'not-a-checkout');
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'keep.txt'), 'keep\n');

    const result = runHelper(workspace, { override: directory });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /exists but is not the @calculogic\/validator Git worktree root/u);
    assert.deepEqual(fs.readdirSync(directory), ['keep.txt']);
  },
);

test(
  'existing validation: a Git root for a different package is rejected',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const other = path.join(workspace.root, 'other-package');
    createRepository(other, 'some-other-package');

    const result = runHelper(workspace, { override: other });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /exists but is not the @calculogic\/validator Git worktree root/u);
  },
);

test(
  'existing validation: a subdirectory of a validator checkout is rejected',
  { skip: bashUnavailable },
  (t) => {
    const workspace = createWorkspace(t);
    const checkout = path.join(workspace.root, 'validator-checkout');
    createRepository(checkout, '@calculogic/validator');
    const subdirectory = path.join(checkout, 'doc');
    fs.mkdirSync(subdirectory);

    const result = runHelper(workspace, { override: subdirectory });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /exists but is not the @calculogic\/validator Git worktree root/u);
  },
);
