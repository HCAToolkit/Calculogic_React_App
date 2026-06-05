# tree-known-roots retirement — addressed occurrence evidence contract (Slice 4)

> Status after issue #572: This document is retained as historical docs/spec context. Any known-roots statements describing active runtime ownership are not current runtime truth; current runtime truth is that Tree known-roots registry/runtime dependencies are retired and replacement Tree evidence controls the relevant runtime paths.


Refs #516  
Refs #523

## 1) Status and scope

This document is a docs/spec-only slice under #516.

This slice records current runtime truth, current implementation reality, target architecture, and a staged implementation path for addressed occurrence evidence inputs required before known-roots runtime replacement.

This slice does not change:

- runtime behavior
- registry payloads
- Tree advisor output
- Structural Addressing logic
- Naming integration
- validation commands
- known-roots runtime dependencies

## 2) Source context

Path so far:

- Slice 1 audited known-roots responsibilities.
- Slice 2 defined the target replacement model.
- Slice 3 staged registry-alignment blockers.
- Slice 4 defines addressed occurrence evidence contract inputs before runtime replacement work.

Confirmed runtime dependency paths in current implementation reality:

1. `knownTopLevelDirectories` → unexpected top-level folder advisor policy
2. `topRoots[].kind` → occurrence-derived structural/semantic classification

## 3) Contract ownership

Ownership boundary for this contract:

- Structural Addressing owns deterministic occurrence/address production.
- Structural Addressing may provide occurrence/location evidence.
- Tree owns structural-home interpretation.
- Tree owns semantic-home interpretation.
- Tree owns folder-kind interpretation.
- Tree owns placement/advisor policy.
- Naming owns semantic-name and semantic-family interpretation.
- Tree may consume Naming-prepared evidence through an explicit bridge.
- tree-known-roots is transitional compatibility data only.

Addressed occurrence evidence may own/provide evidence fields such as:

- `path`
- `name`
- `occurrenceType`
- `addressPath`
- `parentAddressPath`
- address lineage / ancestry (if current or target-deferred)
- repo-top / scope-top location markers
- scope identity (if current or target-deferred)
- deterministic ordering/traversal evidence (if current or target-deferred)
- source evidence metadata (if current or target-deferred)

Addressed occurrence evidence must not own/provide interpretation or policy truth for:

- structural-home meaning
- semantic-home meaning
- folder-kind meaning
- advisor policy decisions
- Naming semantic-family meaning
- known-roots compatibility verdicts
- placement verdicts
- severity / findings

## 4) Current evidence reality

Current runtime truth for addressed evidence in inspected Tree runtime paths:

- `prepareTreeStructuralAddressSnapshot(...)` emits `occurrenceRecords` with `path`, `name`, `addressPath`, `parentAddressPath`, and preserves `occurrenceType` from occurrence snapshot records.
- `prepareTreeKnownRootsCompatibilityEvidence(...)` consumes addressed snapshot records and reads `addressPath`, `path`, `name`, and `occurrenceType`.
- repo-top compatibility matching in `prepareTreeKnownRootsCompatibilityEvidence(...)` currently relies on single-token `path` shape (no `/` or `\\`) plus `occurrenceType === "folder"` for repo-top folder occurrence detection.
- `classifyTreeOccurrenceRecords(...)` currently reads `topRoots[].kind` and emits interpretation fields (`structuralClass`, `structuralKind`, `isKnownTopRoot`, `isStructuralRoot`, `isSemanticRoot`) using Tree-known-roots metadata.

Current implementation reality for structural-addressing path discovery in this slice:

- Prompt path `calculogic-validator/src/structural-addressing` was not found in this repository.
- Inspected docs and inventory references indicate structural-addressing code under `calculogic-validator/structural-addressing/src/...` for addressed occurrence production context.

Not current runtime truth (target/deferred for this contract slice):

- explicit first-class `repoTopCandidate` marker field on addressed records
- explicit first-class `scopeTopCandidate` marker field on addressed records
- explicit ancestry/lineage field contract across all addressed records
- explicit source/scope metadata contract fields beyond current snapshot envelope fields (`scope`, `scopeRoots`, and source string)

## 5) Target addressed occurrence evidence shape

Future Tree-owned replacement slices should consume a bounded addressed occurrence evidence contract like the following.

