# Tree Policy Registry Loading/Normalization Path Audit

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


## Status and scope

- **Document type:** Tree-owned docs/audit checkpoint
- **Scope:** loading/normalization planning for Tree-owned policy registries after issues #455, #457, #459, #461, #465, #467, #469, #472, and #474
- **Runtime posture:** no runtime behavior change in this audit
- **Decision posture:** recommendation for next minimal implementation slice only

Context boundary for this checkpoint:

- `tree-known-roots.registry.json` remains current runtime truth for known-root compatibility behavior.
- Builtin tree signal-policy registries loaded via `getBuiltinTreeSignalPolicy()` are also current runtime truth for active shim/signal detection evidence lanes.
- The newer Tree policy registries listed in this checkpoint remain data-only policy/evidence vocabularies and are not current runtime truth yet.
- `tree-addressed-occurrence-evidence-model.spec.md` remains docs/spec-only design guardrail and future runtime input.

---

## 1. Current registry inventory

### 1.1 Inventory classification table

| Artifact | Current role classification | Notes for loading/normalization path |
|---|---|---|
| `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json` | current runtime truth; data-only identity registry; future runtime input | Active known-root compatibility baseline consumed by shipped runtime loaders/wiring. |
| `calculogic-validator/tree/src/registries/_builtin/validator-owned-signals.registry.json` | current runtime truth; data-only evidence registry; data-only policy registry | Active runtime signal-policy payload for validator-owned basename signal matching through `getBuiltinTreeSignalPolicy()`. |
| `calculogic-validator/tree/src/registries/_builtin/shim-detection-signals.registry.json` | current runtime truth; data-only evidence registry; data-only policy registry | Active runtime signal-policy payload for shim detection/suppression vocabularies and extension allowlist through `getBuiltinTreeSignalPolicy()`. |
| `calculogic-validator/tree/src/registries/tree-signal-policy-registry.logic.mjs` | current runtime truth | Loader/cache/runtime preparation owner for active signal-policy registries consumed by tree runtime modules. |
| `calculogic-validator/tree/src/tree-shim-detection.logic.mjs` | current runtime truth | Runtime consumer of active signal-policy registries for shim evidence collection and suppression lanes. |
| `calculogic-validator/tree/src/tree-structure-advisor.logic.mjs` | current runtime truth | Runtime consumer of known-roots and signal-policy registries for advisory detection flow. |
| `calculogic-validator/tree/src/registries/_builtin/folder-kinds.registry.json` | data-only identity registry; data-only policy registry; future runtime input | Defines bounded folder-kind vocabulary (`structural`, `semantic`, `unspecified`) and should stay declarative until a bounded consumer exists. |
| `calculogic-validator/tree/src/registries/_builtin/structural-homes.registry.json` | data-only identity registry; data-only policy registry; future runtime input | Defines structural-home identity vocabulary and definitions; currently not wired as runtime decision source. |
| `calculogic-validator/tree/src/registries/_builtin/surface-structural-home-perspective.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Encodes perspective/evidence relationships from surface to candidate structural homes; evidence layer, not placement truth. |
| `calculogic-validator/tree/src/registries/_builtin/structural-home-signal-policy.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Newer structural-home signal policy lane remains data-only in this checkpoint and is not the same as the already-active shim/validator signal-policy registries. |
| `calculogic-validator/tree/src/registries/_builtin/semantic-home-policy.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Encodes semantic-home derivation lanes/guardrails; bounded policy/evidence input only. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-addressed-occurrence-evidence-model.spec.md` | docs/spec-only design guardrail; future runtime input | Defines addressed-occurrence evidence modeling guidance; not runtime-wired in current implementation reality. |

### 1.2 Current implementation reality summary

