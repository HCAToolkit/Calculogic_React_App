# Terminology Scoping Conventions (V1)

## 1. Purpose

This document introduces a compact scoped-terminology convention for overloaded uses of the word `canonical`.

This is a **docs-only terminology scoping pass**. It is intended to reduce ambiguity in validator-facing and convention-heavy documentation without performing a repo-wide prose rewrite.

## 2. Scoped Canonical Terms (V1)

Use the following scoped forms when determinism depends on exact meaning.

### 2.1 `canonical_source`
- Refers to: the current authoritative source of truth for content.
- Does **not** refer to: a planned destination, filename shape, ordering rule, or syntax grammar.
- Example: a migration wrapper doc that remains the active NL authority until repointing.

### 2.2 `canonical_target`
- Refers to: the intended destination artifact/path for migrated or repointed content.
- Does **not** refer to: current authority before repointing.
- Example: a planned split NL doc path listed in a migration scaffold.

### 2.3 `canonical_filename`
- Refers to: approved filename tokenization/pattern for an artifact class.
- Does **not** refer to: which document currently owns semantic authority.
- Example: a policy-approved segment style for `cfg-*.md` naming.

### 2.4 `canonical_order`
- Refers to: required stable ordering (for concerns, slots, sequence-sensitive tables, etc.).
- Does **not** refer to: syntax/notation grammar or source-of-truth ownership.
- Example: fixed CSCS concern slot ordering.

### 2.5 `canonical_grammar`
- Refers to: authoritative syntax/format rules for a notation.
- Does **not** refer to: sort order, source authority, or destination planning.
- Example: deterministic structural address token/segment grammar.

## 3. Usage Guidance

- Prefer scoped terms in tables, manifests, validator-facing notes, migration metadata, and other determinism-sensitive contexts.
- Plain-language prose may still use unscoped "canonical" where context is obvious and ambiguity risk is low.
- Do not force awkward prose rewrites solely to insert scoped terminology.

## 4. Scope Boundary for This Pass

This V1 pass is **not** a repo-wide terminology normalization rewrite.

Deferred follow-up: a separate **Terminology Normalization Pass** can broaden normalization across overloaded terms, including `canonical` and `host` (and optionally `root`/`source`).
