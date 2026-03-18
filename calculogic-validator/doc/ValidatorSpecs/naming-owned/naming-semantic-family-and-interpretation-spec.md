# Naming Slice: Semantic-Family and Definitions/Relationships Interpretation Spec

- **Classification:** Normative
- **Applies to:** Naming-slice semantic-name interpretation extensions.
- **Status:** Active for bounded naming-owned runtime/report behavior in the current tranche; semantic-family derivation is implemented as report-first observation, while tree consumption remains deferred.
- **Authority posture note:** Bounded normative supporting spec for naming interpretation modeling; does not supersede primary canonical naming authorities.

## 1) Purpose

This spec defines the next naming interpretation tranche by extending the current naming runtime/spec foundation rather than redesigning it.

This pass:

1. normalizes to what naming runtime/specs already do today,
2. adds a bounded definitions-and-relationships interpretation layer,
3. defines semantic-family as a run-scoped interpreted signal for report-first outputs.

This spec documents the current bounded naming-owned runtime/report behavior for semantic-family interpretation in this tranche.

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

- shared filename interpretation precedence and semantic-family lane framing that may or may not apply depending on semantic-name shape,
- naming-slice semantic-name + role-token disambiguation framing,
- suite-level registry model and normalization/resolution ownership boundaries.

### 2.4 What this spec adds beyond current base

This spec adds a bounded interpretation vocabulary layer that was not yet explicitly defined:

- first bounded naming entities for semantic-family interpretation when semantic-name shape supports that interpretation,
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

`semantic-name` remains the full semantic lane before any role/ext interpretation and before any family/subgroup interpretation that may or may not apply for a given semantic-name shape.

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

- semantic-family/group presence may or may not be present in a filename shape,
- when filename shape does support semantic-family interpretation, naming remains the derivation owner,
- semantic-family is interpreted first from current naming interpretation context,
- normalized during the validator run,
- temporarily held in runtime/report/results context,
- not yet authoritative declared registry truth,
- later custom registry/overlay work may declare, override, or pin meanings.

Guardrail: this spec intentionally does not over-commit exact runtime field names in this tranche.

### 6.1 Intended report/output layers (bounded next-tranche direction)

The intended naming-owned report surfaces for semantic-family work are separated into bounded layers so observation does not get confused with policy.

1. **Per-file derived outputs** capture naming's filename-level interpretation when the semantic-name shape supports it. Conceptual candidates in this layer include:
   - `semanticName`
   - `semanticTokens`
   - `semanticFamily`
   - `familyRoot`
   - `familySubgroup`
   - `relatedSemanticNames`
   - ambiguity markers such as `ambiguityFlags`
   - split markers such as `splitFamilyFlags`
2. **Run-level aggregate observations** summarize what a naming run observed across files after derivation. Conceptual candidates in this layer include:
   - `familyRootCounts`
   - `familySubgroupCounts`
   - `semanticFamilyCounts`
3. **Later candidate-policy direction** may use recurring observed roots/subgroups/families as evidence for future custom-registry additions, overlays, or pinning. The report itself does **not** declare registry membership or convert an observed count into policy truth.

Observation/policy boundary for this tranche:

- per-file derived outputs are naming-owned interpreted results,
- aggregate count surfaces are naming-owned observed run statistics,
- current aggregate inclusion is explicit and tiered: `familyRootCounts` use canonical root evidence (`semanticName` + `familyRoot`), while `familySubgroupCounts`, `semanticFamilyCounts`, and run-scoped peer/split observation maps require singular canonical family evidence (`semanticName` + `semanticFamily` + `familyRoot` and no `family-boundary-heuristic` marker),
- `familyRootCounts.tree = 12` means the naming run observed 12 canonical-evidence files whose derived `familyRoot` was `tree`,
- that observation does **not** mean `tree` is now a declared registry root or registry-approved family,
- later customization/registry work may review these observations as candidate evidence, but policy declaration remains a separate later ownership lane.

