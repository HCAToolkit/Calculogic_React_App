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

Example occurrence set:

- `calculogic-validator/src`
- `calculogic-validator/naming/src`
- `calculogic-validator/tree/src`

All three terminal tokens are `src`, but tree modeling must treat them as three distinct folder occurrences because their parent-relative lineage differs.

Required statement:

- Same token + different lineage => different occurrence identity.

## Concrete Validator Tree Illustration (Illustrative, Tree-Specific)

### Status Note (Scope and Authority)

This section is a concrete **illustrative tree-occurrence** example for this document.

- Letters represent **folder occurrences**.
- Numbers represent **file occurrences**.
- This notation is **tree-specific modeling guidance** scoped to this doc.
- It is **not** declared canonical runtime grammar in this pass.
- It does **not** replace `calculogic-validator/doc/ConventionRoutines/DeterministicStructuralAddressingSpec-Draft.md`.

### Concrete Tree Excerpt

`A` = `calculogic-validator/`

```text
A: calculogic-validator/
1├─ LICENSE
2├─ README.md
3├─ package.json
A├─ doc/
│ A├─ ConventionRoutines/
│ B├─ ValidatorSpecs/
│ C└─ Indexes/
B├─ bin/
│ 1├─ calculogic-validate.mjs
│ 2├─ calculogic-validate-naming.mjs
│ 3└─ calculogic-validator-health.mjs
C├─ scripts/
│ 1├─ validate-all.mjs
│ 2├─ validate-naming.mjs
│ 3├─ validator-health-check.host.mjs
│ 4├─ report-capture-verify.mjs
│ 5└─ report-capture-summarize.mjs
D├─ src/
│ 1├─ index.mjs
│ 2├─ validator-config.schema.json
│ A├─ core/
│ │ 1├─ repository-root.logic.mjs
│ │ 2├─ npm-arg-forwarding-guard.logic.mjs
│ │ 3├─ validator-exit-code.logic.mjs
│ │ A├─ cli/
│ │ │ 1├─ validator-cli-output.logic.mjs
│ │ │ 2├─ validator-cli-scopes.logic.mjs
│ │ │ 3├─ validator-cli-targets.logic.mjs
│ │ │ 4└─ validator-cli-usage.logic.mjs
│ │ 4├─ validator-report.contracts.mjs
│ │ 5├─ validator-report-meta.logic.mjs
│ │ 6├─ validator-runner.logic.mjs
│ │ 7├─ validator-registry.knowledge.mjs
│ │ 8├─ validator-scopes.runtime.mjs
│ │ 9├─ validator-root-files.knowledge.mjs
│ │ 10└─ source-snapshot.logic.mjs
│ B└─ config/
│   1├─ validator-config.contracts.mjs
│   2└─ validator-config.logic.mjs
```

### Example Interpreted Occurrences

Interpretation principle used below (Illustrative, tree-specific):

- occurrence marker ≠ actual folder/file name,
- marker identifies position/type within the illustrative lineage system,
- actual name is the folder/file token resolved at that occurrence.

- `A.1`
  - Address: `A.1`
  - Occurrence type: `file occurrence`
  - Occurrence marker: `1`
  - Actual name: `LICENSE`
  - Resolved path: `calculogic-validator/LICENSE`
  - Meaning: first file occurrence directly under repo-root occurrence `A`.

- `A.A`
  - Address: `A.A`
  - Occurrence type: `folder occurrence`
  - Occurrence marker: `A`
  - Actual name: `doc`
  - Resolved path: `calculogic-validator/doc/`
  - Meaning: first folder occurrence under repo-root occurrence `A`.

- `A.A.A`
  - Address: `A.A.A`
  - Occurrence type: `folder occurrence`
  - Occurrence marker: `A`
  - Actual name: `ConventionRoutines`
  - Resolved path: `calculogic-validator/doc/ConventionRoutines/`
  - Meaning: first folder occurrence under `calculogic-validator/doc/`, distinguished by lineage from other `A` markers.

- `A.D`
  - Address: `A.D`
  - Occurrence type: `folder occurrence`
  - Occurrence marker: `D`
  - Actual name: `src`
  - Resolved path: `calculogic-validator/src/`
  - Meaning: fourth folder occurrence directly under repo-root occurrence `A`.

- `A.D.A`
  - Address: `A.D.A`
  - Occurrence type: `folder occurrence`
  - Occurrence marker: `A`
  - Actual name: `core`
  - Resolved path: `calculogic-validator/src/core/`
  - Meaning: first folder occurrence under `calculogic-validator/src/`, showing reused letter markers remain lineage-scoped.

