# Tree Structural Vocabulary and Root Classification Spec (Modeling Contract, V0.1.0)

## Purpose

This document defines a documentation-first modeling contract for **non-semantic tree structure vocabulary** so tree work can proceed without conflating:

- top-level structural roots,
- subtree structural partitions,
- semantic/custom roots.

Status posture for this document:

- **Current modeling contract:** terminology, classes, and mapping guidance in this document.
- **No runtime change claim:** this file does not add or require tree runtime behavior changes.

## Scope and Non-Goals

### In scope

- Canonical terms for root/partition classes.
- Class boundaries and ownership semantics.
- Mapping from current builtin known-roots data into this class model.
- Initial metadata candidates for future registry modeling.

### Out of scope

- Changing tree runtime behavior.
- Replacing existing registry loader behavior in this same task.
- Introducing structural-address runtime rules.

## Canonical Terms and Definitions

### 1) `top-root`

A **top-root** is a directory name interpreted at repository root scope (`/`) as a first-class root entry for tree analysis.

- Scope kind: `repo-top`.
- Examples: `src`, `doc`, `tools`, semantic package roots.
- Source of truth today: `topRoots[]` in `tree-known-roots.registry.json`.

### 2) `structural-root`

A **structural-root** is a `top-root` with structural meaning rather than semantic/package identity.

- Structural role: declares a common surface type (source, tests, docs, scripts, tooling, etc.).
- Typical ownership source: builtin-general defaults.
- Important: structural-root truth is about top-level scope, not all nested folder names everywhere.

### 3) `subtree-partition`

A **subtree-partition** is a structural folder convention used *inside* a subtree (for example inside `src/`, `doc/`, or feature/domain roots), not a universal repo-top root by default.

- Scope kind: `subtree-local`.
- Examples: `assets`, `components`, `content`, `shared`.
- Guardrail: subtree-partitions are local organization conventions unless explicitly promoted to top-root class by a separate decision.

### 4) `semantic-root`

A **semantic-root** is a `top-root` that encodes semantic package/repo-local identity rather than generic structure.

- Scope kind: `repo-top`.
- Examples in current builtin registry payload: `calculogic-validator`, `calculogic-doc-engine`.
- Common ownership source: custom or dogfooding/current-repo reality entries.

### 5) `ownershipSource`

`ownershipSource` indicates why a class entry exists in the registry:

- `builtin`: generalized tree-owned default vocabulary.
- `custom`: repository-local, package-local, or dogfooding-specific entry.

## Class Model (Documentation-First)

For tree modeling, every known folder vocabulary entry should be interpreted under one of these classes:

1. **Top-root structural vocabulary**
   - Class token: `top-root + structural-root`.
   - Authority: top-level registry.

2. **Subtree structural partition vocabulary**
   - Class token: `subtree-partition`.
   - Authority: subtree convention/modeling docs and future partition registries.

3. **Semantic/custom roots**
   - Class token: `top-root + semantic-root`.
   - Authority: top-level registry, with explicit ownership/source semantics.

This split is mandatory for future tree modeling to avoid flattening all non-semantic folder names into one undifferentiated bucket.

## Metadata Candidates for Future Registry Modeling

The following metadata shape is recommended for future evolution (documentation-only in this pass):

- `name`: folder token.
- `scopeKind`: `repo-top` | `subtree-local`.
- `structuralKind`: `top-root-structural` | `subtree-partition` | `semantic-root`.
- `allowedParentKinds`:
  - `repo-root-only` for top-roots,
  - constrained parent class set for subtree-partitions (for example `top-root-structural`, `semantic-root`, or domain folders depending on future policy).
- `ownershipSource`: `builtin` | `custom`.
- `styleClass`: existing style channel (`generic-builtin`, `custom-style`, etc.).

Optional future fields (not required now):

- `evidenceClass`: `generalized` | `dogfooding` | `candidate`.
- `promotionPolicy`: notes for promotion from subtree-local candidate to top-root candidate.

## Mapping Current Builtin Known-Roots Data to This Model

Current registry payload already provides `topRoots[]` entries with:

- `root`,
- `kind` (`structural` or `semantic`),
- `ownershipSource` (`builtin` or `custom`),
- optional `styleClass`.

Mapping rules from current payload:

1. `topRoots[].kind = structural` => classify as **top-root structural vocabulary**.
2. `topRoots[].kind = semantic` => classify as **semantic/custom roots**.
3. Any subtree partition vocabulary is **not represented** by current `topRoots[]` and must not be inferred as implicit top-root truth.

### Current top-root structural entries (from builtin payload)

- `bin`
- `doc`
- `docs`
- `public`
- `scripts`
- `src`
- `test`
- `tools`

### Current semantic/custom root entries (from builtin payload)

- `calculogic-doc-engine`
- `calculogic-validator`

## Classification of Example Names

### Top-root structural candidates

Classify these as `top-root-structural` candidates:

- `doc`
- `src`
- `test`
- `tools`
- `scripts`
- `public`
- `bin`

### Subtree structural partition candidates

Classify these as `subtree-partition` candidates (not universal top-roots by default):

- `assets`
- `components`
- `content`
- `shared`

### Semantic/custom roots

Classify repo/package identity roots as `semantic-root` entries, with explicit source ownership and style semantics.

## Guardrails

1. **No flattening rule:** do not merge top-root structural and subtree-partition vocabulary into one class.
2. **Scope truth rule:** top-root entries define repo-top expectations only.
3. **Local convention rule:** subtree partitions are local unless explicitly promoted.
4. **Ownership clarity rule:** keep builtin-general vs custom/dogfooding provenance explicit.
5. **Runtime safety rule:** this contract can guide future implementation but does not itself change runtime behavior.

## Builtin-General vs Repo-Local/Dogfooding vs Future Candidates

- **Builtin-general (currently represented):** generic structural top-roots such as `src`, `test`, `doc`, `tools`, etc.
- **Repo-local/dogfooding (currently represented):** semantic custom roots that reflect current repository/package layout.
- **Future candidates (not yet modeled in runtime registry):** subtree partition vocabularies such as `assets`, `components`, `content`, `shared`, subject to explicit scope-bound modeling and promotion policy.

## Implementation Follow-Up (After This Doc Lands)

1. **Tree↔Naming contract alignment:** consume this class vocabulary when documenting boundary between naming-derived signal and tree-owned folder classes.
2. **Semantic family implementation:** ensure family grouping logic distinguishes top-root vs subtree partition context.
3. **Structural addressing work:** bind addressing examples to class-aware scope (`repo-top` vs `subtree-local`) to avoid ambiguous addresses.
4. **Future registry evolution:** add a separate subtree-partition registry/model or equivalent metadata extension rather than overloading `topRoots[]`.
5. **Policy classification hardening:** formalize evidence/promotion policy before promoting subtree-local conventions into builtin top-root defaults.

## Authority and Compatibility Notes

- This document is a **modeling contract note** that complements (does not replace) the canonical tree runtime spec.
- Existing tree-known-roots runtime behavior remains unchanged in this task.
