# Validator Config Spec (V0.1)

Status: **Canonical**

## Report-only note (current behavior)

The naming validator remains **report-first** for detection and findings emission. Supplying validator config changes report inputs/metadata and may additionally enable strict exit semantics via `strictExit`. It does **not** enable fix execution or broader mode selection.

## 1) Purpose

This spec defines the canonical validator config contract for current naming-validator usage. The config provides strict, deterministic input for registry shaping (reportable extension additions and role metadata additions) and reproducible report metadata.

## 2) Versioning

- Required field: `version`
- Required value: `"0.1"`
- Contract source: `VALIDATOR_CONFIG_VERSION` in `src/core/config/validator-config.contracts.mjs`

Any other version value is invalid.

## 3) Schema

Canonical JSON Schema file:

- `calculogic-validator/src/validator-config.schema.json`

Schema and runtime validation are aligned:

- Unknown keys are rejected at all documented strictness points.
- Root `$schema` is allowed as an editor/tooling hint and is ignored by runtime normalization.

## 4) Allowed keys (current)

### 4.1 Root object

Allowed root keys:

- `version` (required, const `"0.1"`)
- `$schema` (optional string hint)
- `strictExit` (optional boolean; enables strict exit semantics for naming CLI)
- `naming` (optional object)

### 4.2 `naming`

Allowed keys:

- `reportableExtensions` (optional object)
- `roles` (optional object)

### 4.3 `naming.reportableExtensions`

Allowed keys:

- `add` (optional array of strings)

Rules for each `add[]` entry:

- Must be a string.
- String is trimmed by normalization.
- Trimmed value must start with `.`.

### 4.4 `naming.roles`

Allowed keys:

- `add` (optional array of role metadata objects)

Rules for each `add[]` entry object:

- `role`: required non-empty string (trimmed by normalization)
- `category`: required enum
  - `concern-core`
  - `architecture-support`
  - `documentation`
  - `deprecated`
- `status`: required enum
  - `active`
  - `deprecated`
- `notes`: optional string

No other keys are allowed on role entries.

## 5) Strictness rules

Unknown keys are rejected at:

- root
- `naming`
- `naming.reportableExtensions`
- `naming.roles`
- each `naming.roles.add[]` object

Special case:

- root `$schema` is explicitly allowed as a hint key.
- `$schema` is not retained in normalized config output.

## 6) Normalization rules (deterministic)

Runtime loading returns normalized config with deterministic shaping:

- Output always sets `version: "0.1"`.
- `strictExit` is retained only when provided.
- `role` strings are trimmed.
- extension strings are trimmed.
- extension additions are de-duplicated after trim (`Set` semantics).
- `roles.add` entries are de-duplicated by trimmed `role` value; **first occurrence wins**.
- `naming` is included in normalized output only when at least one supported naming addition list is present.

## 7) Merge semantics in naming runtime

Current naming wiring applies normalized config additively:

- `reportableExtensions` runtime set = defaults ∪ config additions.
- role metadata runtime map = default metadata map + config additions **only when role key does not already exist**.
- active roles are derived from merged metadata where `status === "active"`.
- role suffix list is derived from merged role keys sorted by descending string length.

## 8) CLI consumption

Config flag (exact form):

- `--config=<path>`

Current failure modes when config is supplied:

- cannot read file → error
- cannot parse JSON → error
- invalid config shape/content → error

When a valid config is supplied, naming reports may include:

- `configDigest`

Strict-exit resolution for naming CLI uses existing exit-policy semantics:

- Effective strictness is `true` when CLI `--strict` is present.
- Otherwise, effective strictness is `true` when `config.strictExit === true`.
- Otherwise, effective strictness is `false`.
- Report JSON is emitted before exit code is derived/applied.

This behavior applies to:

- `calculogic-validator/scripts/validate-naming.mjs`
- `calculogic-validator/bin/calculogic-validate-naming.mjs`

## 9) Valid examples

### 9.1 Minimal

```json
{
  "version": "0.1"
}
```

### 9.2 Add one role

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
          "status": "active",
          "notes": "Custom runtime architecture role"
        }
      ]
    }
  }
}
```

### 9.3 Add one extension

```json
{
  "$schema": "./calculogic-validator/src/validator-config.schema.json",
  "version": "0.1",
  "naming": {
    "reportableExtensions": {
      "add": [".mdx"]
    }
  }
}
```

### 9.4 Combined (add role + extension)

```json
{
  "$schema": "./calculogic-validator/src/validator-config.schema.json",
  "version": "0.1",
  "naming": {
    "reportableExtensions": {
      "add": [".mdx"]
    },
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

### 9.5 Strict exit via config

```json
{
  "version": "0.1",
  "strictExit": true
}
```
