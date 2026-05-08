# Tree Addressed-Occurrence Evidence Model Design (Hybrid Transition, Slice #469)

## Status and Scope

- **Document type:** Design model (docs/design-only).
- **Issue context:** child slice design for `#469` under parent roadmap `#452`.
- **Current runtime stance:** this document records design direction only and implements no runtime behavior changes.
- **Runtime authority boundary:** for **current runtime truth** and **current implementation reality**, continue to treat current tree runtime + current builtin registries as authoritative.

This design uses these status phrases intentionally:

- current runtime truth
- current implementation reality
- target architecture
- not current runtime truth
- staged implementation path

## 1) Hybrid transition model

### 1.1 Core model statement

The hybrid model for this slice is:

- preserve `tree-known-roots.registry.json` as **current runtime truth** for known-root compatibility behavior,
- define addressed-occurrence evidence as a future parallel layer,
- allow a future known-roots compatibility wrapper to annotate/translate current known-root outputs into addressed-occurrence evidence terms,
- avoid treating known-root compatibility as long-term canonical Tree meaning.

Runtime behavior in this issue remains unchanged. That is **current implementation reality**.

### 1.2 Direction of travel

```text
current known-root runtime compatibility
→ compatibility wrapper / annotation layer
→ addressed-occurrence evidence model
→ future Tree placement interpretation
```

Interpretation note:

- this direction is **target architecture**,
- it is **not current runtime truth**,
- it is a **staged implementation path** for future runtime slices.

## 2) Addressed-occurrence evidence unit (conceptual)

### 2.1 Design intent

Define the smallest inspectable future evidence unit for one occurrence.

This unit is:

- not a runtime schema yet,
- not report output yet,
- a design model for future runtime evidence assembly.

### 2.2 Conceptual evidence-unit shape

```text
AddressedOccurrenceEvidenceUnit
- activeScope                      // scope profile name or scope-profile reference
- occurrenceAddress                // deterministic addressed occurrence identity
- physicalPath                     // normalized repo-relative path
- token                            // folder/file token at this occurrence
- parentLineage                    // ordered parent occurrence chain
- occurrenceKind                   // folder | file
- structuralHomeEvidence           // evidence items pointing to structural-home interpretation
- semanticHomeEvidence             // evidence items for semantic-home derivation
- folderKindEvidence               // bounded folder-kind vocabulary evidence
- surfaceHomePerspectiveEvidence   // affinity/evidence, not final placement truth
- knownRootCompatibilityEvidence   // compatibility-only evidence layer
- evidenceSource                   // where this signal came from (registry/runtime/bridge)
- signalStrength                   // optional evidence strength/confidence field
- ambiguityNotes                   // optional unresolved or competing interpretation notes
```

### 2.3 Boundary clarifications

- `occurrenceAddress` identifies occurrence context; it is not automatically meaning.
- `structuralHomeEvidence` and `semanticHomeEvidence` are evidence lanes, not mandatory final truth in this slice.
- `knownRootCompatibilityEvidence` exists to preserve compatibility insight without redefining structural/semantic ownership.

## 3) Known-roots compatibility wrapper plan

### 3.1 Wrapper purpose

A future compatibility wrapper can preserve current known-root behavior while making compatibility assumptions explicit.

Wrapper role:

- annotate current known-root outputs,
- map known-root facts into compatibility evidence fields,
- preserve existing findings/advisories until a future runtime issue explicitly changes behavior.

### 3.2 Conceptual mapping fields

Potential fields in `knownRootCompatibilityEvidence`:

- `knownRootName`
- `knownRootKind`
- `knownRootCompatibilityStatus`
- `currentRuntimeClassification`
- `unexpectedTopLevelCompatibility`
- `runtimeSource: tree-known-roots.registry.json`

### 3.3 Guardrails

- Wrapper output annotates **current runtime truth**; it does not silently replace it.
- Wrapper output should expose where current behavior uses compatibility shortcuts.
- Wrapper output must not claim known roots are canonical long-term Tree meaning.

