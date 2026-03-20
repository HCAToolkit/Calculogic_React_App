# Configuration: Validator Naming Registry Report Metadata (cfg-validator-naming-registry-report-metadata)

Project: Calculogic Validator (calculogic-validator)
Type: Configuration
Scope: validator CLI + runner metadata plumbing
Passes: 2

## 1. Purpose and Scope

Add read-path registry-state metadata from naming validator results into script/bin report envelopes and runner validator meta.

## 2. Configuration Contracts

- Naming validator already returns `result.registry`.
- Script/bin envelopes should include registry metadata when present.
- Runner validator entries should expose `meta.registry` without losing `meta.filters`.

## 3. Build Concern

### 3.1 Containers

- Script report builder in `scripts/validate-naming.host.mjs`.
- Bin report builder in `bin/calculogic-validate-naming.host.mjs`.
- Runner hook metadata assembler in `src/core/validator-registry.knowledge.mjs`.

### 3.2 Subcontainers

- Conditional spread of registry fields in top-level report objects.
- Conditional assembly of runner `meta` object from filters + registry.

### 3.3 Primitives

- `registryState`
- `registrySource`
- `registryDigests`

## 4. BuildStyle Concern

N/A (non-visual).

## 5. Logic Concern

- Preserve existing exit-code behavior.
- Add `sourceSnapshot` and `validatorVersion` parity in bin envelope.
- Keep naming registry resolver behavior deterministic while validating custom role
  categories from `_builtin/categories.registry.json` during resolver flow (not module init).

## 6. Knowledge Concern

- Update schema and registry-state docs for optional registry metadata fields and runner placement.
- Maintain `_builtin/reportable-extensions.registry.json` parity with intended built-in
  reportable extension coverage.

## 7. Results Concern

- JSON report payloads include registry metadata fields when `result.registry` exists.

## 8. ResultsStyle Concern

N/A (non-visual).

## 9. Assembly and Integration

- Integration-ish tests invoke script, bin, and runner CLIs via `spawnSync` and verify metadata presence + digest shape.

## 10. Implementation Passes

1. Update docs and code envelopes/meta plumbing.
2. Add integration-ish tests.
3. Run full test suite.
4. Follow-up nits: restore intended built-in reportable extension parity and thread
   builtin category allowlist through resolver validation flow.
