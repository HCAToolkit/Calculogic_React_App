# cfg-validatorRunner

## 0.0 Version
Current implementation target: **V0.1.2** (deterministic multi-validator runner core with report metadata envelope support).

## 1.0 Purpose
Provide a deterministic runner that executes one or more registered validators and returns a single versioned combined report.

## 2.0 Inputs and Source of Truth
### 2.1 Validator registry
The runner reads validator definitions from a deterministic registry in `calculogic-validator/src/validator-registry.knowledge.mjs`.

### 2.2 Runtime options
- `validators` (optional list of validator IDs)
- `scope` (optional scope string forwarded to validators that support scope selection)
- `config` (optional loaded validator config object from JSON contract V0.1)

### 2.3 Initial validator set
V0.1.0 includes the naming validator only, wrapped through the registry run hook without changing naming-validator internals.

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
- optional `configDigest`
- `startedAt`, `endedAt`, `durationMs`
- `validators` (deterministic execution order)

### 3.2 Validator entry shape
Each validator entry includes:
- `id`
- `description`
- `scope`
- `totalFilesScanned`
- `counts` (if available)
- additional pass-through summary keys when provided (`codeCounts`, `specialCaseTypeCounts`, etc.)
- `findings`
- optional `meta`

### 3.3 Ordering and determinism
- Validator execution order matches registry declaration order.
- Findings order from each validator is preserved as-is (no resorting in the runner).

## 4.0 CLI Contract (`validate-all`)
### 4.1 Inputs
- `--help`
- `--scope=<repo|app|docs|validator|system>` (optional)
- `--validators=<id1,id2>` (optional)
- `--config=<path>` (optional JSON config path)

### 4.2 Behavior
- Resolves repository root deterministically from script location.
- Executes runner with selected options.
- Writes JSON report to stdout.
- Exits `0` on success.
- Exits `1` for usage errors (invalid flags, unknown validator IDs, invalid scope).

## 5.0 Deferred Behavior
Deferred to future slices:
- enforcement/fail modes
- changed-files mode
- parallel validator execution
- validator dependency graph orchestration
- report persistence and baselining
