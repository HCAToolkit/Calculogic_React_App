# calculogic-validator

This folder contains the Calculogic naming validator tooling extracted from the builder app tree.

## Commands

Run naming validator:

```bash
npm run validate:naming
npm run validate:naming -- --scope=repo
npm run validate:naming -- --scope=app
npm run validate:naming -- --scope=docs
```

Run full validator suite:

```bash
npm run validate:all
npm run validate:all -- --scope=repo
npm run validate:all -- --scope=app
npm run validate:all -- --scope=docs
npm run validate:all -- --validators=naming --scope=app
```

Run validator health check:

```bash
npm run health:validator
```

Capture command output into timestamped report files:

```bash
npm exec -- calculogic-report-capture --keep 20 -- npm run validate:naming -- --scope=app
npm exec -- calculogic-report-capture --prefix validator-health --keep 20 -- npm run health:validator
npm exec -- calculogic-report-capture --dir .local-reports --keep 50 -- npm run validate:naming -- --scope=repo
```

Offline / locked registry note:

- Preferred: `npm exec -- calculogic-report-capture ...` (requires dependencies already installed via `npm ci` or `npm install`).
- Strict no-download mode: `npx --no-install calculogic-report-capture ...`
- Example: `npx --no-install calculogic-report-capture --keep 20 -- npm run validate:naming -- --scope=app`

By default, `calculogic-report-capture` writes report files to OS cache storage.
Use `--dir` to write to a repo-local or custom directory.
Use `--json` if you want machine-readable metadata that includes the report path.
CI tip: use `--dir .local-reports` (or another workspace folder) so the report can be uploaded as an artifact.
If you use a repo-local report directory, add it to `.gitignore`.

- Canonical validator module now lives in `src/naming/` (`naming-validator.host.mjs` / `naming-validator.wiring.mjs` / `naming-validator.logic.mjs` / `naming-validator.contracts.mjs`).
- CLI entrypoint lives in `scripts/validate-naming.mjs`.
- Validator tests live in `test/`.
- Run from repository root with `npm run validate:naming`.
- Canonical naming contract docs remain in `doc/ConventionRoutines/`.


## Compatibility shim

Legacy imports from `src/validators/naming-validator.logic.mjs` remain supported via a thin re-export shim to the canonical host entrypoint.
