# Tree Structural-Address Snapshot / Probe Boundary Audit (Issue #478)

## Scope and Status

- **Classification:** Normative audit checkpoint for tree-owned documentation/spec boundary decisions.
- **Task posture:** docs/spec/audit only.
- **Runtime posture:** no runtime behavior change in this pass.
- **Issue lineage:** Refs #478; parent roadmap context Refs #452.

This audit evaluates boundary clarity between:

1. current Tree occurrence snapshot behavior,
2. fuller deterministic structural-address snapshot / get-tree probe model,
3. future loader/normalization or registry-based Tree reasoning.

Required distinction: occurrence records in current runtime truth are evidence substrate; they are not automatically equivalent to a complete structural-address / get-tree probe contract.

---

## 1) Current occurrence snapshot reality

Current implementation reality from `prepareTreeOccurrenceSnapshot` and related Tree wiring/runtime/tests:

### 1.1 Scoped-root binding

- The snapshot derives scoped roots from target descriptors, include roots, or selected-path top-level roots.
- Each occurrence record contains `scopeRootPath` and `isScopedRoot`.
- The snapshot also carries `scopeRoots` as a top-level array.

Status: **present in current runtime truth**.

### 1.2 Folder/file occurrence records

- Records are assembled for both directory paths and file paths discovered from selected paths.
- Each record includes `occurrenceType` with deterministic `folder` vs `file` typing.

Status: **present in current runtime truth**.

### 1.3 Parent linkage and lineage

- Records include `parentResolvedPath` and `lineageSegments`.
- Depth is explicit via `depth` (`lineageSegments.length - 1`).

Status: **present in current runtime truth**.

### 1.4 Deterministic sibling markers

- Siblings are sorted deterministically by `actualName`, then `occurrenceType`, then `resolvedPath`.
- Folder markers use alphabetic sequence (`A`, `B`, …; extended via `AA`, etc.).
- File markers use numeric sequence (`1`, `2`, …).
- Marker lineage is materialized via `markerSegments` and flattened `occurrenceMarker`.

Status: **present in current runtime truth**.

### 1.5 Local rebasing by active scope and by parent folder

- Markers are computed per sibling group under each parent key.
- Folder and file counters restart per sibling group.
- Target/file targeting behavior can rebase scope root to containing folder rather than file root lineage.

Status: **present in current runtime truth**.

### 1.6 Resolved-path preservation

- Every occurrence record keeps `resolvedPath`.
- Downstream Tree logic consumes resolved paths for file reasoning and findings path fields.

Status: **present in current runtime truth**.

### 1.7 Stable internal handoff shape to Tree logic

- Wiring injects `occurrenceSnapshot` into prepared Tree inputs.
- Runtime logic checks for `occurrenceSnapshot.occurrenceRecords` and uses fallback only when absent/malformed.
- Classification and file reasoning consume the occurrence record array as a bounded internal substrate.

Status: **present in current runtime truth**.

### 1.8 Boundary statement

Current occurrence snapshot behavior is substantial and deterministic. It already behaves like an occurrence-address evidence substrate, but that does **not** by itself establish a separately formalized structural-address probe contract surface (for example, a neutral get-tree output boundary).

---

## 2) Structural-address model requirements

From `tree-occurrence-model-and-addressing.spec.md`, expected fuller model elements for structural-address snapshot / get-tree probe interpretation include:

- scoped root starts at `A` in illustration,
- folder occurrences under a parent use alphabetic markers (`A`, `B`, `C`, …),
- file occurrences under a parent use numeric markers (`1`, `2`, `3`, …),
- folder counting restarts inside each parent folder,
- file counting restarts inside each parent folder,
- nested depth locally rebases sibling counters,
- lineage-based addresses are explicit (example: `A.D.A.3`),
- resolved filesystem path remains user-facing truth,
- structural addresses represent pre-reasoning occurrence identity, not final meaning.

Boundary interpretation for this audit:

- This model is stronger than “we have occurrence records.”
- It implies an explicit, inspectable, stable probe-ready contract that can be consumed without pulling in Tree findings semantics.

---

## 3) Gap analysis

### 3.1 Classification result

**Classification:** mostly sufficient but needs docs/contract formalization.

### 3.2 Evidence

Why this is not “insufficient”:

- Occurrence substrate is already deterministic and rich (scope-root binding, lineage, markers, parent linkage, folder/file typing, local rebasing, resolved-path preservation).
- Wiring/runtime already rely on this substrate in current implementation reality.

