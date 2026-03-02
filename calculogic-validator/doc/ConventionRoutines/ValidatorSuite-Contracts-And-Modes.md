# Validator Suite Contracts and Modes

## 1) Identity and Vocabulary (Canonical)

Calculogic Validator is a modular, configurable, policy-driven validator suite. It is report-first by default and can optionally escalate findings via soft-fail/hard-fail policies or execute deterministic fix plans (correct/replace) when explicitly enabled.

Canonical terms:

- **Modular**: the suite is slice-based (for example naming, tree, structural-addressing), and slices can evolve independently while sharing common contracts.
- **Configurable / customizable**: adopters can tune resolved config profiles, scope roots, registries, thresholds, and allowlists without changing the core suite model.
- **Extensible / pluggable**: new validator slices and rules can be added through registry/runner composition without rewriting existing slices.
- **Policy-driven**: mode/policy controls exit behavior and optional fix-plan execution; mode does not redefine what is detected.
- **Report-first**: every slice defaults to `report`, producing deterministic findings output before any enforcement or fix behavior is enabled.

## 2) Shared Mode Matrix (Canonical)

Suite-wide policies over the same findings:

- `report`: report findings first; exit behavior may still be policy-driven.
- `soft-fail`: report findings and fail only under configured soft-fail thresholds/scope gates.
- `hard-fail`: report findings and fail deterministically on configured hard-fail conditions.
- `correct`: execute explicitly allowed safe fix plans in addition to reporting.
- `replace`: execute explicitly allowed structural fix plans in addition to reporting.

Normative rule:

- **Modes must not change detection.** For identical inputs and config, the finding set is identical across modes. Modes only change:
  1. exit code policy, and
  2. whether a deterministic fix plan is executed.

## 3) Report-first does not imply exit 0 (Canonical)

Report-first means findings are emitted deterministically before enforcement/fixes. It does **not** require a success exit code. Exit behavior may still be policy-driven (for example, to keep CI visibility) without changing detection or report ordering.

## 4) Current exit-code policy (as implemented today)

Current implementation policy:

- any `warn` findings => exit `2`
- when no `warn` findings exist, `--strict` with any `legacy-exception` findings => exit `1`
- otherwise => exit `0`
- invalid CLI usage => exit `1`

This is the current implementation policy and may later be generalized under suite modes (`soft-fail` / `hard-fail` / `correct` / `replace`), while detection remains unchanged.

## 5) Shared scope vocabulary (Canonical)

Current supported scope names are:

- `repo`
- `app`
- `docs`
- `validator`
- `system`

Slices may implement scope-specific include/exclude details, but the scope vocabulary should remain consistent across suite docs and slice specs.

## 6) Shared Report Envelope (Canonical)

Each validator slice should emit a stable high-level report envelope:

- `validatorId`
- `validatorVersion`
- `mode`
- `scope`
- `targets[]` (optional)
- `sourceSnapshot` (snapshot metadata only: filesystem state and/or git reference such as `HEAD`; dirty/untracked diagnostics are metadata)
- `configFingerprint` (hash/fingerprint of resolved config)
- `summary` (stable counts)
- `findings[]` (deterministically sorted)
- `suggestedFix[]` (optional; when fix planning is enabled)
- `appliedFix[]` (optional; only when fixes are actually executed)

`sourceSnapshot` values are environment metadata for reproducibility and comparison, not naming roles and not detection categories.

This contract is intentionally shape-level so slices can add deterministic details while preserving suite-wide comparability.

### Current report mapping (naming slice)

Canonical envelope is the stable suite contract; some slices currently emit equivalent fields under different names until runner unification.

- `validatorVersion` → `toolVersion`
- `validatorId` → not yet emitted by the naming report (deferred; currently not present in naming output)
- `configFingerprint` → `configDigest`
- `summary` → `counts` + `codeCounts` (plus deterministic naming-specific breakdowns such as `specialCaseTypeCounts` and warning-category/status counts)
- `findings[]` → `findings[]`
- `sourceSnapshot` → not yet emitted by the naming report (deferred)

## 7) Shared Determinism Rules (Canonical)

All slices should follow these deterministic rules:

- Normalize report paths to `/` separators.
- Use stable ordering for findings and summary derivations.
- Use explicit include/exclude sets per scope profile.
- Same inputs (repo snapshot, args, resolved config) => same report.