- The current implementation reality is intentionally mixed: active runtime registry lanes include both known-roots compatibility (`tree-known-roots`) and active signal-policy registries loaded through `getBuiltinTreeSignalPolicy()`, while several newer policy/evidence registries remain staged as data-only assets.
- This split is clean with respect to ownership: known-roots stays current runtime truth for compatibility classification, active shim/validator signal-policy registries stay current runtime truth for signal detection lanes, and newer structural-home/semantic-home policy registries remain staged implementation path inputs.
- This checkpoint confirms the newer Tree policy registries (`folder-kinds`, `structural-homes`, `surface-structural-home-perspective`, `structural-home-signal-policy`, `semantic-home-policy`) are not current runtime truth, and they should remain non-authoritative for findings until a bounded consumer slice is selected.

---

## 2. Loading ownership options

### Option 1 — Keep all new policy registries data-only for now

- **Benefit:** maximal runtime stability; zero risk of accidental behavior drift.
- **Risk:** delayed validation of loader assumptions and delayed integration feedback.
- **Ownership impact:** strongest ownership purity right now; docs/spec and payload layers stay isolated from runtime mechanics.
- **When appropriate:** when no first bounded runtime consumer is agreed.
- **Should it happen now:** **Yes by default** unless a clear first consumer is already scoped.

### Option 2 — Add local per-registry loader helpers only where runtime needs them

- **Benefit:** incremental adoption with tight blast radius; keeps direct builtin-loader pattern aligned with tree slice posture.
- **Risk:** helper proliferation and inconsistent normalization if each registry evolves independently.
- **Ownership impact:** maintains tree-local ownership; requires strict loader/converter/runtime boundary discipline per registry.
- **When appropriate:** once one registry has immediate consumer needs and stable normalization semantics.
- **Should it happen now:** **No** for this checkpoint; appropriate in a follow-up bounded loader slice only.

### Option 3 — Add a shared Tree policy registry loader

- **Benefit:** centralized normalization and reduced duplicate loader code for multiple policy registries.
- **Risk:** over-centralization before consumer requirements stabilize; can create premature generic layer/coupling.
- **Ownership impact:** may blur direct builtin-loader ownership unless narrowly scoped and justified.
- **When appropriate:** after two or more real runtime consumers need common policy-loading semantics.
- **Should it happen now:** **No**; too early relative to current runtime truth.

### Option 4 — Add normalized lookup maps for all Tree registries

- **Benefit:** fast runtime access patterns and deterministic lookup semantics once integration begins.
- **Risk:** front-loads converter/runtime-shape work for registries with no active consumer; likely speculative normalization.
- **Ownership impact:** increases converter/runtime coupling pressure before behavior scope is bounded.
- **When appropriate:** after registry consumers are explicit and lookup access patterns are proven.
- **Should it happen now:** **No**.

### Option 5 — Hybrid: keep data-only registries static while adding one bounded loader only for the first runtime consumer

- **Benefit:** smallest executable step toward target architecture with preserved runtime stability.
- **Risk:** requires careful consumer selection to avoid “temporary” loader behavior becoming accidental global policy.
- **Ownership impact:** strong if limited to one consumer and one registry lane with explicit non-goals.
- **When appropriate:** when the first runtime consumer is concrete and acceptance criteria are narrow.
- **Should it happen now:** **Not in this audit issue**; candidate for the next issue only if a clear first consumer is identified.


### Option 6 — Structural-address snapshot/probe before loader integration

- **Benefit:** creates a deterministic pre-reasoning evidence lane (occurrence location first, meaning later) before policy registry consumption expands.
- **Risk:** adds one more staged slice before loader adoption, which can delay policy consumption.
- **Ownership impact:** keeps addressing evidence production separated from interpretation/policy consumption, preserving clean tree ownership boundaries.
- **When appropriate:** when addressed-occurrence identity is not yet a stable runtime input lane for policy reasoning.
- **Should it happen now:** **Yes as a next checkpoint candidate**, but first verify whether the current occurrence snapshot already satisfies enough of the structural-address model or needs a dedicated get-tree/probe formalization slice.

