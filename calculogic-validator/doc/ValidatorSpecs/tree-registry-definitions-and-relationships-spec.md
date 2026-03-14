# Tree Registry Definitions and Relationships Spec (Modeling Contract, V0.1.0)

## Purpose

Define the first bounded interpretive registry model for tree so tree can reason deterministically about:

- structural entities,
- entity definitions,
- inter-entity relationships,
- interpretation rules.

This spec is documentation-first and creates the missing interpretive layer between:

- tree occurrence identity/addressing, and
- tree runtime findings/report behavior.

Status posture for this document:

- **Current modeling contract:** terms, definitions, relationships, and interpretation rules in this file.
- **No runtime change claim:** this file does not require immediate runtime behavior changes.
- **Bounded first slice:** only the first minimal set of entities and relationships are defined here.

## Scope and Non-Goals

### In scope

- First bounded set of tree entities.
- First bounded set of tree relationship types.
- First explicit interpretation rules for tree-local deterministic reasoning.
- Mapping of current builtin tree-known-roots registry into this model.
- Registry layering guidance for follow-up work.

### Out of scope

- Immediate migration of all concepts into builtin runtime registry payloads.
- Runtime parser/loader/executor behavior changes in this task.
- Semantic-family implementation details.
- Naming-derived interpretation expansion.
- Structural-address runtime grammar finalization.

## Canonical Entity Set (Bounded V0.1.0)

The following nouns are the first bounded tree registry entities.

### 1) `repo-root`

The repository-root interpretation anchor for tree scope (`/`) and lineage.

### 2) `scope-root`

A rebased interpretation anchor used when tree runs against a targeted subtree.

- A `scope-root` is an interpretation anchor, not a filesystem rewrite.
- A `scope-root` may equal `repo-root` in full-repo runs.

### 3) `top-root-structural`

A repo-top root occurrence that represents generalized structural vocabulary.

- Example class intent: roots like `src`, `doc`, `test`, `tools`.
- Scope posture: valid at repo-top interpretation layer.

### 4) `top-root-semantic`

A repo-top root occurrence that represents semantic/package identity.

- Example class intent: repo-specific package roots.
- Scope posture: repo-top semantic identity, not generic subtree convention.

### 5) `subtree-partition`

A subtree-local structural partition convention interpreted inside a containing subtree.

- Not universal repo-top truth by default.
- Requires explicit containment context for interpretation.

### 6) `folder-occurrence`

A concrete path occurrence whose terminal node is a folder.

- Identity is lineage-bound (scope + ancestry), not token-only.

### 7) `file-occurrence`

A concrete path occurrence whose terminal node is a file.

- Identity is lineage-bound (scope + ancestry), not token-only.

## Definitions Layer (Entity Meaning Contract)

This layer defines what qualifies as each entity type.

### `repo-root` definition

A path interpretation origin with these properties:

- is the canonical top anchor for repo-wide tree interpretation,
- hosts repo-top occurrence evaluation,
- is stable across runs for the same repository snapshot.

### `scope-root` definition

A scoped interpretation origin with these properties:

- is derived from target selection/rebasing policy,
- anchors local occurrence addressing in a scoped run,
- does not alter resolved filesystem truth.

### `top-root-structural` definition

A `folder-occurrence` qualifies as `top-root-structural` when all are true:

1. occurrence is at repo-top relative to `repo-root`,
2. token is declared in top-root vocabulary with structural class intent,
3. interpretation is structural (surface/type), not semantic package identity.

### `top-root-semantic` definition

A `folder-occurrence` qualifies as `top-root-semantic` when all are true:

1. occurrence is at repo-top relative to `repo-root`,
2. token is declared in top-root vocabulary with semantic class intent,
3. interpretation meaning is semantic/repo identity.

### `subtree-partition` definition

A `folder-occurrence` qualifies as `subtree-partition` when all are true:

1. occurrence is interpreted below a containing root/subtree context,
2. token is declared as a subtree-local partition convention,
3. interpretation does not imply universal repo-top class truth.

### `folder-occurrence` definition

A path occurrence with:

- a rooted lineage,
- terminal kind `folder`,
- deterministic identity from scope + lineage.

### `file-occurrence` definition

A path occurrence with:

- a rooted lineage,
- terminal kind `file`,
- deterministic identity from scope + lineage.

## Relationships Layer (Bounded Relationship Vocabulary)

Relationship types define allowed interpretation graph edges among entities.

### 1) `allowed-at-repo-top`

Declares that an entity class is interpretable at repo-top scope.

- Applies to: `top-root-structural`, `top-root-semantic`.
- Excludes by default: `subtree-partition`.

### 2) `contained-by`

Declares direct interpretation containment for occurrences/classes.

- `folder-occurrence` may be `contained-by` repo-root/scope-root/other folder occurrence.
- `file-occurrence` is `contained-by` a folder occurrence.

### 3) `may-host`

Declares allowed child interpretation classes from a parent class.

- Example bounded posture:
  - repo-root may host top-root classes,
  - top-root/subtree folder contexts may host subtree partitions,
  - folder occurrences may host file occurrences.

### 4) `rebases-from`

Declares scope-rebasing ancestry for interpretation roots.

