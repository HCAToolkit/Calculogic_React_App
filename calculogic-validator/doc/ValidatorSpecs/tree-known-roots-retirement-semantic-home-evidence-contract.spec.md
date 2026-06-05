# Tree Known-Roots Retirement Semantic-Home Evidence Contract (Slice 7)

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


## 1. Status and scope

This slice is docs/spec only and remains evidence-only.

Issue linkage:
- Refs #516
- Refs #529

This document defines current runtime truth, current implementation reality, and target architecture for Tree-owned semantic-home evidence preparation without changing runtime advisor behavior and without replacing known-roots runtime dependencies in this slice.

This slice does not change:
- Tree advisor output behavior
- occurrence classification behavior
- knownTopLevelDirectories allow-list behavior
- topRoots[].kind runtime classification behavior
- registry payloads
- Structural Addressing runtime logic
- Naming runtime behavior

## 2. Ownership boundary contract

Current and target ownership boundary for this slice:

```text
Structural Addressing owns deterministic occurrence/address production.
Structural Addressing may provide occurrence/location evidence.
Tree owns structural-home interpretation.
Tree owns semantic-home interpretation.
Tree owns folder-kind interpretation.
Tree owns placement/advisor policy.
Naming owns semantic-name and semantic-family interpretation.
Tree may consume Naming-prepared evidence through an explicit bridge.
tree-known-roots is transitional compatibility data only.
```

Semantic-home evidence boundary reminder:
- addressed occurrence evidence says where an occurrence is.
- Tree semantic-home evidence says what semantic-home interpretation signal applies.
- Naming semantic-family interpretation must remain Naming-owned and must not be reimplemented in Tree.

## 3. Current runtime truth

Current runtime truth for known-roots dependencies remains unchanged:

1. `knownTopLevelDirectories` still drives `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` advisor policy.
2. `topRoots[].kind` still feeds occurrence-derived structural/semantic classification through `classifyTreeOccurrenceRecords(...)`.

Current runtime truth for prepared dependencies in Tree advisor wiring:
- `preparedDependencies.treeKnownRootsCompatibilityEvidence` exists and is non-observable.
- `preparedDependencies.treeStructuralHomeEvidence` exists and is non-observable.
- no `preparedDependencies.treeSemanticHomeEvidence` exists yet.

## 4. Current implementation reality for semantic-home evidence inputs

Current implementation reality in Tree wiring/runtime:
- Tree wiring does not currently receive a canonical Naming-prepared semantic-home evidence payload in `preparedDependencies`.
- `namingSemanticFamilyBridge` is an optional contributor input surface, not a canonical prepared semantic-home evidence contract.
- There is no current stable runtime bridge contract that provides deterministic per-occurrence semantic-home evidence fields ready for Tree semantic-home evidence preparation.

Current implementation reality conclusion:
- this slice cannot safely add runtime semantic-home evidence preparation in Tree without inventing or hard-coding a Naming bridge shape as current runtime truth.

## 5. Why Tree must not reimplement Naming interpretation

Tree must not derive Naming-owned semantic meaning by:
- inferring semantic family from basename-only heuristics,
- treating folder tokens as Naming semantic-family truth,
- or recreating naming semantic-family parsing logic inside Tree.

Doing so would violate ownership boundaries and create competing policy truth between Tree and Naming.

## 6. Target architecture and evidence shape (staged implementation path)

Target architecture for a future implementation slice:
- Tree prepares semantic-home evidence from addressed occurrence records plus Naming-prepared semantic signals delivered through an explicit bridge contract.
- Tree interprets semantic-home using that prepared Naming evidence and deterministic Tree rules.
- runtime advisor outputs remain unchanged until a later behavior-migration slice explicitly adopts the evidence.

Target semantic-home evidence record shape (non-observable evidence-only contract):

```text
addressPath
parentAddressPath
path
name
occurrenceType
semanticHome
semanticHomeSource
semanticHomeEvidenceStrength
semanticFamily (pass-through from Naming-prepared evidence when available)
semanticName (pass-through from Naming-prepared evidence when available)
rationale
```

Out-of-scope fields for this evidence contract:
- finding / findingCode / severity / verdict / placementVerdict
- advisor decisions
- known-roots classification flags (`isKnownTopRoot`, `isStructuralRoot`, `isSemanticRoot`)
- replacement of current `structuralClass` / `structuralKind` runtime behavior

## 7. Required future inputs before implementation

A future code slice should only implement Tree semantic-home evidence preparation after a stable Naming-prepared bridge exposes deterministic inputs at runtime with explicit contract fields and lifecycle.

Minimum required future input contract:
- deterministic addressed occurrence linkage key (for example `addressPath` and/or stable `path`)
- Naming-owned semantic-family and semantic-name signals
- explicit source identity and confidence semantics for those Naming signals
- deterministic ordering rules compatible with Tree prepared-dependency conventions

## 8. Replacement-path relationship and non-impact statement

How this supports known-roots replacement path:
- semantic-home evidence will later support replacing the semantic side of `topRoots[].kind` classification dependencies once behavior-preserving migration tests are added in a later slice.

Why this does not affect unexpected top-level folder policy now:
- `knownTopLevelDirectories` remains current runtime truth for top-level folder advisor policy in this slice.
- semantic-home evidence preparation is staged as non-observable evidence-only work and is not routed into advisor finding behavior here.

## 9. Next slice

Next implementation slice after inputs exist:
- define and lock the runtime Naming-prepared semantic-home bridge contract consumed by Tree prepared dependencies,
- implement `prepareTreeSemanticHomeEvidence(...)` as evidence-only and non-observable,
- add focused tests proving no advisor output changes and no known-roots dependency replacement in the same slice.
