# Validator Tree Structural Reality Audit

## Purpose

This audit records the current structural reality of the `calculogic-validator` package tree so later tree-advisor hardening can distinguish real structural improvement opportunities from healthy multi-surface spread.

Classification: Audit

## Scope and method

- Audited from package tree layout and colocated docs/code surfaces directly.
- Did **not** start from tree-advisor findings output.
- Focused on ownership boundaries, extraction paths, deterministic organization, and extensibility.
- Runtime behavior was intentionally left untouched.

Classification: Audit

## Current structure strengths

1. **Suite-core vs slice-owned boundary is already legible and mostly deterministic.**
   - `calculogic-validator/src/core/**` is a coherent suite-core helper/runtime lane.
   - `calculogic-validator/naming/src/**` and `calculogic-validator/tree/src/**` are explicit owned-slice lanes with their own `test/` surfaces.
   - This shape supports independent slice evolution while preserving a stable suite contract center.

2. **Tree-owned internals already show meaningful semantic grouping.**
   - `tree/src/contributors/**` isolates contributor assembly concerns.
   - `tree/src/registries/**` and `tree/src/registries/_builtin/**` separate policy/registry logic from builtin registry payloads.
   - Top-level tree files (`*.host|*.wiring|*.logic|*.contracts`) align with concern-style decomposition and predictable ownership.

3. **Cross-surface docs are structured by authority lane, not mixed ad hoc.**
   - `doc/ValidatorSpecs/` root keeps canonical entrypoints.
   - `doc/ValidatorSpecs/tree-owned/`, `naming-owned/`, `cross-cutting/`, and `suite-owned/` provide clear ownership-specific supporting lanes.
   - `doc/Indexes/ValidatorDocsIndex.md` provides explicit authority routing.

4. **Operational surfaces are intentionally split by role and are discoverable.**
   - `scripts/` holds host wrappers (`validate-*.host.mjs`, report-capture scripts).
   - `bin/` exposes package-level command entrypoints.
   - `tools/report-capture/` keeps its own package-local implementation boundary.

Classification: Audit

## Immediate real structural opportunities

### Opportunity A — Suite-level `test/` surface is too flat for family growth

- **Structural pattern:** `calculogic-validator/test/` has many mixed families (`validator-config*`, `report-capture*`, runner/cli/exit/scope tests) in one directory with only `fixtures/` nested.
- **Why this is a real opportunity:** test ownership is readable now, but future additions will increase scan noise and make ownership/extraction less obvious.
- **Likely better grouping shape:** introduce bounded family subfolders while preserving filenames, e.g.:
  - `test/suite-core/` (runner/exit/scope/report-meta)
  - `test/config/` (validator-config schema + behavior)
  - `test/report-capture/` (report capture script/tool integration)
  - keep `test/fixtures/` shared.

### Opportunity B — `scripts/` currently mixes validator orchestration and report-capture utility wrappers

- **Structural pattern:** validator entry wrappers (`validate-all`, `validate-naming`, `validate-tree`, `validator-health-check`) and report-capture utility wrappers (`report-capture-*`, `generate-validator-report-examples`) are siblings.
- **Why this is a real opportunity:** semantics are related but distinct; scan-time ownership is flatter than necessary.
- **Likely better grouping shape:**
  - `scripts/validate/*.host.mjs`
  - `scripts/report-capture/*.host.mjs`
  - optional `scripts/health/*.host.mjs` if health utilities continue to grow.

### Opportunity C — Tree root has a growing flat cluster of `tree-occurrence*`, `tree-shim-detection*`, and `tree-structure-advisor*` files

- **Structural pattern:** several tree semantic families live at `tree/src/` root alongside contributor/registry folders.
- **Why this is a real opportunity:** current size is manageable, but family growth may blur boundaries between runtime core, occurrence modeling, and shim diagnostics.
- **Likely better grouping shape (incremental, not urgent):**
  - `tree/src/runtime/` (`tree-structure-advisor.*`, runner-facing core)
  - `tree/src/occurrence/` (`tree-occurrence-*`)
  - `tree/src/shim/` (`tree-shim-detection.*`)
  - keep `contributors/` and `registries/` as-is.

Classification: Audit

## Healthy/expected spread that hardening should preserve

1. **Multi-surface CLI spread is healthy, not noise.**
   - `bin/` entrypoints, `scripts/` hosts, `src/core/cli/` shared CLI helpers, and slice-local CLI files (`naming/src/cli/`) represent valid layered ownership, not structural drift.

2. **Config and registry spread across suite-core and slices is healthy.**
   - Suite-wide config contracts and scope registries under `src/core/` + `src/registries/`.
   - Slice-specific registries under `naming/src/registries/` and `tree/src/registries/`.
   - This boundary should be preserved as “expected cross-surface composition,” not reported as scatter.

3. **Docs/implementation pairing across authority lanes is healthy.**
   - Canonical spec at `doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md` plus tree-owned support docs under `doc/ValidatorSpecs/tree-owned/` is a good split between runtime authority and supporting modeling/navigation.

4. **`tools/report-capture/` + root `scripts/report-capture-*` pairing is healthy.**
   - Tool implementation under `tools/report-capture/src/` with top-level script wrappers is an expected operator-facing surface split.

Classification: Audit

## Ambiguous / maybe-later cases (do not drive immediate changes)

1. **Top-level `doc/Audits/` vs `doc/ValidatorSpecs/tree-owned/*.audit.md` split.**
   - Could be unified by a stricter audit home model, but current split may be intentional (global validator audits vs tree-owned structural audits).
   - Treat as discoverability tuning, not immediate structural debt.

2. **Potential dedicated `src/core/health/` lane.**
   - Health behavior currently appears in scripts/bin and naming health files; a suite-core health lane might emerge later.
   - Current footprint does not justify immediate rehome.

3. **Possible further subdivision inside `doc/ConventionRoutines/`.**
   - The folder holds many conventions/contracts; sub-grouping could improve scanability.
   - Because this is canonical-contract-heavy content, churn risk is high; defer until a documentation IA pass.

Classification: Audit

## Conclusion: target signal for future tree-advisor hardening

A better tree-advisor signal should:

- **Preserve** intentional multi-surface layering (suite-core helpers, owned-slice roots, scripts/bin/tools/docs authority lanes).
- **Prefer reporting** high-ROI structural flattening where semantic families are clearly present but insufficiently grouped (notably top-level suite tests and mixed script families).
- **Avoid noise** on healthy cross-surface pairings that represent explicit ownership boundaries rather than accidental scatter.
- **Treat ambiguous IA choices cautiously** unless extractability, ownership clarity, or deterministic navigation measurably improves.

Short modeling-preservation note for later hardening:

- account for top-level semantic-family containers (for example `tree/`, `naming/` in repo shapes where they exist),
- evaluate lower-level family grouping opportunities within each container before escalating to repo-wide scatter,
- and distinguish healthy container-local family density from true cross-container semantic scatter.

Classification: Audit