Why this is not yet “sufficient as-is for structural-address substrate”:

- The runtime substrate exists, but the repo lacks a tree-owned formalized neutral probe contract that cleanly separates:
  - pre-reasoning structural-address evidence,
  - known-root compatibility interpretation,
  - later registry/loader normalization layers.
- Current consumption path is embedded in Tree runtime reasoning flow rather than explicitly documented as a standalone get-tree/probe boundary contract.

Conclusion:

- Current snapshot is near-ready substrate.
- Minimal next step is contract formalization of a neutral probe boundary (docs-first, optionally followed by tiny non-behavioral adapter slice only if needed).

---

## 4) Get-tree / probe boundary

### 4.1 Is a future neutral probe slice needed?

**Yes**, but the immediate need is boundary formalization; this issue does not require selecting a runtime command surface.

Reasoning:

- Current runtime truth has the ingredients.
- Missing piece is a clearly scoped neutral contract that exposes structural-address evidence without coupling to findings/report logic.
- In this audit context, “get-tree” means neutral addressed tree structure/probe concept, not mandatory command implementation.

### 4.2 Smallest safe slice definition

If implemented in a future issue, smallest safe get-tree/probe slice should be:

1. **Input scope/target behavior**
   - Reuse existing scope + target resolution semantics already used by tree wiring.
   - No new scope policy.

2. **Output shape (example contract sketch, pre-reasoning only)**
   - `scope`
   - `scopeRoots`
   - `occurrenceRecords[]` where each record carries existing evidence fields such as:
     - `resolvedPath`, `actualName`, `occurrenceType`
     - `scopeRootPath`, `isScopedRoot`, `isScopeTopOccurrence`
     - `parentResolvedPath`, `depth`, `lineageSegments`
     - `markerSegments`, `occurrenceMarker`

3. **Surface mode decision space (future slice choice, not implemented here)**
   - docs-only contract formalization,
   - internal API,
   - debug/probe output,
   - command surface,
   - or a staged combination.

   Audit recommendation for smallest safe progression: docs-only contract first, then evaluate internal API/probe exposure if needed; command surface is optional and deferred.

4. **Hard boundaries for that slice**
   - no finding/report semantics changes,
   - no registry-based reasoning,
   - no known-root replacement,
   - no placement confidence logic,
   - no naming-bridge payload changes.

---

## 5) Pre-reasoning handoff boundary

Define layer boundaries as follows.

### 5.1 Structural-address evidence producer

- Produces deterministic occurrence-address evidence from selected paths + scoped roots.
- Owns lineage/marker assembly and folder/file sibling rebasing.

### 5.2 Current occurrence snapshot substrate

- Current implementation reality container for evidence records.
- Supplies deterministic pre-reasoning structural substrate.

### 5.3 Known-root compatibility interpretation

- Separate interpretation layer that consumes paths/occurrences for conservative compatibility advisories.
- Must not be treated as equivalent to structural-address identity model completeness.

### 5.4 Future registry-based reasoning

- Later layer for richer structural-home/semantic-home reasoning.
- Should consume normalized structural-address evidence rather than reconstructing identity heuristically.

### 5.5 Final Tree findings/reports

- Report/finding layer remains downstream of the above.
- User-facing truth remains resolved paths in findings output.
- Structural addresses are pre-reasoning/internal evidence identity, not required report surface in this stage.

---

## Non-goal reaffirmation

This audit explicitly performs no runtime, loader, registry, naming, CLI-output, report-shape, or known-root logic changes. It does not add get-tree command/runtime behavior and does not expose structural addresses in findings output.

---

## Recommendation (next minimal issue)

Recommended next minimal issue (docs-first and boundary-safe):

1. **Gap classification (required precision):**
   - **mostly sufficient but needs docs/contract formalization**.

2. **Answer: Is dedicated get-tree/probe formalization needed?**
   - Yes. Formalization is needed as a neutral boundary contract; this does not require choosing a command in this issue.

3. **Answer: Should loader/normalization wait?**
   - Yes. Loader/normalization migration should wait until the boundary contract is explicitly documented and accepted, to avoid policy/runtime coupling drift.

4. **Smallest safe next step**
   - Publish a tree-owned docs-only contract slice that formalizes neutral probe evidence shape using current occurrence snapshot fields (no runtime behavior change), with conformance notes showing no findings/report impact.
   - After docs-only acceptance, evaluate whether internal API or debug/probe output is needed; keep command surface optional and deferred.