- `A.D.A.3`
  - Address: `A.D.A.3`
  - Occurrence type: `file occurrence`
  - Occurrence marker: `3`
  - Actual name: `validator-exit-code.logic.mjs`
  - Resolved path: `calculogic-validator/src/core/validator-exit-code.logic.mjs`
  - Meaning: third file occurrence under `calculogic-validator/src/core/`, interpreted by parent chain plus file-segment typing.

### Nested Lineage and Depth Semantics (Illustrative, Tree-Specific)

In this document's tree-specific illustrative notation, each appended segment extends the occurrence lineage and therefore the interpreted nesting depth.

- `A` = repo-root occurrence in the current tree scope.
- `A.D` = fourth folder occurrence directly under that scoped root.
- `A.D.A` = first folder occurrence nested under `A.D`.
- `A.D.A.3` = third file occurrence under `A.D.A`.

Interpretation rule for this illustration:

- alphabetic lineage segments represent nested folder-occurrence depth,
- terminal numeric segment represents file-occurrence sibling position under that folder lineage.

Status boundary reminder:

- This is tree-specific modeling guidance for deterministic interpretation examples.
- It remains non-canonical runtime grammar in this pass.

### Why This Illustration Matters

- The same actual name/token may appear in multiple `path occurrence` instances under different parent chains.
- The same illustrative occurrence marker may also appear under different parent lineages in the tree-specific notation.
- Tree interpretation must distinguish `path occurrence` identity by lineage, not token only.
- Tree interpretation must also distinguish `path occurrence` identity by lineage when occurrence markers are reused.
- Repeated names such as multiple `src` occurrences under different parents are a motivating case for explicit occurrence addressing.

### Modeling Takeaway

Tree determinism requires both:

1. structural vocabulary/root-partition classification, and
2. occurrence addressing/lineage identity.

Neither layer is sufficient alone for reliable interpreted tree occurrence modeling.

## Tree-Specific Occurrence Addressing Guidance (Modeling Direction)

This section defines a tree-focused addressing concept that is separate from, but related to, the broader deterministic structural addressing draft.

### Relationship to deterministic structural addressing draft

- The draft defines broader cross-domain structural addressing direction.
- This document defines a tree-local occurrence identity model that can align with that draft over time.
- This document does **not** finalize open draft decisions or replace draft authority.

### Comparison to more constrained local-rooted addressing elsewhere

This tree-local rebasing behavior is similar in principle to more constrained semantic-scope/local-rooted addressing used elsewhere in NL/C-style documentation and reasoning contexts.

Boundary note:

- tree occurrence addressing and NL/C-style local addressing are **not the same system**,
- tree addressing here is broader because it must model arbitrary repeated names, mixed folder/file occurrence typing, and deep lineage across real filesystem structure.

### Tree occurrence identity requirements

A tree occurrence address should represent at minimum:

1. rooted lineage from `repo-root`,
2. parent-relative occurrence context,
3. terminal node kind (folder vs file).

### Scope Binding, Rebasing, and Reasoning Use

Tree occurrence addressing in this document is **scope-bound and locally rebased**.

Scoped-root rebasing rule (normative for this modeling contract):

- **Occurrence addressing is local to the active tree scope; when tree is run against a targeted folder/subtree, counting and addressing rebase from that scoped root rather than always from repository-root.**

Implications:

- the same address tail (for example `A.D.A.3`) may appear in multiple independent scopes,
- identity remains deterministic only when the scope binding is explicit,
- cross-scope comparisons must include both scope root and address tail.

Reasoning-vs-output boundary:

- tree uses occurrence addresses for deterministic internal reasoning and interpreted occurrence identity,
- user-facing findings/reports should still expose the resolved real filesystem path,
- occurrence markers are not a replacement for resolved paths in findings output.

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

Example illustration only (aligned with the concrete validator-tree style in this document):

- Folder occurrence lineage: `A.D.A`
- Terminal file occurrence under that lineage: `A.D.A.3`

Interpretation of the example:

- `A.D.A` identifies a folder occurrence (marker chain resolves to `calculogic-validator/src/core/`),
- `A.D.A.3` identifies a file occurrence under that same lineage (`validator-exit-code.logic.mjs`),
- marker tokens (`A`, `D`, `3`) are occurrence markers in this illustrative system, not the actual folder/file names,
- identity derives from lineage + terminal kind, not name-only.

(Notation above remains intentionally non-canonical and modeling-scoped in this document.)

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
