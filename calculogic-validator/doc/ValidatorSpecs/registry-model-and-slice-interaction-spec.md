# Registry Model and Slice Interaction Spec (Suite-Level)

- **Classification:** Normative
- **Applies to:** Calculogic validator suite registry modeling and cross-slice registry interaction.
- **Status:** Active suite-level contract.

## Purpose

This spec defines a suite-level model for registry ownership, registry shape, and cross-slice interaction. It exists to keep validator slices independently evolvable while preserving deterministic shared contracts.

This spec intentionally formalizes **model rules**, not runtime rewrites. Existing registries and normalization behavior remain valid unless and until changed by a future implementation task.

## Terminology

- **Canonical entities**: Core nouns that represent canonical_source policy meaning in the model.
- **Perspective/projection registry**: A registry shape that emphasizes one view over shared canonical meaning (for example grouped policy view or allowed-surface view).
- **Normalization/resolution layer**: Deterministic logic that compiles one or more registry inputs into runtime-ready interpretation.
- **Slice-local registry surface**: Registry payloads owned by a single validator slice and not yet elevated to suite-shared ownership.
- **Suite-level/shared-contract registry surface**: Registry vocabulary/contracts intended for reuse across slices.
- **Suite-owned contract surface**: Suite-level shared vocabulary/compatibility contract surface that standardizes meaning across slices.
- **Suite-owned implementation surface**: Suite-level shared implementation logic/helpers used to support cross-slice reuse while preserving slice-owned concrete behavior.

## Core model

The suite uses a **multi-shape, single-meaning** registry model:

1. Canonical policy meaning is expressed through bounded core entities.
2. Multiple registry shapes may represent different perspectives of the same policy space.
3. Perspective shape is not automatically a separate canonical truth.
4. Runtime interpretation is determined by deterministic normalization/resolution logic.

Normative implications:

- Storage shape does **not** need to equal runtime shape.
- Grouped or policy-oriented source registries may be flattened or compiled for runtime.
- A perspective registry must not compete with canonical truth unless an explicit normalization contract defines precedence and derivation.

## Canonical entities

The suite-level core registry nouns are:

- **Category**
- **Role**
- **Surface**

These nouns define the baseline policy graph for validator registry interpretation.

Clarifications:

- Current slices may only partially model this graph today.
- A slice may introduce additional bounded nouns when needed for that slice’s domain.
- New nouns should extend (not bypass) the core model unless a documented exception is justified by slice boundaries and deterministic ownership.

## Perspective registries

Perspective/projection registries are allowed and expected. Typical perspectives include:

- **Grouped views** (policy grouped for readability/management).
- **Allowed-surface views** (surface-compatibility and placement-oriented policy).
- **Definition views** (expanded human-readable definitions and descriptors).
- **Relationship views** (explicit cross-entity relationship overlays).

Contract rules:

- Not every perspective must exist in code to be part of this model.
- Perspective registries are contract-valid even when introduced incrementally.
- Perspective registries must reference canonical meaning through explicit normalization/resolution rules.
- Perspective registries must not become shadow canonical_source stores through undocumented duplication.

## Normalization/resolution

Normalization/resolution is a first-class contract layer.

Responsibilities:

1. Compile registry inputs into deterministic runtime-ready state.
2. Resolve perspective-shaped payloads into a canonical runtime interpretation.
3. Apply explicit precedence/merge rules where multiple sources are present.
4. Preserve deterministic ordering/interpretation for repeatable findings.

Examples of allowed behavior:

- Flatten grouped registries into role/category lookup state.
- Resolve policy-shaped registries into executable validator constraints.
- Merge built-in + overlay/custom inputs when contract rules define this.

Normalization/resolution owns deterministic runtime interpretation; storage convenience shape does not.

## Slice-local vs suite-level ownership

### Slice-local ownership (default)

A registry should remain slice-local when:

- Its semantics are consumed by one slice only.
- Its vocabulary is still stabilizing within that slice.
- Cross-slice reuse would prematurely couple unrelated slice internals.

### Suite-level/shared ownership (elevated)

A registry concept should be elevated when:

- Multiple slices need the same noun meaning or compatibility policy.
- Drift between slice-local copies would create conflicting canonical truth.
- Suite runner/composition requires shared deterministic interpretation.