---

## 3. Normalization boundaries

Normalization must preserve these boundaries:

1. **identity data vs evidence data**
   - Identity registries (for example known roots, structural-home vocabulary) can normalize canonical keys and dedupe vocabulary rows.
   - Evidence registries (signal/perspective/policy lanes) should normalize payload shape only, not convert evidence into truth.

2. **evidence data vs final interpretation**
   - Normalization may canonicalize evidence records.
   - Final interpretation remains runtime logic ownership and must not be encoded as pre-resolved outcomes in registry loaders.

3. **known-root compatibility vs future addressed-occurrence evidence**
   - Known-root compatibility remains current runtime truth and must remain behavior-stable.
   - Addressed-occurrence evidence remains staged implementation path input and should not backdoor runtime findings before explicit adoption.

4. **Structural Home identity vs Semantic Home derivation**
   - Structural Home identity vocabulary and Semantic Home derivation policy are separate lanes.
   - Loader normalization must not collapse semantic derivation into structural identity, or the reverse.

5. **Surface → Structural Home evidence vs placement truth**
   - Surface perspective entries are evidence associations.
   - They must not be normalized into definitive placement assertions.

6. **folder-token signal policy vs Semantic Home truth**
   - Structural-home signal tokens are policy evidence, including weak/anti-pattern classes.
   - They must not be promoted to Semantic Home truth by loader normalization.

7. **Naming semantic-family output vs Tree derivation policy**
   - Naming semantic-family output remains naming-owned boundary input.
   - Tree derivation policy remains tree-owned interpretation lane.
   - Normalization may preserve bridge payload compatibility but must not re-own naming semantics.

---


## 5. Structural-address checkpoint evaluation before loader/normalization

Classification: Informative

### 5.0 Three-layer distinction: known-root compatibility vs occurrence snapshot vs structural-address probe

- **Layer 1 — current known-root compatibility (current runtime truth):**
  - Known-root compatibility is active runtime truth for top-root compatibility interpretation.
  - This lane is compatibility classification truth, not structural-addressing grammar by itself.

- **Layer 2 — current Tree occurrence snapshot (current implementation reality):**
  - `prepareTreeOccurrenceSnapshot` collects folder/file occurrence records for active Tree scoped inputs.
  - The flow is wired through `tree-structure-advisor.wiring.mjs` and consumed in `tree-structure-advisor.logic.mjs` via `occurrenceSnapshot.occurrenceRecords`.
  - The current snapshot already provides occurrence substrate fields (`resolvedPath`, lineage segments, parent linkage, depth, occurrence markers, scope-root binding).

- **Layer 3 — proposed structural-address snapshot/probe (deterministic addressing formalization target):**
  - formalizes the tree-specific deterministic addressing model described in `tree-occurrence-model-and-addressing.spec.md` (illustrative lane):
    - scoped root starts at `A`,
    - folder siblings are addressed alphabetically (`A`, `B`, ...),
    - file siblings are addressed numerically (`1`, `2`, ...),
    - folder and file counters rebase locally per parent lineage depth,
    - lineage addresses such as `A.D.A.3` are explicit and inspectable.
  - can emit a neutral addressed tree snapshot / "get tree" style output lane.
  - acts as pre-reasoning evidence production before interpretation/meaning lanes.

Interpretation boundary for this audit:

- Do not treat current occurrence snapshot behavior as absent.
- Do not auto-equate current occurrence snapshot with full structural-address formalization.
- Treat sufficiency against the addressing model as an explicit checkpoint before loader/normalization expansion.

### 5.1 Does the current occurrence snapshot implement the full deterministic A-Z / numeric local-rebasing address model from the spec?

**Answer:** Partially, but not yet proven as full formalization in this audit.

Rationale:

- Current snapshot behavior already carries occurrence markers and lineage-bound records.
- This audit does not yet prove that the current runtime contract is explicitly closed as the full A-root + folder-alpha + file-numeric + local-rebasing structural-address model authority.
- Therefore, treat the current snapshot as likely substrate, with sufficiency to be explicitly audited/formalized before loader-driven interpretation expansion.

### 5.2 Does current behavior expose or support a neutral addressed tree snapshot / get-tree style output?

**Answer:** Not yet as an explicit, stable addressed-tree contract in this checkpoint.

- Current occurrence records are runtime-consumed inputs, but the neutral addressed-tree probe lane is not yet explicitly closed as a standalone contract surface in this audit.
- This is the key gap to confirm/formalize before broader policy-registry consumption drives interpretation lanes.

### 5.3 Does current behavior provide a clean pre-reasoning handoff shape for Tree?

**Answer:** Partially.

- Current occurrence snapshot already hands occurrence records into Tree runtime.
- The audit still recommends formalizing the addressed-occurrence handoff shape when measured against the deterministic addressing model expectations from `tree-occurrence-model-and-addressing.spec.md`.
- This preserves the architecture principle: location substrate first, interpretation later.

### 5.4 If not fully sufficient, what minimal structural-addressing slice is still needed before loader/runtime registry consumption?

**Proposed smallest slice (docs-defined implementation target for follow-up issue):**

1. Reuse existing occurrence snapshot collection path (`prepareTreeOccurrenceSnapshot`) as the base substrate.
2. Explicitly close/formalize deterministic addressing semantics aligned to the tree occurrence/addressing spec illustration (A-root, folder-alpha, file-numeric, local sibling-counter rebasing per parent lineage).
3. Expose a neutral addressed-tree snapshot/probe ("get tree" style) as evidence lane contract without changing findings/report behavior.
4. Preserve resolved path truth and known-root compatibility truth unchanged.
5. Keep policy registries out of interpretation in this slice (evidence producer only).
6. Defer Semantic Home truth, placement confidence, and final interpretation to later bounded consumers.

Guardrail:

- This probe is an evidence producer only; it is not a meaning interpreter.

---

## 4. Recommendation

## Recommended next minimal issue

**Recommended category:** another docs/spec slice (structural-address snapshot/probe issue definition), then bounded loader/normalization slice.

**Recommendation detail:**

- Before loader/normalization work, run a bounded sufficiency audit on the current occurrence snapshot as structural-address substrate.
- If sufficient, proceed to the hybrid bounded-loader or compatibility-wrapper path for one clear first runtime consumer.
- If insufficient, next minimal issue should formalize/extend current occurrence snapshot into a structural-address snapshot/probe evidence slice without changing runtime findings behavior.
- If first-consumer clarity is still absent after that checkpoint, keep registries data-only and continue narrow docs/spec preparation.

### Candidate first bounded consumer (if confirmed)

- Consumer lane: current known-root compatibility interpretation path where policy lookups can remain evidence-only.
- Bounded change shape: add one loader/converter pair for one selected policy registry (likely `structural-home-signal-policy` or `surface-structural-home-perspective`) and consume it only in a non-expanding compatibility context.
- Explicit guardrail: no new finding families/codes/severity semantics in that first loader slice.

### Why this is the smallest clean step

- Preserves runtime stability and current implementation reality.
- Maintains clean ownership boundaries between policy-data loading and runtime interpretation.
- Keeps the staged implementation path deterministic: docs/spec alignment -> one bounded loader -> broader policy adoption only after evidence.

### Explicit non-recommendations for the immediate next slice

- Do not introduce a shared all-policy tree loader yet.
- Do not normalize all registry payloads into global lookup maps yet.
- Do not wire addressed-occurrence evidence assembly in the same step as first loader adoption.

---

## Parent/roadmap linkage notes

This audit is a checkpoint under issue #476 with parent roadmap context #452.
It confirms the current runtime truth boundary and recommends the smallest staged implementation path that avoids runtime drift.
