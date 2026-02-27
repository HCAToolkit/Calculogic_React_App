# calculogic-validator

This folder contains the Calculogic naming validator tooling extracted from the builder app tree.

## Commands

## npm argument forwarding (wrong vs right)

- ✅ Correct: `npm run validate:naming -- --scope=app`
- ❌ Incorrect: `npm run validate:naming --scope=app`
- npm consumes script arguments unless you place `--` before validator flags.

Run naming validator:

```bash
npm run validate:naming
npm run validate:naming -- --scope=repo
npm run validate:naming -- --scope=app
npm run validate:naming -- --scope=docs
node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app --config=calculogic-validator/test/fixtures/validator-config.roles.contracts.json
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

- Preferred (deps already installed): `npm exec -- calculogic-report-capture --keep 20 -- npm run validate:naming -- --scope=app`
- Strict no-download: `npx --no-install calculogic-report-capture --keep 20 -- npm run validate:naming -- --scope=app`

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

## Validator config schema and strictness

- Published schema: `calculogic-validator/src/validator-config.schema.json`.
- Runtime validation is strict and rejects unknown keys at the same levels the schema disallows them (`naming`, `naming.reportableExtensions`, `naming.roles`, and each `naming.roles.add[]` entry; root allows optional `$schema` as an editor hint and normalization ignores it).

Tool-agnostic schema reference example for editor integration:

```json
{
  "$schema": "./calculogic-validator/src/validator-config.schema.json",
  "version": "0.1",
  "naming": {
    "roles": {
      "add": [
        {
          "role": "provider",
          "category": "architecture-support",
          "status": "active"
        }
      ]
    }
  }
}
```
