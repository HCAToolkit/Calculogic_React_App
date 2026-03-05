# Registry Customization State System (Built-in vs Custom) — Draft

- **Status:** Draft / document-plan
- **Applies to:** Validator suite registry state handling (starting with naming registries)
- **Report-only note:** This proposal changes registry input selection and report metadata transparency only. It does **not** add enforcement mode behavior or fix execution.

## 1) Purpose and scope

### Why this exists

Current validator workflows often require passing `--config` repeatedly to test alternative registry content. This draft proposes a validator-owned registry-state UX that:

- keeps an immutable built-in baseline;
- supports controlled customization through explicit commands;
- allows predictable default/custom switching without requiring `--config` every run.

### What this covers

- Registry state selection (`builtin` vs `custom`) and active-state resolution.
- Customization command semantics for writing custom registry state.
- Deterministic equality detection via canonicalization + stable stringify + SHA-256 digest.
- Report metadata additions that disclose which registry state was used.

### What this does not cover

- No enforcement-mode introduction.
- No fix/auto-remediation execution.
- No validator algorithm changes beyond selecting registry inputs and reporting metadata.

## 2) Core concepts and vocabulary

- **Built-in registry**: Immutable canonical baseline shipped with validator source. Customization commands never mutate it.
- **Custom registry**: Mutable registry payload under validator-owned custom paths; changed only by dedicated customization commands.
- **Resolved registry**: Effective registry loaded at validation runtime after applying active-state selection.
- **Active registry switch**: Single mutually exclusive state flag: `activeRegistry: "builtin" | "custom"`.
- **Canonicalization**: Normalization step producing deterministic plain-JSON registry representation before digesting/comparison.
- **Stable stringify**: Deterministic recursive JSON serialization with stable object-key ordering and defined array normalization rules.
- **Digest**: `sha256(stableStringify(canonicalRegistry))`.

## 3) Data model (draft minimal state)

Proposed registry-state meta model (single state file):

```json
{
  "activeRegistry": "builtin",
  "builtinDigest": "<sha256-hex>",
  "customDigest": "<sha256-hex>",
  "lastUpdatedAt": "2026-01-01T00:00:00.000Z",
  "schemaVersion": "1"
}
```

### Field definitions

- `activeRegistry` (required): enum `"builtin" | "custom"`; runtime selector.
- `builtinDigest` (required): digest of canonical built-in resolved registry.
- `customDigest` (required): digest of canonical custom resolved registry.
- `lastUpdatedAt` (optional): ISO timestamp set by customization operations.
- `schemaVersion` (optional): state schema version string/number.

### Mutation policy

- Customization commands update state meta.
- Normal validation runs read state meta and registry payloads only.
- Optional guard behavior (draft decision): validation run may recompute+warn on stale digest mismatch but should not silently rewrite state unless explicitly configured.

## 4) File layout proposal (under `calculogic-validator/src/...`)

```text
calculogic-validator/src/
  naming/
    registries/
      _builtin/
        roles.registry.json
        categories.registry.json
        ...
      _custom/
        roles.registry.custom.json
        categories.registry.custom.json
        ...
      registry-state.json
      resolved/
        current-registry.ts
        current-roles.ts
        current-categories.ts
```

### Responsibilities

- `_builtin/**`: canonical immutable shipped registries.
- `_custom/**`: mutable custom payloads written by customization commands.
- `registry-state.json`: active switch + digest metadata.
- `resolved/current-*`: import/export adapters that read `activeRegistry` and route to built-in or custom payload.

### Edit constraints

- Customization commands may edit only:
  - `_custom/**`
  - `registry-state.json`
- Customization commands must never edit `_builtin/**`.

## 5) Canonicalization rules (for digest/equality)

### Object normalization

- Recursively normalize to plain JSON values only (`object`, `array`, `string`, `number`, `boolean`, `null`).
- Reject/strip non-JSON values (`undefined`, functions, `Map`, `Set`, symbols, BigInt) via deterministic policy (draft decision: hard error vs drop-with-warning).
- Sort object keys lexicographically at every depth.

### Array normalization

Arrays must be classified by schema as one of:

1. **Ordered arrays** (sequence is semantic): preserve order exactly.
2. **Set-like arrays** (membership is semantic): sort deterministically.

For naming registry initial scope:

- Roles list is set-like → canonical sort key: `role` ascending, tie-breaker by full stable-stringified item.
- Category identifier lists (if treated as set-like) sort ascending by identifier.
- Rule pipelines/priority lists (if sequence semantics exist) remain ordered arrays.

### Optional/default fields

- Normalize empty optional notes/comments by omission (`"notes": ""` => field omitted).
- Normalize absent optional booleans/flags to explicit defaults only if schema mandates defaults.
- Maintain a single canonical rule per field in schema notes to prevent digest drift.

### Serialization rule

- Canonical output must be plain JSON and then stable-stringified deterministically.

## 6) State transition algorithm (post-customization)

After **every** customization operation:

1. Build canonical built-in resolved registry `B*`.
2. Build canonical custom resolved registry `C*`.
3. Compute digests:
   - `B = sha256(stableStringify(B*))`
   - `C = sha256(stableStringify(C*))`
4. If `C === B`:
   - set `activeRegistry = "builtin"`
   - optional cleanup decision: clear/reset `_custom/**` payloads to empty canonical no-op state.
5. Else (`C !== B`):
   - set `activeRegistry = "custom"`
6. Persist `builtinDigest`, `customDigest`, and optionally `lastUpdatedAt`.

Validation commands then only:

- read `activeRegistry`;
- load resolved registry from corresponding source;
- include report metadata fields (see Section 8).

## 7) Customization command UX (draft command surface)

> Draft behavior contract only; no implementation commitment implied by this document.

### `customize:init`

- **Inputs:** optional scaffold mode/target slice.
- **Effects:** ensure `_custom/**` exists with canonical empty/seed payloads; compute digests; update meta.
- **Editable files:** `_custom/**`, `registry-state.json`.
- **Determinism:** same built-in + same init options => identical custom payload and digests.

### `customize:add-role`

- **Inputs:** role identifier + optional metadata fields.
- **Effects:** add/merge role in custom payload, canonicalize, recompute digests + active state.
- **Editable files:** `_custom/**`, `registry-state.json`.
- **Determinism:** idempotent insert/merge semantics; repeated same command yields identical payload.

### `customize:disable-role`

- **Inputs:** role identifier.
- **Effects:** mark role disabled (or remove, per schema decision), canonicalize, recompute digests/state.
- **Editable files:** `_custom/**`, `registry-state.json`.
- **Determinism:** same input always yields same normalized representation.

### `customize:disable-category`

- **Inputs:** category identifier.
- **Effects:** disable category in custom payload, canonicalize, recompute digests/state.
- **Editable files:** `_custom/**`, `registry-state.json`.
- **Determinism:** deterministic category targeting and sorted derived lists.

### `customize:reset`

- **Inputs:** optional scope (`all` default; or by registry slice).
- **Effects:** clear selected custom payloads back to canonical no-op state; recompute digests/state.
- **Editable files:** `_custom/**`, `registry-state.json`.
- **Determinism:** equivalent scope + baseline always returns same resulting payload.

### `customize:status`

- **Inputs:** optional verbosity.
- **Effects:** read-only status output (`activeRegistry`, digest pair, divergence summary).
- **Editable files:** none (read-only).
- **Determinism:** same on-disk state => byte-equivalent machine-readable output (if offered).

### `customize:sync`

- **Inputs:** none (or optional `--strict`).
- **Effects:** force recompute canonical forms, digests, and active state from current files.
- **Editable files:** `registry-state.json` (and optionally canonical rewrite of `_custom/**` if command defines formatting normalization).
- **Determinism:** same inputs always converge to same digests and state.

## 8) Report metadata additions (report-only transparency)

Proposed additive fields in validator report envelope:

- `registryState`: `"builtin" | "custom"`
- `registrySource`: `"builtin" | "custom"` (explicit selected source for this run)
- `registryDigests`: `{ "builtin": "...", "custom": "...", "resolved": "..." }`

Notes:

- `resolved` may equal `builtin` or `custom` digest based on active selection.
- These fields are metadata-only and do not alter finding semantics or enforcement behavior.

## 9) Relationship to existing `--config` system (draft decisions)

This draft treats registry-state UX as potentially layered with CLI config overrides.

### Candidate priority model (draft)

1. If `--config` is provided, explicit CLI config has top priority for that run.
2. Else, validator resolves via `activeRegistry` state.
3. Built-in remains fallback if custom payload is absent/invalid per chosen failure mode.

### Open decision points

- Should `--config` fully bypass persisted registry state or compose with it?
- Should digest metadata in reports include both persisted state digests and effective `--config` digest?
- Should registry-state commands be limited to vendored/local repos only?

## 10) Determinism and safety constraints

- Built-in sources are immutable under customization workflow.
- No network calls during customization or validation registry selection.
- No nondeterministic ordering in canonicalization or serialization.
- All derived lists sorted via explicit rules.
- Digest algorithm fixed to SHA-256 over stable-stringified canonical JSON.
- Malformed custom payload handling must be explicit (draft decision):
  - **Option A:** hard error and abort validation.
  - **Option B:** report-friendly fallback to built-in + structured warning.
  - Chosen behavior should be stable and documented before implementation.

## 11) Non-goals and deferred items

- Enforcement mode or fix execution workflows.
- Profile marketplace/sharing/distribution features.
- Multi-slice generic registry framework beyond naming (possible future extension, out of scope for this draft).

## 12) Rollout notes (draft planning aid)

- Start with naming registries only.
- **Phase 1 landed:** read-path-only registry resolution, digest computation, and report metadata emission (`registryState`, `registrySource`, `registryDigests`) are in place.
- Phase 1 remains non-mutating: no customization mutation commands/UX are shipped yet.
- Add customization commands in incremental phases.
- Gate future expansion to other validator slices behind explicit follow-up specs.
