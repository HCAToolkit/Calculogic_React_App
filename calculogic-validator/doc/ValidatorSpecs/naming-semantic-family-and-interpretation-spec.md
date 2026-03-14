# Naming Slice: Semantic-Family and Definitions/Relationships Interpretation Spec

- **Classification:** Normative
- **Applies to:** Naming-slice semantic-name interpretation extensions.
- **Status:** Active for documentation-first modeling; runtime implementation deferred.

## 1) Purpose

This spec defines the next naming interpretation tranche by extending the current naming runtime/spec foundation rather than redesigning it.

This pass:

1. normalizes to what naming runtime/specs already do today,
2. adds a bounded definitions-and-relationships interpretation layer,
3. defines semantic-family as a run-scoped interpreted signal for report-first outputs.

This spec is documentation/modeling only. It does not change runtime behavior in this task.

Classification: Normative

## 2) Current-base alignment (extension, not redesign)

### 2.1 Current naming runtime normalization already in place

Current naming runtime already normalizes registry and policy inputs through deterministic resolution in `naming/src/registries/registry-state.logic.mjs`, including:

- registry-state selection (`builtin` / `custom`),
- builtin/custom payload loading and canonicalization,
- config overlay handling for bounded capabilities,
- resolved runtime inputs for roles, reportable extensions/root files,
- resolved finding-policy and summary-bucket surfaces,
- resolved case-rules surface (`semanticName.style`) as prepared runtime policy input.

### 2.2 Current naming interpretation already in place

Current naming interpretation already provides bounded disambiguation hints in `naming/src/rules/naming-rule-derive-disambiguation-hints.logic.mjs`, including:

- role-like token extraction from folder path segments,
- role-like token extraction from semantic-name tokens,
- active-role/category-bounded confusable role-token preparation,
- bounded hint output without reassignment of canonical role ownership.

### 2.3 Current naming/shared specs already define the baseline

Current baseline is already defined by existing specs:

- shared filename interpretation precedence and optional semantic-family lane framing,
- naming-slice semantic-name + role-token disambiguation framing,
- suite-level registry model and normalization/resolution ownership boundaries.

### 2.4 What this spec adds beyond current base

This spec adds a bounded interpretation vocabulary layer that was not yet explicitly defined:

- first bounded naming entities for semantic-family interpretation,
- first bounded relationship types between those entities,
- run-scoped normalized signal guidance for report/results consumption.

Guardrail: this extension does **not** replace current naming runtime concepts or the slice model already normalized today.

Classification: Normative

## 3) Bounded naming entities (first tranche)

The first bounded interpretation nouns are:

- `semantic-name`
- `semantic-token`
- `semantic-family`
- `family-root`
- `family-subgroup`
- `related-semantic-name`
- `ambiguous-semantic-name`
- `split-family`

These nouns are intentionally bounded for current runtime maturity and report-first scope.

Classification: Normative

## 4) Definitions layer

### 4.1 `semantic-name`

Descriptive filename lane content already parsed below the canonical dominant role slot. It carries domain meaning and may contain role-like or category-adjacent vocabulary, without becoming a second canonical role declaration.

`semantic-name` remains the full semantic lane before any role/ext interpretation and before any optional family/subgroup interpretation.

### 4.2 `semantic-token`

A token derived from semantic-name segmentation (for current naming direction: deterministic split tokens such as hyphen/dot-separated semantic-name segments), used for interpretation hints and bounded relationships.

### 4.3 `semantic-family`

An interpreted grouping signal that clusters semantic-names judged related under current naming interpretation context. In this tranche it is run-scoped interpreted meaning, not authoritative declared registry truth.

`semantic-family` does **not** replace `semantic-name`. It is interpreted structure inside semantic-name interpretation.

### 4.4 `family-root`

A naming-derived anchor (semantic-name or normalized representative token-set) used as the current run's anchor for semantic-family interpretation.

### 4.5 `family-subgroup`

A bounded subgroup interpretation inside semantic-family when related names cluster into subpatterns that should remain distinct in reporting.

