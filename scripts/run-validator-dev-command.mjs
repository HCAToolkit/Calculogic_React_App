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

// On Windows, npm's own CLI is exposed as `npm.cmd` (or `.ps1`/a shim, depending on install
// method) - a script, not a native executable, so `child_process.spawn('npm'-or-any-resolved-
// npm.cmd-path, ..., { shell: false })` cannot run it: CreateProcess cannot execute a .cmd file
// directly, only cmd.exe can (Node's own "Spawning .bat and .cmd files on Windows" doc). Merely
// locating npm.cmd (an earlier version of this fix) does not solve that - the located path still
// cannot be spawned without a shell.
//
// This sidesteps the problem entirely rather than working around it: npm always sets
// `npm_execpath`, the absolute path to its own CLI *JavaScript* entry point, in the environment of
// any script it runs via `npm run <script>` - this wrapper's only supported invocation (every
// package.json entry that uses it does so via `npm run`). Re-invoking npm as
// `process.execPath <npm_execpath> <args>` runs npm's own CLI through node directly - node itself
// is always a real, natively executable binary on every platform, so no `.cmd`/`.bat`/shell
// resolution is ever needed, and no shell means no quoting/command-injection surface at all. The
// exact same code path runs on every platform; only the `npm_execpath` value differs. `env` is
// injectable only for deterministic testing.
export const resolveNpmInvocation = ({ env = process.env } = {}) => {
  const npmExecPath = env.npm_execpath;
  if (!npmExecPath) {
    return {
      ok: false,
      reason:
        'npm_execpath was not found in the environment. This command must be invoked via ' +
        '`npm run <script>` (its only supported invocation) - npm sets npm_execpath ' +
        'automatically for scripts it runs.',
    };
  }

  return { ok: true, command: process.execPath, prefixArgs: [npmExecPath] };
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

// A checkout can pass every resolveLinkedValidatorCheckout check above (real link, correct
// package name, complete test/ directory) and still be INCOMPATIBLE with specific dispatched
// commands: the devcontainer's own checkout helper deliberately leaves a pre-existing sibling
// checkout untouched (.devcontainer/README.md, "The helper does not fetch, reset, overwrite, or
// automatically link an existing checkout"), so a checkout cloned before a given standalone fix
// landed can stay linked indefinitely. Two commands in scope here depend on standalone-repo fixes
// that were not always present: addressing:get-tree (PR #24, HCAToolkit/calculogic-validator)
// requires scripts/addressing-get-tree.host.mjs to resolve its own development root via the
// resolveValidatorDevelopmentContext identity contract; report:verify (PR #25) requires
// scripts/report-capture-verify.host.mjs to compute its own repository root one directory level
// above itself, not two. Before either fix, both scripts silently assumed the old embedded-nested
// layout and failed (or, worse, could succeed against a coincidentally-named sibling) once run
// against a real standalone checkout - exactly the failure mode this dispatcher exists to prevent
// for an ordinary installed copy; an older linked checkout can reintroduce the same failure mode
// through a different door.
//
// Detecting this by comparing the checkout's git history against known-good commit SHAs was
// considered and rejected: it requires the linked checkout to be a git worktree with reachable,
// unrewritten history (untrue for a shallow clone, an exported tree, or a detached checkout), and
// it would need to be kept in sync with the standalone repo's own commit log indefinitely - the
// general-purpose Validator version-management framework this task explicitly says not to build.
// A dynamic capability probe (importing the checkout's own script and calling it with a synthetic
// case) was also considered for addressing-get-tree.host.mjs, which does have a safe entrypoint
// guard - but report-capture-verify.host.mjs does not: importing it, in either its pre-fix or
// fixed form, immediately runs it for real (spawns child processes, writes real report files) -
// exactly the silent modification of the user's checkout this task says to avoid. Since one of the
// two required checks cannot safely execute any checkout code at all, both use the same
// mechanism for consistency: a direct read of the dispatched script's own source text, checked for
// the specific, deliberate statement the real fix commit introduced or removed - not merely
// whether the file exists (every version of both files, fixed or not, already exists and already
// has the right name).
const CHECKOUT_COMPATIBILITY_REQUIREMENTS = {
  'addressing:get-tree': {
    relativeScriptPath: path.join('scripts', 'addressing-get-tree.host.mjs'),
    // Added by PR #24 as the actual fix, not incidentally: the import that wires this script to
    // the identity contract it needs to resolve a standalone (non-embedded) development root.
    requiredSubstring: 'resolveValidatorDevelopmentContext',
    fixDescription:
      'the addressing:get-tree standalone-root fix (PR #24, HCAToolkit/calculogic-validator)',
    incompatibilityDetail:
      `does not yet import resolveValidatorDevelopmentContext, so it would still assume the old ` +
      `embedded-nested layout and fail (or resolve the wrong root) when run against this checkout`,
  },
  'report:verify': {
    relativeScriptPath: path.join('scripts', 'report-capture-verify.host.mjs'),
    // Removed by PR #25 as the actual fix: the literal broken path segment the pre-fix script
    // prepended onto every tool path it located, assuming a nested embedded copy one level
    // deeper than a real standalone checkout actually is.
    forbiddenSubstring: 'calculogic-validator/tools/report-capture',
    fixDescription: 'the report:verify standalone-root fix (PR #25, HCAToolkit/calculogic-validator)',
    incompatibilityDetail:
      `still constructs tool paths with the old embedded-nested "calculogic-validator/" prefix, ` +
      `so it would fail to locate its own report-capture tooling when run against this checkout`,
  },
};

export const checkValidatorCheckoutCompatibility = ({ realPath, scriptName }) => {
  const requirement = CHECKOUT_COMPATIBILITY_REQUIREMENTS[scriptName];
  if (!requirement) {
    return { ok: true };
  }

  const scriptPath = path.join(realPath, requirement.relativeScriptPath);
  let source;
  try {
    source = fs.readFileSync(scriptPath, 'utf8');
  } catch {
    return {
      ok: false,
      reason:
        `${requirement.relativeScriptPath} could not be read inside the linked checkout at ` +
        `${realPath}. This checkout predates ${requirement.fixDescription} (or is otherwise ` +
        `incomplete/restructured). Update the linked checkout (e.g. \`git -C ${realPath} pull\`) ` +
        `and try again.`,
    };
  }

  const isCompatible =
    'requiredSubstring' in requirement
      ? source.includes(requirement.requiredSubstring)
      : !source.includes(requirement.forbiddenSubstring);

  if (!isCompatible) {
    return {
      ok: false,
      reason:
        `The linked standalone Validator checkout at ${realPath} predates ${requirement.fixDescription}` +
        ` - its own ${requirement.relativeScriptPath} ${requirement.incompatibilityDetail}. ` +
        `Update the linked checkout (e.g. \`git -C ${realPath} pull\`) and try again.`,
    };
  }

  return { ok: true };
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

  const compatibility = checkValidatorCheckoutCompatibility({ realPath: linked.realPath, scriptName });
  if (!compatibility.ok) {
    process.stderr.write(`${compatibility.reason}\n`);
    process.exitCode = 1;
    return;
  }

  const npmInvocation = resolveNpmInvocation();
  if (!npmInvocation.ok) {
    process.stderr.write(`${npmInvocation.reason}\n`);
    process.exitCode = 1;
    return;
  }

  const child = spawn(
    npmInvocation.command,
    [
      ...npmInvocation.prefixArgs,
      // Suppresses npm's own "> pkg@ver script\n> command\n\n" lifecycle banner, which npm
      // otherwise prints to stdout ahead of the dispatched script's own output (Refs #716 review
      // discussion_r4058875446). stdio is 'inherit' below, so that banner would land in the same
      // stdout stream a wrapping `calculogic-report-capture` invocation captures verbatim into its
      // report file, in front of the Validator's own JSON - making the whole file invalid JSON for
      // report:summarize to parse. --silent controls only npm's own log output at this loglevel; it
      // does not touch the dispatched script's own stdout/stderr, which remain fully inherited.
      '--silent',
      '--prefix',
      VALIDATOR_LINK_PATH,
      'run',
      scriptName,
      '--',
      ...forwardedArgs,
    ],
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
