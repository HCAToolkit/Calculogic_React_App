// Tests for the offline Validator pin-consistency check (Refs #713).
// Contract: doc/nl-config/cfg-validatorPinConsistency.md.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  INSTALLATION_RECORD_LIMITATION,
  evaluateValidatorPin,
  extractPinnedLinks,
  formatValidatorPinReport,
  parseCommitFromSpec,
} from '../scripts/validator-pin/validator-pin-consistency.logic.mjs';
import {
  CHECKOUT_ENVIRONMENT_VARIABLE,
  collectValidatorPinInputs,
  probeInstallation,
  readTrackedTextFiles,
  resolveCheckout,
} from '../scripts/validator-pin/validator-pin-inputs.host.mjs';
import { VALIDATOR_PIN_LINK_REGISTRY } from '../scripts/validator-pin/validator-pin-links.knowledge.mjs';

const PIN = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);
const INTEGRITY = 'sha512-pinned';
const BLOB = 'https://github.com/HCAToolkit/calculogic-validator/blob/';

const spec = (commit) => `git+https://github.com/HCAToolkit/calculogic-validator.git#${commit}`;
const linkTo = (commit, targetPath) => `See [\`${targetPath}\`](${BLOB}${commit}/${targetPath}).\n`;

const buildInputs = ({
  packageCommit = PIN,
  lockRootCommit = PIN,
  lockResolvedCommit = PIN,
  lockIntegrity = INTEGRITY,
  linkCommits = {},
  documentOverrides = {},
  extraTrackedFiles = [],
  scanFailures = [],
  installation,
  checkout = null,
} = {}) => {
  const documents = new Map(
    VALIDATOR_PIN_LINK_REGISTRY.map(({ id, sourceDocument, targetPath }) => [
      sourceDocument,
      documentOverrides[id] ?? linkTo(linkCommits[id] ?? PIN, targetPath),
    ]),
  );
  return {
    packageJson: { devDependencies: { '@calculogic/validator': spec(packageCommit) } },
    packageLock: {
      packages: {
        '': { devDependencies: { '@calculogic/validator': spec(lockRootCommit) } },
        'node_modules/@calculogic/validator': {
          resolved: `git+ssh://git@github.com/HCAToolkit/calculogic-validator.git#${lockResolvedCommit}`,
          integrity: lockIntegrity,
        },
      },
    },
    documents,
    trackedFiles: [...[...documents].map(([filePath, content]) => ({ path: filePath, content })), ...extraTrackedFiles],
    scanFailures,
    installation: installation ?? stableInstallation(),
    checkout,
  };
};

function stableInstallation({ commit = PIN, integrity = INTEGRITY, hiddenLockPresent = true, entryPresent = true, missingFiles = [] } = {}) {
  return {
    kind: 'directory',
    hiddenLockPresent,
    hiddenLockEntry: hiddenLockPresent && entryPresent
      ? { resolved: `git+ssh://git@github.com/HCAToolkit/calculogic-validator.git#${commit}`, integrity }
      : null,
    installedFileExists: (relativePath) => !missingFiles.includes(relativePath),
  };
}

const linkedInstallation = ({ ok = true } = {}) => ({
  kind: 'symlink',
  link: ok ? { ok: true, realPath: '/work/calculogic-validator', head: OTHER } : { ok: false, reason: 'broken symlink' },
});

const checkoutProbe = ({ commits = [PIN], missingPaths = [] } = {}) => ({
  path: '/work/calculogic-validator',
  source: '--checkout',
  hasCommit: (commit) => commits.includes(commit),
  fileExistsAtCommit: (_commit, relativePath) => !missingPaths.includes(relativePath),
});

const statusesById = (result) => Object.fromEntries(result.targets.map(({ id, status }) => [id, status]));

// --- parsing -------------------------------------------------------------------------------

test('commit ids are parsed from https and ssh specs, and short or missing ids are rejected', () => {
  assert.equal(parseCommitFromSpec(spec(PIN)), PIN);
  assert.equal(parseCommitFromSpec(`git+ssh://git@github.com/x/y.git#${PIN}`), PIN);
  assert.equal(parseCommitFromSpec('git+https://github.com/x/y.git#abc1234'), null);
  assert.equal(parseCommitFromSpec('^1.2.3'), null);
  assert.deepEqual(extractPinnedLinks(linkTo('cd1bc42', 'doc/a.md')), [{ commit: 'cd1bc42', targetPath: 'doc/a.md' }]);
});

