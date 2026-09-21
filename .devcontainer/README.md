# Devcontainer Baseline

## Runtime baseline

- Node baseline is defined by the devcontainer image: `mcr.microsoft.com/devcontainers/javascript-node:22`.

## Post-create behavior

`postCreateCommand` installs and runs:

- `ripgrep` (`rg`) via apt (for fast repo search during audits/refactors)
- project dependencies (`npm install`)
- project build (`npm run build`)
- `.devcontainer/ensure-standalone-validator-checkout.sh`

The checkout helper ensures the standalone validator repository is available beside the React app checkout:

```text
/workspaces/
├─ Calculogic_React_App/
└─ calculogic-validator/
```

If the target path already exists, the helper accepts it only when that path is the actual Git worktree root and its `package.json` identifies `@calculogic/validator`. A valid standalone checkout is left in place. The helper does not fetch, reset, overwrite, or automatically link an existing checkout.

## Validator live-development mode

The shared Codespace checkout does **not** automatically enable `npm link`. Stable package consumption and live development remain separate, explicit modes.

### Ownership and prerequisites

- [`HCAToolkit/calculogic-validator`](https://github.com/HCAToolkit/calculogic-validator) is the authoritative, editable Validator source. All implementation changes belong there.
- This repository (`Calculogic_React_App`) is the consumer and validation target. It normally resolves `@calculogic/validator` from the immutable pinned Git commit recorded in its committed `package.json`/`package-lock.json` (see PR #710).
- Live development requires an accessible standalone Validator checkout. The devcontainer's post-create step prepares one as a sibling checkout by default (see above); outside the devcontainer, clone `HCAToolkit/calculogic-validator` yourself.
- Before entering live mode, start from a clean React app working tree (`git status` with nothing to commit) and make sure any unrelated local changes to `package.json`/`package-lock.json` are committed or stashed elsewhere first — the restoration sequence below discards uncommitted changes to those two files.

### Entering live development

Link the standalone checkout deliberately, one command in each repository:

```bash
cd ../calculogic-validator
npm link

cd ../Calculogic_React_App
npm link @calculogic/validator
```

Confirm the link resolved to the live checkout rather than the pinned stable package:

```bash
readlink node_modules/@calculogic/validator
# expected: a path pointing at your standalone calculogic-validator checkout, not an extracted package directory

npx calculogic-validator-health
# expected: two "OK" lines, sourced from the linked checkout
```

In the npm 10.9.7 environment this workflow was verified against, `npm link @calculogic/validator` did **not** modify `package.json` or `package-lock.json` — only `node_modules/@calculogic/validator` and its bin symlinks changed. This is the observed behavior for that npm version, not a guarantee for every npm release; check `git status` yourself after linking if you want to confirm it for your own environment.

### Working in live mode

- Make Validator implementation changes in the standalone `calculogic-validator` checkout, not in the React app.
- A fresh process launched from the React app observes those changes immediately — no repacking, reinstalling, or copying source is needed. For example, edit and save a file in the standalone checkout, then simply re-run a command from the React app:

  ```bash
  npx calculogic-validate-naming --scope=app
  ```

  The report's `sourceSnapshot.repositoryRoot` should still identify the React app checkout — the React app remains the validation target even though the Validator implementation is being served live from the linked checkout.

### Returning to stable mode

Restore the pinned stable package with this exact sequence:

```bash
npm unlink @calculogic/validator
git restore -- package.json package-lock.json
npm ci
```

**`npm unlink @calculogic/validator` does more than remove the symlink.** In the tested environment, it removed the `@calculogic/validator` entry entirely from both `package.json` and `package-lock.json` — the first command alone leaves your dependency files in a modified, incomplete state. All three commands are required together.

**`git restore -- package.json package-lock.json` discards _all_ uncommitted changes to those two files, not just the link-related ones.** Before running it, check `git status` and make sure you have not left any other unrelated edits to `package.json` or `package-lock.json` that you meant to keep — commit or stash them elsewhere first.

After running the sequence, confirm the restoration:

```bash
test -d node_modules/@calculogic/validator && [ ! -L node_modules/@calculogic/validator ] && echo "OK: real package directory"
# expected: prints "OK: real package directory" — confirms it exists as a directory and is not a symlink

git status
# expected: clean, package.json and package-lock.json match the committed stable dependency

npx calculogic-validator-health
npx calculogic-validate-naming --scope=app
# expected: both succeed, with repositoryRoot identifying this React app checkout
```

### Boundaries and limitations

- Do not edit files under `node_modules/@calculogic/validator` as if they were Validator source — that installed copy is an artifact, not an editable checkout.
- Do not edit the legacy embedded `calculogic-validator/` directory in this repository as a substitute for editing the standalone checkout; it is retained for other consumer scripts and is not the live-development target.
- **Validator self-development commands** — `validate:naming:validator:*` (`:entry`, `:naming`, `:tree`, `:doc`), `report:naming:validator*`, `report:all:validator`, `report:tree:validator`, `addressing:get-tree`, `report:verify`, `report:addressing:get-tree:validator`, and `test:validator:source` — now route through `scripts/run-validator-dev-command.mjs` (Refs #715). This guard confirms `node_modules/@calculogic/validator` is a live link to a complete standalone checkout (not an ordinary install, a broken link, an unrelated package, or a stripped/packaged copy) before dispatching via `npm --prefix node_modules/@calculogic/validator run <script> -- <args>` — the same pattern documented above, now automatic. In **stable (non-linked) mode**, each of these commands exits nonzero immediately with a message naming exactly what's wrong, instead of silently scanning a partial installed copy or (for `test:validator:source`) reporting a false `1..0` test success. In **live mode**, they run against the real linked checkout's own `bin/`, `scripts/`, `naming/`, `tree/`, `doc/` (target arguments are now relative to that checkout's own root, not the old embedded-tree-relative paths) — do not treat their output as a stable/embedded control while linked.
- `@calculogic/report-capture` and the scripts `report:summarize` and `report:examples:validator` still invoke embedded `calculogic-validator/scripts/*.host.mjs` files directly by path, never through the installed `@calculogic/validator` package. This slice does not migrate them (`report:examples:validator` needs a standalone-repo-owned prerequisite first — see Calculogic_React_App#714/#715 for the open ownership question — and `report:summarize` is generic React-app report tooling, migrated separately with its own proof that it still reads this app's own `.reports/`), and they remain genuinely unaffected by linking or unlinking `@calculogic/validator`.
- Updating the pinned stable dependency to a genuinely newer Validator revision is a separate decision, made by changing the committed Git commit reference in `package.json`/`package-lock.json` — this workflow does not itself select or publish a new stable version.
- Git URL rewriting, local filesystem paths, and any other environment-specific transport behavior you may encounter are not required production configuration. The commands above were verified in one environment (Node v22.22.2, npm 10.9.7); portability to every local desktop, Codespaces, or CI environment has not been independently confirmed.

## Maintenance

If the devcontainer baseline changes, update `.devcontainer/devcontainer.json` + this file together.
