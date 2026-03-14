# Tree Occurrence Model and Addressing Spec (Modeling Contract, V0.1.0)

## Purpose

This document defines a documentation-first contract for how tree interprets **path occurrences** by combining:

1. structural vocabulary/root classification, and
2. tree-specific occurrence addressing.

The model is designed to prevent token-only interpretation (for example treating every `src` token as the same thing) and to make occurrence identity explicit and deterministic.

Status posture for this document:

- **Current modeling contract:** terms, object model, and interpretation rules in this file.
- **No runtime change claim:** this pass does not change tree runtime behavior.
- **Tree-specific addressing direction:** tree occurrence notation in this file is scoped modeling guidance unless/until promoted into canonical runtime grammar.

## Scope and Non-Goals

### In scope

- Core modeled objects required for tree occurrence interpretation.
- Explicit two-layer interpretation contract (vocabulary + occurrence identity).
- Tree-specific occurrence-addressing guidance for repeated names at different depths/parents.
- Folder/file occurrence typing guidance for tree modeling examples.
- Relationship to existing tree root/partition vocabulary contract and deterministic structural addressing draft.

### Out of scope

- Runtime parser changes or enforcement changes.
- Replacing the broader deterministic structural addressing draft.
- Declaring tree-specific example notation in this file as final runtime grammar.

## Required Core Modeled Objects

### 1) `repo-root`

Repository root scope (`/`) that anchors all occurrence lineage.

### 2) `path occurrence`

A concrete occurrence of a token at a specific rooted path lineage.

- Key property: occurrence identity is contextual (parent lineage + position), not token-only.

### 3) `folder occurrence`

A `path occurrence` whose terminal node is a folder.

### 4) `file occurrence`

A `path occurrence` whose terminal node is a file.

### 5) `vocabulary token`

A reusable lexical token used in structure (for example `src`, `doc`, `assets`, `index.ts`).

- Tokens may repeat in many occurrences.
- Token equality does **not** imply occurrence equality.

### 6) `interpreted tree occurrence`

A `path occurrence` after applying both:

- structural vocabulary classification, and
- occurrence identity/addressing.

Interpretation output conceptually binds:

- token,
- path lineage,
- occurrence type (folder/file),
- structural class.

## Combined Interpretation Model (Two Orthogonal Layers)

Tree interpretation must use two complementary, orthogonal layers.

### Layer A: Structural vocabulary / classification layer

This layer supplies structural meaning/class semantics for occurrences, using the root/partition model already defined by the tree structural vocabulary spec:

- top-root structural vocabulary,
- subtree-partition vocabulary,
- semantic/custom roots.

This layer answers: **"What class meaning does this occurrence carry in context?"**

### Layer B: Occurrence addressing / identity layer

This layer supplies deterministic occurrence identity for repeated tokens across different parents/depths.

This layer answers: **"Which exact occurrence is this, among repeated names?"**

### Mandatory composition rule

Tree interpretation is complete only when both layers are present:

- classification without addressing is ambiguous for repeated tokens;
- addressing without classification lacks structural meaning.

Therefore, tree must interpret **occurrences**, not names alone.

## Why Token-Only Interpretation Fails

Repeated folder names can appear under different parents and at different depths.

Example set:

- `calculogic-validator/src`
- `calculogic-validator/naming/src`
- `calculogic-validator/tree/src`

All three terminal tokens are `src`, but tree modeling must treat them as three distinct folder occurrences because their parent-relative lineage differs.

Required statement:

- Same token + different lineage => different occurrence identity.

## Tree-Specific Occurrence Addressing Guidance (Modeling Direction)

This section defines a tree-focused addressing concept that is separate from, but related to, the broader deterministic structural addressing draft.

### Relationship to deterministic structural addressing draft

- The draft defines broader cross-domain structural addressing direction.
- This document defines a tree-local occurrence identity model that can align with that draft over time.
- This document does **not** finalize open draft decisions or replace draft authority.

### Tree occurrence identity requirements

A tree occurrence address should represent at minimum:

1. rooted lineage from `repo-root`,
2. parent-relative occurrence context,
3. terminal node kind (folder vs file).

### Folder/file typing rule (tree modeling direction)

For tree occurrence address modeling in this spec:

- alphabetic segments represent **folder occurrences**,
- numeric segments represent **file occurrences**.

Status boundary:

- This is a tree-specific modeling direction for documentation/examples.
- It is not declared as canonical runtime grammar in this pass.
- Promotion to canonical runtime/addressing rules requires explicit follow-up adoption work.

### Visual deterministic notation (documentation example)

A simple illustrative notation may be used for examples:

- folder lineage segments are alphabetic labels,
- terminal file occurrence uses numeric segment typing.

Example illustration only:

- Folder occurrence lineage: `R.calculogic-validator.naming.src`
- Terminal file occurrence under that lineage: `R.calculogic-validator.naming.src.01`

Interpretation of the example:

- `R...src` identifies a folder occurrence,
- `...src.01` identifies a file occurrence under that folder occurrence lineage,
- identity derives from lineage + terminal kind, not name-only.

(Notation above is intentionally non-canonical and modeling-scoped in this document.)

## Interpreted Occurrence Walkthrough for Repeated `src`

Given:

- `calculogic-validator/src`
- `calculogic-validator/naming/src`
- `calculogic-validator/tree/src`

Tree must model:

- three distinct `folder occurrence` instances,
- each with its own parent lineage,
- each independently eligible for structural classification in context.

This means tree can simultaneously assert:

- token reused: `src`,
- occurrence identities distinct,
- classification may differ by parent context even with shared token.

## Connection to Existing Root/Partition Vocabulary Contract

The tree structural vocabulary/root classification spec defines **what structural class vocabulary means**.

This document defines **how concrete path occurrences are uniquely identified** when applying that vocabulary.

Combined contract:

1. roots/partitions classify occurrence meaning,
2. occurrence addressing identifies deterministic occurrence context,
3. both are required for future tree determinism.

This separation prevents two failure modes:

- flattening all repeated names into one pseudo-node,
- assigning class meaning without stable occurrence identity.

## Compatibility Notes with Current Tree Spec

This document is modeling-first and intentionally non-disruptive to current runtime behavior documented in the tree structure advisor validator spec.

- No runtime claims are added here.
- No enforcement mode changes are introduced here.
- This contract is intended to guide future deterministic tree evolution.

## Recommended Follow-Up Tasks

1. Define a small tree-local address example registry (documentation-only) that exercises repeated-name scenarios across top-root and subtree contexts.
2. Add a traceability table mapping each interpreted occurrence field to current tree findings payload fields and explicit "missing today" markers.
3. Open a bounded alignment note with the deterministic structural addressing draft for any grammar decisions needed before runtime adoption.

