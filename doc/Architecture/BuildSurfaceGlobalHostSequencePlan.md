# Build Surface Global Host Sequence Plan

This document defines the recommended sequencing for stabilizing the Build Surface before converting it into a global host surface, integrating Doc Engine entry points, and preparing publish-flow integration seams.

It exists to prevent scope creep and to avoid building deeper integrations on top of an unreliable host surface baseline.

## Purpose

The current Build Surface is evolving from a Build-tab-specific implementation into a future **global host surface** that can support multiple concern tabs (Build, BuildStyle, Logic, Knowledge, Results, ResultsStyle) and plugin-driven atom/config sources.

Before that refactor, the Build Surface needs a correctness pass for:
- breakpoint preview behavior (mobile/tablet/desktop)
- light/dark theme parity

This plan also defines when to:
- prove Doc Engine integration in the host app
- plan publish integration contracts
- and proceed with Doc Engine extraction work

## Why this sequencing matters

Breakpoint/theme inconsistencies in the host surface create noise during debugging and make later architecture changes harder to verify.

If unresolved, they can blur whether a problem comes from:
- host UI rendering
- tab/source composition changes
- Doc Engine integration
- publish-flow hooks

This plan prioritizes a **trustworthy host baseline first**, then architecture shaping, then integration proof, then extraction.

---

## Current Context

### Build Surface role (current)
The Build Surface currently acts as:
- the Build tab’s main composition surface
- panel/canvas host
- interaction/persistence hub for pane state
- a staging area for future shared host behavior

### Future direction (planned)
The Build Surface will evolve into a **global host surface** where:
- shared panel/canvas shell behavior remains stable
- the active tab determines which atom/config sources are shown
- plugin architecture provides tab-specific source catalogs/primitives
- Doc Engine can be invoked from build workflows (e.g., insert-browser info/docs)
- publish-related flows can be invoked from the global header and coordinate with docs validation

### Related architecture documents
- `doc/Architecture/DocEngineExtractionPlan.md` (doc engine extraction boundary and staging)
- Compliance audit / NL alignment docs (as applicable)

---

## Work Order (Required Sequence)

### Status Update (Post-Phase-1 Reconciliation)

- **Phase 1 host stability pass is completed** via PR **#108**.
- Landed scope (high level):
  - preview-only breakpoint controls/state now drive deterministic preview sizing behavior in the Build Surface host UI
  - dark-theme parity styling was expanded across Build Surface host regions (header/panels/canvas chrome)
- Explicitly not included in PR #108:
  - no Build Surface → Global Host refactor extraction/splitting
  - no tab-provider seam extraction or inventory lifecycle progression work
- Verification summary for that pass was captured in the PR (manual breakpoint/theme checks plus automated lint/build checks).

### Phase 1 — Build Surface Host Stability Pass

#### Goal
Fix host-surface correctness issues before architecture-level refactors.

#### Scope
Address:
- breakpoint preview controls (mobile/tablet/desktop) that currently do not meaningfully change the preview/host experience
- light/dark mode styling inconsistencies across Build Surface regions (panels, canvas, shell areas)

#### Objectives
- Make breakpoint state changes produce visible and deterministic behavior (or explicitly align UI controls to their current intended scope if they are preview-state-only)
- Achieve theme parity/coherence across Build Surface host regions
- Reduce visual/debugging ambiguity before refactoring host structure

#### Non-goals
- No global host surface conversion yet
- No tab-driven plugin source architecture refactor in this phase
- No publish workflow implementation
- No Doc Engine extraction work
- No unrelated visual redesign

#### Deliverables
- Code fixes for breakpoint and theme correctness
- Verification notes (what changed + how verified)
- NL/CCPP updates only if file ownership/responsibility/order changes

#### Verification (minimum)
- `npm run lint`
- `npm run build`
- Manual checks:
  - switch mobile/tablet/desktop and confirm expected visible behavior
  - switch light/dark and confirm consistent rendering across panels + canvas + host shell

---

### Phase 2 — Global Host Surface Refactor Prep

#### Goal
Prepare the Build Surface to become a shared/global host surface while preserving existing Build functionality.

#### Scope
Refactor the current surface so generic host behavior can be reused while tab-specific sources/composition can vary by active concern tab.

#### Objectives
- Separate host-generic surface concerns from Build-specific source composition
- Preserve deterministic UI structure/order and stable panel behavior
- Create clean seams for tab-driven plugin-provided atoms/configurations/primitives

#### Expected boundary direction (conceptual)
Split toward:
- **host surface shell logic**
  - pane widths
  - resize behavior
  - collapse state
  - shared panel/canvas orchestration
  - host-level persistence contracts
- **Build-specific source composition**
  - current Build tab left-panel sections/items
  - Build-only source adapters
- **tab-driven source injection seam**
  - active tab determines source providers
  - plugin architecture can supply concern-specific catalogs/primitives