// --- positive states -----------------------------------------------------------------------

test('consistent stable installation: packaged targets verified offline, unpackaged unverified', () => {
  const result = evaluateValidatorPin(buildInputs());

  assert.equal(result.status, 'consistent');
  assert.deepEqual(statusesById(result), {
    ccpp: 'verified',
    ccs: 'verified',
    'tree-structure-advisor': 'unverified',
    'naming-validator': 'unverified',
    'validator-runner': 'unverified',
  });
  for (const target of result.unverifiedTargets) {
    assert.match(target.reason, /no standalone checkout/u);
  }
  assert.ok(formatValidatorPinReport(result).includes(`note: ${INSTALLATION_RECORD_LIMITATION}`));
});

test('a standalone checkout containing the declared commit verifies all five targets', () => {
  const result = evaluateValidatorPin(buildInputs({ checkout: checkoutProbe() }));

  assert.equal(result.status, 'consistent');
  assert.deepEqual(new Set(Object.values(statusesById(result))), new Set(['verified']));
});

test('linked development passes but is labelled and never counted as stable-install consistency', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: linkedInstallation() }));

  assert.equal(result.status, 'linked-development');
  assert.notEqual(result.status, 'consistent');
  assert.match(result.installation.message, /stable-install consistency is not verified/u);
  // Without a checkout, packaged targets cannot be verified through a linked (non-pinned) copy.
  assert.equal(statusesById(result).ccpp, 'unverified');
  assert.match(result.targets[0].reason, /stable-install consistency was not established/u);
  const report = formatValidatorPinReport(result);
  assert.ok(report.includes('result: linked-development'));
  assert.ok(!report.some((line) => line.includes(INSTALLATION_RECORD_LIMITATION)));
});

test('a checkout that lacks the declared commit leaves targets unverified with a fetch hint', () => {
  const result = evaluateValidatorPin(buildInputs({ checkout: checkoutProbe({ commits: [OTHER] }) }));

  assert.equal(result.status, 'consistent');
  assert.equal(statusesById(result)['naming-validator'], 'unverified');
  assert.match(result.unverifiedTargets[0].reason, /does not contain commit aaaaaaa \(fetch it\)/u);
});

// --- deliberate breaks ---------------------------------------------------------------------

test('break: a stale link pin fails check 2a', () => {
  const result = evaluateValidatorPin(buildInputs({ linkCommits: { ccs: OTHER } }));

  assert.equal(result.status, 'failed');
  assert.match(result.linkPins.results.find(({ id }) => id === 'ccs').message, /link pins bbbbbbb, declared pin is aaaaaaa/u);
});

test('break: a stale link pin still fails during linked development', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: linkedInstallation(), linkCommits: { 'validator-runner': OTHER } }));

  assert.equal(result.status, 'failed');
});

test('break: a short commit id in a link fails check 2a', () => {
  const result = evaluateValidatorPin(buildInputs({ linkCommits: { ccpp: 'aaaaaaa' } }));

  assert.equal(result.status, 'failed');
});

test('break: a link to a different target path fails check 2a', () => {
  const result = evaluateValidatorPin(buildInputs({ documentOverrides: { ccpp: linkTo(PIN, 'doc/ConventionRoutines/CCS.md') } }));

  assert.equal(result.status, 'failed');
  assert.match(result.linkPins.results[0].message, /registered target is doc\/ConventionRoutines\/CCPP\.md/u);
});

test('break: package.json and package-lock.json disagree fails check 1', () => {
  const result = evaluateValidatorPin(buildInputs({ packageCommit: OTHER }));

  assert.equal(result.status, 'failed');
  assert.match(result.declaredPin.message, /package\.json=bbbbbbb, package-lock\.json root=aaaaaaa/u);
});

test('break: lockfile root and resolved entry disagree fails check 1', () => {
  const result = evaluateValidatorPin(buildInputs({ lockResolvedCommit: OTHER }));

  assert.equal(result.status, 'failed');
  assert.match(result.declaredPin.message, /package-lock\.json resolved=bbbbbbb/u);
});

test('break: a packaged target missing from the installed package fails check 2b', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: stableInstallation({ missingFiles: ['doc/ConventionRoutines/CCPP.md'] }) }));

  assert.equal(result.status, 'failed');
  assert.equal(statusesById(result).ccpp, 'missing');
});