### Guardrails

- Do not duplicate canonical entities across slices without explicit derivation contracts.
- Do not create a mega-registry that collapses unrelated policy domains.
- Keep policy ownership explicit: slice-local where local, suite-shared where shared.
- Treat shared contracts and shared implementation differently: contract surfaces may be elevated when shared meaning needs stabilization, while implementation surfaces should be elevated only when real slice-owned consumers/specializers exist.
- **Normative pairing rule:** any suite-owned implementation surface must have at least one corresponding slice-owned implementation surface that consumes, specializes, or enforces it.
- Suite-owned implementation is not a standalone destination; it exists to support slice-owned behavior and shared cross-slice contracts.
- Promotion to suite-owned implementation without a real slice-owned consumer/specializer should generally be treated as a structural smell.
- Shared contracts may exist before broad reuse, but shared implementation should not be promoted speculatively.
- Suite-owned implementation should strengthen slice boundaries, not replace slice ownership.

## Cross-slice interaction

Slices may share concepts without sharing storage layout.

Cross-slice interaction rules:

1. Shared vocabulary should be referenced through suite contracts, not inferred from another slice’s private registry shape.
2. Slice-internal registry layouts remain slice-owned implementation details unless promoted.
3. Relationship overlays may connect meanings across slices, but ownership boundaries stay explicit.
4. Suite-level aggregation/composition may consume multiple slice outputs while preserving per-slice independence.
5. Shared implementation surfaces should be consumable by slices without collapsing slice-local ownership boundaries.
6. Slices remain the concrete enforcement/specialization owners even when suite-owned implementation support exists.

Expected future interconnection patterns:

- Shared meanings for category/role/surface vocabulary.
- Shared allowed-surface/placement policy surfaces where relevant.
- Relationship overlays that join slice-local entities without flattening all slices into one schema.
- Runner-level aggregation that composes slice registries through deterministic normalization contracts.

## Current validator mapping

Current validator artifacts map into this model as follows:

- **Naming built-in categories registry** (`naming/src/registries/_builtin/categories.registry.json`): canonical entity vocabulary payload (category-focused canonical_source within naming scope).
- **Naming built-in roles registry** (`naming/src/registries/_builtin/roles.registry.json`): canonical entity payload with role/category assignments and grouped perspectives.
- **Suite scope-profiles registry** (`src/registries/_builtin/scope-profiles.registry.json`): suite-level perspective registry for scope surface targeting used across runner/slice execution contexts.
- **Naming registry-state normalization logic** (`naming/src/registries/registry-state.logic.mjs`): normalization/resolution contract implementation for active registry-state selection and deterministic digest/state handling.
- **Suite validator registry composition** (`src/core/validator-registry.knowledge.mjs`): suite-level composition registry for slice runners/entrypoints.
- **Suite contracts/modes document** (`doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`): existing shared-contract layer that governs suite vocabulary, mode semantics, and cross-slice comparability.

This mapping confirms that current implementation already reflects multiple registry shapes and runtime normalization, rather than a single flat storage model.

## Future extension guidance

Future slice-specific docs should inherit this model and then specialize it for slice semantics.

Guidance:

1. Start by identifying canonical entities and ownership boundaries.
2. Add perspective registries only when they improve clarity, compatibility governance, or composability.
3. Define normalization/resolution contract text whenever perspective and canonical shapes differ.
4. Promote to suite-shared ownership only when cross-slice reuse and drift-risk justify elevation.
5. Apply the suite-owned implementation pairing rule to future shared helpers/utilities: suite-owned implementation requires at least one real slice-owned implementation consumer/specializer.

Likely future perspective registries include:

- Definition registries (expanded descriptors and deterministic glossary-level semantics).
- Relationship registries (entity-to-entity policy overlays).
- Allowed-surface mapping registries (bounded compatibility matrices).

These are model extensions, not immediate implementation requirements.

Future slice interaction may include interconnected/shared concepts, but ownership boundaries must remain explicit to preserve modular evolution.

## Non-goals

This spec does **not**:

- Require immediate creation of every conceptual registry described above.
- Require flattening all existing registries into one storage shape.
- Introduce or mandate a mega registry.
- Change current validator runtime behavior, config contracts, or report output.
- Rename files, relocate registry assets, or mutate current registry payloads.