## 4) Relationship to Structural Home and Semantic Home

### 4.1 Ownership boundaries

- Structural Home identity remains owned by `structural-homes.registry.json`.
- Semantic Home remains tree-derived from folder context + naming bridge outputs.
- Known-root compatibility evidence may inform interpretation but must not become canonical Structural Home or Semantic Home truth.

### 4.2 Repeated-token interpretation rule

Repeated tokens like `src`, `doc`, `test`, and `scripts` must be interpreted using:

- occurrence address,
- parent lineage,
- evidence assembly,

not root-token-only matching.

Short example:

- `calculogic-validator/tree/src`
- `calculogic-validator/naming/src`

Both include token `src`, but they are separate addressed occurrences with different lineage and semantic context.

## 5) Relationship to Folder Kind

- `folder-kinds.registry.json` owns Tree folder-kind vocabulary.
- Folder Kind evidence is distinct from Structural Home identity.
- Folder Kind evidence is distinct from known-root compatibility.
- Future addressed-occurrence evidence may carry folder-kind evidence, while Folder Kind remains a bounded Tree classification vocabulary.

## 6) Relationship to Surface → Structural Home perspective

- `surface-structural-home-perspective.registry.json` owns affinity/evidence only.
- Surface → Structural Home perspective must not become final placement truth.
- Addressed-occurrence evidence may reference this perspective as one evidence lane.
- Final placement interpretation remains Tree-owned runtime interpretation.

## 7) Relationship to future policy registries

This design protects future slices by keeping registry roles separate.

### 7.1 structural-home-signal policy

`structural-home-signal-policy.registry.json` should model weak/contextual/anti-pattern folder signal policy.

Guardrail:

- it must not be repurposed as known-root compatibility truth.

### 7.2 semantic-home policy

`semantic-home-policy.registry.json` should consume occurrence + lineage evidence and naming-bridge outputs.

Guardrail:

- it must not treat known roots as canonical Semantic Home truth.

### 7.3 Loader/normalization guardrail

Tree registry loading/normalization should not assume known roots are long-term primary meaning.

### 7.4 Structural addressing progression guardrail

Future runtime structural addressing should follow this order:

1. occurrence location first,
2. evidence assembly second,
3. interpretation/reporting later.

## 8) Runtime staging recommendation (post-design)

Recommended runtime-safe sequence after this design slice:

1. Keep `tree-known-roots.registry.json` unchanged.
2. Add/design addressed-occurrence evidence assembly in a future issue.
3. Keep known-root compatibility evidence as annotation layer.
4. Later decide if tree reports should expose occurrence addresses/evidence details.
5. Proceed to Slice 5 only if this design confirms weak folder-label policy can remain separate from known-root compatibility.

This issue itself implements none of these runtime steps.

## 9) Recommended next minimal action

Preferred next issue recommendation under `#452`:

- create a follow-up child issue for Slice 5 only if this design confirmation holds:
  - `structural-home-signal-policy.registry.json` can remain separate from known-root compatibility.

Alternative minimal fallback:

- create a small docs-only handoff issue mapping this design into Slice 5 constraints if remaining ambiguity is found.

## 10) Non-goals reaffirmed for this slice

This document intentionally does not:

- change runtime files,
- change registry JSON files,
- add structural-address runtime parsing,
- add addressed-occurrence runtime evidence assembly,
- change tree reports/findings/CLI output,
- change Naming behavior or Naming→Tree bridge payload shape,
- implement Slice 5 or Slice 6 policy registries.

## 11) Authority and context note for this document

For this design slice:

- Runtime authority references: suite contract + tree validator spec.
- Navigation-only reference: tree documentation map/inventory.
- Task-scoped supporting context: issue-chain continuity (`#465/#466`, `#467/#468`, `#459/#464`, `#461/#462`) and parent roadmap `#452`.

Accordingly, this document defines **target architecture** and **staged implementation path**, while preserving **current runtime truth** and **current implementation reality** unchanged.
