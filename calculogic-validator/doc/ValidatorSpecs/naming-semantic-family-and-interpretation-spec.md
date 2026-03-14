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

### 4.2 `semantic-token`

A token derived from semantic-name segmentation (for current naming direction: deterministic split tokens such as hyphen/dot-separated semantic-name segments), used for interpretation hints and bounded relationships.

### 4.3 `semantic-family`

An interpreted grouping signal that clusters semantic-names judged related under current naming interpretation context. In this tranche it is run-scoped interpreted meaning, not authoritative declared registry truth.

### 4.4 `family-root`

A semantic-name or normalized representative token-set used as the current run's anchor for a semantic-family interpretation.

### 4.5 `family-subgroup`

A bounded subgroup interpretation inside a semantic-family when related names cluster into subpatterns that should remain distinct in reporting.

### 4.6 `related-semantic-name`

A semantic-name interpreted as materially related to another semantic-name/family under bounded naming interpretation rules for the run.

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

Classification: Normative

## 7) Runtime/report maturity boundary

Current maturity boundary remains unchanged:

- warn/error/strict/plan/fix behavior for semantic-family is deferred,
- semantic-family interpretation is report-first in this phase,
- results/reporting is the first intended consumer,
- tree runtime consumption is deferred until implementation maturity justifies it.

Classification: Normative

## 8) Relationship to tree (future handoff boundary)

Future boundary contract:

- naming owns semantic-family derivation,
- tree may later consume prepared family/root/subgroup signals,
- such signals may later help tree reason about expected semantic folders/subtrees,
- tree must not independently derive semantic-family as a competing source of truth.

Classification: Normative

## 9) Guardrails

- Do not redesign naming runtime concepts already normalized today.
- Semantic-family is not a naive shared-prefix matcher.
- Semantic-family interpretation does not replace role/category/surface policy.
- Ambiguous/split-family outcomes should be preserved, not prematurely collapsed.
- Interpreted signal now is distinct from declared policy later.

Classification: Normative

## 10) Relationship to current specs

This spec extends (and does not replace):

- `calculogic-validator/doc/ValidatorSpecs/filename-case-and-interpretation-contract.md`
- `calculogic-validator/doc/ValidatorSpecs/naming-semantic-name-and-role-disambiguation-spec.md`
- `calculogic-validator/doc/ValidatorSpecs/registry-model-and-slice-interaction-spec.md`

Classification: Normative

## 11) Non-goals for this tranche

- No runtime behavior changes.
- No custom-registry implementation changes.
- No warn/error/strict/fix/plan policy changes.
- No tree runtime integration changes.
- No registry payload mutation requirements.

Classification: Normative