### 6.2 Bounded semantic-family interpretation grammar notes (report-first)

Interpretation in this phase may apply bounded grammar-like guidance for semantic-family normalization when the semantic-name shape supports family/subgroup interpretation.

Connector-token guidance:

- Connector tokens such as `and`, `or`, `with` (or similar connective forms) may be treated as low-weight connector tokens in semantic-family interpretation.
- Connector tokens do not become family roots.
- Connector tokens may justify keeping adjacent semantic tokens joined as one normalized subgroup phrase rather than treating them as a loose list or as multiple equally primary subgroups.
- Absence of connector tokens may increase ambiguity or list-like interpretation pressure.
- This is a report-first interpretation rule/policy surface in this phase, not a strict runtime law yet.

Descriptor-token guidance:

- Some tokens may function as adjacent semantic descriptors rather than isolated list items.
- Example: `occurrence-model` may be interpreted as one connected subgroup unit, with `model` acting as a descriptor-style token adjacent to `occurrence`.
- Descriptor-style token behavior may justify preserving adjacent terms as a connected subgroup phrase.
- This is interpretation guidance, not final hard-coded runtime grammar in this tranche.

Future policy direction (deferred):

- These interpretation rules may later live in naming-owned semantic-family interpretation policy, registry-backed interpretation surfaces, and customizable commands/overrides once this intended naming-owned lane reaches later runtime/report maturity.
- Recurring aggregate observations such as `familyRootCounts`, `familySubgroupCounts`, and `semanticFamilyCounts` may later be reviewed as candidate evidence for what should be added, pinned, or overridden in a custom registry.
- Those observed counts remain report evidence only; they do **not** become registry truth unless a later policy/customization surface explicitly declares them.
- That policy/customization expansion is intentionally deferred until customization commands are no longer deferred and report maturity is stronger.

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
- `relatedSemanticNames` remains the current field name for bounded churn reasons and now means same-`semanticFamily` peer semantic names observed within the current run's singular canonical family-evidence set; it is intentionally not a generic semantic-relatedness claim.
- Current runtime `ambiguityFlags` and `splitFamilyFlags` are bounded observational markers: `family-boundary-heuristic` records a deterministic but not-confidently-singular boundary choice for connector-free 4+ token semantic names, and `family-root-observed-multiple-families` records that one observed `familyRoot` mapped to multiple singular observed `semanticFamily` values in the run.

Classification: Normative

## 7) Runtime/report maturity boundary

Current maturity boundary remains unchanged:

- warn/error/strict/plan/fix behavior for semantic-family is not implemented in the current runtime tranche yet,
- semantic-family interpretation remains structurally important and report-first in this phase,
- results/reporting is the first intended consumer,
- tree runtime consumption is not activated in this tranche yet and remains deferred until naming-owned implementation maturity justifies it.

Results-first, tree-later handoff clarification:

- Results/reporting consumes naming-owned semantic-family outputs first.
- Tree consumption is later and explicitly deferred in this tranche; that timing deferment does not make semantic-family derivation conceptually optional.
- Tree may later consume `semanticFamily`/`familyRoot`/`familySubgroup`/`relatedSemanticNames` for semantic-folder expectations or grouping reasoning once naming emits those outputs.
- Tree may later consume naming-owned aggregate observations such as `familyRootCounts`/`familySubgroupCounts`/`semanticFamilyCounts` only as report context, not as tree-owned policy declaration.
- Tree must not derive semantic-family independently as a competing source.

Classification: Normative

## 8) Relationship to tree (future handoff boundary)

Future boundary contract:

- naming owns semantic-family derivation as an intended implementation lane for later runtime/report/results maturity,
- tree may later consume prepared family/root/subgroup signals produced by naming-owned derivation,
- tree may later consume naming-owned aggregate observations as downstream context when useful,
- such signals may later help tree reason about expected semantic folders/subtrees, and tree behavior depends on naming providing them rather than re-deriving them,
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

