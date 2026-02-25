# Document Content Classification Convention (v1)

## 1. Purpose / Why This Exists

This convention defines a small, reusable classification vocabulary so documentation can explicitly distinguish **authoritative rule content** from explanatory, draft, placeholder, or historical text.

The primary goals are:

- improve deterministic interpretation during documentation review,
- reduce ambiguity in mixed draft/living docs,
- provide stable semantics that future validation/scoping work can reference (without defining tooling behavior in this pass).

## 2. Scope

This convention applies to repository documentation content where interpretation ambiguity matters (for example: rules, examples, templates, draft assumptions, migration notes, and historical lineage text).

This v1 pass does **not** require labeling every paragraph in the repo.

Out of scope for this pass:

- validator/tooling implementation,
- parser/scanner behavior design,
- broad retroactive annotation sweeps,
- frontmatter/metadata standardization beyond lightweight marking patterns.

## 3. Classification Set (v1)

- `Normative`
- `Illustrative`
- `Placeholder`
- `Draft-Assumption`
- `Historical`
- `Informative`

## 4. Definitions

### 4.1 `Normative`

- **Purpose/meaning:** Defines binding rules, contracts, policies, required behavior, or acceptance constraints.
- **Authoritative:** **Yes** (source of truth).
- **Future validator-scoped parsing relevance (conceptual):** **In scope** as primary authoritative material.
- **Typical locations:** Convention requirements, “MUST/SHALL” rules, canonical legality matrices, required ordering contracts.

### 4.2 `Illustrative`

- **Purpose/meaning:** Provides explanatory examples to clarify intent or structure.
- **Authoritative:** **No** (example only).
- **Future validator-scoped parsing relevance (conceptual):** **Out of normative scope**; may be ignored or separately treated as examples.
- **Typical locations:** Example blocks, sample addresses, demonstration snippets, walkthrough rows.

### 4.3 `Placeholder`

- **Purpose/meaning:** Marks provisional scaffold values/tokens/rows pending concrete canonical replacement.
- **Authoritative:** **No** (non-canonical/provisional).
- **Future validator-scoped parsing relevance (conceptual):** **Out of normative scope** unless explicitly promoted to concrete canonical content.
- **Typical locations:** Templates, unresolved mapping rows, draft placeholders such as `x` in non-canonical sample contexts.

### 4.4 `Draft-Assumption`

- **Purpose/meaning:** Captures a temporary assumption used to preserve draft consistency until an open decision is resolved.
- **Authoritative:** **Partially/temporarily** within the explicitly stated draft scope only; not final law.
- **Future validator-scoped parsing relevance (conceptual):** Treat as **draft-scoped**, not as final global policy.
- **Typical locations:** Deferred decision sections, scoped draft closure notes, temporary cross-doc alignment statements.

### 4.5 `Historical`

- **Purpose/meaning:** Preserves lineage, prior terminology, or migration context.
- **Authoritative:** **No** for current policy (context only).
- **Future validator-scoped parsing relevance (conceptual):** Typically **out of normative scope**.
- **Typical locations:** Migration notes, terminology history, prior-state references.

### 4.6 `Informative`

- **Purpose/meaning:** Adds supporting explanation/background that helps comprehension but does not impose requirements.
- **Authoritative:** **No** (supporting context).
- **Future validator-scoped parsing relevance (conceptual):** Usually **out of normative scope** unless explicitly linked to normative clauses.
- **Typical locations:** Rationale paragraphs, orientation notes, explanatory summaries.

## 5. Authoritative vs Non-Authoritative Interpretation Rules

1. If content is marked `Normative`, treat it as binding for repository documentation interpretation.
2. `Illustrative`, `Placeholder`, `Historical`, and `Informative` are non-authoritative by default.
3. `Draft-Assumption` is scoped and temporary: valid for current draft coherence where stated, but not equivalent to finalized global policy.
4. In mixed sections, explicit labels govern interpretation precedence.
5. If a block is unlabeled and appears in a requirement section using binding language, treat it as `Normative` unless the surrounding section states otherwise.

## 6. Where to Apply First (Practical Rollout Guidance)

This convention is intentionally incremental. Do **not** annotate all content immediately.

Start with high-value ambiguity points:

- tables (especially legality/allowance tables),
- examples/snippets,
- provisional mappings,
- draft assumptions/open-decision closures,
- non-authoritative filename/path examples,
- template scaffolds.

Minimum viable adoption guideline:

- Apply labels first where ambiguity could impact future deterministic parsing/validation scope.

## 7. Marking Patterns (Lightweight)

Use one of these simple deterministic patterns:

- `Classification: Normative`
- `Classification: Illustrative`
- `Classification: Placeholder`
- `Classification: Draft-Assumption`
- `Classification: Historical`
- `Classification: Informative`

Approved inline alternatives (short form) when full metadata is too heavy:

- `Illustrative example:`
- `Placeholder note:`
- `Draft-Assumption:`
- `Historical note:`
- `Informative note:`

Guidance:

- Prefer one explicit label near the block/table/section header rather than labeling every line.
- Avoid inventing additional classification names in v1.

## 8. Examples of Marking Patterns

### 8.1 Table Example

- `Classification: Normative` above a legality matrix that defines allowed vs disallowed canonical forms.

### 8.2 Example Block

- `Classification: Illustrative` above sample addresses used only to explain shape.

### 8.3 Template Scaffold

- `Classification: Placeholder` near unresolved template tokens such as `[A.1.2.x]`.

### 8.4 Draft Closure Section

- `Classification: Draft-Assumption` for scoped temporary decisions in draft specs.

### 8.5 Migration/Lineage Note

- `Classification: Historical` where prior terminology or legacy structure is retained only for context.

## 9. Change Control / Future Expansion Notes

1. Keep v1 small and stable to support predictable adoption.
2. Add or rename classes only via explicit convention update.
3. Future tooling may reference these labels conceptually, but this document intentionally defines no validator or parser implementation behavior.
4. As legacy docs are touched for normal work, incrementally add labels where they reduce interpretation ambiguity.
