# tree-known-roots retirement — Naming-prepared semantic evidence bridge contract (Slice 8)

Refs #516  
Refs #531

## 1) Status and scope

This document is a docs/spec-first bridge contract slice under #516 and #531.

This slice defines current runtime truth, current implementation reality, target architecture, and a staged implementation path for Naming-prepared semantic evidence that Tree can later consume for semantic-home evidence preparation.

This slice does **not** change:

- runtime behavior
- Tree advisor output
- occurrence classification
- unexpected top-level folder policy
- registry JSON payloads
- Structural Addressing runtime logic
- Naming runtime behavior
- known-roots runtime dependencies

## 2) Source context

Current chain for this bridge work:

- Slice 7 (`tree-known-roots-retirement-semantic-home-evidence-contract.spec.md`) staged a Tree semantic-home evidence contract.
- Slice 7 recorded that runtime implementation is blocked.
- The blocker is missing deterministic Naming-prepared semantic evidence inputs linked to addressed occurrences.
- Slice 8 defines the bridge contract required before Tree can safely implement `prepareTreeSemanticHomeEvidence(...)`.

## 3) Current evidence reality

### 3.1 Current runtime truth

- Tree wiring accepts an optional `namingSemanticFamilyBridge` input surface.
- Tree contributor wiring may attach naming-bridge contributors when that optional surface is provided.
- Tree currently consumes naming bridge observations for advisory findings, not for semantic-home evidence preparation.
- No `preparedDependencies.treeSemanticHomeEvidence` payload exists in current runtime truth.

### 3.2 Current implementation detail

- Naming currently stages bridge observations through a bounded naming-owned projection helper.
- Current bridge observations are finding-derived and include semantic interpretation fields only when canonical naming evidence exists.
- The current bridge observation shape is semantic-family oriented (`path`, `semanticName`, `familyRoot`, `semanticFamily`, optional `familySubgroup`, optional ambiguity/split markers), not addressed-occurrence keyed semantic-home evidence.

### 3.3 Optional or unstable input surface

- `namingSemanticFamilyBridge` is optional input to Tree wiring.
- Presence, composition sequencing, and consumer usage are runtime composition details and must not be treated as a complete semantic-home prepared-dependency contract.

### 3.4 Target/deferred evidence

Target/deferred bridge evidence needed by Tree semantic-home preparation includes addressed-occurrence linkage fields and source-strength metadata that are not currently emitted as a canonical runtime contract.

### 3.5 Not present

The following are not present as canonical runtime bridge contract fields today:

- deterministic `addressPath` linkage in Naming bridge observations
- deterministic `parentAddressPath` linkage in Naming bridge observations
- Naming-owned `semanticNameSource` / `semanticFamilySource` metadata fields
- canonical bridge-level evidence-strength/confidence field for Tree semantic-home preparation
- a stable `prepareTreeSemanticHomeEvidence(...)` runtime path

## 4) Target bridge payload shape (minimum required by Tree)

The minimum target bridge payload below is required before Tree should implement semantic-home evidence preparation.

| Field | Meaning | Owner | Current availability | Target requirement | Consumer | Must not imply |
| --- | --- | --- | --- | --- | --- | --- |
| `path` | normalized repo-relative path associated with Naming evidence | Naming-prepared bridge payload; path normalization conventions align with suite/runtime contracts | present in current naming bridge observations | required | Tree bridge ingestion + occurrence-linking helper | does not imply structural-home or semantic-home verdict |
| `addressPath` | deterministic occurrence address for the same occurrence represented by `path` | Structural Addressing produces; bridge contract carries aligned key for linkage | not present in current naming bridge observations | required before semantic-home prep implementation | Tree semantic-home evidence preparation | does not imply semantic identity by itself |
| `parentAddressPath` | deterministic parent occurrence address for lineage-aware interpretation | Structural Addressing produces; bridge contract carries aligned key for linkage | not present in current naming bridge observations | required for lineage-safe semantic-home preparation | Tree semantic-home evidence preparation | does not imply folder-kind or placement policy |
| `occurrenceType` | addressed occurrence kind (`file`/`folder`) associated with semantic evidence | Structural Addressing occurrence lane; bridge carries linkage classification | not present in current naming bridge observations | required | Tree semantic-home evidence preparation | does not imply semantic-family truth |
| `semanticName` | Naming-owned semantic-name interpretation for the occurrence | Naming | present in current naming bridge observations | required | Tree semantic-home evidence preparation | does not imply canonical placement policy |
| `semanticFamily` | Naming-owned semantic-family interpretation for the occurrence | Naming | present in current naming bridge observations | required | Tree semantic-home evidence preparation | does not imply structural-home identity |
| `semanticFamilySource` | source metadata describing how semantic-family evidence was produced | Naming | not present as explicit canonical field | required | Tree semantic-home evidence preparation + diagnostics | does not authorize Tree to re-derive naming logic |
| `semanticNameSource` | source metadata describing how semantic-name evidence was produced | Naming | not present as explicit canonical field | required | Tree semantic-home evidence preparation + diagnostics | does not imply confidence by itself |
| `evidenceSource` | bridge-level source identity for the observation payload | Naming bridge contract | not present as explicit canonical field | required | Tree evidence preparation/wiring diagnostics | does not imply policy truth |
| `evidenceStrength` (or equivalent confidence metadata) | bounded confidence/strength metadata if the bridge lane supports it | Naming bridge contract | not present in canonical runtime bridge shape | target-deferred but strongly recommended | Tree semantic-home evidence preparation | does not imply advisor severity/verdict |
| `rationale` | bounded explanation for why semantic signals were assigned | Naming bridge contract | not present as canonical field | target-deferred but recommended | Tree semantic-home evidence preparation + debugging | does not imply replacement of Tree policy layers |