- Observed filename form: `tree-occurrence-model-and-addressing-spec.md`
- Likely canonicalized interpretation candidate:
  - semantic-name candidate: `tree-occurrence-model-and-addressing`
  - role candidate: `spec`
  - extension: `.md`
- Disambiguation note (no explicit dotted role slot present):
  - This observed filename does not already expose explicit canonical `.<role>.<ext>` ownership.
  - `spec` matches a known role token, so it is a strong candidate for intended role ownership rather than being casually left inside semantic-family interpretation.
  - This ambiguity is therefore preserved and surfaced as likely role ownership intent.
- Explicit-role contrast:
  - If the file were `tree-occurrence-model-and-addressing.spec.md`, `.spec` would remain canonical role authority.
  - In that explicit-slot case, any additional role-like token remaining inside semantic-name text would be interpreted as semantic content by default.

Illustrative semantic-name interpretation snapshot (report-first phase):

- Observed semantic lane tokens: `[tree, occurrence, model, and, addressing, spec]`
- Likely canonicalized semantic-name candidate: `tree-occurrence-model-and-addressing`
- Canonicalized semantic tokens (after likely role-candidate separation): `[tree, occurrence, model, and, addressing]`
- Role candidate (separated from semantic-family interpretation lane): `spec`
- Layering note:
  - Full semantic-name candidate (`tree-occurrence-model-and-addressing`) remains the broad descriptive semantic lane.
  - `semanticFamily` is the bounded grouping signal interpreted inside that semantic lane, not the lane repeated verbatim.
- `semanticFamily`: `tree` (primary bounded family grouping label)
- `familyRoot`: `tree` (dominant grouping anchor across related tree docs)
- Primary normalized `familySubgroup`: `occurrence-model-and-addressing`
  - connector-token rationale: `and` is treated as a low-weight connector token that justifies keeping nearby semantic terms joined as one normalized subgroup phrase.
  - descriptor-token rationale: `model` is treated as a descriptor-like adjacent token that justifies preserving `occurrence-model` as a connected unit inside the subgroup phrase.
- Secondary ambiguity notes (non-primary, report-first):
  - lower-confidence fragment candidate: `occurrence-model`
  - lower-confidence fragment candidate: `addressing`
- Candidate `relatedSemanticNames` (run-scoped and interpretation-dependent):
  - `tree-structural-vocabulary-and-root-classification-spec`
  - `tree-registry-definitions-and-relationships-spec`

Connector/descriptor interpretation note for this example:

- Connector token `and` is preserved in `semanticTokens` as low-weight connective meaning and is not promoted to a family root.
- Descriptor-style use of `model` helps preserve `occurrence-model` adjacency while still normalizing the primary subgroup as one connected phrase: `occurrence-model-and-addressing`.

Boundary reinforcement:

- `semantic-family` remains inside semantic-name interpretation; it does not replace semantic-name.
- For this shape, semantic-family reasoning applies to the semantic-name portion that remains after the likely role candidate (`spec`) is separated.
- `familyRoot`, `familySubgroup`, and `relatedSemanticNames` remain naming-owned derived outputs.
- Those naming-owned outputs may later be handed to results first and tree later through cross-slice contracts.
- Tree does not re-own semantic-family derivation in this model and must remain downstream of naming-owned outputs.

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
- `calculogic-validator/doc/ValidatorSpecs/naming-owned/naming-semantic-name-and-role-disambiguation-spec.md`
- `calculogic-validator/doc/ValidatorSpecs/cross-cutting/registry-model-and-slice-interaction-spec.md`

Classification: Normative

## 12) Non-goals for this tranche

- No runtime behavior changes.
- No custom-registry implementation changes.
- No warn/error/strict/fix/plan policy changes.
- No tree runtime integration changes.
- No registry payload mutation requirements.

Classification: Normative
