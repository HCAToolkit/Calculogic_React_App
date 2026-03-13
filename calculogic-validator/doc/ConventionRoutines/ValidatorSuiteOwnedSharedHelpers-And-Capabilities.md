# Validator Suite-Owned Shared Helpers and Capabilities Inventory

Classification: Normative

## 1) Purpose

This document is the canonical implementation-facing inventory for **currently existing** suite-owned shared helpers and reusable capabilities.

It is a reuse/navigation guide for implementation work so contributors can deterministically answer:

- whether a suite-owned shared helper/capability already exists,
- where it lives, and
- when to reuse it instead of reimplementing ad hoc.

This document complements, but does not replace:

- `ValidatorHelperAreas-And-Reuse-Conventions.md`
- `ValidatorLoaderConverterRuntimeOwnership-Contract.md`

## 2) Authority and boundary note

- This inventory is for reuse/navigation guidance.
- Canonical ownership and boundary rules remain governed by the existing ownership docs listed above.
- Do **not** interpret this inventory as permission to move slice-owned behavior into suite-core.
- Similar-looking behavior is not automatically shared behavior; ownership remains concern-first.

## 3) Current suite-owned shared helper/capability inventory

Only currently real, discoverable suite-owned surfaces are listed here.

### 3.1 Entry: suite-core CLI helper area

- **Owner:** suite-core
- **Path/area:** `calculogic-validator/src/core/cli/`
- **Concern:** shared validator CLI scaffolding for usage/error output flow and repeatable CLI argument parsing.
- **Reusable capability:**
  - structured report emission helpers via `validator-cli-output.logic.mjs`
  - usage/usage-error formatting and output via `validator-cli-usage.logic.mjs`
  - repeatable `--target` parsing/normalization via `validator-cli-targets.logic.mjs`
  - scope token/order and scope usage-line helpers via `validator-cli-scopes.logic.mjs`
- **When to reuse:**
  - adding/updating validator CLI entrypoints (`validate:naming`, `validate:tree`, `validate:all`, or new suite CLIs)
  - implementing repeatable `--target` argument handling
  - implementing consistent scope usage output derived from suite scope vocabulary
  - implementing report-first stdout emission + usage/error stderr behavior
- **When not to reuse:**
  - slice-internal runtime logic that is not CLI-facing
  - slice-specific parser semantics that belong to slice-owned CLI areas
- **Reuse boundary type:** helper-area reuse

### 3.2 Entry: shared scoped snapshot/input helper boundary

- **Owner:** suite-core
- **Path/area:** `calculogic-validator/src/core/suite-scoped-snapshot-input.logic.mjs`
- **Concern:** suite-owned scope profile selection and deterministic in-scope path/input collection.
- **Reusable capability:**
  - scope-profile read
  - `includeRoots` walking
  - `includeRootFiles` inclusion
  - normalized path collection
  - optional target filtering
  - deterministic sort/dedupe for selected path sets
- **When to reuse:**
  - any slice validator that needs suite-owned scope selection before slice interpretation
  - any cross-slice validator/composition that needs the same suite scope boundary
  - any implementation that must preserve suite-consistent scope + target semantics
- **When not to reuse:**
  - logic deciding what selected paths *mean* for a specific slice
  - slice heuristics that should remain slice-owned interpretation behavior
- **Reuse boundary type:** runtime boundary reuse (and composition boundary reuse for cross-slice composition)

### 3.3 Entry: suite-core exit policy derivation helper

- **Owner:** suite-core
- **Path/area:** `calculogic-validator/src/core/validator-exit-code.logic.mjs`
- **Concern:** deterministic suite exit-code derivation from findings and strict-mode semantics.
- **Reusable capability:**
  - derive exit code from findings (`deriveExitCodeFromFindings`)
  - derive exit code from composed runner reports (`deriveExitCodeFromRunnerReport`)
  - application of suite builtin exit policy predicates without duplicating policy checks in each CLI
- **When to reuse:**
  - any validator CLI that must map findings/report outputs to suite-consistent exit codes
  - composed suite execution paths where multiple validator findings feed one exit status
- **When not to reuse:**
  - non-validator tooling with intentionally different exit semantics
  - experimental policy behavior not yet part of suite exit policy contract
- **Reuse boundary type:** runtime boundary reuse

### 3.4 Entry: suite-core report meta + source snapshot helpers

- **Owner:** suite-core
- **Path/area:**
  - `calculogic-validator/src/core/validator-report-meta.logic.mjs`
  - `calculogic-validator/src/core/source-snapshot.logic.mjs`
- **Concern:** deterministic shared metadata helpers used in validator report envelopes.
- **Reusable capability:**
  - tool version lookup and stable hashing/digest helpers for config/report metadata
  - git/filesystem source snapshot metadata capture for report reproducibility context
- **When to reuse:**
  - constructing validator or runner report envelopes that require suite-consistent metadata fields
  - computing deterministic config digest/fingerprint values used across validators
- **When not to reuse:**
  - slice-specific finding logic or traversal mechanics
  - policy registry canonicalization that belongs in loader/converter layers
- **Reuse boundary type:** composition boundary reuse

## 4) Guardrails

- Do **not** invent shared helpers in this inventory that do not currently exist.
- Do **not** treat runner/composition/runtime modules generically as "helpers" unless the reusable capability is explicit and bounded.
- Do **not** bypass slice ownership just because behavior looks similar.
- Prefer reuse of actual suite-owned capabilities above over ad hoc reimplementation when concern + owner match.

## 5) Codex-oriented usage note

Before adding new cross-slice helper logic:

1. Check this inventory first.
2. If an existing suite-owned helper/capability matches both concern and owner, reuse it.
3. If no entry matches, fall back to:
   - `ValidatorHelperAreas-And-Reuse-Conventions.md` for helper-area routing, and
   - `ValidatorLoaderConverterRuntimeOwnership-Contract.md` for loader/converter/runtime boundary ownership.

This keeps implementation ROI aligned with clear boundaries, deterministic organization, and extraction-friendly growth.
