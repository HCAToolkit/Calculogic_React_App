# Validator Tree Report Noise Hardening Audit

## Purpose

This audit compares a **fresh validator-scope tree report** against the established structural-reality baseline so the next hardening slice can separate durable structure signal from naming-bridge noise.

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

- `.reports/validate-tree-validator-2026-04-11_16-46-46.txt`

Classification: Audit

## Fresh runtime report summary

Validator entry summary (`tree-structure-advisor`, scope `validator`):

- `totalFilesScanned`: `199`
- total findings: `19`
- code counts:
  - `TREE_OBSERVED_FAMILY_CLUSTER`: `10`
  - `TREE_FAMILY_SCATTERED`: `5`
  - `TREE_SHIM_SURFACE_PRESENT`: `4`

Primary recurring families/patterns in this run:

- family clusters/scatter around `validator`, `tree`, `naming`, `report`, `registry`
- repeated cross-home spread where docs + implementation lanes are both present
- repeated bridge/shim token observability (`bridge`, `shim`) without thin re-export evidence

At-a-glance strength vs noise:

- strongest structural signal: `TREE_FAMILY_SCATTERED` when emitted for mixed script/tooling wrappers where structural flattening opportunities are already known.
- strongest observability signal (non-actionable now): `TREE_OBSERVED_FAMILY_CLUSTER` for large families (`validator`, `tree`) as context only.
- noisiest signal: repeated `TREE_OBSERVED_FAMILY_CLUSTER` and some `TREE_FAMILY_SCATTERED` emissions on healthy docs/implementation pairing.
- secondary noise: `TREE_SHIM_SURFACE_PRESENT` token-only findings for `bridge`/`shim` naming in runtimeish files with no thin re-export evidence.

Classification: Audit

## Baseline comparison against structural-reality audit

Baseline authority used for comparison:

- `validator-tree-structural-reality.audit.md`

The baseline already marked the following as healthy and worth preserving:

- docs/implementation pairing by authority lane,
- config/registry spread across suite-core and slices,
- layered CLI surfaces,
- `tools/report-capture/` + root script-wrapper pairing.

The fresh report currently re-emits advisories over several of those healthy patterns, which means the naming-bridge tree advisories are directionally useful but still too coarse in precision.

Classification: Audit

## True positives worth preserving

### 1) Mixed script/tooling family spread remains a real structural opportunity

`report` family scatter across:

- `calculogic-validator/scripts/report-capture-*.host.mjs`
- `calculogic-validator/tools/report-capture/src/report-capture.*.mjs`

This aligns with baseline Opportunity B (`scripts/` mixed families). Keep this as actionable signal for future bounded grouping improvements.

### 2) Large family clusters are useful as *context*, not automatic debt

High cluster counts (`validator=17`, `tree=11`, `naming=13`, `report=6`) are useful telemetry that families are real and recurring. Preserve this observability because it helps size future hardening opportunities.

### 3) `registry` family scatter may indicate cross-lane model friction

`registry` spread across docs and naming runtime surfaces can be a valid advisory seed when coupled with explicit ownership boundaries (spec vs runtime registry logic). Preserve as a cautious, review-required signal.

Classification: Audit

## Technically true but low-value / noisy findings

### 1) Docs + implementation authority pairing flagged as scatter

Scatter findings for `naming`, `tree`, and `validator` frequently cross:

- `calculogic-validator/doc/**`
- corresponding owned implementation roots (`naming/src`, `tree/src`, suite-core `src/core`)

This is structurally expected per baseline and should not default to “needs regrouping.”

### 2) Repeated cluster findings on many files in the same family

`TREE_OBSERVED_FAMILY_CLUSTER` currently emits repeatedly on multiple files for the same family in a single run. That inflates noise relative to planning value.

### 3) Token-only shim-surface observability is high-noise for bridge/shim names