test('break: an unpackaged target missing at the declared commit fails check 2b', () => {
  const result = evaluateValidatorPin(buildInputs({
    checkout: checkoutProbe({ missingPaths: ['doc/ValidatorSpecs/nl-config/cfg-validatorRunner.md'] }),
  }));

  assert.equal(result.status, 'failed');
  assert.equal(statusesById(result)['validator-runner'], 'missing');
});

test('break: a stale installation (installed from another commit) fails check 3', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: stableInstallation({ commit: OTHER, integrity: 'sha512-old' }) }));

  assert.equal(result.status, 'failed');
  assert.match(result.installation.message, /stale installation: npm installed bbbbbbb, declared pin is aaaaaaa; run npm ci/u);
});

test('break: only the installed integrity differing fails check 3', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: stableInstallation({ integrity: 'sha512-other' }) }));

  assert.equal(result.status, 'failed');
  assert.match(result.installation.message, /installed integrity differs/u);
});

test('break: a missing hidden lockfile, a missing entry, or no installation fails check 3', () => {
  for (const [installation, expectedMessage] of [
    [stableInstallation({ hiddenLockPresent: false }), /node_modules\/\.package-lock\.json is missing, so the installation is unknown; run npm ci/u],
    [stableInstallation({ entryPresent: false }), /has no node_modules\/@calculogic\/validator entry; run npm ci/u],
    [{ kind: 'missing' }, /is not installed; run npm ci/u],
  ]) {
    const result = evaluateValidatorPin(buildInputs({ installation }));
    assert.equal(result.status, 'failed', JSON.stringify(installation));
    assert.match(result.installation.message, expectedMessage);
  }
});

test('break: an invalid npm link fails check 3', () => {
  const result = evaluateValidatorPin(buildInputs({ installation: linkedInstallation({ ok: false }) }));

  assert.equal(result.status, 'failed');
  assert.match(result.installation.message, /invalid npm link: broken symlink/u);
});

test('break: an unregistered pinned link fails the discovery guard; the embedded tree is excluded', () => {
  const unregistered = { path: 'README.md', content: linkTo(PIN, 'doc/ConventionRoutines/CCPP.md') };
  const embedded = { path: 'calculogic-validator/doc/x.md', content: linkTo(OTHER, 'doc/y.md') };

  const failed = evaluateValidatorPin(buildInputs({ extraTrackedFiles: [unregistered] }));
  assert.equal(failed.status, 'failed');
  assert.deepEqual(failed.linkPins.unregistered.map(({ path: filePath }) => filePath), ['README.md']);

  assert.equal(evaluateValidatorPin(buildInputs({ extraTrackedFiles: [embedded] })).status, 'consistent');
});

test('uppercase commit ids are recognized and normalized to lowercase', () => {
  assert.deepEqual(extractPinnedLinks(linkTo(PIN.toUpperCase(), 'doc/a.md')), [{ commit: PIN, targetPath: 'doc/a.md' }]);
  assert.equal(parseCommitFromSpec(spec(PIN.toUpperCase())), PIN);
  // A registered link written in uppercase that names the declared commit is consistent...
  assert.equal(evaluateValidatorPin(buildInputs({ linkCommits: { ccpp: PIN.toUpperCase() } })).status, 'consistent');
  // ...and one naming another commit is still caught.
  assert.equal(evaluateValidatorPin(buildInputs({ linkCommits: { ccpp: OTHER.toUpperCase() } })).status, 'failed');
});

test('break: an unregistered pinned link with an uppercase commit id fails the discovery guard', () => {
  const uppercase = { path: 'doc/new-note.md', content: linkTo(PIN.toUpperCase(), 'doc/ConventionRoutines/CCPP.md') };
  const result = evaluateValidatorPin(buildInputs({ extraTrackedFiles: [uppercase] }));

  assert.equal(result.status, 'failed');
  assert.deepEqual(result.linkPins.unregistered.map(({ path: filePath, commit }) => [filePath, commit]), [['doc/new-note.md', PIN]]);
});