| field | meaning | source owner | current availability | target requirement | consumer use | must not imply |
|---|---|---|---|---|---|---|
| `path` | deterministic occurrence path token/path | Structural Addressing production (or current Tree bridge snapshot producer) | current runtime truth | required | candidate detection, parent/child context joins | structural-home/semantic-home/folder-kind meaning |
| `name` | occurrence basename token | Structural Addressing production (or current Tree bridge snapshot producer) | current runtime truth | required | display, joins, semantic bridge keying input | Naming semantic-family meaning by itself |
| `occurrenceType` | bounded occurrence type (`folder`/`file`) | Structural Addressing production (or current Tree bridge snapshot producer) | current runtime truth | required | folder-only gates, policy routing | placement verdicts/severity |
| `addressPath` | deterministic structural address identity for the occurrence | Structural Addressing | current runtime truth (Tree bridge uses `occurrenceMarker`) | required | stable addressing joins, evidence traceability | policy/interpretation truth |
| `parentAddressPath` | parent structural address identity | Structural Addressing | current runtime truth | required | ancestry joins and placement context | structural-home interpretation |
| `repoTopCandidate` (or equivalent marker) | location evidence that occurrence is repo-top candidate | Structural Addressing provides location evidence; Tree may derive equivalent bridge evidence | target/deferred as explicit field (currently inferred from single-token `path` + folder type in compatibility logic) | required before replacing `knownTopLevelDirectories` path | Tree advisor policy input and Tree interpretation preprocessing | expected/allowed/unexpected policy decision |
| `scopeTopCandidate` (or equivalent marker) | location evidence that occurrence is scope-top candidate | Structural Addressing provides location evidence; Tree may derive equivalent bridge evidence | target/deferred as explicit field | required for scoped replacement parity | Tree interpretation/policy staging | structural/semantic classification meaning |
| `lineage` / `ancestorAddressPaths` (or equivalent) | deterministic ancestry evidence | Structural Addressing | target/deferred as explicit field | optional but recommended where replacement slices need ancestry beyond parent pointer | deeper context for Tree interpretation | home assignment verdicts by itself |
| `scopeIdentity` / `sourceScopeMetadata` (or equivalent) | scope/source metadata for deterministic provenance | Structural Addressing snapshot envelope | partially current (scope object/source string exists) | target contract should freeze fields required by replacement slices | deterministic scope-aware policy and interpretation staging | naming/home/policy interpretation truth |

## 6) Repo-top and scope-top contract

Contract boundary:

- repo-top / scope-top is location evidence, not meaning evidence.
- single-token path shape can be location evidence, not policy truth.
- nested paths like `calculogic-validator/src` must not be treated as repo-top solely because basename is `src`.

Current implementation reality examples aligned to compatibility behavior:

- `src` => repo-top candidate
- `test` => repo-top candidate
- `calculogic-validator/src` => not repo-top
- `packages/foo/src` => not repo-top
- `docs/test` => not repo-top

Tree policy and interpretation layers must consume location evidence and then decide meaning/policy; location evidence alone is not current runtime truth for expected/allowed/unexpected outcomes.

## 7) Relationship to occurrence classification replacement

This contract supports eventual replacement of `topRoots[].kind` dependency by providing deterministic where-is evidence inputs.

Ownership boundary remains:

- addressed occurrence evidence can say where a folder/file is.
- Tree structural-home / semantic-home / folder-kind interpretation decides what it means.

Current implementation reality fields that must eventually be behaviorally preserved or replaced through Tree-owned interpretation lanes:

- `structuralClass`
- `structuralKind`
- `isKnownTopRoot`
- `isStructuralRoot`
- `isSemanticRoot`

This slice does not implement replacement for these fields.

## 8) Relationship to unexpected top-level folder policy replacement

This contract supports eventual replacement of `knownTopLevelDirectories` dependency by providing deterministic repo-top candidate evidence.

Ownership boundary remains:

- addressed occurrence evidence can identify repo-top candidates.
- Tree advisor policy decides whether a repo-top candidate is expected, allowed, unexpected, ignored, or deferred.

This slice does not implement policy replacement and does not alter `TREE_UNEXPECTED_TOP_LEVEL_FOLDER` behavior.

## 9) Relationship to registry-alignment blockers

This contract is necessary but not sufficient relative to Slice 3 blockers.

Still required before runtime replacement work:

- `test` / `tests` literal handling remains unresolved policy, not solved by address evidence alone.
- Tree-local/shared ownership boundary contract remains required before runtime replacement.
- `structural-homes` and `folder-kinds` registries are interpretation inputs, not address evidence.
- semantic-home and Naming bridge decisions are not solved by address evidence alone.
- shared `surfaces.registry.json` remains deferred unless separately scoped.

## 10) Migration sequence impact

Recommended next bounded slice:

1. Add Tree-owned structural-home evidence preparation over addressed occurrences.

Staging reminder:

- runtime replacement for known-roots dependencies still requires behavior-preserving tests and required blocker decisions documented in Slice 3.

## 11) Non-goals and anti-drift guardrails

This contract does not:

- replace known-roots
- change occurrence classification
- change unexpected top-level folder policy
- make Structural Addressing responsible for Tree interpretation
- make Tree responsible for Naming interpretation
- resolve `test` / `tests` policy
- introduce shared `surfaces.registry.json`
- change registry payloads
- change Tree advisor output
- create `validate:addressing` commands

Additional guardrails for this slice:

- no runtime behavior changes
- no Tree advisor findings/finding code/severity/placement verdict/confidence scoring changes
- no Structural Addressing runtime logic changes
- no Naming integration runtime behavior changes
- no registry payload changes
- no known-roots runtime dependency removal
