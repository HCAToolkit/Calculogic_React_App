# calculogic-validator

## 1) Overview

`calculogic-validator` is the repository-local validator package in `calculogic-validator/`, including CLI binaries, host scripts, schema, and tests for naming and full validation workflows. In this repo, the recommended way to run it is from the **repo root** via npm scripts so command behavior, arguments, and report capture stay consistent with CI and team workflows.

## 2) Quickstart (repo root)

```bash
npm ci
npm test
npm run validate:naming -- --scope=app
```

What this does:

- `npm ci`: installs exact lockfile dependencies.
- `npm test`: runs the project and validator tests.
- `npm run validate:naming -- --scope=app`: runs naming validation against app scope only.

> npm argument forwarding reminder:
>
> - ✅ Correct: `npm run validate:naming -- --scope=app`
> - ❌ Incorrect: `npm run validate:naming --scope=app`
>
> Use `--` before validator flags so npm forwards them to the script.

## 3) Root npm workflows (recommended)

Use these from the repository root.

### Core validation

```bash
npm run validate:naming
npm run validate:all
npm run health:validator
```

- `npm run validate:naming`: naming-only validation using repo defaults.
- `npm run validate:all`: full validator pass (all configured validators).
- `npm run health:validator`: validator environment/health diagnostics.

### Reports by scope and target

Naming report capture:

```bash
npm run report:naming:repo
npm run report:naming:app
npm run report:naming:docs
npm run report:naming:validator
npm run report:naming:system
```

Full-suite report capture:

```bash
npm run report:all:repo
npm run report:all:app
npm run report:all:docs
npm run report:all:validator
npm run report:all:system
```

Report utilities:

```bash
npm run report:verify
npm run report:summarize
```

- `report:naming:*`: capture naming validator output for a specific scope.
- `report:all:*`: capture full-suite output for a specific scope.
- `report:verify`: checks report-capture wiring/outputs.
- `report:summarize`: summarizes captured reports.

## 4) Validator binaries (direct invocation)

These binaries are defined in `calculogic-validator/package.json` and can be executed directly from repo root.

```bash
node calculogic-validator/bin/calculogic-validate.mjs
node calculogic-validator/bin/calculogic-validate-naming.mjs
node calculogic-validator/bin/calculogic-validator-health.mjs
```

What each binary does:

- `calculogic-validate.mjs`: full validator entrypoint.
- `calculogic-validate-naming.mjs`: naming-only validator entrypoint.
- `calculogic-validator-health.mjs`: validator health/diagnostic entrypoint.

## 5) Scopes and targets

Common scopes used in this repository:

- `repo`
- `app`
- `docs`
- `validator`
- `system`

Examples:

```bash
npm run validate:naming -- --scope=repo
npm run validate:naming -- --scope=app
npm run validate:naming -- --scope=docs
npm run validate:all -- --scope=validator
npm run validate:all -- --scope=system
```

Use scope-specific `report:*` commands when you want one-command capture per target/scope combination.

## 6) Strict config and schema

Validator config schema:

- `calculogic-validator/src/validator-config.schema.json`

Runtime behavior is strict and rejects unknown keys where the schema disallows them. Root-level `$schema` is allowed as an editor hint.

Example:

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

## 7) Report capture notes

- Report scripts write JSON capture metadata to `./.reports` in this repository.
- Keep count/retention is handled by script-level `--keep` values.
- Use `npm run report:verify` after setup changes.
- Use `npm run report:summarize` for a concise overview of recent captures.

## 8) Compatibility note

Legacy imports from `src/validators/naming-validator.logic.mjs` remain supported via a thin re-export shim to the canonical naming validator host entrypoint.
