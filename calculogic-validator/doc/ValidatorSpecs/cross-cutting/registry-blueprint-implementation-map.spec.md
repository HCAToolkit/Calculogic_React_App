# Registry Blueprint Implementation Map

- **Classification:** Informative
- **Applies to:** Calculogic validator registry blueprint alignment, current implementation mapping, and future registry extraction planning.
- **Status:** Active alignment map.
- **Authority posture note:** This document maps current implementation reality to the target registry blueprint. It does not change runtime behavior, registry ownership, config contracts, or report output.

## Purpose

This map aligns the living registry blueprint with current repository implementation reality.

It explicitly separates:

- implemented/current runtime behavior
- current-but-slice-local behavior
- target architecture
- deferred/future work

## How to Read This Map

This is an alignment map, not a runtime spec and not an immediate implementation checklist for every blueprint concept.

Interpretation guardrails:

- storage shape does not need to equal runtime shape
- perspective registries must not become competing truth
- normalization/resolution owns deterministic runtime interpretation
- slice-local ownership remains valid until suite-level promotion is justified

## 1. Implemented / Current Runtime Truth

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

The target blueprint treats **Category**, **Role**, and **Surface** as shared canonical entities.

Current implementation reality:

- Category and Role registry payloads currently live under Naming builtin registries.
- `rolesByCategory` is currently a Naming-owned grouped storage payload.
- Runtime role/category normalization is currently performed by Naming registry-state logic.
- This is intentional for now and should not be treated as architectural failure.

Current rule:

Keep categories and roles in Naming until a future suite-shared extraction task has clear consumers, loader changes, and tests.

Current implementation posture:

Shared-contract-aligned, but not yet suite-shared implementation.

## 3. Target Architecture / Not Yet Implemented

The following blueprint concepts are valid target architecture, but are not current runtime truth:

- `surfaces.registry.json`
- `definitions.registry.json`
- `relationships.registry.json`
- allowed-surfaces-by-category registry or relationship view
- agnostic-core meanings registry
- formal Tree `folder-kinds.registry.json`
- formal Tree `structural-homes.registry.json`
- Tree structural-home relationship registry
- weak structural-home signal registry
- anti-pattern structural-home signal registry

Implementation rule for this group:

These may be implemented later only after ownership, loaders/resolvers, and tests are explicitly defined.

## 4. Deferred / Future Work

The following are valid future directions and are not current implementation obligations:

- lexical coherence validator
- catch-all detection
- command confidence/noise-depth UX
- standalone compat validator slice
- broad customization command system
- full suite-shared registry extraction

## 5. Immediate Alignment Tasks

1. Keep the current Naming registry-state implementation as the runtime source for categories/roles until extraction is justified.
2. Keep the living document’s shared Category/Role/Surface model as target architecture.
3. Document future shared registry extraction before moving files.
4. Avoid creating surfaces, definitions, relationships, or Tree structural-home registries until loaders/resolvers/tests are scoped.
5. Keep future lexical/coherence work as deferred draft material.

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
