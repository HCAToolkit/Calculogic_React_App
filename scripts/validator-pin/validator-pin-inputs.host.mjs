// Filesystem and git adapters for the Validator pin-consistency check (Refs #713).
// Contract: doc/nl-config/cfg-validatorPinConsistency.md §2 and §9.0.
//
// Shared by the CLI host and the test so both evaluate identical inputs. Offline only: the
// optional standalone checkout is queried with local `git cat-file`, never over the network.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveLinkedValidatorCheckout } from '../run-validator-dev-command.mjs';
import { VALIDATOR_PACKAGE_NAME, VALIDATOR_PIN_LINK_REGISTRY } from './validator-pin-links.knowledge.mjs';

export const CHECKOUT_ENVIRONMENT_VARIABLE = 'CALCULOGIC_VALIDATOR_CHECKOUT';

// The repository root is derived from this module's location, not from the working directory,
// so the check reads the same repository wherever it is invoked from.
export const resolveAppRepositoryRoot = ({ moduleUrl = import.meta.url } = {}) =>
  path.resolve(path.dirname(fileURLToPath(moduleUrl)), '..', '..');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const runGit = (cwd, args) => spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });

const listTrackedFiles = (repositoryRoot) => {
  const result = runGit(repositoryRoot, ['ls-files', '-z']);
  if (result.status !== 0) {
    throw new Error(`git ls-files failed in ${repositoryRoot}: ${result.stderr}`);
  }
  return result.stdout.split('\0').filter(Boolean);
};

// Reads every tracked file for the discovery guard. The working-tree copy is preferred so local,
// unstaged edits are scanned; when it cannot be read (for example a path excluded by a sparse
// checkout), the content is read from Git's index instead. A path that cannot be read either way
// is returned as a scan failure, never skipped, so an incomplete scan cannot pass. Files containing
// NUL bytes are binary and cannot hold a pinned link, so they are not scanned.
export const readTrackedTextFiles = (repositoryRoot, { trackedPaths = listTrackedFiles(repositoryRoot) } = {}) => {
  const files = [];
  const failures = [];

  for (const relativePath of trackedPaths) {
    let content;
    try {
      content = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
    } catch (workingTreeError) {
      const indexed = runGit(repositoryRoot, ['show', `:${relativePath}`]);
      if (indexed.status !== 0) {
        failures.push({
          path: relativePath,
          reason: `unreadable in the working tree (${workingTreeError.code ?? workingTreeError.message}) and in the index (${indexed.stderr.trim() || `git exit ${indexed.status}`})`,
        });
        continue;
      }
      content = indexed.stdout;
    }
    if (!content.includes('\0')) {
      files.push({ path: relativePath, content });
    }
  }

  return { files, failures };
};

export const probeInstallation = (repositoryRoot) => {
  const packageDirectory = path.join(repositoryRoot, 'node_modules', ...VALIDATOR_PACKAGE_NAME.split('/'));
  let lstat;
  try {
    lstat = fs.lstatSync(packageDirectory);
  } catch {
    return { kind: 'missing' };
  }

  if (lstat.isSymbolicLink()) {
    const link = resolveLinkedValidatorCheckout({ cwd: repositoryRoot });
    if (link.ok) {
      const head = runGit(link.realPath, ['rev-parse', 'HEAD']);
      link.head = head.status === 0 ? head.stdout.trim() : null;
    }
    return { kind: 'symlink', link };
  }

  const hiddenLockPath = path.join(repositoryRoot, 'node_modules', '.package-lock.json');
  const hiddenLockPresent = fs.existsSync(hiddenLockPath);
  const hiddenLockEntry = hiddenLockPresent
    ? readJson(hiddenLockPath).packages?.[`node_modules/${VALIDATOR_PACKAGE_NAME}`] ?? null
    : null;

  return {
    kind: 'directory',
    hiddenLockPresent,
    hiddenLockEntry,
    installedFileExists: (relativePath) => fs.existsSync(path.join(packageDirectory, relativePath)),
  };
};

export const createCheckoutProbe = ({ checkoutPath, source }) => {
  const absolutePath = path.resolve(checkoutPath);
  return {
    path: absolutePath,
    source,
    hasCommit: (commit) => runGit(absolutePath, ['cat-file', '-e', `${commit}^{commit}`]).status === 0,
    fileExistsAtCommit: (commit, relativePath) => runGit(absolutePath, ['cat-file', '-e', `${commit}:${relativePath}`]).status === 0,
  };
};

// Checkout discovery order: explicit --checkout, then the environment variable, then an existing
// npm link. Sibling directory locations are never guessed.
export const resolveCheckout = ({ explicitCheckout, environment = process.env, installation }) => {
  if (explicitCheckout) {
    return createCheckoutProbe({ checkoutPath: explicitCheckout, source: '--checkout' });
  }
  if (environment[CHECKOUT_ENVIRONMENT_VARIABLE]) {
    return createCheckoutProbe({ checkoutPath: environment[CHECKOUT_ENVIRONMENT_VARIABLE], source: CHECKOUT_ENVIRONMENT_VARIABLE });
  }
  if (installation.kind === 'symlink' && installation.link?.ok) {
    return createCheckoutProbe({ checkoutPath: installation.link.realPath, source: 'npm link' });
  }
  return null;
};

export const collectValidatorPinInputs = ({ repositoryRoot = resolveAppRepositoryRoot(), explicitCheckout, environment = process.env } = {}) => {
  const documents = new Map(
    VALIDATOR_PIN_LINK_REGISTRY.map(({ sourceDocument }) => {
      const absolutePath = path.join(repositoryRoot, sourceDocument);
      return [sourceDocument, fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : undefined];
    }).filter(([, content]) => content !== undefined),
  );
  const installation = probeInstallation(repositoryRoot);
  const trackedScan = readTrackedTextFiles(repositoryRoot);

  return {
    packageJson: readJson(path.join(repositoryRoot, 'package.json')),
    packageLock: readJson(path.join(repositoryRoot, 'package-lock.json')),
    documents,
    trackedFiles: trackedScan.files,
    scanFailures: trackedScan.failures,
    installation,
    checkout: resolveCheckout({ explicitCheckout, environment, installation }),
  };
};
