# Naming Slice: Semantic Name and Role Disambiguation Spec

## 1) Purpose

This document defines the naming-slice specialization for semantic-name interpretation and role-like token disambiguation.

It inherits the suite-level shared filename interpretation and case-policy contract and then specifies naming-slice-focused interpretation behavior.

In this scope, semantic name is treated as a major naming interpretation lane directly beneath the canonical dominant role slot in practical importance.

Classification: Normative

## 2) Relationship to Shared Contract and Ownership

Inherited shared concepts come from:

- `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
- `calculogic-validator/doc/ValidatorSpecs/registry-model-and-slice-interaction-spec.md`

Naming-slice specialization in this document does not redefine those shared nouns. It applies and specializes them for naming-slice interpretation behavior.

Ownership clarification:

- Suite-owned implementation surfaces may provide shared parsing/normalization/case-policy infrastructure.
- Naming-slice implementation is one concrete slice-owned enforcement/specialization surface that consumes that shared infrastructure.
- Suite-owned implementation does not replace naming-slice ownership of naming-slice interpretation outcomes.
- This spec does not assume naming owns the entire filename interpretation and case-policy implementation surface.

Classification: Normative

## 3) Naming-Slice Interpretation Hierarchy

Naming-slice interpretation precedence follows deterministic order:

1. canonical dominant role slot
2. semantic name lane
3. optional semantic-family-style interpretation
4. folder context

Interpretation guardrail:

- Semantic name is high-importance interpretation content, but it cannot override explicit canonical role-slot ownership when the explicit `.<role>.<ext>` slot is present and valid.

Classification: Normative

## 4) Semantic Name Lane Definition

Semantic name is the descriptive filename lane used to carry domain intent and meaning that is not the canonical ownership declaration.

Semantic-name lane characteristics:

- May contain role-like tokens.
- May contain category-like tokens.
- May contain registry-adjacent vocabulary or other semantic references.
- Remains descriptive/semantic interpretation content.
- Is not a second canonical role lane.

Interpretation consequence:

- Role-like strings in semantic name are interpreted as semantic references by default when explicit canonical role ownership is already declared.

Classification: Normative

## 5) Role Disambiguation Rules

### 5.1 Explicit canonical role slot authority

When a filename contains an explicit canonical role slot `.<role>.<ext>`, that slot is the default authority for canonical role ownership.

### 5.2 Role-like tokens inside semantic name

When explicit canonical role-slot ownership exists, matching role-like tokens elsewhere in semantic name are interpreted as semantic-name content by default.

### 5.3 Role-like folder tokens

Folder names containing role-like tokens are interpreted as context by default, not canonical role declarations.

### 5.4 Ambiguity behavior boundary

The naming slice may flag ambiguity or emit guidance where tokens could confuse interpretation.

However, ambiguity signaling must not reinterpret or reassign explicit canonical role-slot ownership based only on incidental role-like semantic or folder tokens.

Classification: Normative

## 6) Optional Semantic-Family-Style Interpretation

Semantic-family-style grouping is an optional interpretation capability inside or around semantic naming.

Rules:

- It is not a required structural filename lane.
- It may later be inferred, declared, or registry-assisted.
- It remains secondary to canonical dominant role ownership.
- It remains subordinate to explicit ownership grammar.

This section is an interpretation option, not a mandatory runtime requirement.

Classification: Normative

## 7) Naming-Case Application Points (Naming-Slice Specialization)

Case-policy foundations are inherited from suite-level shared contract.

Naming-slice specialization may define how those shared case-policy surfaces apply to:

- semantic-name lane text,
- semantic-name token segments,
- optional semantic-family-style segments,
- role token segments in the explicit canonical role slot.

Case-policy guardrail:

- Case-policy application does not redefine canonical role ownership.

This doc defines naming-slice application framing, not a replacement for shared case-policy contract nouns.

Classification: Normative

## 8) Examples and Normalization Sketches

Classification: Illustrative

### 8.1 `naming-role-matrix.contracts.ts`

- Canonical role: `contracts` (from explicit `.contracts.ts` slot)
- Semantic name: `naming-role-matrix`
- Optional semantic-family-style interpretation: `naming` family with `role-matrix` semantic grouping (optional)
- Why role-like tokens are not reclassified: explicit role slot already owns canonical role; `role` inside semantic name is descriptive text.

### 8.2 Role-like folder token with explicit role slot

Path example: `validators/view/naming-role-index.logic.mjs`

- Canonical role: `logic` (from explicit `.logic.mjs` slot)
- Semantic name: `naming-role-index`
- Optional semantic-family-style interpretation: `naming` family with `role-index` grouping (optional)
- Folder context: `view` is role-like but contextual in this interpretation lane
- Why role-like tokens are not reclassified: explicit role slot remains authority; folder token and semantic-name token are contextual/semantic.

### 8.3 Semantic grouping with explicit role slot

Filename example: `role-catalog-family-map.report.mjs`

- Canonical role: `report`
- Semantic name: `role-catalog-family-map`
- Optional semantic-family-style interpretation: `catalog` or `family-map` grouping (optional and policy-dependent)
- Why role-like tokens are not reclassified: `role` token is semantic reference content; explicit `.report.mjs` slot remains canonical ownership declaration.

## 9) Ambiguity Handling

Ambiguity classes naming slice may later detect/report include (non-exhaustive):

- semantic-name tokens that equal known role identifiers while explicit canonical role slot is present,
- folder tokens that resemble role identifiers,
- mixed token patterns that could be misread as competing ownership lanes.

Ambiguity guidance is allowed and useful. Default authority rule remains:

- If explicit canonical role slot exists and is valid, it remains the canonical role authority.

Classification: Normative

## 10) Inherited vs Naming-Slice-Specialized Content

Inherited shared concepts (not redefined here):

- canonical dominant role slot as authoritative ownership lane,
- semantic name as a major lane directly below canonical role,
- optional semantic-family/semantic-group lane concept,
- folder-token contextual interpretation,
- shared case-policy contract surface.

Naming-slice-specific specialization in this spec:

- how naming slice interprets semantic-name lane content,
- default disambiguation behavior for role-like tokens in semantic/folder context,
- optional semantic-family-style interpretation framing in naming slice,
- naming-slice application points for shared case-policy surfaces.

Classification: Normative

## 11) Non-goals

This spec does not:

- change runtime behavior,
- require a mandatory semantic-family lane,
- redefine suite-level core nouns,
- finalize all future registry shapes,
- rename files, move files, or mutate registry payloads.

Classification: Normative
