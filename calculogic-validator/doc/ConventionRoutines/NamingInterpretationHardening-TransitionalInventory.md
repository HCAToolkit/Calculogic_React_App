# Naming Interpretation Hardening — Transitional Inventory

Classification: Informative

## 1) Purpose and tranche boundary

This transitional inventory maps the current naming-interpretation hardening tranche against three already-active contract specs:

- `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
- `calculogic-validator/doc/ValidatorSpecs/naming-semantic-name-and-role-disambiguation-spec.md`
- `calculogic-validator/doc/ValidatorSpecs/registry-model-and-slice-interaction-spec.md`

The goal is ownership clarity and hardening ROI for the next naming-first pass, not broad redesign.

## 2) Spec-to-implementation mapping

### 2.1 `filename-case-and-interpretation-contract.md` (suite-level shared contract)

| Contract area | Current status | Implementation reality (transitional) |
| --- | --- | --- |
| Deterministic interpretation precedence (explicit role slot → semantic name → optional family/group → folder context) | **Partially implemented** | Explicit role-slot parsing and role checks exist in naming runtime. Semantic and folder signals are not yet fully represented as a complete interpreted-lane model with explicit runtime diagnostics for every precedence lane. |
| Explicit role-slot authority over incidental role-like tokens | **Partially implemented** | Canonical parse + role checks exist; role-like semantic/folder override behavior is contract-defined but not yet fully locked as dedicated disambiguation behavior/tests for all edge patterns. |
| Optional semantic-family / semantic-group interpretation | **Intentionally out of scope for now** | Contract marks this as optional; no mandatory runtime lane required in current tranche. |
| Folder-token context as contextual (not canonical authority by default) | **Partially implemented** | Folder context is used as scope/traversal input for walking/reporting mechanics. Folder-token interpretation remains a separate interpretation lane (contextual by default and non-overriding vs an explicit role slot), and that lane is not yet fully hard-locked as a dedicated behavior matrix. |
| Lane-aware case policy surface (shared concept) | **Partially implemented (semantic-name baseline + bounded optional registry integration implemented)** | Semantic-name case policy baseline is registry-resolved and prepared-runtime-backed today, and bounded optional registry integration is now exercised for `caseRules` on that semantic-name surface. Lane-specific policy expansion for additional interpretation lanes remains future-facing/partial. |
| Suite-owned implementation pairing rule (shared impl must have slice consumer) | **Already implemented (architecture guardrail)** | Current naming/runtime boundaries already reflect slice-owned enforcement with suite contracts; no speculative suite-only implementation is required in this tranche. |

### 2.2 `naming-semantic-name-and-role-disambiguation-spec.md` (naming specialization)

| Contract area | Current status | Implementation reality (transitional) |
| --- | --- | --- |
| Naming interpretation hierarchy mirrors shared precedence | **Partially implemented** | Canonical parse/role and semantic-case checks exist, but hierarchy-level disambiguation behavior is not yet expressed as one complete, test-locked matrix. |
| Semantic name as major lane, non-overriding | **Partially implemented** | Semantic name is parsed and case-checked; explicit “semantic role-like token never overrides valid role slot” needs explicit hardening tests across representative filenames/folders. |
| Explicit canonical role-slot authority | **Already implemented (core baseline)** | Filename parsing and role-slot role checks establish explicit role handling as the primary runtime lane. |
| Role-like tokens in semantic name treated as semantic by default when explicit role exists | **Partially implemented** | Contract exists; behavior is covered indirectly by existing parser/role checks, but dedicated disambiguation scenarios remain a hardening target. |
| Role-like folder tokens remain contextual by default | **Partially implemented** | Contract exists; folder context is currently used operationally for scoped traversal/reporting, while folder-token meaning as an interpretation lane (contextual and non-overriding vs explicit role slot) is not yet expressed as a dedicated, test-locked disambiguation matrix. |
| Ambiguity signaling allowed without ownership reassignment | **Already implemented (baseline), hardening recommended** | Ambiguity signaling exists (for example hyphen-appended role ambiguity). Additional disambiguation classes should be broadened before registry expansion. |
| Naming-case application points beyond current semantic case checks | **Partially implemented (semantic-name baseline + bounded optional registry integration implemented)** | Naming currently applies a prepared semantic-name case-policy baseline sourced from registry payload and runtime preparation, and bounded optional registry integration is now proven for `caseRules` on that surface. Additional lane-aware policy surfaces remain a later hardening step. |
| Optional semantic-family-style interpretation | **Intentionally out of scope for now** | Optional by contract; no mandatory runtime addition needed in this tranche. |

### 2.3 `registry-model-and-slice-interaction-spec.md` (suite-level registry ownership model)

| Contract area | Current status | Implementation reality (transitional) |
| --- | --- | --- |
| Multi-shape, single-meaning model + deterministic normalization/resolution | **Already implemented (baseline)** | Naming registry-state owner and runtime converters already normalize payloads deterministically. |
| Registry-state owner vs direct builtin ownership rule | **Already implemented (baseline)** | Naming uses registry-state ownership; tree keeps direct builtin loaders; suite-core remains composition owner. |
| Slice-local vs suite-shared elevation guardrails | **Partially implemented (process maturity)** | Guardrails are specified and mostly followed; this inventory clarifies next tranche boundaries to avoid premature suite-core flattening. |
| Distinguish shared contract surfaces from shared implementation surfaces | **Partially implemented (process maturity)** | Contract is explicit, but transitional hardening should further prevent speculative promotion without slice consumers. |
| Do not flatten into mega-registry / avoid shadow canonical stores | **Already implemented (baseline)** | Current structure preserves slice boundaries and avoids universal registry flattening. |
| Loader/converter/runtime ownership clarity for mechanics | **Already implemented (baseline), keep explicit** | Loader/converter/runtime preparation and parser/disambiguation/traversal mechanics are code-owned behavior, not registry payload responsibilities. |

## 3) Ownership classification for candidate hardening surfaces

| Candidate surface | Ownership classification |
| --- | --- |
| Filename-lane precedence vocabulary (role-slot, semantic-name, optional family/group, folder context) | **Suite-shared contract only** |
| Explicit role-slot authority rule text | **Suite-shared contract only** (consumed by naming slice) |
| Naming disambiguation behavior for semantic/folder role-like tokens | **Naming-slice implementation** |
| Ambiguity findings and naming-slice disambiguation diagnostics | **Naming-slice implementation** |
| Semantic-name case style policy currently in `caseRules` payload | **Registry payload (implemented baseline: builtin, optional custom, or bounded config overlay)** |
| Bounded optional registry integration for semantic-name `caseRules` | **Naming-slice implementation + registry-state preparation (implemented, bounded)** |
| Potential broader lane-aware case-policy expansion metadata (future) | **Registry payload candidate** (only after behavior lock + ownership clarity) |
| Registry-state selection, normalization, digesting, converter prep | **Code-owned loader/converter mechanism (registry-state + runtime preparation)** |
| Canonical filename parsing (`<semantic>.<role>.<ext>` and extension handling) | **Code-owned runtime/parser/disambiguation mechanic** |
| Folder traversal/scoped collection mechanics | **Code-owned runtime/parser/disambiguation mechanic** |
| Role/category/status canonical vocabulary payloads | **Builtin registry candidate** (already active) |

## 4) Registry-backed candidates vs code-owned mechanics

### 4.1 Policy surfaces that are valid builtin-registry candidates

- Lane policy metadata (for example the implemented semantic-name case style baseline and bounded optional `caseRules` integration for semantic-name; later broader lane-aware metadata only once behavior is stable).
- Vocabulary/state payloads (roles/categories/status, finding policy mappings, allowed special-case classifications, summary-bucket policy).
- Optional future disambiguation policy toggles **only** when they express bounded policy choices rather than parser algorithm flow.

### 4.2 Mechanics that should remain code-owned

- Canonical filename parsing and token extraction mechanics.
- Deterministic interpretation/disambiguation control flow and precedence execution.
- Traversal and scoped path-collection mechanics.
- Runtime normalization/converter mechanics that compile payload shapes into executable runtime state.

Guardrail: do not push parser/disambiguation/traversal engines into registries; registry payloads may originate from builtin, optional custom, or bounded config-overlay sources for supported surfaces, converter/runtime preparation owns normalization and style-to-pattern compilation, and naming rule/helper code consumes prepared runtime state for deterministic enforcement.

## 5) Recommended bounded implementation order (naming interpretation hardening tranche)

1. **Disambiguation behavior and tests first**
   - Add/expand naming-slice tests that lock explicit-role authority against role-like semantic and folder tokens.
   - Increase ambiguity-class test coverage without reassigning canonical ownership.
2. **Lane-aware case-policy surfaces second**
   - Keep parser/disambiguation mechanics code-owned.
   - Add only bounded policy surfaces that clearly belong in naming builtin registries.
3. **Optional registry integration third (bounded step now exercised for semantic-name `caseRules`)**
   - Bounded optional registry integration is now proven for semantic-name `caseRules`.
   - Any broader registry-backed lane policy integration remains future-facing and should proceed only where behavior is test-locked and ownership is unambiguous.

Tranche note: this is naming-first hardening, but better deterministic filename interpretation should improve downstream tree-validator signal quality indirectly.

## 6) Implementation touchpoints (pointer-only)

- `calculogic-validator/naming/src/rules/naming-rule-parse-canonical.logic.mjs` — canonical filename parse entrypoint and lane-adjacent interpretation behavior surface.
- `calculogic-validator/naming/src/naming-validator.logic.mjs` — naming-slice runtime orchestration where parse/disambiguation outputs are composed into findings.
- `calculogic-validator/naming/src/registries/registry-state.logic.mjs` — registry-state owner normalization/digesting flow used before runtime execution.
- `calculogic-validator/naming/src/naming-runtime-converters.logic.mjs` — converter/runtime preparation layer that compiles registry payload shapes into executable state.
- `calculogic-validator/naming/src/registries/_builtin/case-rules.registry.json` — current builtin case-policy payload (semantic-name case baseline).
- `calculogic-validator/naming/src/registries/_builtin/roles.registry.json` — canonical role vocabulary payload consumed by role-slot checks.
- `calculogic-validator/naming/test/naming-validator.test.mjs` — primary naming behavior coverage location for expanding the disambiguation matrix, including role-like folder tokens remaining contextual vs explicit role-slot authority.
- `calculogic-validator/naming/test/naming-runtime-input-boundary.test.mjs` — prepared dependency-injection contract and runtime input-boundary enforcement surface (prepared runtimes/sets required, with path selection/walk exclusions as mechanics).

## 7) Out-of-scope guardrails for this tranche document

- No runtime behavior changes in this task.
- No registry payload edits in this task.
- No customization-command work in this task.
- No tree-validator implementation in this task.
- No speculative suite-core promotion without a real slice-owned consumer.

## 8) Verification checklist for this inventory

- Explicitly inventories all three source specs listed in §1.
- Maintains ownership separation from registry model contract.
- Keeps parser/disambiguation/traversal mechanics code-owned.
- Uses transitional language appropriate for current hardening phase.
