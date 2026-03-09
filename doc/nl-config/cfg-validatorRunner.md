# cfg-validatorRunner

## 0.0 Version

Current implementation target: **V0.1.5** (canonical report-envelope aliases and source snapshot metadata).

## 1.0 Purpose

Provide a deterministic runner that executes one or more registered validators and returns a single versioned combined report.

## 2.0 Inputs and Source of Truth

### 2.1 Validator registry

The runner reads validator definitions from a deterministic registry in `calculogic-validator/src/core/validator-registry.knowledge.mjs`.

### 2.2 Runtime options

- `validators` (optional list of validator IDs)
- `scope` (optional scope string forwarded to validators that support scope selection)
- `config` (optional loaded validator config object from JSON contract V0.1)
- `targets` (optional repeatable path filters forwarded to validators that implement target-aware filtering)

### 2.3 Validator set

- V0.1.0 started with naming validator registration only.
- V0.1.6 adds the second real slice: `tree-structure-advisor` (advisory-only/report-first).
- Runner continues to preserve deterministic registry declaration ordering when executing multiple slices.

### 2.4 Metadata injections

Runner accepts optional host-provided report metadata:

- `toolVersion` (validator package version)
- `configDigest` (stable digest of normalized loaded config)

## 3.0 Combined Report Contract

### 3.1 Report envelope

- `version`
- `mode` (`report`)
- optional `scope`
- optional `toolVersion`
- optional `validatorId` (canonical alias, stable runner identity)
- optional `validatorVersion` (canonical alias of tool version when provided)
- optional `configDigest`
- optional `sourceSnapshot` (`source = "fs"` plus optional git metadata/diagnostics)
- `startedAt`, `endedAt`, `durationMs`
- `validators` (deterministic execution order)

### 3.2 Validator entry shape

Each validator entry includes:

- `id`
- optional `validatorId` (canonical alias of `id`)
- `description`
- `scope`
- `totalFilesScanned`
- `counts` (if available)
- additional pass-through summary keys when provided (`codeCounts`, `specialCaseTypeCounts`, etc.)
- `findings`
- optional `meta`

### 3.4 Per-validator filter metadata (V0.1.4)

- Runner preserves report schema compatibility by attaching optional filter metadata only to validator entries that actively use filtering.
- For naming validator, when target filtering is active:
  - `validators[n].meta.filters.isFiltered = true`
  - `validators[n].meta.filters.targets = [sorted, deduped, repository-relative paths with '/' separators]`
- When no targets are provided, naming validator entries omit `meta.filters` entirely.

### 3.3 Ordering and determinism

- Validator execution order matches registry declaration order.
- Findings order from each validator is preserved as-is (no resorting in the runner).

## 4.0 CLI Contract (`validate-all`)

### 4.1 Inputs

- `--help`
- `--scope=<repo|app|docs|validator|system>` (optional)
- `--validators=<id1,id2>` (optional)
- `--target=<path>` or `--target <path>` (optional, repeatable)
- `--config=<path>` (optional JSON config path)
- `--strict` (optional legacy-exception enforcement when no warnings are present)

### 4.2 Behavior

- Resolves repository root deterministically from script location.
- Forwards `--target` values to target-aware validators as convenience filters applied within selected scope.
- Performs npm argument-forwarding footgun detection before parsing CLI:
  - Primary path: if `npm_config_argv` is parseable, detect supported validator flags supplied to npm while absent in forwarded argv.
  - Fallback path (npm v7+ / Codespaces): when `npm_config_argv` is unavailable, use deterministic `npm_config_<flag>` heuristics gated by lifecycle event and only when forwarded argv lacks supported flags.
  - Fallback suspicious env detection uses stable ordering and low-false-positive rules: known scopes (`repo|app|docs|validator|system`), non-empty target/config, truthy strict (`true|1|yes`), and validator list indicators (`naming` or comma-list).
- Executes runner with selected options.
- Writes JSON report to stdout.
- Resolves ordered exit-policy mappings from builtin validator registry payload (`src/registries/_builtin/exit-policy.registry.json`) via runtime loader while keeping predicate evaluation deterministic in code.
- Exits `2` when any aggregated finding has `severity="warn"`.
- Exits `1` only in strict mode when no warnings exist and any aggregated finding has `classification="legacy-exception"`.
- Exits `0` when neither condition applies.
- Exits `1` for usage errors (invalid flags, unknown validator IDs, invalid scope).
- Exits `1` for malformed target input (e.g., missing `--target` value) and deterministic target resolution errors (e.g., nonexistent target).

## 5.0 Deferred Behavior

Deferred to future slices:

- enforcement/fail modes
- changed-files mode
- parallel validator execution
- validator dependency graph orchestration
- report persistence and baselining
