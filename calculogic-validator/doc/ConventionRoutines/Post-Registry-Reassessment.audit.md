# Post-Registry-Reassessment.audit

## Purpose

This audit reassesses the remaining `keep-hardcoded-for-now` surfaces after registry operationalization and identifies the **highest-ROI next validator work** for the next phase.

This is a planning artifact only: **no runtime behavior changes are proposed in this pass**.

Primary inspection scope:

- `calculogic-validator/src/core/`
- `calculogic-validator/naming/src/`
- `calculogic-validator/tree/src/`

Reference baseline:

- `calculogic-validator/doc/ConventionRoutines/Registry-Expansion-Candidates.audit.md`

---

## Phase-shift assessment

The prior audit’s extraction queue is effectively complete for this scope (no pending `registry-ready-now` and no pending `registry-ready-after-normalization`). The central phase-shift question is now:

1. Which hardcoded areas are still correct to keep engine-owned?
2. Which hardcoded/post-extraction seams now have enough stability for targeted hardening?
3. Which tasks deliver the best ROI through ownership clarity, deterministic behavior, and lower drift risk?

---

## Keep-hardcoded reassessment

| Area | Current owner | Reassessment | Rationale | Classification |
|---|---|---|---|---|
| System-scope compatibility wildcard expansion (`eslint.config.*`, `vite.config.*`, `tsconfig*.json`) | `src/core/validator-scopes.runtime.mjs` | **Keep hardcoded for now** (with guardrail tests/doc hardening) | Expansion is tightly coupled to `ROOT_APP_FILES` and is currently implemented as a compatibility bridge from wildcard registry tokens to explicit deterministic root files. Extracting this further before root-file contract stabilization risks split ownership between scope policy and root-file knowledge. | keep as-is for now |
| Traversal/sorting mechanics (`sortPaths`, deterministic file-order scans, path/code stable sort) | naming/tree runtime logic + wiring | **Keep hardcoded** | These are engine mechanics (deterministic execution and output ordering), not policy vocabularies. Registry extraction here would reduce clarity and blur algorithm-vs-policy boundaries. | keep as-is for now |
| Parser mechanics (`parseCanonicalName`, segment handling, semantic/role/extension split) | naming rule logic | **Keep hardcoded** | Parser behavior is algorithmic grammar enforcement, not a policy lookup table. Externalizing would likely produce regex-dump complexity and weaker debuggability. | keep as-is for now |

---

## Post-extraction hardening opportunities

### 1) High-ROI next tasks

1. **Add cross-slice invariant tests for deterministic ordering/fallback behavior.**
   - Why ROI is high:
     - Determinism is implemented in many local helpers (`localeCompare` sorts, first-match exit policy, canonical key sorts).
     - Registry operationalization increases need for stable, test-locked ordering contracts.
   - Focus:
     - policy first-match semantics (exit policy),
     - sorted outputs for summary/code buckets and path sets,
     - stable fallback behavior (`DEFAULT_VALIDATOR_SCOPE`, unknown-scope null handling).

2. **Document explicit ownership contract for “loader vs converter vs runtime” in one validator-facing convention note.**
   - Why ROI is high:
     - Naming already has clear runtime prep boundaries (`prepareNamingRuntimeInputs` + converters + registry-state), but this pattern is implicit and distributed.
     - Core/tree use similar concepts with varied local idioms.
   - Focus:
     - formalize where schema validation lives,
     - formalize where canonicalization/conversion lives,
     - formalize runtime-only invariants (immutable clones, deterministic ordering, fallback semantics).

3. **System-scope compatibility expansion contract-lock tests are complete in practice; preserve as maintained baseline coverage.**
   - Completion note:
     - wildcard tokens are contract-locked as non-leaking literals,
     - expansion remains deterministic/sorted and bounded to root-file compatibility universe,
     - current test coverage and passing suite already enforce this behavior.

### 2) Worthwhile but later

