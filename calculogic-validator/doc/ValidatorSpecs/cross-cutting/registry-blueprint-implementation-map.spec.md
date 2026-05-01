# Registry Blueprint Implementation Map

- **Classification:** Informative
- **Applies to:** Calculogic validator registry blueprint alignment, current implementation mapping, and extraction planning.
- **Status:** Active alignment map.
- **Authority posture note:** This document maps **current implementation reality** to the **target architecture**. It does not change runtime behavior, registry ownership, config contracts, or report output.

## Purpose

This map aligns the living registry blueprint with **current implementation reality**.

It explicitly separates:

- **current runtime truth**
- current-but-slice-local behavior
- **target architecture**
- **staged implementation path**

## How to Read This Map

This is an alignment map, not a runtime spec and not an immediate implementation checklist for every blueprint concept.

Interpretation guardrails:

- storage shape does not need to equal runtime shape
- perspective registries must not become competing truth
- normalization/resolution owns deterministic runtime interpretation
- slice-local ownership remains valid until suite-level promotion is justified

## 1. Current Runtime Truth

### Naming registries

Currently implemented under:

`calculogic-validator/naming/src/registries/_builtin/`

Current registry payloads include:

- `categories.registry.json`
- `roles.registry.json`
- `reportable-extensions.registry.json`
- `reportable-root-files.registry.json`
- `summary-buckets.registry.json`
- `missing-role-patterns.registry.json`
- `finding-policy.registry.json`
- `overlay-capabilities.registry.json`
- `case-rules.registry.json`

### Naming registry-state

Current owner:

`calculogic-validator/naming/src/registries/registry-state.logic.mjs`

Current behavior:

- loads builtin registry payloads
- supports custom registry state
- supports config overlay state where implemented
- validates category/status shape for role entries
- normalizes grouped `rolesByCategory` storage into flat runtime role entries
- returns deterministic registry source and digest metadata

### Tree advisor

Current behavior:

- Tree exists as a report-first advisory slice
- Tree owns folder/repository-structure interpretation
- Tree consumes Naming bridge outputs where staged by the runner
- Tree must not re-derive Naming semantic-family interpretation from filenames
- shim/compat diagnostics exist as Tree-adjacent advisory behavior

### Runner / reporting

Current behavior:

- `validate:naming`
- `validate:tree`
- `validate:all`
- scope handling
- target filtering
- report capture workflows
- report-first output behavior

## 2. Current but Slice-Local

The **target architecture** treats **Category**, **Role**, and **Surface** as shared canonical entities.

**Current implementation reality**:

- Category and Role registry payloads currently live under Naming builtin registries.
- `roles.registry.json` is currently a Naming-owned grouped runtime input payload (via `rolesByCategory`).
- Runtime role/category normalization is currently performed by Naming registry-state logic.
- This is intentional in the current slice and is not current runtime truth for suite-shared registry ownership.

Current rule:

Keep categories and roles in Naming until a suite-shared extraction task has clear consumers, loader changes, and tests.

Current implementation posture:

Shared-contract-aligned, but slice-local implementation.

## 3. Target Architecture

The following living-document blueprint concepts are valid **target architecture**, but are **not current runtime truth**:

- `roles.registry.json` as the suite-shared canonical Role entity registry (target architecture, not current runtime truth)
- `category-role-perspective.registry.json`
- `surfaces.registry.json`
- `structural-homes.registry.json`
- `agnostic-core-meanings.registry.json`
- `category-surface-perspective.registry.json`
- `surface-structural-home-perspective.registry.json`
- `relationship-types.registry.json`
- `relationships.registry.json`
- Tree-owned `folder-kinds.registry.json`
- Tree-owned `structural-home-signal-policy.registry.json`
- Tree-owned `semantic-home-policy.registry.json`

Tree-side parity explanation for this **target architecture**:

- Naming-side context: Category → Role → agnostic-core meanings.
- Tree-side context: Surface → Structural Home → agnostic-core meanings / signal strength.
- `surface-structural-home-perspective.registry.json` provides placement evidence, not automatic placement truth.
- Tree owns final placement confidence.

Implementation rule for this group:

These concepts belong to the **staged implementation path** and require explicit ownership, loader/resolver contracts, and tests before implementation work.

## 4. Staged Implementation Path

Registry-model migration sequence:

1. docs/spec alignment
2. data-only registry payloads
3. registry shape tests
4. loader compatibility bridges
5. runtime behavior migration
6. extraction preparation

Additional staged items (still **not current runtime truth**):

- lexical coherence validator
- catch-all detection
- command confidence/noise-depth UX
- standalone compat validator slice
- broad customization command system
- full suite-shared registry extraction

## 5. Immediate Alignment Tasks

1. Keep the current Naming registry-state implementation as the runtime source for Category/Role interpretation in the current slice.
2. Keep current Category and Role implementation Naming-owned until shared consumers, loaders, and tests are scoped.
3. Keep grouped `rolesByCategory` storage documented as **current implementation reality**, not architectural failure.
4. Keep the living-document separation between canonical Role identity (`roles.registry.json`) and Category → Role perspective records (`category-role-perspective.registry.json`) as **target architecture**.
5. Follow the staged sequence explicitly: docs/spec alignment → data-only registry payloads → registry shape tests → loader compatibility bridges → runtime behavior migration → extraction preparation.

## 6. Non-goals

This task does not:

- move registry files
- create suite-shared registry loaders
- create a mega-registry
- change validator runtime behavior
- change config contracts
- change report output
- implement surfaces/definitions/relationships registries
- implement Tree structural-home registries
- implement lexical coherence
- change Naming or Tree validation behavior

## 7. Related Documents

- [`registry-model-and-slice-interaction.spec.md`](./registry-model-and-slice-interaction.spec.md)
- [`../../ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`](../../ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md)
- [`../../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`](../../ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md)
- [`../tree-structure-advisor-validator.spec.md`](../tree-structure-advisor-validator.spec.md)
- [`../../ConventionRoutines/NamingValidatorSpec.md`](../../ConventionRoutines/NamingValidatorSpec.md)
