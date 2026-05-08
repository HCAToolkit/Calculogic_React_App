# Tree Policy Registry Loading/Normalization Path Audit

## Status and scope

- **Document type:** Tree-owned docs/audit checkpoint
- **Scope:** loading/normalization planning for Tree-owned policy registries after issues #455, #457, #459, #461, #465, #467, #469, #472, and #474
- **Runtime posture:** no runtime behavior change in this audit
- **Decision posture:** recommendation for next minimal implementation slice only

Context boundary for this checkpoint:

- `tree-known-roots.registry.json` remains current runtime truth for known-root compatibility behavior.
- The newer Tree policy registries are present as data-only policy/evidence vocabularies and are not current runtime truth.
- `tree-addressed-occurrence-evidence-model.spec.md` remains docs/spec-only design guardrail and future runtime input.

---

## 1. Current registry inventory

### 1.1 Inventory classification table

| Artifact | Current role classification | Notes for loading/normalization path |
|---|---|---|
| `calculogic-validator/tree/src/registries/_builtin/folder-kinds.registry.json` | data-only identity registry; data-only policy registry; future runtime input | Defines bounded folder-kind vocabulary (`structural`, `semantic`, `unspecified`) and should stay declarative until a bounded consumer exists. |
| `calculogic-validator/tree/src/registries/_builtin/structural-homes.registry.json` | data-only identity registry; data-only policy registry; future runtime input | Defines structural-home identity vocabulary and definitions; currently not wired as runtime decision source. |
| `calculogic-validator/tree/src/registries/_builtin/surface-structural-home-perspective.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Encodes perspective/evidence relationships from surface to candidate structural homes; evidence layer, not placement truth. |
| `calculogic-validator/tree/src/registries/_builtin/structural-home-signal-policy.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Encodes token signal categories and evidence meaning; explicitly evidence-only language. |
| `calculogic-validator/tree/src/registries/_builtin/semantic-home-policy.registry.json` | data-only evidence registry; data-only policy registry; future runtime input | Encodes semantic-home derivation lanes/guardrails; bounded policy/evidence input only. |
| `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json` | current runtime truth; data-only identity registry; future runtime input | Active known-root compatibility baseline consumed by shipped runtime loaders/wiring. |
| `calculogic-validator/doc/ValidatorSpecs/tree-owned/tree-addressed-occurrence-evidence-model.spec.md` | docs/spec-only design guardrail; future runtime input | Defines addressed-occurrence evidence modeling guidance; not runtime-wired in current implementation reality. |

### 1.2 Current implementation reality summary

- The current implementation reality is intentionally mixed: one active runtime registry (`tree-known-roots`) plus several staged policy/evidence registries that are documentation-backed data assets.
- This split is clean with respect to ownership: runtime compatibility behavior still depends on known-roots mechanics, while newer policy/evidence registries preserve target architecture direction without forcing premature runtime coupling.
- This checkpoint confirms the new registries are not current runtime truth, and they should remain non-authoritative for findings until a bounded consumer slice is selected.

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
- **Should it happen now:** **Strong Yes (as next minimal checkpoint candidate)** if loader/normalization would otherwise infer meaning without a stable addressed-occurrence substrate.

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

### 5.1 Should loader/normalization wait until a structural-address snapshot/probe exists?

**Recommendation:** Yes, for any loader adoption that would influence Tree runtime reasoning about placement/meaning.

Rationale:

- Tree policy registries now define identity/evidence/policy vocabularies, but addressed-occurrence location evidence is still the safer precursor for interpretation.
- Without a deterministic addressed-occurrence snapshot lane, early loader consumption risks normalizing policy data before Tree can deterministically bind evidence to where occurrences actually live.
- Preserving known-root compatibility as current runtime truth is easier when structural addressing is introduced as neutral evidence production first.

### 5.2 Should the next minimal issue after #476 be a structural-address snapshot/probe rather than loader integration?

**Recommendation:** Yes.

- The staged implementation path should insert a minimal structural-address snapshot/probe checkpoint before bounded loader integration.
- This is the smallest risk-reducing slice that improves input determinism without changing findings or report semantics.

### 5.3 Would structural addressing provide a safer pre-reasoning input layer before policy consumption?

**Recommendation:** Yes.

A structural-address snapshot/probe would provide a bounded addressed-occurrence substrate that later Tree reasoning can consume before interpreting:

- Structural Home identity,
- Surface → Structural Home evidence,
- structural-home signal policy,
- Semantic Home policy,
- known-root compatibility annotations.

This keeps the distinction between occurrence location and occurrence meaning explicit and inspectable.

### 5.4 Smallest structural-address slice that proves the model without runtime behavior change

**Proposed smallest slice (docs-defined implementation target for follow-up issue):**

1. Walk active Tree scoped inputs using existing scope/target behavior.
2. Produce deterministic addressed occurrence records for folder/file occurrences only.
3. Preserve resolved path truth and known-root compatibility truth unchanged.
4. Keep output as neutral internal snapshot/probe evidence lane (no new findings, no report-shape changes required for this first slice).
5. Do not consume policy registries for interpretation in this slice.
6. Do not derive Semantic Home truth, placement confidence, or structural-home final interpretation.

Guardrail:

- This probe is an evidence producer only; it is not a meaning interpreter.

---

## 4. Recommendation

## Recommended next minimal issue

**Recommended category:** another docs/spec slice (structural-address snapshot/probe issue definition), then bounded loader/normalization slice.

**Recommendation detail:**

- Next minimal issue should define and land a structural-address snapshot/probe evidence slice first, without changing runtime findings behavior.
- After that checkpoint, use the hybrid bounded-loader path only for one clear first runtime consumer.
- If first-consumer clarity is still absent after the probe slice, keep registries data-only and continue narrow docs/spec preparation.

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
