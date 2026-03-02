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

- `report`: report findings only; non-usage findings do not fail by default.
- `soft-fail`: report findings and fail only under configured soft-fail thresholds/scope gates.
- `hard-fail`: report findings and fail deterministically on configured hard-fail conditions.
- `correct`: execute explicitly allowed safe fix plans in addition to reporting.
- `replace`: execute explicitly allowed structural fix plans in addition to reporting.

Normative rule:

- **Modes must not change detection.** For identical inputs and config, the finding set is identical across modes. Modes only change:
  1. exit code policy, and
  2. whether a deterministic fix plan is executed.

## 3) Shared Report Envelope (Canonical)

Each validator slice should emit a stable high-level report envelope:

- `validatorId`
- `validatorVersion`
- `mode`
- `scope`
- `targets[]` (optional)
- `sourceSnapshot` (filesystem/git reference data; dirty/untracked diagnostics are metadata)
- `configFingerprint` (hash/fingerprint of resolved config)
- `summary` (stable counts)
- `findings[]` (deterministically sorted)
- `suggestedFix[]` (optional; when fix planning is enabled)
- `appliedFix[]` (optional; only when fixes are actually executed)

This contract is intentionally shape-level so slices can add deterministic details while preserving suite-wide comparability.

## 4) Shared Determinism Rules (Canonical)

All slices should follow these deterministic rules:

- Normalize report paths to `/` separators.
- Use stable ordering for findings and summary derivations.
- Use explicit include/exclude sets per scope profile.
- Same inputs (repo snapshot, args, resolved config) => same report.
