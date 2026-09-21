#!/usr/bin/env node
// Guards and dispatches Validator self-development commands (Refs #715, #714, #713).
//
// These commands (naming/tree/all validator-scope checks, addressing:get-tree, report:verify,
// the standalone test suite) inspect the Validator's own implementation, not React-app content.
// They must run against the real, editable standalone checkout connected via `npm link
// @calculogic/validator`, never against an ordinary installed/pinned copy - an installed copy
// is missing whole directories (test/, doc/, tools/, AGENTS.md - excluded from the package
// `files` allowlist) and can silently produce a partial scan or a false "0 tests passing".
//
// This does not reimplement the Validator's own `resolveValidatorDevelopmentContext` identity
// contract (src/core/validator-development-context.logic.mjs in the standalone repo) - that
// contract is invoked for real, inside the linked checkout's own process, by whichever dispatched
// script already depends on it (validate:naming, validate:all, validate:tree already call it
// internally for --scope=validator). This guard instead answers a narrower, prior question from
// the React app's side: does node_modules/@calculogic/validator actually point at a complete,
// editable standalone checkout at all, as opposed to an ordinary install, a stripped/packaged
// copy, a stale/broken link, or an unrelated directory linked in by mistake? A plain
// isSymbolicLink() check alone cannot answer that (a symlink can point anywhere) - hence the
// additional narrowly-scoped content checks below (package name, and a directory excluded from
// every installed/packaged copy), deliberately not a general-purpose identity/security framework.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VALIDATOR_PACKAGE_NAME = '@calculogic/validator';
const VALIDATOR_LINK_PATH = path.join('node_modules', '@calculogic', 'validator');
// Present in every genuine checkout, absent from every installed/packaged copy (excluded from
// the standalone package's `files` allowlist) - the same signal already established for
// distinguishing a complete checkout from a packaged subset in the standalone repo itself.
const DEVELOPMENT_COMPLETENESS_MARKER = 'test';

const readPackageName = (packageJsonPath) => {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))?.name;
  } catch {
    return undefined;
  }
};

// On Windows, npm is exposed as an extensionless-looking command backed by a `.cmd` (or `.bat`/
// `.exe`, depending on install method) file; `child_process.spawn('npm', ..., { shell: false })`
// fails with ENOENT because Windows does not resolve PATHEXT for a bare CreateProcess call the
// way a shell would (see Node's "Spawning .bat and .cmd files on Windows" doc). Resolves the real
// executable by searching PATH + PATHEXT, exactly the same approach already established in this
// project's tools/report-capture/src/report-capture.host.mjs, reused here rather than introducing
// a second mechanism (`shell: true` quoting risk, or a new dependency). A no-op on every other
// platform, and a no-op when the given command already carries its own extension. `platform`/`env`
// are injectable only so this can be exercised deterministically in tests without mutating global
// process state; real callers always use the defaults.
export const resolveWindowsCommand = (command, { platform = process.platform, env = process.env } = {}) => {
  if (platform !== 'win32') {
    return command;
  }

  const ext = path.extname(command);
  if (ext) {
    return command;
  }

  const pathValue = env.PATH || '';
  const pathEntries = pathValue.split(path.delimiter).filter(Boolean);
  const pathextValue = env.PATHEXT || '.COM;.EXE;.BAT;.CMD';
  const pathext = pathextValue.split(';').filter(Boolean);

  for (const directory of pathEntries) {
    for (const extension of pathext) {
      const candidate = path.join(directory, `${command}${extension.toLowerCase()}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return command;
};

const GUIDANCE =
  'This command requires an editable standalone Validator checkout connected with ' +
  '`npm link @calculogic/validator` (see .devcontainer/README.md). An ordinary installed ' +
  'copy cannot provide a complete Validator-development view and will not be used.';

export const resolveLinkedValidatorCheckout = ({ cwd = process.cwd() } = {}) => {
  const linkPath = path.resolve(cwd, VALIDATOR_LINK_PATH);

  let lstat;
  try {
    lstat = fs.lstatSync(linkPath);
  } catch {
    return { ok: false, reason: `${VALIDATOR_LINK_PATH} does not exist. ${GUIDANCE}` };
  }

  if (!lstat.isSymbolicLink()) {
    return {
      ok: false,
      reason: `${VALIDATOR_LINK_PATH} is an ordinary installed package, not a live link. ${GUIDANCE}`,
    };
  }

  let realPath;
  try {
    realPath = fs.realpathSync(linkPath);
  } catch {
    return { ok: false, reason: `${VALIDATOR_LINK_PATH} is a broken symlink (target does not exist). ${GUIDANCE}` };
  }

  const packageName = readPackageName(path.join(realPath, 'package.json'));
  if (packageName !== VALIDATOR_PACKAGE_NAME) {
    return {
      ok: false,
      reason:
        `${VALIDATOR_LINK_PATH} resolves to ${realPath}, whose package.json name is ` +
        `${packageName ? `"${packageName}"` : '(missing/unreadable)'}, not "${VALIDATOR_PACKAGE_NAME}". ${GUIDANCE}`,
    };
  }

  const completenessMarkerPath = path.join(realPath, DEVELOPMENT_COMPLETENESS_MARKER);
  let markerStat;
  try {
    markerStat = fs.statSync(completenessMarkerPath);
  } catch {
    markerStat = null;
  }
  if (!markerStat || !markerStat.isDirectory()) {
    return {
      ok: false,
      reason:
        `${VALIDATOR_LINK_PATH} resolves to ${realPath}, which is missing its own ` +
        `${DEVELOPMENT_COMPLETENESS_MARKER}/ directory - this looks like an installed/packaged ` +
        `copy rather than a complete development checkout. ${GUIDANCE}`,
    };
  }

  return { ok: true, realPath };
};

const parseArgs = (argv) => {
  const separatorIndex = argv.indexOf('--');
  const scriptName = argv[0];
  if (!scriptName) {
    throw new Error('Usage: run-validator-dev-command.mjs <standalone-script-name> [-- <forwarded args>]');
  }

  const forwardedArgs = separatorIndex === -1 ? [] : argv.slice(separatorIndex + 1);
  return { scriptName, forwardedArgs };
};

const run = async () => {
  const { scriptName, forwardedArgs } = parseArgs(process.argv.slice(2));

  const linked = resolveLinkedValidatorCheckout();
  if (!linked.ok) {
    process.stderr.write(`${linked.reason}\n`);
    process.exitCode = 1;
    return;
  }

  const child = spawn(
    resolveWindowsCommand('npm'),
    ['--prefix', VALIDATOR_LINK_PATH, 'run', scriptName, '--', ...forwardedArgs],
    { stdio: 'inherit' },
  );

  await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        resolve();
        return;
      }
      process.exitCode = code ?? 1;
      resolve();
    });
  });
};

// Guards direct-CLI execution so importing this module (e.g. from tests) never triggers a run.
// Uses the resolved-URL comparison, not a naive `file://${argv[1]}` string concat, since the
// latter silently mismatches (and no-ops) when this module is loaded through a symlink - the
// exact defect found in the standalone repo's generate-validator-report-examples.host.mjs.
const isDirectCliEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectCliEntrypoint) {
  run().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
