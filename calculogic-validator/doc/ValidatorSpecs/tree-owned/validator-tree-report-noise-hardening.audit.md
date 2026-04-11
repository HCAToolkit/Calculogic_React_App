# Validator Tree Report Noise Hardening Audit

## Purpose

This audit compares a **fresh validator-scope tree report** against the structural-reality baseline using the **structural-root vs semantic-container** model as the primary interpretation lens.

This pass is intentionally bounded to documentation and planning:

- no runtime logic changes,
- no tree heuristic changes,
- no suppression implementation,
- no ownership-model changes.

Classification: Audit

## Runtime evidence command (exact)

```bash
npm run report:tree:validator
```

Report artifact produced in this pass:

- `.reports/validate-tree-validator-2026-04-11_18-13-30.txt`

Classification: Audit

## Fresh runtime report summary

Validator entry summary (`tree-structure-advisor`, scope `validator`):

- `totalFilesScanned`: `200`
- total findings: `19`
- code counts:
  - `TREE_OBSERVED_FAMILY_CLUSTER`: `10`
  - `TREE_FAMILY_SCATTERED`: `5`
  - `TREE_SHIM_SURFACE_PRESENT`: `4`

Primary recurring families/patterns in this run:

- semantic-family activity concentrated in `validator`, `tree`, `naming`, `report`, and `registry`
- repeated top-level semantic-container pairings (`doc` + owned runtime container such as `naming` or `tree`)
- lower-level family density inside semantic containers (`naming/src/**`, `tree/src/**`, `tools/report-capture/src/**`)
- bridge/shim token observability with no thin re-export evidence

Classification: Audit

## Comparison lens: structural roots vs semantic containers

Primary interpretation model used in this rewrite:

1. **Structural roots/folders are tree-owned** and remain the first-class structural topology surface.
2. **Top-level semantic-family containers** (for this repo shape: `tree/`, `naming/`, and docs ownership lanes under `doc/ValidatorSpecs/*-owned/`) are valid semantic homes, not immediate scatter evidence.
3. **Lower-level family distribution inside a semantic container** is judged first as:
   - expected family presence / healthy density,
   - family subgrouping opportunity,
   - and only secondarily as broader scatter.
4. **Cross-container presence** is meaningful scatter only when no allowed structural/cross-concern rule explains placement.

Ownership boundary preserved:

- naming owns semantic-family derivation (`semanticFamily`, `familyRoot`, `familySubgroup`),
- tree owns structural folder/node interpretation and evidence gating,
- tree may align against naming-derived family signals,
- tree does not re-own naming derivation/validity semantics.

Classification: Audit

## True positives worth preserving

### 1) Cross-container scatter that remains structurally meaningful

`report` family presence across:

- `calculogic-validator/scripts/report-capture-*.host.mjs`
- `calculogic-validator/tools/report-capture/src/report-capture.*.mjs`

This is still a valid structural opportunity because these are distinct structural roots (`scripts` vs `tools`) with family coupling that may benefit from clearer grouping policy.

### 2) Family cluster observability remains useful planning telemetry

High family density remains useful as context:

- `validator=17`, `naming=13`, `tree=11`, `report=6`

This should stay visible, but interpreted as family-density telemetry first (especially inside semantic containers) rather than direct debt.

### 3) `registry` spread is a legitimate review trigger

`registry` appears across docs and runtime registry implementation surfaces. This can be healthy cross-concern/spec-runtime pairing, but can also expose true cross-container over-dispersion in specific cases. Keep as review-required signal.

Classification: Audit

## Noisy / low-value findings under the updated model

### 1) Semantic-container-local density misread as scatter

Findings where family presence spans:

- docs semantic container (`calculogic-validator/doc/**`), and
- matching runtime semantic container (`calculogic-validator/naming/**` or `calculogic-validator/tree/**`)

are often expected canonical spec + owned runtime layering, not default scatter debt.

### 2) Repeated per-file cluster emissions for same family

`TREE_OBSERVED_FAMILY_CLUSTER` repeatedly emitting on multiple files for one family inflates noise. Family-level aggregate context is higher value than file-level repetition.

### 3) Token-only shim/bridge observability remains low-confidence telemetry

`TREE_SHIM_SURFACE_PRESENT` from token signals (`bridge`, `shim`) without thin re-export evidence is still low-confidence observability and should not be interpreted as primary structural debt.

Classification: Audit

## Ambiguous cases (bounded, case-specific handling)

### 1) `registry` family across docs + runtime containers

Could be healthy spec/runtime split across semantic containers, or could indicate additional lower-level subgroup opportunities. Requires explicit per-surface structural explanation before suppression/escalation.

### 2) Broad `validator` family footprint

Can reflect healthy suite identity and layered cross-surface architecture. But at high breadth it may hide finer subgroup opportunities (`validator-cli-*`, `validator-config-*`, report-meta/helpers). Needs subgroup-aware analysis before changing scatter behavior.

Classification: Audit

## Revised hardening targets (bounded next implementation slice)

This plan replaces a docs/runtime-pairing suppression framing with structural-root vs semantic-container-aware gating.

### A) Recognize top-level semantic containers explicitly

Future tree hardening should:

1. classify observed homes by structural-root class and semantic-container role,
2. treat known semantic containers as valid first-pass family homes,
3. avoid immediate scatter escalation when placements are explainable by canonical authority layering.

### B) Evaluate lower-level family containment before scatter escalation

Future tree hardening should:

1. compute container-local family density first,
2. detect lower-level subgroup opportunity inside the same semantic container,
3. escalate to broader scatter only when family presence extends across unrelated containers without allowed structural/cross-concern rationale.

### C) Tighten true cross-container scatter identification

Future tree hardening should:

1. define allowed cross-concern/cross-surface patterns (for example canonical spec + owned runtime pairing),
2. treat scatter as meaningful when observed homes are not covered by those allowed patterns,
3. keep deterministic detail payloads so decisions are inspectable.

### D) Clarify likely modeling split (without changing ownership)

Future implementation should likely use:

- tree structural-root registry modeling for folder/node class interpretation,
- naming semantic-family alignment as bounded consumed evidence,
- no transfer of semantic derivation ownership from naming to tree.

### E) Preserve healthy layered spread

Hardening should continue to preserve:

- canonical tree/naming docs paired with owned runtime containers,
- suite-core helper layers paired with scripts/bin/operator surfaces,
- report-capture runtime implementation paired with host wrappers,
- other explicit cross-surface layering that is structurally intentional.

Classification: Audit

## Implementation-ready next-slice checklist

1. Add structural-root + semantic-container classification to scatter eligibility gating.
2. Add container-local density/subgroup-first evaluation before cross-container scatter decisions.
3. Keep high-ROI scatter emissions where unrelated structural roots are coupled without allowed rule coverage.
4. Reduce `TREE_OBSERVED_FAMILY_CLUSTER` cardinality to family-level summary-oriented observability.
5. Keep token-only shim/bridge signals as low-confidence telemetry unless higher-confidence shim evidence is present.
6. Keep ownership contract intact: naming derives; tree interprets structure and consumes aligned evidence.

Classification: Audit