### 4.6 `related-semantic-name`

A semantic-name interpreted as materially related to another semantic-name/family under bounded naming interpretation rules for the run.

`semanticTokens`, `semanticFamily`, `familyRoot`, `familySubgroup`, and `relatedSemanticNames` are derived interpretation outputs from semantic-name interpretation; they do not replace semantic-name.

### 4.7 `ambiguous-semantic-name`

A semantic-name whose interpreted family/root/subgroup relationship is not confidently singular under current bounded signals and therefore should preserve ambiguity markers.

### 4.8 `split-family`

An interpreted outcome where semantically similar names exhibit enough divergence that collapsing into one family would hide meaningful distinction; split markers are retained for results.

Classification: Normative

## 5) Relationships layer (first bounded relationship set)

The first bounded relationship types are:

- `belongs-to-family`
- `has-family-root`
- `has-subgroup`
- `related-to`
- `ambiguous-with`
- `splits-from`
- `may-group-under`
- `may-signal-tree-grouping`

Relationship interpretation notes:

- `belongs-to-family` and `has-family-root` represent the primary interpreted family linkage.
- `has-subgroup` preserves bounded subgrouping without forcing global ontology commitments.
- `related-to` allows soft relatedness signals where hard family assignment is not yet warranted.
- `ambiguous-with` and `splits-from` preserve uncertainty/divergence outcomes rather than collapsing them.
- `may-group-under` indicates candidate grouping only.
- `may-signal-tree-grouping` is a prepared downstream-consumption hint, not tree-owned derivation authority.

Classification: Normative

## 6) Run-scoped normalized signal guidance (report-first phase)

`semantic-family` is defined in this phase as an interpreted, normalized, run-scoped signal.

Phase guidance:

- semantic-family is interpreted first from current naming interpretation context,
- normalized during the validator run,
- temporarily held in runtime/report/results context,
- not yet authoritative declared registry truth,
- later custom registry/overlay work may declare, override, or pin meanings.

Conceptual signal candidates for this phase (concept-first, field-name-flexible):

- `semanticName`
- `semanticTokens`
- `semanticFamily`
- `familyRoot`
- `familySubgroup`
- `relatedSemanticNames`
- `ambiguityFlags`
- `splitFamilyFlags`

Guardrail: this spec intentionally does not over-commit exact runtime field names in this tranche.

Ownership clarification (naming-owned derived outputs):

- `semanticName`
- `semanticTokens`
- `semanticFamily`
- `ambiguityFlags`
- `splitFamilyFlags`
- `familyRoot`
- `familySubgroup`
- `relatedSemanticNames`

These remain naming-owned derived interpretation signals in this tranche.

Cross-slice boundary clarification:

- Cross-slice contracts define which naming-owned outputs are stable enough to expose and consume.
- Cross-slice contracts define what results/tree may consume.
- Cross-slice contracts do **not** re-own derivation logic.
- `familyRoot`, `familySubgroup`, and `relatedSemanticNames` are not cross-slice owned; they are naming-owned outputs with later cross-slice utility.

Classification: Normative

## 7) Runtime/report maturity boundary

Current maturity boundary remains unchanged:

- warn/error/strict/plan/fix behavior for semantic-family is deferred,
- semantic-family interpretation is report-first in this phase,
- results/reporting is the first intended consumer,
- tree runtime consumption is deferred until implementation maturity justifies it.

Results-first, tree-later handoff clarification:

- Results/reporting consumes naming-owned semantic-family outputs first.
- Tree consumption is later and explicitly deferred in this tranche.
- Tree may later consume `semanticFamily`/`familyRoot`/`familySubgroup`/`relatedSemanticNames` for semantic-folder expectations or grouping reasoning.
- Tree must not derive semantic-family independently as a competing source.

Classification: Normative

## 8) Relationship to tree (future handoff boundary)

Future boundary contract:

