# cfg-validatorPinConsistency

## 0.0 Version

Current implementation target: **V0.1.0** (offline pin-consistency check for the Git-pinned `@calculogic/validator` dependency and the pinned standalone-Validator documentation links; React-app issue #713).

## 1.0 Purpose

Detect, offline and deterministically, when the React app's view of the standalone Validator drifts from the one commit it declares. Drift has three independent forms, and each is its own check:

1. the declared pin disagrees between `package.json` and `package-lock.json`;
2. a pinned documentation link targets a different commit, or a file that does not exist at the declared commit;
3. the locally installed Validator was installed from a different commit than the one declared (a stale installation).

`npm ls @calculogic/validator` cannot detect form 3: it reports the lockfile's declared commit even when an older commit's code is installed. This check reads npm's actual installation record instead.

## 2.0 Inputs and Source of Truth

### 2.1 Declared pin

- `package.json` `devDependencies["@calculogic/validator"]` (a `git+https://…#<commit>` spec);
- `package-lock.json` `packages[""].devDependencies["@calculogic/validator"]` (the lockfile root spec);
- `package-lock.json` `packages["node_modules/@calculogic/validator"].resolved` and `.integrity`.

Specs are compared by their 40-character commit id, not as whole strings: the lockfile's `resolved` uses `git+ssh://` while the manifest uses `git+https://`.

### 2.2 Registered documentation links

`scripts/validator-pin/validator-pin-links.knowledge.mjs` lists every pinned link to the standalone Validator repository (`https://github.com/HCAToolkit/calculogic-validator/blob/<commit>/<path>`) that this repository maintains, with its source document, its target path, and its distribution class:

- **packaged**: the target is one of the documents distributed in the installed package (`doc/ConventionRoutines/CCPP.md`, `doc/ConventionRoutines/CCS.md`);
- **unpackaged**: the target is repository-owned standalone development documentation that the package does not distribute (the Tree, Naming, and Runner NL/config notes under `doc/ValidatorSpecs/nl-config/`). An unpackaged target is never expected in `node_modules`.

A discovery guard scans every tracked file outside the embedded `calculogic-validator/` tree for pinned links. Any link that is not registered fails the check, so a new pinned link cannot bypass verification.

- Commit ids are matched case-insensitively and normalized to lowercase before any comparison, because Git accepts uppercase object ids.
- Each tracked file is read from the working tree; when that fails (for example a path excluded by a sparse checkout), its content is read from Git's index (`git show :<path>`). A tracked path that cannot be read either way is a scan failure, and any scan failure fails the check, so an incomplete scan never produces a passing result.
- Only tracked files are scanned: a new file is covered once it is added to the index.

### 2.3 Installation record

- `node_modules/@calculogic/validator`: a real directory (stable installation) or a symlink created by `npm link` (linked development);
- `node_modules/.package-lock.json`: npm's hidden lockfile, written at install time. Its `packages["node_modules/@calculogic/validator"].resolved` and `.integrity` record what npm actually installed.

### 2.4 Standalone checkout (optional)

A local standalone Validator checkout lets the check confirm unpackaged targets. It is taken, in order, from `--checkout <path>`, the `CALCULOGIC_VALIDATOR_CHECKOUT` environment variable, or the checkout that an existing `npm link` points to. Sibling directory locations are never guessed. No network access is used.

## 5.0 Logic Concern

### 5.1 Check 1: declared-pin agreement

The commit ids from §2.1 must all be present and identical. Any mismatch or unparsable spec fails the check and names each source's commit.

### 5.2 Check 2a: link pins

Each registered source document must contain exactly one pinned link, whose target path equals the registered path and whose commit equals the declared commit. This applies in every installation state, including linked development: canonical references stay tied to the committed stable dependency.

### 5.3 Check 2b: link targets

Each registered target must exist at the declared commit:

- with a standalone checkout that contains the declared commit, every target is checked with `git cat-file -e <commit>:<path>`; a missing target fails;
- otherwise a packaged target is checked in the installed package, but only when check 3 established stable-install consistency; a missing target fails;
- otherwise the target is recorded as **unverified**, with the reason. Unverified is neither verified nor missing, and does not fail the check.

### 5.4 Check 3: installation state

- package directory missing: fails (not installed);
- symlink: validated with `resolveLinkedValidatorCheckout` from `scripts/run-validator-dev-command.mjs`. A valid link is **linked development**: the linked checkout's `HEAD` is reported for information, and stable-install consistency is **not verified**. An invalid link fails;
- real directory: the hidden lockfile must exist and record the package, with the same commit and the same `integrity` as the committed lockfile. Otherwise the check fails as a stale or unknown installation, with the remedy to run `npm ci`.

Matching installation records establish that npm's record of the installation matches the declared pin. They do **not** prove that the installed file contents are byte-identical to that commit.

### 5.5 Overall result

- **failed**: any check failed;
- **linked-development**: nothing failed and the Validator is linked. The installed code is the linked checkout, so this is never reported as stable-install consistency;
- **consistent**: nothing failed and the stable installation's record matches the declared pin.

Unverified targets are listed separately in every result.

## 6.0 Knowledge Concern

### 6.1 Link registry

The five registered links (§2.2) are knowledge data, kept separate from the check logic, so adding a link is a registry change that the discovery guard enforces.

## 7.0 Results Concern

### 7.1 CLI output

`npm run check:validator-pin` (`scripts/validator-pin/check-validator-pin.host.mjs`) prints one line per check and target, then the overall result and, for a stable installation, the installation-record limitation from §5.4. It exits `0` for **consistent** or **linked-development** and `1` for **failed**.

### 7.2 Test integration

`test/validator-pin-consistency.test.mjs` runs the same logic against this repository inside `npm test`, without spawning `npm test` recursively, and fails when the result is **failed**. After a Validator pin change, a stable installation must run `npm ci` before the tests pass.

## 9.0 Assembly Pattern

- knowledge: `scripts/validator-pin/validator-pin-links.knowledge.mjs`
- logic: `scripts/validator-pin/validator-pin-consistency.logic.mjs` (pure checks over injected file contents and probes)
- input host: `scripts/validator-pin/validator-pin-inputs.host.mjs` (reads the manifests, tracked files, and installation record, and provides the `git` checkout probe; shared by the CLI and the test so both evaluate identical inputs)
- CLI host: `scripts/validator-pin/check-validator-pin.host.mjs` (parses `--checkout`, prints the report, sets the exit code; runs when executed and exports nothing, so nothing imports it)