- `scope-root rebases-from repo-root`.
- Rebase changes local interpretation anchor, not underlying filesystem path.

### 5) `lineage-determines-identity`

Declares occurrence identity semantics:

- same token + different lineage => distinct occurrence identity,
- identity key includes scope binding and ancestry.

### 6) `structural-root-of`

Declares that a top-root structural class is structural-root identity for a subtree interpretation domain.

- Example: repo-top `src` as structural-root-of its subtree domain.

### 7) `scope-root-of`

Declares which occurrence set is interpreted under a specific scope root.

- Enables explicit scope binding for address tails and repeated-token disambiguation.

## Interpretation Rules (Bounded V0.1.0)

These rules define first-pass deterministic interpretation behavior for tree modeling.

1. **Occurrence identity is lineage-bound.**
   - Identity derives from scope binding + lineage + terminal kind.
   - Token equality alone is insufficient.

2. **Top-root classes are repo-top interpreted.**
   - `top-root-structural` and `top-root-semantic` are interpreted at repo-top only.

3. **Semantic roots are semantic identities.**
   - `top-root-semantic` denotes repo-top semantic identity, not generic partition behavior.

4. **Subtree partitions are local conventions.**
   - `subtree-partition` is local structural convention unless explicitly promoted by separate policy.

5. **Resolved path remains user-facing truth.**
   - Findings/report payload paths remain resolved filesystem paths.
   - Occurrence addressing is internal reasoning identity substrate.

6. **Scope rebasing is interpretive, not filesystem-mutating.**
   - `scope-root` rebasing changes local interpretation origin only.
   - Resolved path truth remains unchanged.

7. **Registry policy encodes declared structural meaning.**
   - Registry entries should represent explicit declared meaning, not accidental repo coincidence.

## Mapping Current Builtin Known-Roots Registry Into This Model

Source: `calculogic-validator/tree/src/registries/_builtin/tree-known-roots.registry.json` and its loader/normalizer.

### What current builtin registry already covers

Current payload already supplies a bounded **repo-top vocabulary layer**:

- `topRoots[]` entries with:
  - `root`,
  - `kind` (`structural` | `semantic`),
  - `ownershipSource` (`builtin` | `custom`),
  - optional `styleClass`.
- legacy compatibility list via `knownTopLevelDirectories`.

Model mapping:

- `topRoots.kind = structural` -> `top-root-structural`
- `topRoots.kind = semantic` -> `top-root-semantic`

### What current builtin registry does not yet cover

Current payload does not yet model:

- explicit entity definitions registry data,
- explicit relationship records (`contained-by`, `may-host`, `rebases-from`, etc.),
- subtree partition declarations,
- interpretation rules as data,
- scope-root contracts and scope-root lineage relationships.

### What remains deferred

Deferred by design in this pass:

- introducing full definitions/relationships payloads into runtime registries,
- enforcing relationship rules at runtime,
- extending builtin payload to represent every entity class immediately,
- semantic-family interpretation layer implementation.

## Registry Layering Guidance (Future Split)

Recommended layer split for tree registry architecture:

1. **Root vocabulary registry**
   - bounded repo-top vocabulary (`topRoots`) and related ownership/style metadata.

2. **Definitions registry**
   - entity definitions and qualification predicates for tree nouns.

3. **Relationships registry**
   - allowed relationship types and bounded relationship edges.

4. **Interpretation/resolution layer**
   - deterministic rule application over occurrences + definitions + relationships,
   - scoped rebasing behavior,
   - reasoning-vs-output boundary preservation.

Guidance constraint:

- This split should evolve incrementally.
- Existing builtin root vocabulary registry should not be overloaded prematurely with all future concepts.

## Guardrails

1. **Tree definitions are not naming role definitions.**
   - Tree entities classify structure/scope relationships, not naming role/category validity.

2. **Occurrence identity does not replace resolved output paths.**
   - Keep internal occurrence identity and user-facing path output distinct.

3. **Subtree partitions are not silently promoted.**
   - Local partition conventions must not become builtin top-root truth without explicit policy.

4. **Registry policy is declaration-driven.**
   - Prefer declared structural meaning over accidental shape coincidence.

5. **Bounded-first expansion.**
   - Add entities/relationships only when interpretation need is explicit and deterministic.

## Immediate Follow-Up Runtime Task (Recommended)

After this spec lands, the next bounded runtime task should be:

- **Add a tree definitions/relationships interpretation adapter in tree runtime wiring that derives interpreted occurrence metadata from existing occurrence snapshot + known top roots, without changing findings envelope or path output.**

Minimal target for that follow-up:

1. Keep existing `topRoots` loader contract unchanged.
2. Add a lightweight definitions/relationships model module (runtime-local, bounded).
3. Materialize interpreted occurrence annotations (entity class + relationship hints) for internal tree reasoning only.
4. Preserve current findings codes, report shape, and resolved-path output semantics.

## Authority and Compatibility Notes

- This document is a modeling contract aligned with existing tree vocabulary and occurrence specs.
- It complements current tree runtime documentation and does not replace it.
- Runtime authority remains with the suite contract plus tree runtime spec until follow-up implementation work is accepted.
