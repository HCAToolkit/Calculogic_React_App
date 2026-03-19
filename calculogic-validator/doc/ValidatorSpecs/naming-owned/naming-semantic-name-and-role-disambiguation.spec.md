# Naming Slice: Semantic Name and Role Disambiguation Spec

## 1) Purpose

This document defines the naming-slice specialization for semantic-name interpretation and role-like token disambiguation.

It inherits the suite-level shared filename interpretation and case-policy contract and then specifies naming-slice-focused interpretation behavior.

In this scope, semantic name is treated as a major naming interpretation lane directly beneath the canonical dominant role slot in practical importance.

Classification: Normative

Authority posture note: This is a bounded normative supporting spec for naming interpretation specialization; it does not supersede primary canonical naming authorities.

## 2) Relationship to Shared Contract and Ownership

Inherited shared concepts come from:

- `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
- `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction.spec.md`

Naming-slice specialization in this document does not redefine those shared nouns. It applies and specializes them for naming-slice interpretation behavior.

Ownership clarification:

- Registry payloads own case-policy data surfaces.
- Converter/runtime preparation owns compilation of case-style policy into prepared runtime pattern state.
- Naming-slice rule/helper execution consumes prepared runtime state when applying naming-slice case-policy behavior.
- Suite-owned implementation does not replace naming-slice ownership of naming-slice interpretation outcomes.
- This spec does not assume naming owns the entire filename interpretation and case-policy implementation surface.

Classification: Normative

## 3) Naming-Slice Interpretation Hierarchy

Naming-slice interpretation precedence follows deterministic order:

1. canonical dominant role slot
2. semantic name lane
3. semantic-family-style interpretation when semantic-name shape supports it
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

## 6) Semantic-Family-Style Interpretation When Shape Supports It

Semantic-family-style grouping is an intended naming-owned interpretation capability inside semantic naming, but it only applies when the semantic-name shape supports that interpretation.

Rules:

- Semantic-family presence is not a required structural filename lane in every filename shape.
- It may later be inferred, declared, or registry-assisted through naming-owned derivation.
- It remains secondary to canonical dominant role ownership.
- It remains subordinate to explicit ownership grammar.

For bounded semantic-family entities/definitions/relationships and run-scoped interpreted-signal framing, see `./naming-semantic-family-and-interpretation.spec.md`.

This section documents a naming-owned interpretation lane whose runtime implementation is not yet activated in the current tranche.

Classification: Normative

## 7) Naming-Case Application Points (Naming-Slice Specialization)

Case-policy foundations are inherited from suite-level shared contract.

Naming-slice specialization currently applies a prepared semantic-name case-policy baseline through naming runtime preparation and consumption.

Naming-slice specialization may define how shared case-policy surfaces apply to:

- semantic-name lane text,
- semantic-name token segments,
- semantic-family-style segments when the semantic-name shape exposes them,
- role token segments in the explicit canonical role slot.

Current runtime boundary for this specialization:

- Implemented baseline: prepared semantic-name lane case-policy application, including bounded optional registry integration for semantic-name `caseRules`.
- Future runtime expansion: additional family/group/folder lane-aware policy remains future-facing and is not required by the current runtime contract yet.

Case-policy guardrail:

- Case-policy application does not redefine canonical role ownership.

This doc defines naming-slice application framing, not a replacement for shared case-policy contract nouns.

Classification: Normative

## 8) Examples and Normalization Sketches

Classification: Illustrative

### 8.1 `naming-role-matrix.contracts.ts`

- Canonical role: `contracts` (from explicit `.contracts.ts` slot)
- Semantic name: `naming-role-matrix`
- Semantic-family-style interpretation when shape-supported: `naming` family with `role-matrix` semantic grouping
- Why role-like tokens are not reclassified: explicit role slot already owns canonical role; `role` inside semantic name is descriptive text.

### 8.2 Role-like folder token with explicit role slot

Path example: `validators/host/naming-role-index.logic.mjs`

- Canonical role: `logic` (from explicit `.logic.mjs` slot)
- Semantic name: `naming-role-index`
- Semantic-family-style interpretation when shape-supported: `naming` family with `role-index` grouping
- Folder context: `host` is role-like but contextual in this interpretation lane
- Why role-like tokens are not reclassified: explicit role slot remains authority; folder token and semantic-name token are contextual/semantic.

### 8.3 Semantic grouping with explicit role slot

Filename example: `role-catalog-family-map.contracts.mjs`

- Canonical role: `contracts`
- Semantic name: `role-catalog-family-map`
- Semantic-family-style interpretation when shape-supported: `catalog` or `family-map` grouping (policy-dependent)
- Why role-like tokens are not reclassified: `role` token is semantic reference content; explicit `.contracts.mjs` slot remains canonical ownership declaration.

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
- semantic-family/semantic-group lane concept when the semantic-name shape exposes it,
- folder-token contextual interpretation,
- shared case-policy contract surface.

Naming-slice-specific specialization in this spec:

- how naming slice interprets semantic-name lane content,
- default disambiguation behavior for role-like tokens in semantic/folder context,
- semantic-family-style interpretation framing in naming slice when shape-supported,
- naming-slice application points for shared case-policy surfaces.

Classification: Normative

## 11) Non-goals

This spec does not:

- change runtime behavior,
- require semantic-family presence in every filename shape,
- redefine suite-level core nouns,
- finalize all future registry shapes,
- rename files, move files, or mutate registry payloads.

Classification: Normative