## 5) Linkage between Naming evidence and Tree addressed occurrences

Tree semantic-home preparation must link Naming-prepared evidence to addressed occurrences using deterministic linkage keys, in bounded precedence order:

1. `addressPath` (primary linkage key when present)
2. `path` + `occurrenceType` alignment against addressed occurrence records
3. `parentAddressPath` for lineage-sensitive resolution where needed

Additional linkage notes:

- `scope`-relative normalized `path` remains an acceptable fallback linkage key only when deterministic addressed linkage is unavailable.
- `file` vs `folder` occurrence class must be preserved during linkage; Tree must not merge them opportunistically.
- If stable occurrence identifiers are introduced later, they may be added as explicit bridge keys in a future slice.

Guardrail:

- Tree must not guess semantic identity from folder basename alone unless Naming prepared that semantic evidence explicitly in the bridge payload.

## 6) What Naming owns

Naming ownership within this bridge contract:

- filename parsing
- semantic-name extraction
- semantic-family extraction
- role suffix parsing
- case/style interpretation
- Naming-side ambiguity handling
- Naming-side special cases

Tree may consume Naming-prepared output fields but must not duplicate Naming interpretation internals.

## 7) What Tree may consume

Tree is allowed to consume only bridge-exposed prepared fields, including:

- `semanticName`
- `semanticFamily`
- source metadata (`semanticNameSource`, `semanticFamilySource`, `evidenceSource`)
- confidence/strength metadata when supported
- deterministic linkage keys to addressed occurrences (`path`, `addressPath`, `parentAddressPath`, `occurrenceType`)
- ambiguity/split markers when provided by Naming bridge payload

This consumption scope supports later semantic-home evidence preparation only. It does not authorize runtime behavior migration in this slice.

## 8) What Tree must not infer or reimplement

Tree must not:

- parse Naming filename grammar itself
- reimplement semantic-family extraction
- treat folder basename as semantic-family truth
- treat tree-known-roots semantic roots as target semantic-home truth
- convert optional Naming observations into canonical policy truth
- replace occurrence classification in this slice
- replace unexpected top-level folder policy in this slice

## 9) Relationship to future `prepareTreeSemanticHomeEvidence(...)`

This bridge contract is the prerequisite for a later Tree implementation slice that would:

- implement `prepareTreeSemanticHomeEvidence(...)`
- stage `preparedDependencies.treeSemanticHomeEvidence` as non-observable prepared evidence
- emit semantic-home evidence records linked to addressed occurrences and Naming-prepared semantic signals
- enable behavior-preserving replacement work for the semantic side of `topRoots[].kind`

This slice defines the bridge contract only and does not implement runtime preparation.

## 10) Relationship to known-roots retirement

This bridge supports future known-roots retirement by enabling replacement planning for:

- `topRoots[].kind` semantic-side dependency
- occurrence-derived structural/semantic classification migration toward occurrence + prepared-evidence interpretation

This slice does **not** replace known-roots runtime truth now.

This slice does **not** affect:

- `knownTopLevelDirectories` usage for unexpected top-level folder advisor policy
- current Tree advisor findings envelope

## 11) Non-goals and anti-drift guardrails

### Non-goals for Slice 8

Do not add or change:

- runtime behavior
- Tree advisor findings
- finding codes
- severity
- placement verdicts
- confidence scoring in reports
- validation-style reports
- occurrence classification behavior
- unexpected top-level folder policy behavior
- semantic-home runtime behavior
- folder-kind replacement runtime behavior
- broader scatter heuristics
- `validate:addressing` commands
- Naming runtime behavior
- Tree advisor output behavior
- registry JSON payloads
- shared surfaces registry
- Structural Addressing runtime logic
- known-roots removal

### Explicit anti-drift guardrails

- Do not add `preparedDependencies.treeSemanticHomeEvidence` in this slice.
- Do not delete, rename, split, or rewrite:
  - `tree-known-roots.registry.json`
  - `folder-kinds.registry.json`
  - `structural-homes.registry.json`
  - `surface-structural-home-perspective.registry.json`
- Do not normalize `test` / `tests` handling.
- Do not replace:
  - `knownTopLevelDirectories` → unexpected top-level folder advisor policy
  - `topRoots[].kind` → occurrence-derived structural/semantic classification

## 12) Authority layering note for this bridge spec

For this task scope, authority layering is:

- runtime authority: `ValidatorSuite-Contracts-And-Modes.md`, `tree-structure-advisor-validator.spec.md`, `NamingValidatorSpec.md`
- navigation metadata: `tree-owned/tree-documentation-map-and-reorg-inventory.md`
- task-scoped supporting context: known-roots retirement slices (`target-model`, `registry-alignment`, `addressed-occurrence`, `semantic-home evidence`, responsibility audit)

This document remains docs/spec-first bridge-contract guidance and not current runtime behavior.