#### Non-goals
- No requirement to fully implement all tab source providers in one pass
- No Doc Engine repo extraction in this phase
- No full publish implementation

#### Deliverables
- Refactor changes and/or architecture prep changes
- Boundary notes documenting host-generic vs Build-specific responsibilities
- Updated NL documents to maintain deterministic 1:1 ordering where affected

#### Verification (minimum)
- `npm run lint`
- `npm run build`
- Existing Build tab behavior still works
- Panel resize/collapse/persistence behavior remains stable

---

### Phase 3 — Doc Engine Integration Proof in Host App (Pre-Extraction)

#### Goal
Prove that Doc Engine integration works through the host app’s real UI seams before splitting the Doc Engine into a separate repository.

#### Scope
Validate host-app integration points such as:
- Build surface insert-browser info/docs invocation
- Global header doc/publish-adjacent invocation
- Content resolution/rendering through existing composition root/provider wiring

#### Objectives
- Confirm stable invocation from host surface and global header contexts
- Verify deterministic content/not-found behavior at integration boundaries
- Identify any interface changes needed before extraction

#### Non-goals
- No full publish pipeline implementation
- No mandatory DB-backed publish logic unless specifically needed for proof
- No Doc Engine repo extraction in the same pass

#### Deliverables
- Working integration proof(s) in current repo
- Boundary notes for extraction readiness
- Interface/contract adjustments discovered during proof (if any)

#### Verification (minimum)
- Known doc content resolves and renders successfully
- Missing content path resolves to deterministic `not_found` behavior
- Host surface interactions remain stable after integration changes
- `npm run lint`
- `npm run build`

---

### Phase 4 — Publish Contract Planning (Lightweight)

#### Goal
Define publish orchestration contracts and Doc Engine participation points before full publish implementation.

#### Scope
Plan the interfaces and responsibilities for publish-related flows without implementing final DB-backed publishing.

#### Objectives
Define/clarify:
- global header publish trigger contract (`onPublish` seam)
- publish flow stages (draft sequence)
- documentation/provenance completeness checks (Doc Engine role)
- validation result envelope(s)
- responsibility boundaries between header shell, publish orchestrator, Doc Engine, and data layer

#### Non-goals
- No full publish wizard UI
- No final DB transaction/persistence implementation
- No role/permission system implementation
- No production publish API implementation

#### Deliverables
- Architecture plan and/or interface definitions for publish orchestration
- Responsibility mapping across subsystems
- Follow-up implementation task list (later phase)

---

### Phase 5 — Doc Engine Extraction Execution

#### Goal
Extract the Doc Engine into its own repository/package after host-app seams are proven and boundaries are stable.

#### Preconditions
- Host-app integration proof completed
- Doc Engine responsibilities confirmed
- Import repoint strategy clear
- At least one host-app integration test retained for engine/app boundary behavior
- Findings from Phases 2–4 reflected in extraction plan

#### Execution
Follow and update:
- `doc/Architecture/DocEngineExtractionPlan.md`

Use extraction findings to keep:
- provider/pack boundaries clean
- app-owned composition intact
- canonical content/not-found semantics deterministic

---

### Phase 6 — Full Publish Implementation (Later)

#### Goal
Implement DB-backed publish flows after host surface and Doc Engine boundaries are stable.

#### Scope (future)
- publish orchestration UI/flow
- DB persistence + transactions
- lineage/provenance writes
- validation mode enforcement during publish
- visibility/permissions integration
- governance/trust metadata (as applicable)

#### Note
This phase is intentionally deferred to avoid coupling publish implementation to unstable host or extraction boundaries.

---

## Decision Rules (Scope Control)

### Stop and split work if:
- Phase 1 starts becoming a global host refactor
- breakpoint/theme fixes require major architectural changes unrelated to correctness
- Doc Engine proof starts requiring full publish implementation
- publish planning starts pulling in DB schema/transaction implementation
- a single pass becomes multi-subsystem churn beyond reviewable scope

### Boundary rules (keep explicit)
- **Host Surface** owns panel/canvas shell orchestration and shared UI host behavior
- **Tab Source Composition** owns concern-specific item sources and panel content
- **Doc Engine** owns docs retrieval/search/documentation validation support
- **Publish Orchestrator** owns publish sequencing and workflow state
- **Data Layer / DB** owns persistence mechanics and transactions

---

## Suggested Immediate Next Task

**Phase 1 — Build Surface Host Stability Pass**
- breakpoint preview behavior correctness
- light/dark theme parity
- verification + low-churn fixes only

This is the recommended first step before globalizing the surface or expanding Doc Engine/publish integration.

---

## Notes for NL / CCPP Alignment

When implementing any phase in this plan:
- maintain deterministic ordering between NL and code
- update NL only where responsibility/order/ownership changes
- preserve low-churn boundaries during stabilization work
- record boundary decisions if refactors alter subsystem responsibilities
