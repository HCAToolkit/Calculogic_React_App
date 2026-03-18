# Filename Case and Interpretation Contract (Suite-Level Shared Contract)

## 1) Purpose

This document defines suite-owned shared concepts for **filename interpretation** and **filename case policy surfaces** so multiple validator slices can rely on a common contract without depending on naming-slice private internals.

This contract is intentionally shape-level and cross-slice oriented. It does **not** define naming-slice-specific rule implementation details or runtime algorithm internals.

Classification: Normative

Authority posture note: This is a bounded normative supporting spec in naming documentation maps; it remains a shared contract lane and does not replace primary canonical naming authorities.

## 2) Scope and Ownership Boundary

- This is a **suite-level shared-contract** document.
- The naming slice may be the primary interpreter/enforcer of these concepts today, but the concepts themselves are suite-owned.
- Other slices may reference these concepts as stable contract vocabulary without importing naming-slice internal registry layout or private helper topology.

Classification: Normative

## 3) Core Filename Interpretation Concepts

### 3.1 Canonical dominant role slot

The canonical dominant role slot is the authoritative filename ownership lane.

Practical shape reference:

- explicit role-slot pattern: `.<role>.<ext>`

When present and valid, this lane is the authoritative canonical role declaration for filename ownership.

### 3.2 Semantic name lane

The semantic name is a high-priority filename interpretation lane directly below the canonical dominant role slot in practical naming importance.

- Semantic name materially influences interpretation and diagnostics.
- Semantic name does **not** override an explicit canonical dominant role slot.

### 3.3 Semantic-family / semantic-group interpretation when filename shape supports it

Semantic-family-like interpretation is part of the intended naming-owned filename interpretation lane, but it only applies when filename shape exposes semantic-family/group structure.

- Semantic-family/group presence is not required as a structural lane for contract validity in every filename.
- Cross-slice contracts may reference it when naming exposes those outputs and ROI/domain semantics justify downstream use, while naming remains the primary derivation owner.

### 3.4 Folder-token context

Folder tokens are contextual signals by default.

- They provide interpretation hints.
- They are not primary canonical role declarations unless another explicit contract says otherwise.

Classification: Normative

## 4) Interpretation Precedence

Filename interpretation must follow deterministic precedence.

Minimum precedence order:

1. explicit canonical role slot
2. semantic name lane
3. semantic-family / semantic-group interpretation when filename shape supports it
4. folder-token context

Deterministic precedence rule:

- Explicit canonical role slot detection always takes precedence over incidental role-like strings elsewhere.

Classification: Normative

## 5) Role-like Token Disambiguation (Shared Contract Rule)

### 5.1 Role-like tokens inside semantic name

When an explicit `.<role>.<ext>` canonical role slot exists, other matching role-like strings in the semantic name are interpreted as semantic references by default, not competing canonical roles.

### 5.2 Role-like folder tokens

Role-like folder tokens are contextual hints by default and do not compete with an explicit canonical role slot unless another explicit contract introduces a different precedence for a specific scope.

Classification: Normative

## 6) Case-Policy Layer (Suite-Level Policy Surface)

Case policy is a suite-level shared policy surface.

Contract shape:

- Different filename lanes may carry different case expectations.
- Case policy may be attached by lane.
- Case policy may later be refined by role-aware or slice-aware rules.

This contract intentionally defines policy shape and extensibility direction rather than implementation-heavy enforcement detail.

Classification: Normative

## 7) Shared Cross-Slice Expectations

Other slices may rely on this contract to:

- consume stable filename interpretation vocabulary,
- reason about precedence deterministically,
- avoid coupling to naming-slice private rule layout.

Clarifications:

- Naming slice may be the primary interpreter/enforcer.
- The contract remains suite-owned and reusable across slices.
- Future suite-owned helpers may normalize filename interpretation for reuse across slices.

Classification: Normative

## 8) Suite-Owned Implementation Pairing Rule

Any suite-owned implementation surface introduced for filename interpretation or case policy must have at least one corresponding slice-owned implementation surface.

Purpose of this rule:

- Suite-owned implementation provides shared contract-backed infrastructure.
- Slice-owned implementation remains responsible for enforcement and specialization.

Structural guardrail:

- Promoting implementation to suite-owned without an actual slice-owned consumer/specializer is a structural smell and should generally be avoided.

Classification: Normative

## 9) Examples

Classification: Illustrative

### 9.1 Explicit role slot wins over role-like semantic token

- Filename: `order.role-summary.logic.mjs`
- Interpreted canonical dominant role slot: `.logic.mjs`
- `role-summary` in semantic name is treated as semantic reference text, not a competing canonical role.

### 9.2 Role-like folder token treated as contextual

- Path: `components/host/order-details.logic.mjs`
- Filename canonical dominant role slot: `.logic.mjs`
- Folder token `host` is role-like context and does not supersede filename role-slot ownership.

### 9.3 Semantic name is important but subordinate to explicit canonical role

- Filename: `validator-core-normalization.logic.mjs`
- Semantic name lane: `validator-core-normalization` (high importance)
- Canonical dominant role slot: `.logic.mjs` (authoritative ownership lane)

### 9.4 Case-policy lanes separated from role ownership

- Filename interpretation lanes:
  - semantic name lane may carry one case expectation,
  - canonical role slot token may carry another case expectation.
- Lane case policy does not redefine canonical role ownership precedence.

## 10) Relationship to Existing Suite-Level Parent Model

This contract is a child shared-contract document under the suite-level registry/slice interaction parent model.

Parent references:

- `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction-spec.md`
- `calculogic-validator/doc/ConventionRoutines/ValidatorSuite-Contracts-And-Modes.md`

This child contract focuses specifically on filename interpretation and case-policy semantics.

Classification: Normative

## 11) Non-goals

- No runtime behavior changes in this task.
- No requirement to implement all case lanes immediately.
- No requirement to make semantic-family/group presence mandatory in every filename shape.
- No requirement to flatten naming logic into suite-core in this task.
- No file renames/moves and no registry payload changes in this task.

Classification: Normative
