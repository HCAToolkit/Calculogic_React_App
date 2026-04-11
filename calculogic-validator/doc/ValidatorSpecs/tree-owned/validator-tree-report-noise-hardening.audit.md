# Validator Tree Report Noise Hardening Audit

## Purpose

This audit re-evaluates validator-scope tree advisory noise after the recently shipped hardening slices and rewrites prior conclusions against **fresh runtime evidence**.

Shipped behavior now in scope for this audit:

- `TREE_FAMILY_SCATTERED` structural-root + semantic-container gating,
- `TREE_OBSERVED_FAMILY_CLUSTER` family-level / family-in-container aggregation,
- `TREE_FAMILY_SUBGROUP_OPPORTUNITY` bounded container-local subgroup opportunity signaling.

This pass remains docs/planning only:

- no runtime logic changes,
- no heuristic changes,
- no ownership-boundary changes.

Classification: Audit

## Runtime evidence command (exact)

```bash
npm run report:tree:validator
```

Fresh report artifact produced in this rewrite pass:

- `.reports/validate-tree-validator-2026-04-11_21-39-01.txt`

Classification: Audit

## Fresh runtime report summary

Validator entry summary (`tree-structure-advisor`, scope `validator`):

- `totalFilesScanned`: `200`
- total findings: `11`
- code counts:
  - `TREE_FAMILY_SCATTERED`: `3`
  - `TREE_OBSERVED_FAMILY_CLUSTER`: `4`
  - `TREE_SHIM_SURFACE_PRESENT`: `4`
  - `TREE_FAMILY_SUBGROUP_OPPORTUNITY`: `0`

Major recurring families/patterns in this run:

- `TREE_FAMILY_SCATTERED` is now limited to broader cross-container spreads: `registry`, `validator`, `report`.
- `TREE_OBSERVED_FAMILY_CLUSTER` appears as container-local telemetry in expected homes (`naming`, `tree`, `validator-cli`, `report-capture`).
- `TREE_SHIM_SURFACE_PRESENT` remains token/path-only low-confidence observability (`bridge`/`shim`) with no thin re-export evidence.
- No `TREE_FAMILY_SUBGROUP_OPPORTUNITY` findings fired in this run.

Classification: Audit

## Re-evaluation against shipped behavior

### 1) `TREE_FAMILY_SCATTERED` now reads mostly high-value

The current `3` scatter findings are no longer broad blanket noise. They map to families that still span multiple structural homes/containers in ways that can warrant targeted review:

- `registry`: docs + runtime registry implementation surfaces,
- `validator`: doc/scripts/suite-core/tree registry surfaces,
- `report`: scripts wrappers + report-capture tool runtime.

Given the shipped structural-root and semantic-container gating, remaining scatter appears significantly precision-improved and mostly actionable as a planning trigger.

### 2) `TREE_OBSERVED_FAMILY_CLUSTER` reads as useful telemetry, not primary noise

Cluster findings are now concise and container-scoped:

- `naming` cluster under `calculogic-validator/naming`,
- `tree` cluster under `calculogic-validator/tree`,
- `validator` cluster in `src/core/cli`,
- `report` cluster in `tools/report-capture`.

This is now good observability signal for family density and potential local grouping review, not debt by default.

### 3) `TREE_FAMILY_SUBGROUP_OPPORTUNITY` appears well-bounded (non-eager in this run)

No subgroup findings fired. With current density and singular-evidence prerequisites, that suggests the detector is not over-triggering under current validator scope data.

This should be treated as a positive boundedness signal, not as a missing-feature defect by itself.

### 4) `TREE_SHIM_SURFACE_PRESENT` is now the primary remaining noisy area

All four shim-surface findings are token/path-only observability with no thin re-export evidence, and all remain `info` level.

Relative to the now-cleaner scatter/cluster outputs, this code family is currently the largest residual low-confidence noise pocket.

### 5) Broad families still needing special handling

- `validator` remains naturally broad across suite-core/docs/scripts/registries and should keep bounded, architecture-aware interpretation.
- `registry` remains ambiguous: some spread is healthy canonical-doc + runtime pairing, while some may indicate over-dispersion.

These should continue to be treated as review-required families rather than auto-suppress or auto-escalate categories.

Classification: Audit

## True positives worth preserving

1. **Cross-container scatter for `report`** across scripts wrappers and tool runtime remains a meaningful structural coupling signal.
2. **Broad-family scatter for `validator`** remains useful as a bounded architecture review trigger.
3. **`registry` scatter** remains a valid ambiguity detector where spec/runtime layering and potential over-spread can coexist.
4. **Container-local cluster telemetry** for `naming`, `tree`, `validator-cli`, and `report-capture` remains useful planning context.

Classification: Audit

## Noisy / low-value findings (current state)

1. **`TREE_SHIM_SURFACE_PRESENT` token-only signals** (`bridge`, `shim`) without thin re-export evidence remain low-confidence and often non-actionable by themselves.
2. **Some broad-family spread cases** (especially `validator`/`registry`) can still read noisy when architecture layering is intentional and already explainable.

Classification: Audit

## Ambiguous cases

1. **`registry` family**: healthy docs/runtime layering vs excess dispersion is still case-dependent.
2. **`validator` family**: expected suite-wide identity vs overly broad footprint remains a bounded interpretive judgment.
3. **No subgroup signals this run**: could mean true absence of dense lower-level subgroup opportunities, or thresholds that are conservatively high for current data shape.

Classification: Audit

## Revised bounded hardening plan

### What noise is actually left after recent slices

- Primary residual noise: `TREE_SHIM_SURFACE_PRESENT` token/path-only observability.
- Secondary residual ambiguity: broad-family interpretation (`validator`, `registry`) in intentionally layered architecture.

### What now looks good enough (do not revisit immediately)

- `TREE_FAMILY_SCATTERED` baseline precision after structural-root + semantic-container gating.
- `TREE_OBSERVED_FAMILY_CLUSTER` as concise container-scoped telemetry.
- `TREE_FAMILY_SUBGROUP_OPPORTUNITY` bounded trigger posture (non-eager in this run).

### Next highest-ROI implementation slice

1. **Precision cleanup pass for shim-surface observability**, not a broad new heuristic expansion.
2. Add bounded suppression/reduction for recurring low-confidence token-only shim findings when no stronger shim evidence is present across repeated patterns.
3. Preserve deterministic payload detail so operators can still inspect why a shim-surface advisory appeared.

### Out of scope for now

- Reworking semantic-family derivation ownership (remains naming-owned).
- Large architecture rewrites for broad-family spread.
- Aggressive subgroup-threshold retuning without additional multi-scope evidence.

Classification: Audit

## Ownership boundary confirmation

This rewrite remains aligned with the current ownership contract:

- naming owns semantic-family derivation and naming validity,
- tree owns structural interpretation and advisory gating,
- tree consumes naming bridge evidence only,
- tree does not re-own naming derivation or naming validity semantics.

Classification: Audit
