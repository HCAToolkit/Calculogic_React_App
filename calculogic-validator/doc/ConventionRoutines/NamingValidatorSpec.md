# Naming Validator Spec (V0.1.7)

## Purpose and Scope

This document defines the V0.1.7 filename naming validator slice for deterministic automation.

## Suite Contract Alignment

This naming slice follows the shared suite contract in [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md): Calculogic Validator is modular, configurable, policy-driven, and report-first by default. Mode policy changes exit behavior and optional fix execution, not detection.

V0.1.7 scope is intentionally narrow:

- filename validation only
- report mode only
- deterministic findings output
- deterministic scope profiles for migration planning
- no rename enforcement

Out of scope for V0.1.7:

- structural addressing validation
- NL↔Code numbering/parity validation
- provenance token consistency checks
- auto-fix or rename execution
- broad migration/cleanup enforcement

## Version labeling note

Subsection version tags (for example `(V0.1.2)`) reflect the last material change for that subsection; the document version reflects the overall spec revision.

## Source-of-Truth References

Primary naming authority:

- `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
- Role categories, role status values, role semantics, provisional-role policy, and category↔surface governance policy are authoritative in the `Role Registry Master List V1` section of `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`.

Supporting workflow alignment:

- `doc/ConventionRoutines/NL-First-Workflow.md`
- `calculogic-validator/doc/ConventionRoutines/CCS.md`
- `calculogic-validator/doc/ConventionRoutines/CCPP.md`

## Canonical Filename Contract (V0.1.2)

Canonical grammar:

- `<semantic-name>.<role>.<ext>`

Recognized compound format suffixes in V0.1.2:

- `module.css`

Filename grammar is unchanged from V0.1.1.

## Role Registry Metadata (V0.1.2)

V0.1.2 uses a structured role registry with metadata:
The role registry source-of-truth is `FileNamingMasterList-V1_1.md`.

- `role`
- `category` (runtime-bounded: `concern-core` | `architecture-support` | `documentation` | `deprecated`)
- `status` (runtime-bounded: `active` | `deprecated`)
- `notes` (optional)

Default runtime registry roles in the naming slice:

- `host` (`architecture-support`, `active`)
- `wiring` (`architecture-support`, `active`)
- `contracts` (`architecture-support`, `active`)
- `build` (`concern-core`, `active`)
- `build-style` (`concern-core`, `active`)
- `logic` (`concern-core`, `active`)
- `knowledge` (`concern-core`, `active`)
- `results` (`concern-core`, `active`)
- `results-style` (`concern-core`, `active`)
- `spec` (`documentation`, `active`)
- `policy` (`documentation`, `active`)
- `workflow` (`documentation`, `active`)
- `plan` (`documentation`, `active`)
- `audit` (`documentation`, `active`)
- `healthcheck` (`documentation`, `active`)

Registry vocabulary vs config additions:

- The default role registry is the runtime baseline used by naming validation.
- Config can add roles (add-only).
- `FileNamingMasterList-V1_1.md` remains the source-of-truth taxonomy, while the naming slice currently uses a bounded category vocabulary for deterministic checks.
- If runtime-supported category values expand beyond the bounded set listed here, update this section and the master-list compatibility note accordingly.

Governance taxonomy vs runtime subset (explicit boundary):

- The master list includes additional governance categories (for example `concern-style`, `surface-system`, `indexing-registry`, `integration-adapter`, and other planned categories) plus category↔surface allowance policy.
- V0.1.7 runtime does **not** enforce category↔surface validity yet and does not require/support the full governance category vocabulary in this slice.
- Governance status vocabulary includes `provisional`; runtime role classification in this slice remains bounded to active/deprecated handling for deterministic report behavior.
- Runtime currently keeps `build-style` and `results-style` under `concern-core` as an implementation taxonomy constraint for deterministic checks; this is not a governance semantic redefinition.

Deprecated historical roles:

- `view` (`deprecated`, `deprecated`) — historical pre-current concern split term.

Semantic-name rules:

- kebab-case only for canonical filenames
- semantic name is everything before role segment

Parsing assumptions:

- role is the segment immediately before extension/format segment
- for `module.css`, role is the segment before `module`
- role suffix must be dot-separated (not hyphen-appended)

## Input Scope Profiles (V0.1.2)

V0.1.2 implements deterministic scope profiles selected by CLI.

### Default scope

- default scope is `repo`

### `repo` scope

- repository-wide behavior
- includes all reportable files under repository root, excluding explicit walk exclusions (`.git`, `node_modules`, `dist`, `coverage`, `.vite`)

### `app` scope

- includes application-focused roots:
  - `src/`
  - `test/`
- excludes docs, validator, and system-only roots by profile definition

### `docs` scope

- includes docs-focused roots:
  - `doc/`
  - `docs/`
- includes selected root conventional docs currently limited to `README.md`

### `validator` scope

- includes validator implementation root:
  - `calculogic-validator/`

### `system` scope

- includes root tooling/system files:
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `eslint.config.*`
  - `vite.config.*`

### Invalid scope behavior

- invalid scope values are treated as deterministic CLI usage errors
- CLI prints usage/help text and exits non-zero

## Scope Contract (V0.1.3)

Supported scopes:

- `repo`
- `app`
- `docs`
- `validator`
- `system`

Default behavior:

- No `--scope` input is equivalent to `--scope=repo`.

Inclusion/exclusion summary:

- `repo`: all reportable files under repository root (minus explicit walker exclusions).
- `app`: includes `src/**` and `test/**`; excludes docs, validator, and system-only roots by profile definition.
- `docs`: includes `doc/**`, `docs/**`, and selected root conventional docs currently limited to `README.md`.
- `validator`: includes `calculogic-validator/**`.
- `system`: includes root tooling files (`package.json`, `package-lock.json`, `tsconfig*.json`, `eslint.config.*`, `vite.config.*`).

Invalid scope behavior:

- Unknown scope values are usage errors with non-zero exit and valid-scope usage text.

## Validator Config Input (Report-only, V0.1.7)

Config reference: [`validator-config-spec.md`](../ValidatorSpecs/validator-config-spec.md).

Current naming behavior remains report-only in implementation. Passing `--config=<path>` does **not** enable enforcement or fix execution in the naming slice.

When provided, config only affects naming report inputs for:

- reportable extension set (defaults ∪ additions)
- naming role registry runtime (defaults + add-only role additions)
- missing-role pattern policy runtime (builtin normalized schema for legacy exception detection)
- finding-policy runtime (builtin outcome→finding metadata mapping for stable decision outcomes)

In current behavior, these config effects are limited to classification/runtime registries only for report generation.

Config does not change detection mode/scope semantics and does not introduce enforcement/fix execution. Current exit policy remains policy-driven as documented in this spec.

## CLI Usage (V0.1.7)

- `npm run validate:naming` (defaults to `--scope=repo`)
- `npm run validate:naming -- --scope=repo`
- `npm run validate:naming -- --scope=app`
- `npm run validate:naming -- --scope=docs`
- `npm run validate:naming -- --scope=validator`
- `npm run validate:naming -- --scope=system`
- `npm run validate:naming -- --scope=app --target src/buildsurface`
- `npm run validate:naming -- --scope=app --target src/buildsurface --target src/shared`
- `npm run validate:naming -- --scope=app --config=./path/to/validator-config.json`
- `node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app --config=./path/to/validator-config.json`

npm argument forwarding note:

- npm requires a separator `--` to forward CLI flags to scripts.
- Wrong (now deterministic usage error): `npm run validate:naming --scope=app`, `npm run validate:all --scope=app`
- Right: `npm run validate:naming -- --scope=app`, `npm run validate:all -- --scope=app`
- The validator scripts fail fast with guidance when supported flags are detected in npm invocation metadata but not forwarded to script argv.

## Targeted runs (developer convenience, V0.1.6)

Optional CLI filter flag:

- `--target <path>`
- `--target=<path>`
- repeatable; union semantics when provided multiple times

Path handling:

- accepts repo-relative or absolute paths
- target may be a file (exact path match) or directory (recursive descendants)
- normalization stores report metadata in repo-relative `/`-separated form

Filtering contract:

- target filtering is applied after canonical scope discovery
- selected scope remains authoritative and report `scope` remains unchanged
- non-existent target path is deterministic non-zero error
- existing targets that produce zero in-scope files produce valid empty report output

Report metadata additions:

- `filters.isFiltered` (boolean)
- `filters.targets` (sorted normalized target list, only when filtering is active)

## Classification Outputs

Stable classifications used by V0.1.2:

- `canonical`
- `allowed-special-case`
- `legacy-exception`
- `invalid-ambiguous`

Classification semantics are unchanged from V0.1.1. Scope profiles only change selected input paths.

Internal decision normalization (runtime implementation boundary):

- code-owned branching resolves stable outcome IDs (for example `canonical`, `unknown-role`, `deprecated-role`, `missing-role`)
- registry-owned finding policy maps each outcome ID to finding metadata vocabulary (`code`, `severity`, `classification`, `message`, `ruleRef`, optional `suggestedFix`)
- runtime behavior remains deterministic and output-equivalent while separating branch mechanics from policy metadata defaults

## Finding Schema

Each finding uses a stable object shape:

- `code` (string)
- `severity` (`info` | `warn`)
- `path` (normalized relative path)
- `classification` (classification enum)
- `message` (human-readable summary)
- `ruleRef` (spec/master-list rule reference)
- `suggestedFix` (optional)
- `details` (optional object)

Rule ID note (canonical linkage):

- naming currently emits `code` values (`NAMING_*`) as the stable finding identifiers
- map `code` to canonical `ruleId` for suite-wide contracts and future slice alignment
- canonical contract reference: [`ValidatorRuleIds-Contract.md`](./ValidatorRuleIds-Contract.md)

Report object includes:

- `mode`
- `scope`
- `totalFilesScanned`
- summary count objects
- `findings`

When `--config=<path>` is supplied, report metadata may also include:

- `configDigest`
  - emitted by the CLI when config input is active

### Special-case subtype metadata

V0.1.2 keeps top-level classification `allowed-special-case` and includes deterministic subtype metadata in `details.specialCaseType`:

- `ecosystem-required`: `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.*`, `eslint.config.*`
- `barrel`: `index.ts`, `index.tsx`
- `test-convention`: `*.test.*`, `*.spec.*`
- `ambient-declaration`: `*.d.ts`
- `conventional-doc`: `README.md`

### Deprecated role metadata

When a canonical-like parse resolves to a known deprecated role (currently `view`):

- classification remains `invalid-ambiguous`
- code is `NAMING_DEPRECATED_ROLE`
- `details` includes parsed filename metadata plus:
  - `roleStatus: "deprecated"`
  - `roleCategory: "deprecated"`
  - optional `deprecationNote`
- validator does not auto-map deprecated role to modern roles (manual migration required)

## Finding / Error Codes (V0.1.2)

- `NAMING_CANONICAL`
- `NAMING_ALLOWED_SPECIAL_CASE`
- `NAMING_LEGACY_EXCEPTION`
- `NAMING_UNKNOWN_ROLE`
- `NAMING_DEPRECATED_ROLE`
- `NAMING_BAD_SEMANTIC_CASE`
- `NAMING_ROLE_HYPHEN_AMBIGUITY`

## Rollout Modes

Mode semantics are centralized in the suite-wide matrix in [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md).

Naming V0.1.7 currently implements:

- `report` only (slice behavior)
  - emits findings and summary deterministically before any enforcement/fix behavior
  - exit code is policy-driven in current implementation:
    - exit `2` when any finding has `severity="warn"`
    - when no warnings exist, `--strict` exits `1` when any finding has `classification="legacy-exception"`
    - otherwise exit `0`
  - invalid CLI usage (e.g., unknown `--scope`) exits `1`

`--strict` in this naming slice is an exit-policy modifier, not a separate detection mode. See [`ValidatorSuite-Contracts-And-Modes.md`](./ValidatorSuite-Contracts-And-Modes.md) for canonical policy framing.

Suite policy options are shared contracts but deferred for naming implementation:

- `soft-fail`
- `hard-fail`
- `correct`
- `replace`

## Allowed Special-Case Handling Rules

V0.1.2 recognizes these special cases:

- barrel files: `index.ts`, `index.tsx`
- framework/tool required names:
  - `package.json`
  - `package-lock.json`
  - `tsconfig*.json`
  - `vite.config.*`
  - `eslint.config.*`
- test files: `*.test.*`, `*.spec.*`
- ambient declarations: `*.d.ts`
- conventional docs: `README.md`

## Legacy Exception Handling Rules

For incremental adoption, V0.1.2 classifies non-canonical in-scope files as `legacy-exception` when they do not clearly claim canonical syntax.

A file is `invalid-ambiguous` instead of `legacy-exception` when it presents canonical intent but violates contract deterministically, including:

- missing-role candidate detection is bounded by normalized registry-backed patterns:
  - two-dot-segment form: `<semantic>.<ext>`
  - compound extension form: `<semantic>.module.css` (reported extension remains `module.css`)
- unknown role segment in canonical position
- deprecated role segment in canonical position
- semantic-name casing violation in canonical position
- hyphen-appended role ambiguity

## Determinism Requirements

- normalize path separators to `/`
- scope profile include sets are explicit
- deduplicate overlapping inclusions before classification
- sort findings by normalized path ascending
- stable classification and code assignment per filename
- deterministic summary breakdown ordering
- same scope + same repository state => identical counts and ordering

## Summary / Reporting Expectations by Scope

- `repo`: full baseline for complete repository migration visibility
- `app`: app-focused baseline to reduce non-app noise
- `docs`: docs-focused baseline for documentation naming profile visibility
- `validator`: validator-focused baseline for validator package and scripts
- `system`: root-tooling baseline for system-level configuration files

## Non-Goals (V0.1.2)

- changed-files mode (deferred)
- no automatic rename suggestions beyond optional textual hints
- no repository-wide rename migration
- no automatic suppression generation
- no cross-file semantic validation
- no role taxonomy expansion for `provider`/`catalog`/`ids`/`anchor` in this slice
- no surface-aware role validity enforcement yet (category↔surface matrix remains governance-only in this slice)