test('break: an incomplete scan (any unreadable tracked file) fails instead of passing', () => {
  const result = evaluateValidatorPin(buildInputs({
    scanFailures: [{ path: 'doc/unreadable.md', reason: 'unreadable in the working tree (EACCES) and in the index (fatal)' }],
  }));

  assert.equal(result.status, 'failed');
  assert.equal(result.linkPins.ok, false);
  assert.ok(formatValidatorPinReport(result).includes(
    'FAIL check 2a doc/unreadable.md: tracked file could not be scanned (unreadable in the working tree (EACCES) and in the index (fatal))',
  ));
});

// --- input host ----------------------------------------------------------------------------

const git = (cwd, ...args) => {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout;
};

test('input host: tracked files missing from a sparse checkout are read from the index, not skipped', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-pin-sparse-'));
  try {
    git(root, 'init', '-q');
    fs.mkdirSync(path.join(root, 'kept'));
    fs.mkdirSync(path.join(root, 'sparse'));
    fs.writeFileSync(path.join(root, 'kept', 'a.md'), 'kept\n');
    fs.writeFileSync(path.join(root, 'sparse', 'b.md'), linkTo(PIN.toUpperCase(), 'doc/ConventionRoutines/CCPP.md'));
    git(root, 'add', '.');
    git(root, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'fixture');
    git(root, 'sparse-checkout', 'set', 'kept');
    assert.equal(fs.existsSync(path.join(root, 'sparse', 'b.md')), false, 'sparse checkout should remove the file from the working tree');

    const scan = readTrackedTextFiles(root);
    assert.deepEqual(scan.failures, []);
    assert.deepEqual(scan.files.map(({ path: filePath }) => filePath).sort(), ['kept/a.md', 'sparse/b.md']);
    assert.deepEqual(extractPinnedLinks(scan.files.find(({ path: filePath }) => filePath === 'sparse/b.md').content), [
      { commit: PIN, targetPath: 'doc/ConventionRoutines/CCPP.md' },
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('input host: a tracked path readable neither in the working tree nor the index is a scan failure', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-pin-unreadable-'));
  try {
    git(root, 'init', '-q');
    const scan = readTrackedTextFiles(root, { trackedPaths: ['doc/missing.md'] });
    assert.deepEqual(scan.files, []);
    assert.equal(scan.failures.length, 1);
    assert.equal(scan.failures[0].path, 'doc/missing.md');
    assert.match(scan.failures[0].reason, /unreadable in the working tree \(ENOENT\) and in the index/u);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});


test('input host: a real package directory without a hidden lockfile is reported as such', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-pin-probe-'));
  try {
    fs.mkdirSync(path.join(root, 'node_modules', '@calculogic', 'validator'), { recursive: true });
    const installation = probeInstallation(root);
    assert.equal(installation.kind, 'directory');
    assert.equal(installation.hiddenLockPresent, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('input host: a symlink to something other than a Validator checkout is an invalid link', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validator-pin-link-'));
  try {
    const target = path.join(root, 'not-a-checkout');
    fs.mkdirSync(target);
    fs.mkdirSync(path.join(root, 'node_modules', '@calculogic'), { recursive: true });
    fs.symlinkSync(target, path.join(root, 'node_modules', '@calculogic', 'validator'), 'dir');
    const installation = probeInstallation(root);
    assert.equal(installation.kind, 'symlink');
    assert.equal(installation.link.ok, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('input host: checkout discovery is explicit, then environment, then npm link, and never guessed', () => {
  const link = { kind: 'symlink', link: { ok: true, realPath: '/linked' } };
  const environment = { [CHECKOUT_ENVIRONMENT_VARIABLE]: '/from-env' };

  assert.equal(resolveCheckout({ explicitCheckout: '/explicit', environment, installation: link }).source, '--checkout');
  assert.equal(resolveCheckout({ environment, installation: link }).source, CHECKOUT_ENVIRONMENT_VARIABLE);
  assert.equal(resolveCheckout({ environment: {}, installation: link }).source, 'npm link');
  assert.equal(resolveCheckout({ environment: {}, installation: { kind: 'directory' } }), null);
});

// --- this repository -----------------------------------------------------------------------

test('this repository: the declared pin, links, and installation are not inconsistent', () => {
  const result = evaluateValidatorPin(collectValidatorPinInputs({ environment: {} }));
  const report = formatValidatorPinReport(result).join('\n');

  assert.notEqual(result.status, 'failed', report);
  assert.ok(['consistent', 'linked-development'].includes(result.status), report);
});
