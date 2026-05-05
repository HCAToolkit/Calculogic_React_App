# Tree Registry Policy Inventory (Issue #453 audit slice)

Status/Authority:
- **Status:** Audit inventory for one docs-only slice.
- **Authority posture:** Documents **current runtime truth** and **current implementation reality**, plus bounded **target architecture** direction.
- **Does not change:** Runtime behavior, registry payloads, Naming → Tree bridge shape, CLI/report contracts.
- **Roadmap linkage:** Parent context in issue #452; task slice in issue #453.

## 1) Scope and source anchors

This inventory covers Tree-registry policy ownership for the requested target files only.

Runtime/spec authority read order used for this audit:
1. `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`
2. `calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md`
3. `calculogic-validator/doc/ConventionRoutines/NamingValidatorSpec.md`
4. `calculogic-validator/doc/ValidatorSpecs/nl-config/cfg-treeStructureAdvisor.md`
5. `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-documentation-map-and-reorg-inventory.md` (navigation-only)

Additional registry-model context used:
- `calculogic-validator/doc/ConventionRoutines/ValidatorLoaderConverterRuntimeOwnership-Contract.md`
- `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction.spec.md`
- `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-blueprint-implementation-map.spec.md`

## 2) Ownership boundaries (binding for this inventory)

- Surface is shared artifact-consumption context, not a folder home.
- Structural Home is a registry-backed Tree-side folder/home context.
- Semantic Home is Tree-derived from folder context plus Naming bridge outputs, not a shared canonical registry noun by default.
- Naming owns semantic-name and semantic-family interpretation.
- Tree consumes Naming outputs only through a bounded bridge.
- Tree owns folder-kind, structural containment, semantic-home, weak/anti-pattern folder signal, and placement-confidence interpretation.
- Registry data provides evidence; Tree runtime owns advisory interpretation and final placement/confidence behavior.

## 3) Inventory matrix: current runtime truth vs target registry direction

| Registry file | Intended owner | Exists now | Current path (if exists) | Current runtime consumer (if any) | Current equivalent policy source when absent | Current policy state | Recommended next child issue action | Stop conditions / ownership risks |
|---|---|---|---|---|---|---|---|---|
| `surfaces.registry.json` | shared suite | No | n/a | none in current runtime truth | Tree path/scope interpretation and known-root classification logic/spec guidance | derived + documented-only for this concept (not registry-backed in Tree runtime) | defer | Risk: treating Surface as folder-home truth would blur shared vs Tree ownership.
| `structural-homes.registry.json` | shared suite, Tree-consumed | No | n/a | none in current runtime truth | Tree folder/root interpretation (`tree-known-roots` + structural interpretation layers) | derived/hardcoded mix in Tree-local structures; not registry-backed with this filename | harden (after Tree-owned substrate is normalized) | Risk: introducing this first can create duplicate truth with existing Tree root vocab policy.
| `surface-structural-home-perspective.registry.json` | Tree-consumed shared perspective | No | n/a | none in current runtime truth | Tree local placement evidence modeling in tree advisor spec and runtime interpretation | documented-only + derived in runtime reasoning; not persisted as registry payload | defer | Risk: perspective registry could be misused as placement authority instead of evidence.
| `folder-kinds.registry.json` | Tree-owned | No | n/a | none in current runtime truth | Tree folder-kind interpretation layer in runtime/spec | hardcoded/derived (Tree-owned interpretation) | add | Low blast radius; clean ownership if introduced as data-only evidence vocabulary.
| `structural-home-signal-policy.registry.json` | Tree-owned | No | n/a | none in current runtime truth | Tree structural signals from known roots, shim signals, validator-owned signals | hardcoded + derived | defer | Risk: premature policy freeze while signal heuristics are still tranche-bounded.
| `semantic-home-policy.registry.json` | Tree-owned | No | n/a | none in current runtime truth | Tree semantic-home derivation from folder context + Naming bridge | derived + hardcoded interpretation rules | defer | Risk: could incorrectly externalize Naming semantics into Tree registry nouns.
| `agnostic-core-meanings.registry.json` | shared suite | Yes | `calculogic-validator/naming/src/registries/_builtin/agnostic-core-meanings.registry.json` | Naming runtime consumer | n/a | registry-backed in Naming; not consumed by Tree runtime today | no-op | Risk: forcing direct Tree coupling to Naming-internal registry path.
| `relationship-types.registry.json` | shared suite | No | n/a | none | cross-cutting blueprint/spec planning only | documented-only | defer | Risk: creating relationship taxonomy without first stabilizing Tree-owned policy substrate.
| `relationships.registry.json` | shared suite | No | n/a | none | cross-cutting blueprint/spec planning only | documented-only | defer | Risk: may duplicate inferred relationships that are not current runtime truth.