- **Normalize loader utility patterns where low-risk:** multiple modules use local `loadJsonFile`/payload assertions and cache conventions; converging shape can reduce maintenance overhead, but should avoid a generic mega-loader.
- **Clarify naming case-rule registry ownership path:** `case-rules.registry.json` is consumed directly by a rule module rather than through broader naming registry-state ownership. This is acceptable currently, but documenting intent would reduce future ambiguity.
- **Tighten doc pointers from registry JSON to canonical rule docs/spec anchors** where links are currently mixed between convention docs and validator spec docs.

### 3) Keep as-is for now

- No reopening of completed extraction slices for roles/extensions/findings/summary/missing-role/tree signals/tree roots/exit policy.
- No migration of parser/traversal mechanics into registries.
- No broad rewrite of registry-state architecture while current ownership is functioning and tested.

---

## Contract and ownership review (post-operationalization)

### Suite-owned vs slice-owned boundaries

- **Suite-owned** boundaries are clean for scope defaults/profiles and exit policy (`src/core` + `src/registries`).
- **Slice-owned** boundaries are mostly clean in naming (`registry-state.logic.mjs` + runtime converters + wiring).
- **Tree slice** is also clear for known roots and signal vocabularies, with runtime logic consuming prepared/cached policy artifacts.

Assessment: ownership is generally healthy; ROI now is mostly **hardening and explicit contract documentation**, not additional extraction.

### Loader vs runtime converter vs logic ownership

- Naming has the strongest explicit layering (registry load → converter runtime prep → validator logic assertions).
- Core/tree loaders validate and normalize payloads effectively, but layering conventions are less explicitly documented as shared architecture.

Assessment: architecture quality is good; main gap is **cross-slice contract codification** and invariant tests.

### Registry-state vs direct builtin loader usage

- Naming runtime inputs are centralized via `registry-state.logic.mjs` for major extracted surfaces.
- Some surfaces intentionally remain direct builtin loader consumers (e.g., tree signal/known roots loaders, core scope/exit loaders).

Assessment: acceptable and coherent today; document this as intentional “local registry owner” pattern to avoid future accidental divergence.

### Deterministic ordering and fallback behavior

- Determinism appears intentionally maintained through explicit sorts and first-match policy evaluation.
- Default scope fallback and profile cloning behavior are explicit and tested.

Assessment: strong baseline; best next ROI is **cross-slice invariant test reinforcement**, not redesign.

---

## Candidate classification

## high-ROI next task

1. Cross-slice deterministic ordering/fallback invariant tests.
2. Single authoritative doc note for registry ownership layering (loader/converter/runtime logic).
3. Maintain completed system-scope compatibility expansion contract-lock coverage as regression baseline.

## worthwhile but later

1. Light normalization of repeated loader/canonicalization scaffolding where it does not blur ownership.
2. Documentation clarification for direct builtin registry consumers versus registry-state mediated consumers.
3. Minor spec/doc anchor consistency cleanup across registry payload references.

## keep as-is for now

1. System-scope wildcard expansion implementation placement in `validator-scopes.runtime.mjs` (until root-file contract stabilization).
2. Traversal/sorting mechanics as code-owned engine behavior.
3. Parser mechanics (`parseCanonicalName` and adjacent grammar logic) as code-owned engine behavior.

---

## Recommended next task order (ranked)

1. **Cross-slice deterministic invariants test pass** (ordering, first-match, fallback semantics).
2. **Ownership contract note for loader/converter/runtime boundaries** (prevents future coupling regressions).
3. **Maintain system-scope wildcard-expansion contract-lock coverage as completed baseline** (already done in practice; keep green).
4. **Targeted documentation cleanup for direct-builtin vs registry-state ownership semantics**.
5. **Optional low-risk utility normalization pass** for duplicated loader helpers (only if still justified after tasks 1–4).

---

## Out-of-scope reaffirmation

- No runtime behavior changes.
- No registry payload changes.
- No file renames/moves.
- No reopening of completed registry extraction slices absent a concrete defect.
