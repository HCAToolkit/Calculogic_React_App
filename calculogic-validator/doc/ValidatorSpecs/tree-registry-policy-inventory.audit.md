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

## 8) Issue #461 checkpoint — known roots vs structural homes relationship (docs-only)

Status/Authority for this section:
- **Status:** Audit clarification for Slice 4 checkpoint issue #461 (under #459, roadmap #452).
- **Scope:** docs-only; no runtime, registry payload, or CLI/report behavior changes.
- **Framing terms:** Uses exact status language: **current runtime truth**, **current implementation reality**, **target architecture**, **staged implementation path**.

### 8.1 current runtime truth — suite scope profiles vs Tree interpretation

1. Suite-owned `scope-profiles.registry.json` owns scope-selection boundaries (`repo`, `app`, `docs`, `validator`, `system`) via `includeRoots` and `includeRootFiles`.
2. That ownership is separate from Tree structural interpretation.
3. Tree structural interpretation starts after scope/target selection and is owned by Tree runtime logic and Tree registries.

Checkpoint answer:
- `--scope=validator`, `--scope=app`, `--scope=docs`, etc. are suite boundary selection concerns, not Tree structural-home placement policy.

### 8.2 current runtime truth — what `tree-known-roots.registry.json` owns now

`tree-known-roots.registry.json` currently functions as the Tree runtime repo-top vocabulary and classification source for this repository.

It currently owns:
- known repo-top root names,
- per-root `kind` classification (`structural` or `semantic`),
- normalized known-root set consumed by Tree runtime top-level checks.

Runtime effects currently wired:
- feeds `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` (`knownTopLevelDirectories` set in Tree runtime),
- feeds occurrence classification through `tree-occurrence-classification.logic.mjs` (`repo-top-structural-root` vs `repo-top-semantic-root`),
- provides current runtime structural top-root classification via `topRoots.kind=structural`.

Checkpoint answer:
- It is not merely passive documentation; it is an active runtime input used by current Tree checks.

### 8.3 Relationship verdict — known roots vs structural homes

Verdict: **partially overlapping, not equivalent**.

- `tree-known-roots.registry.json` is a **narrower runtime repo-top root vocabulary + top-root kind classifier**.
- `structural-homes.registry.json` is a **broader structural-home identity vocabulary** that includes identities not limited to repo-top roots (for example `app`, `config`, `data`, `ops`, `generated`, `vendor`, `compat`).
- Overlap exists for some identities (`src`, `doc`, `scripts`, and quality-domain naming family intent), but payload semantics and consumption responsibility are not the same.

Therefore:
- known roots are **not current runtime equivalent** to structural homes,
- treating them as identical would collapse two different policy layers and create competing truth.

### 8.4 What `structural-homes.registry.json` should own now

Recommended ownership now:
- Structural Home identity vocabulary and definitions (identity layer),
- target architecture reference surface for future Tree runtime normalization,
- not the direct runtime authority for current top-root checks yet (that remains known roots in current runtime truth).

`test` vs `tests` checkpoint:
- current runtime known root uses `test`,
- structural-home vocabulary currently includes `tests`.

Recommendation:
- Use `test` as the current quality structural-home identity for runtime-alignment slices until an explicit migration decision is modeled and bridged.
- Rationale: preserving deterministic current runtime truth avoids immediate drift between repo-top known-root runtime checks and future perspective/identity payloads.

### 8.5 `folderKind` on Structural Home records

Recommendation:
- Do **not** add `folderKind` to structural-home records in this slice.

Reasoning:
- Folder-kind classification is Tree-owned occurrence/classification vocabulary.
- Structural-home records are identity vocabulary.
- Duplicating folder-kind semantics inside structural-home records would risk competing truth with known-roots `kind` and Tree occurrence classification contracts.

### 8.6 Agnostic-core meanings in Surface → Structural Home perspective

Recommendation:
- Agnostic-core meanings should remain a separate shared interpretation-evidence layer.
- Future Surface → Structural Home perspective entries should not inline agnostic-core payload as placement truth.

Allowed future use:
- perspective layer may reference agnostic meanings as bounded evidence hints,
- but agnostic meanings are **not current runtime truth** for placement authority and should not become placement truth.

### 8.7 What `surface-structural-home-perspective.registry.json` should own in #459

Recommended ownership for that future registry:
- Surface → Structural Home affinity/evidence mapping only,
- no scope-selection semantics,
- no known-root runtime authority,
- no final placement/confidence authority.

Recommended shape direction:
- prefer grouped perspective axis shape (`structuralHomesBySurface`) over a flat list (`surfaceStructuralHomePerspective`) to align with perspective ownership patterns and scanability.

Modeling guardrail:
- distinguish entries representing **current runtime known-root aligned identities** from entries representing **target architecture broader structural-home identities**.
- if this distinction is not explicitly modeled, pause implementation and add the minimal relationship contract first.

### 8.8 Recommendation for PR #460 / Slice 4

Recommendation: **pause and revise with docs-first clarification before continuing implementation payload work**.

Specific guidance:
1. Do not proceed as-is with flat `surfaceStructuralHomePerspective` payload.
2. Revise toward grouped `structuralHomesBySurface` shape once known-root vs structural-home relationship modeling is explicit.
3. Resolve `test` vs `tests` identity decision explicitly in docs/spec-first form before runtime-impacting registry wiring.
4. Reopen or continue PR #460 as a narrower implementation slice only after the relationship contract is documented and accepted.

### 8.9 staged implementation path (minimal next action)

Recommended next minimal action:
1. keep this checkpoint as docs-only (current change),
2. add a narrowly scoped follow-up docs/spec note in #459 clarifying relationship contract fields:
   - known-root identity,
   - structural-home identity,
   - relationship status (`aligned`, `alias`, `target-only`),
3. then revise PR #460 payload shape accordingly (grouped perspective, with explicit current-vs-target labeling),
4. only after that, consider loader/runtime bridge updates.

This preserves deterministic ownership boundaries while unblocking Surface → Structural Home perspective work via a staged implementation path.