## 4) Separation of truth classes

### 4.1 current runtime truth

- No requested target Tree-policy registry filenames exist yet in runtime paths.
- Tree currently runs with existing builtins such as `tree-known-roots.registry.json`, `validator-owned-signals.registry.json`, and `shim-detection-signals.registry.json` plus Tree runtime interpretation layers.
- Tree consumes Naming-derived evidence only through bounded bridge inputs; Tree does not parse Naming internals directly.

### 4.2 target registry direction

- Introduce data-only Tree-owned policy registries in staged order that preserves deterministic interpretation ownership in Tree runtime.
- Keep shared-perspective registries as evidence inputs, never as final placement/confidence authority.
- Normalize shared nouns only after Tree-owned local policy surfaces are explicit and non-duplicative.

### 4.3 documented planning context that is not yet runtime truth

- Cross-cutting blueprint docs enumerate `surfaces.registry.json`, `structural-homes.registry.json`, `surface-structural-home-perspective.registry.json`, `relationship-types.registry.json`, `relationships.registry.json`, and Tree-owned registry filenames as **target architecture**.
- That enumeration is not current runtime truth and should not be interpreted as already-implemented loader/runtime contracts.

### 4.4 inferred/observed policy that should not auto-convert into registry truth

- Observed folder patterns from current repository layout.
- Current tranche-bounded placement/coherence heuristics.
- Any advisory outcomes that depend on bridge availability/quality.

These remain implementation evidence and must be explicitly modeled before registry promotion.

## 5) Option comparison for next slice (required)

### Option A — add/harden `folder-kinds.registry.json`
- Ownership: pure Tree-owned.
- Blast radius: minimal (Tree-local policy vocabulary extraction).
- Deterministic runtime path: high (maps directly to existing folder-kind interpretation layer).
- Future extraction value: high (creates stable substrate for later structural-home and semantic-home policy registries).

### Option B — add/harden `structural-homes.registry.json`
- Ownership: shared noun consumed by Tree.
- Blast radius: medium (cross-slice noun surface with potential overlap vs Tree-local current root interpretation).
- Deterministic runtime path: medium only if folder-kind vocabulary is already stabilized.
- Future extraction value: high, but sequencing-sensitive.

### Option C — add/harden `surface-structural-home-perspective.registry.json`
- Ownership: shared perspective consumed by Tree.
- Blast radius: medium-to-high (perspective/evidence contract could be mistaken for placement truth).
- Deterministic runtime path: medium-low before structural-home and folder-kind contracts are explicit.
- Future extraction value: medium-high after foundational ownership substrate exists.

## 6) Recommended next child issue

**Recommended next child issue:** add/harden `folder-kinds.registry.json` as a data-only Tree-owned registry slice.

Why this is the best next staged implementation path:
- clean ownership boundary (Tree-owned policy substrate),
- minimal blast radius (no required shared-contract loader migration in first step),
- deterministic runtime path (mirrors existing folder-kind interpretation responsibilities),
- strong future extraction value (enables later structural-home and perspective normalization without duplicate truth).

## 7) Stop-conditions check for this audit slice

For this docs-only slice, no stop condition was triggered:
- no registry JSON file creation was required,
- no runtime behavior change was required,
- no Naming/Tree runner/CLI/report shape change was required,
- no ambiguous equivalent authoritative inventory file path blocked this addition.