- naming owns semantic-family derivation,
- tree may later consume prepared family/root/subgroup signals,
- such signals may later help tree reason about expected semantic folders/subtrees,
- tree must not independently derive semantic-family as a competing source of truth.

Interpretation posture alignment:

- semantic-family is modeled as a run-scoped interpreted signal,
- derived from resolved runtime inputs and semantic-name interpretation,
- emitted as derived interpretation output,
- eligible for later declared/custom policy without changing current ownership boundaries.

Classification: Normative

## 9) Boundary example (`semanticName` vs `semanticFamily`)

Example filename: `order-payment-refund-reconcile.logic.mjs`

- `semanticName`: `order-payment-refund-reconcile` (full semantic lane remains intact)
- `semanticTokens`: `[order, payment, refund, reconcile]`
- `semanticFamily`: `order-payment`
- `familyRoot`: `order`
- `familySubgroup`: `payment-refund`
- `relatedSemanticNames`: may include `order-payment-adjustment` (if interpreted related in the same run)

Boundary note: these are naming-owned derived outputs from semantic-name interpretation. They may later be passed through cross-slice contracts for results first, and tree later, without transferring derivation ownership out of naming.

Classification: Normative

### 9.1 Validator-doc-realistic example (`tree-occurrence-model-and-addressing-spec.md`)

Example filename (validator-doc-realistic): `tree-occurrence-model-and-addressing-spec.md`

- Intended semantic name (full semantic lane text): `tree-occurrence-model-and-addressing-spec`
- Intended role form: docs role signal aligned to `spec` intent
- Extension: `.md`
- Ambiguity note (`-spec` vs `.spec`): this filename shape is realistic in current validator docs and can be interpreted as a compressed role-form signal (`-spec`) inside semantic text, rather than canonical dotted-role-slot form.

Illustrative semantic-name interpretation snapshot (report-first phase):

- `semanticName`: `tree-occurrence-model-and-addressing-spec`
- `semanticTokens`: `[tree, occurrence, model, and, addressing, spec]`
- `semanticFamily`: `tree-occurrence-model-and-addressing`
- `familyRoot`: `tree` (repeated grouping anchor across related tree docs)
- Candidate `familySubgroup` interpretations (ambiguity preserved):
  - `occurrence-model`
  - `addressing`
  - `occurrence-model-and-addressing` (bounded combined alternative)
- Candidate `relatedSemanticNames` (run-scoped and interpretation-dependent):
  - `tree-structural-vocabulary-and-root-classification-spec`
  - `tree-registry-definitions-and-relationships-spec`

Connective-token note (`and`):

- Connective tokens such as `and` may still be preserved in `semanticTokens`.
- They may carry lower interpretive weight or connective meaning relative to domain anchors.
- They should not automatically be promoted to dominant family anchors.

Boundary reinforcement:

- `semantic-family` remains inside semantic-name interpretation; it does not replace semantic-name.
- `familyRoot`, `familySubgroup`, and `relatedSemanticNames` remain naming-owned derived outputs.
- Those naming-owned outputs may later be handed to results first and tree later through cross-slice contracts.
- Tree does not re-own semantic-family derivation in this model.

Classification: Normative

## 10) Guardrails

- Do not redesign naming runtime concepts already normalized today.
- Semantic-family is not a naive shared-prefix matcher.
- Semantic-family interpretation does not replace role/category/surface policy.
- Ambiguous/split-family outcomes should be preserved, not prematurely collapsed.
- Interpreted signal now is distinct from declared policy later.

Classification: Normative

## 11) Relationship to current specs

This spec extends (and does not replace):

- `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
- `calculogic-validator/doc/ValidatorSpecs/naming-semantic-name-and-role-disambiguation-spec.md`
- `calculogic-validator/doc/ValidatorSpecs/registry-model-and-slice-interaction-spec.md`

Classification: Normative

## 12) Non-goals for this tranche

- No runtime behavior changes.
- No custom-registry implementation changes.
- No warn/error/strict/fix/plan policy changes.
- No tree runtime integration changes.
- No registry payload mutation requirements.

Classification: Normative
