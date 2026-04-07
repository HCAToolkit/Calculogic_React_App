# Validator Loader → Converter → Runtime Ownership Contract (V1)

Classification: Normative

## 1. Purpose

This convention defines the canonical ownership split for validator slice assembly:

1. **Loader** (registry-state loading and policy-data canonicalization)
2. **Converter** (validated payload → runtime-ready structures)
3. **Runtime / wiring / logic** (execution mechanics and findings/report derivation)

The goal is deterministic boundaries between **policy data** and **engine mechanics** so slice internals stay modular and extraction-friendly.

## 2. Loader ownership (policy-data boundary)

A loader owns:

- Schema/shape checks and deterministic validation of registry payloads.
- Payload loading from builtin/custom registry sources.
- Canonicalization of payload entries (trim/normalize/dedupe/sort where policy data requires canonical forms).
- Builtin/custom source resolution and precedence handling.
- Bounded cache/state lifecycle for loaded registry-state snapshots.

A loader must not own runtime traversal, report derivation, finding mechanics, or validator decision flow.

## 3. Converter ownership (runtime-shape preparation)

A converter owns deterministic transformation from validated payloads into runtime-ready structures, for example:

- `Set`/`Map` representations.
- Matcher arrays/compiled matcher state.
- Runtime object clones that preserve immutability expectations at runtime call sites.

Converters do not make final validator findings and do not execute repository traversal or algorithmic runtime decisions.

## 4. Runtime / wiring / logic ownership (engine mechanics)

Runtime/wiring/logic own execution semantics, including:

- Scope fallback/defaulting and scoped target filtering.
- Deterministic ordering of paths/findings/output projections.
- Immutable clone usage and prepared-input assertions.
- Execution mechanics (walk/traversal, rule flow, decision application).
- Report derivation/summarization and findings emission.

Runtime/wiring consume prepared runtime inputs from loader+converter layers rather than re-owning registry canonicalization rules.

## 5. What must not be pushed into registries

Registries are policy data, not engines. Do **not** push these into registries:

- Parser grammar or parser control flow.
- Traversal mechanics.
- Sorting mechanics that belong to deterministic runtime pipelines.
- Algorithmic decision flow and execution branching.

Registries may describe bounded policy vocabulary and lookup content, but mechanics stay in runtime logic modules.

## 6. Where this appears today

### 6.1 Naming slice

- Loader ownership appears in `naming/src/registries/registry-state.logic.mjs` via builtin/custom registry resolution, payload checks, canonicalization, and registry digest/state handling.
- Converter ownership appears in `naming/src/naming-runtime-converters.logic.mjs` via runtime set/map/runtime-shape conversion helpers.
- Runtime/wiring/logic ownership appears in:
  - `naming/src/naming-validator.wiring.mjs` for prepared runtime input assembly and scope-target runtime preparation.
  - `naming/src/naming-validator.logic.mjs` for traversal/classification/decision flow/findings/summaries.

### 6.2 Suite core

- Runtime/wiring/logic ownership appears in suite-core runner and composition modules such as:
  - `src/core/validator-runner.logic.mjs`
  - `src/core/validator-registry.knowledge.mjs`

Suite core composes slice runners and shared runtime contracts; it does not replace slice-local loader/converter responsibilities.

### 6.3 Tree slice

- Loader-style policy loading appears in tree registry logic modules:
  - `tree/src/registries/tree-known-roots-registry.logic.mjs`
  - `tree/src/registries/tree-signal-policy-registry.logic.mjs`
- Runtime/wiring/logic ownership appears in:
  - `tree/src/tree-structure-advisor.wiring.mjs`
  - `tree/src/tree-structure-advisor.logic.mjs`


## 6.4 Direct builtin-loader vs registry-state ownership semantics

Use this decision rule to keep ownership deterministic and avoid generic loader sprawl:

1. **Choose a registry-state owner** (for example `naming/src/registries/registry-state.logic.mjs`) when a slice requires:
   - multi-source policy composition (builtin + custom/overlay),
   - explicit precedence/merge/canonicalization contracts,
   - digest/cache/state lifecycle as part of the slice runtime contract.
2. **Choose a direct builtin loader** (for example tree slice local registry logic) when policy payloads are intentionally slice-local and bounded, and no cross-slice generic state host is required.
3. **Keep suite-core surfaces locally owned** for composition/runtime mechanics (`src/core/**`) instead of promoting them into a generic registry-state aggregator.

Why this is normative:

- Naming centralization through a registry-state owner is intentional because naming has broader extracted policy surfaces and overlay precedence needs.
- Tree direct builtin loading is intentional because tree policy vocabularies are bounded and locally consumed.
- Suite-core local ownership is intentional because runner/registry/scopes modules are composition mechanics, not slice-policy canonicalization hosts.

Anti-pattern to avoid:

- Do **not** flatten every registry surface behind one universal state layer; that pattern obscures ownership, increases coupling, and weakens clear extraction paths.

## 7. Canonical usage rule

When documenting or implementing validator slices, treat this contract as the canonical ownership reference for loader-converter-runtime boundaries.

Related references:

- `doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
- `doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction.spec.md`