`TREE_SHIM_SURFACE_PRESENT` for runtimeish `bridge`/`shim` token matches (no thin re-export evidence) is useful as telemetry but low-value as repeated per-file advisory debt signal.

Classification: Audit

## Structurally expected patterns likely to suppress/refine later

Patterns that should not drive immediate reorg decisions:

- canonical spec docs + owned runtime implementations sharing a semantic family token (`tree`, `naming`, `validator`),
- suite-core CLI helper lane + wrapper scripts + slice-local CLI files,
- report-capture implementation in `tools/report-capture/` plus operator wrappers in root `scripts/`.

These are expected layered ownership surfaces in current repo reality and should be guarded from coarse scatter treatment.

Classification: Audit

## Ambiguous cases (careful handling required)

### 1) `registry` family

Could be:

- legitimate cross-surface model documentation + implementation pairing (healthy), or
- early sign of over-dispersed registry logic/documentation naming.

Needs case-specific review before any suppression or escalation.

### 2) `validator` family breadth

Very large family footprint can mean:

- healthy suite-core platform identity, or
- over-broad semantic grouping that hides finer structural families.

Do not harden with broad suppression or broad escalation until family granularity rules are explicitly bounded.

Classification: Audit

## Hardening targets (bounded next implementation slice)

This section defines a bounded plan for later implementation while preserving current ownership model:

- naming interprets,
- runner stages,
- tree consumes structural + naming bridge evidence.

### A) `TREE_FAMILY_SCATTERED` precision hardening

Behaviors that appear too coarse now:

- treating docs/runtime cross-home pairing as default scatter concern,
- emitting scatter where observed homes reflect known healthy authority layering.

Bounded hardening targets:

1. Add explicit **structural guardrails** for healthy cross-home pairings (docs authority lane + owned runtime lane) so these pairings reduce advisory strength or do not emit by default.
2. Keep scatter emissions for known high-ROI surfaces (especially mixed script/tooling families) where baseline already identifies structural opportunities.
3. Preserve deterministic thresholds and explicit details payloads; refine eligibility, not randomize scoring.
4. Keep naming interpretation in naming slice; tree only consumes bridge evidence and applies structural gating.

What should continue to emit:

- scatter findings where mixed structural homes map to actionable regrouping opportunities already supported by baseline.

What should likely be suppressed/refined:

- scatter findings driven primarily by healthy docs/runtime authority pairings.

### B) `TREE_OBSERVED_FAMILY_CLUSTER` signal shaping

Behaviors that appear too coarse now:

- repeated per-file cluster emissions for the same family in one run.

Bounded hardening targets:

1. Shift toward one deterministic representative emission per family cluster per run (or equivalent bounded aggregation surface).
2. Preserve cluster observability as planning context, not direct structural debt.
3. Keep severity/info posture unless coupled with additional structural risk signals.

What should continue to emit:

- family cluster observability for large recurring families.

What should likely be suppressed/refined:

- duplicate cluster advisories that do not add new structural context.

### C) Out-of-scope for this hardening slice

Do **not** do the following in the next precision pass:

- move semantic-family derivation into tree,
- adopt raw family-name denylist as primary strategy,
- broad heuristic rewrite across unrelated tree signals,
- add generic suppression infrastructure unless a narrowly scoped, deterministic contract is justified,
- change suite ownership boundaries (naming/runner/tree split).

Classification: Audit

## Implementation-ready next-slice checklist

1. Define deterministic healthy-pairing guardrails for `TREE_FAMILY_SCATTERED` (docs authority lane + owned runtime lane).
2. Define deterministic emission cardinality rules for `TREE_OBSERVED_FAMILY_CLUSTER` (family-level aggregation/reduction).
3. Retain high-ROI emissions for mixed script/tooling families.
4. Keep shim token-only observability as non-debt telemetry unless higher-confidence evidence is present.
5. Keep all changes within tree advisory consumption/gating; no naming ownership transfer.

Classification: Audit
