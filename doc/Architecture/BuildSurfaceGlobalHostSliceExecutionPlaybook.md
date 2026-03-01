# Build Surface Global Host Slice Execution Playbook

## Document Status
> Terminology note: in this architecture/playbook context, `host` refers to the `ui_host_surface` concept (UI composition shell) and `host_owner` boundary assignments where stated, not the `address_host` namespace token semantics used by structural addressing grammar. See `calculogic-validator/doc/ConventionRoutines/TerminologyScoping-Conventions-V1.md`.


- **Document Type:** Architecture Execution Playbook
- **Status:** Draft (Docs-First Refactor Execution Guidance)
- **Purpose:** Convert the Build Surface global-host draft inventory into a repeatable semantic-slice execution and verification workflow.
- **Scope:** Execution sequencing guidance, per-slice template, safety checks, PR boundaries, and inventory reconciliation rules for Build Surface → Global Host migration.
- **Related Docs:**
  - `doc/Architecture/BuildSurfaceGlobalHostDraftInventoryPlan.md`
  - `doc/Architecture/BuildSurfaceGlobalHostSequencePlan.md`
  - `calculogic-validator/doc/ConventionRoutines/FileNamingMasterList-V1_1.md`
  - `calculogic-validator/doc/ConventionRoutines/CSCS.md`
  - `calculogic-validator/doc/ConventionRoutines/CCPP.md`
  - `doc/ConventionRoutines/General-NL-Skeletons.md`
  - `doc/ConventionRoutines/NL-First-Workflow.md`
  - `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`

## Purpose

This playbook operationalizes the Build Surface → Global Host migration as a **repeatable execution workflow**.

- The inventory plan remains the source of truth for draft targets, mapping direction, and naming alignment.
- Status token meanings are centralized in `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`.
- This playbook defines **how** semantic slices are executed, verified, and reconciled as implementation lands.
- This playbook does not replace task-specific engineering judgment; it provides guardrails and repeatable review shape.
- In short: the inventory plan is the target/mapping ledger, while this playbook is the execution/verification routine.

## Rule-Class Split (v1)

This playbook distinguishes **Normative Requirements** (deterministic/checkable expectations) from **Heuristic Guidance (Non-Normative)** (human-judgment recommendations). Heuristic guidance is intentionally non-normative and should not be interpreted as strict compliance criteria.

## Scope Boundaries

### In Scope (Required)

- semantic-slice sequencing guidance
- per-slice execution template and done criteria
- reusable verification and safety checklists
- wrapper/forwarder transitional seam rules and retirement criteria
- PR boundary guidance for reviewability
- inventory reconciliation/status update guidance

### Out of Scope (Required)

- architecture redesign beyond approved inventory direction
- naming-policy expansion or role-registry changes
- broad optimization passes bundled into slice execution
- unrelated cleanup/renames outside the active slice boundary
- changes that silently redesign behavior under an extraction label

## Execution Model (Semantic-Slice Method)

### NL Co-Migration Principle (Required)

Semantic-slice execution for Build Surface global-host refactor uses **code + NL co-migration**, not deferred NL cleanup.

#### Normative Requirements

- each semantic code slice must migrate/update corresponding NL slice content in the same pass
- naming and NL references for touched files must be aligned in-slice to avoid post-hoc drift
- numbering/provenance for touched atoms/sections must be pre-validated for consistency before slice exit
- each slice must follow the same rhythm from the draft inventory plan:

1. **Extract**
2. **Repoint**
3. **Cleanup / Normalize**
4. **Retire Legacy**

#### Heuristic Guidance (Non-Normative)

- canonical split NL targets should become authoritative incrementally as slices land
- legacy monolith NL content in `doc/nl-config/cfg-buildSurface.md` should be progressively forwarded/annotated as ownership drains

### 1) Extract

Define a bounded slice around one migration boundary (host shell, logic seam, persistence seam, contract seam, or tab-provider seam).

A bounded slice should:

- map to specific inventory row(s) and target file(s)
- move one coherent responsibility cluster (not multiple unrelated concerns)
- preserve behavior-first extraction before redesign

Defer from this step:

- broad stylistic cleanup
- feature changes not required for migration safety
- speculative naming shifts outside current inventory direction

### 2) Repoint

After extraction, repoint imports/call sites to the new destination in the minimum required scope.

#### Heuristic Guidance (Non-Normative)

Repoint guidance:

- prefer direct repoint where impact is small and observable
- allow a temporary wrapper/forwarder only when repoint cannot land safely in the same slice
- keep repoint diffs explicit and limited to touched seam paths

### 3) Cleanup / Normalize

Normalize only the area touched by the slice:

- remove dead imports and drained code paths
- align local comments/NL references where ownership changed
- apply naming normalization only for actively migrated files

Do not turn cleanup into broad tree-wide churn.

### 4) Retire Legacy

#### Normative Requirements

Retire fully drained legacy files or leave a wrapper/forwarder only when necessary.

Legacy retirement should happen when:

- all call sites are repointed
- wrapper/forwarder has no unique behavior
- verification is complete for touched path

#### Heuristic Guidance (Non-Normative)

- wrapper/forwarder usage should be short-lived transitional seam usage

## Slice Ordering Strategy (Draft v1, Non-Mandatory)

**Classification:** Heuristic Planning Guidance (Non-Normative)

This ordering is a **draft-safe starting strategy** and not immutable law.
It is not intended to be strict compliance criteria and may be adjusted based on repo reality, dependencies, and migration risk.

### Slice Group A — Canonicalization + Persistence Support Alignment (Low Risk)

- **Why first:** tight blast radius; improves contract clarity before host/wiring extraction.
- **Typical dependencies:** none beyond existing persistence call sites.
- **Do not mix:** host shell extraction, tab-provider introduction, or app-level mount repoint.

### Slice Group B — Host Shell Boundary Extraction Scaffolding

- **Why now:** creates stable composition seams that later wiring slices can target.
- **Typical dependencies:** Group A contract/persistence clarity is preferred.
- **Do not mix:** behavior redesign of panel interactions or theme/breakpoint policy changes.

### Slice Group C — Shared Host Wiring Seam Introduction

- **Why now:** separates host-level orchestration from tab-specific population paths.
- **Typical dependencies:** baseline host shell targets established in prior group.
- **Do not mix:** broad tab-provider expansion or unrelated build/app frame edits.

### Slice Group D — Tab-Provider Contract/Wiring Introduction

- **Why now:** formalizes variable tab population seams after host shell is stable.
- **Typical dependencies:** shared host wiring seam available.
- **Do not mix:** final wrapper deletion unless all affected call sites are already repointed.

### Slice Group E — Repoint Slices Across BuildTab/App Mount Path

- **Why now:** repoint entry flow once host/tab seams are already explicit and testable.
- **Typical dependencies:** wiring seams in place and verified.
- **Do not mix:** large cosmetic cleanup or additional architecture experiments.

### Slice Group F — Legacy Wrapper Retirement / Final Drain

- **Why last:** avoids churn from deleting transitional seams too early.
- **Typical dependencies:** all consumer imports switched and behavior checks complete.
- **Do not mix:** fresh extraction scope in same PR; this should be drain/retire focused.

## Per-Slice Execution Template (Copy/Use Per Task)

```md
### Slice Name
- <short descriptive name>

### Boundary Being Migrated
- <host shell / persistence / wiring / contracts / repoint seam>

### Inventory Row(s) / Target File(s)
- Inventory rows: <list>
- Target files: <list>

### Legacy Source(s) Being Drained
- <legacy files/paths and responsibility being drained>

### Slice Type
- <host | logic | wiring | contracts | persistence | repoint>

### Preconditions
- [ ] Related inventory rows identified
- [ ] Dependencies from prior slices met
- [ ] NL/CCPP touch impact identified (if concern ownership moves)
- [ ] Legacy NL source section(s) in `doc/nl-config/cfg-buildSurface.md` identified for this slice

### Extract Steps
1. <bounded extraction step>
2. <bounded extraction step>

### NL Co-Migration Steps
1. <identify matching legacy NL section(s) in `cfg-buildSurface.md`>
2. <create/update canonical split NL target file(s) for this semantic slice>
3. <repoint or annotate legacy monolith NL references to reflect forwarded/partial/retained status>
4. <verify naming alignment for touched code paths + NL filenames>
5. <verify numbering/provenance consistency for touched atoms/sections>

### Repoint Steps
1. <import/call-site repoint step>
2. <integration seam repoint step>

### Cleanup / Normalize Steps
1. <dead code cleanup>
2. <local naming/comment/NL normalization>

### Wrapper/Forwarder Use
- Allowed: <yes/no>
- Why needed: <short rationale>
- Retirement trigger for this wrapper/forwarder: <explicit condition>

### Verification Checks
- [ ] Import/module safety checklist run (applicable items)
- [ ] Behavior parity checklist run (applicable items)
- [ ] Persistence safety checklist run (if touched)
- [ ] Interaction safety checklist run (if touched)
- [ ] Docs/contract alignment checklist run (if touched)
- [ ] NL co-migration checklist run for touched semantic slice

### Done Criteria
- [ ] Bounded responsibility moved
- [ ] Required call sites repointed
- [ ] Code behavior unchanged for the slice unless an explicit planned behavior adjustment was declared
- [ ] Canonical split NL target exists or is updated for touched responsibility
- [ ] Legacy `cfg-buildSurface.md` status updated (forwarded/partial/retained) for touched sections
- [ ] NL/code references are coherent after repoint/annotation updates
- [ ] Naming alignment check completed for touched code + NL files
- [ ] Numbering/provenance consistency check completed for touched atoms/sections
- [ ] Legacy status classified (`extracted`/`repointed`/`legacy-wrapper`/`retired`)
- [ ] Inventory reconciliation update recorded when material

### Deferred Follow-Ups (Explicit)
- <item intentionally not completed in this slice>
```

## Verification & Safety Checklists

Use only the checklists relevant to the touched boundary.

### A) Import / Module Safety

- [ ] imports updated (relative + aliases)
- [ ] exports/barrels updated where required
- [ ] no circular import introduced in migrated path
- [ ] dynamic/lazy import paths verified (if applicable)

### B) Behavior Parity / Runtime Safety

- [ ] shell layout still renders
- [ ] left/canvas/right zones still mount correctly
- [ ] tab switching behavior still works in touched paths
- [ ] state/hook behavior preserved in touched modules
- [ ] no obvious effect/closure regression introduced

### C) Persistence Safety (When Touched)

- [ ] parse/serialize behavior preserved
- [ ] version constants/contracts remain aligned
- [ ] fallback/default behavior preserved
- [ ] no accidental persisted payload shape drift

### D) Interaction Safety (When Touched)

- [ ] panel resize/collapse behavior remains correct
- [ ] inspector/right panel behavior remains intact
- [ ] breakpoint/theme behavior remains intact (if touched)

### E) Docs / Contract Alignment (When Touched)

- [ ] NL references updated where filename/path contract changed
- [ ] CCPP/NL notes updated where concern ownership shifted
- [ ] inventory status/mapping updated when slice materially landed
- [ ] canonical split NL target file(s) updated for touched semantic slice
- [ ] legacy monolith NL sections marked forwarded/partial/retained where applicable
- [ ] touched naming alignment validated across code path + NL filename references
- [ ] touched numbering/provenance consistency validated (without expanding convention policy in this playbook)

## Wrapper / Forwarder Retirement Rules

Use temporary wrappers/forwarders only as transitional seams.

### Lifecycle Labels

Use centralized token meanings from `doc/ConventionRoutines/StatusVocabularyRegistry-V1.md`.

- **`extracted`**: responsibility moved to target, but consumers may still route through legacy path.
- **`repointed`**: active consumers switched to target path.
- **`legacy-wrapper`**: legacy file remains as thin delegator only (no unique logic).
- **`retired`**: legacy file removed after full drain.

### Retirement Criteria (Required)

A wrapper/forwarder can be retired when:

- all known call sites are repointed to canonical target
- wrapper/forwarder adds no unique behavior/state/contract translation
- touched-path verification is complete
- inventory status has been updated to reflect repointed/retired state
- no lingering imports depend on the wrapper/forwarder path

### Drift Control

#### Heuristic Guidance (Non-Normative)

Avoid long-lived wrappers/forwarders; if a wrapper/forwarder survives multiple slices, record explicit blocker and target retirement slice.

## PR Boundary Guidance

Keep each PR reviewable and semantically scoped.

### Required PR Shape Principles

#### Normative Requirements

- do not combine unrelated semantic slices
- do not combine refactor + optimization + feature behavior change unless safety-coupled
- state boundary being migrated and legacy source being drained in PR summary
- include explicit verification notes in PR summary
- verification notes should state both what was checked (manual and/or automated) and what was intentionally not checked in this slice (if any)

#### Heuristic Guidance (Non-Normative)

- one primary migration boundary per PR when practical
- separate extraction work from broad cleanup work where possible

### Good PR Shapes (Examples)

- **Extraction-only PR:** move persistence contracts/logic to canonical target + minimal repoints.
- **Repoint-only PR:** switch BuildTab/App mount seam imports to established host wiring target.
- **Retirement PR:** remove now-empty wrappers after confirmed repoint completion.

## Inventory Reconciliation / Status Update Rules

The inventory plan remains the migration ledger; update it deliberately.

### When to Update `Status`

#### Normative Requirements

Update status when a slice changes lifecycle state (that is, changes status/ownership interpretation in a way that affects inventory tracking or migration decisions), e.g.:

- `planned` → `in-progress`
- `in-progress` → `extracted`
- `extracted` → `repointed`
- `repointed` → `retired`
- optional transitional `legacy-wrapper` when temporary delegator is intentionally retained

### Snapshot/Mapping Update Rules

#### Normative Requirements

- update snapshot/mapping sections when extracted/repointed ownership changes interpretation
- preserve one-to-many drain visibility (one legacy source to multiple canonical targets)
- avoid rewriting unaffected rows during narrow-scope slices

#### Heuristic Guidance (Non-Normative)

- for partial completion, annotate precisely rather than over-claiming completion

### Partial Slice Handling

If slice is partially complete:

- keep status conservative (`in-progress`, `extracted`, or `legacy-wrapper`)
- record blockers/deferred follow-ups explicitly
- avoid marking `retired` until wrapper/path drain is complete

### Anti-Churn Rule

Do not mass-edit inventory rows for docs-only wording polish unrelated to landed migration state.

## Risk / Anti-Churn Guardrails

- no mass renames during unrelated slices
- no hidden role/responsibility changes without explicit boundary notes
- no silent behavior redesign under “extraction” label
- avoid mixing tab-provider expansion with shell extraction unless required by dependency
- preserve small, auditable slice boundaries and explicit deferred lists

## Optional Starter Slice Backlog (Draft Guidance, Not Mandatory)

These starter examples follow current draft inventory/repo-reality naming and are illustrative execution aids for slicing; they are not a naming-policy or role-registry expansion by this playbook.

### 1) Persistence Canonicalization + Repoint Prep
- **Objective:** align persistence contracts/logic to canonical targets and prep clean repoint seam.
- **Likely target file(s):** `src/tabs/build/buildsurface-persistence.logic.ts`, `src/tabs/build/buildsurface-persistence.contracts.ts`
- **Likely legacy source(s):** `src/tabs/build/buildSurfacePersistence.ts`, `src/tabs/build/buildSurfacePersistence.contracts.ts`
- **Risk:** Low
- **Notes:** keep behavior identical; no shell extraction mixed in.

### 2) Host Root Shell Extraction Scaffold
- **Objective:** establish global host root composition target.
- **Likely target file(s):** `src/tabs/build/buildsurface.host.tsx`
- **Likely legacy source(s):** `src/tabs/build/BuildSurface.build.tsx`
- **Risk:** Medium
- **Notes:** extraction scaffold only; avoid tab-provider redesign in same slice.

### 3) Left Panel Host Extraction (Shell-Only)
- **Objective:** isolate left panel shell frame from mixed BuildSurface composition.
- **Likely target file(s):** `src/tabs/build/leftpanel.host.tsx`
- **Likely legacy source(s):** `src/tabs/build/BuildSurface.build.tsx`, `src/tabs/build/BuildSurface.logic.ts`
- **Risk:** Medium
- **Notes:** keep section population semantics unchanged.

### 4) Shared Host Wiring Seam Introduction
- **Objective:** introduce host-level wiring seam for cross-zone orchestration.
- **Likely target file(s):** `src/tabs/build/buildsurface-host.wiring.ts`
- **Likely legacy source(s):** `src/tabs/build/BuildSurface.logic.ts`, `src/tabs/build/index.tsx`
- **Risk:** Medium
- **Notes:** do not repoint app mount path until seam is stable.

### 5) Build-Tab Provider Wiring Extraction
- **Objective:** isolate Build-tab-specific source feed seam.
- **Likely target file(s):** `src/tabs/build/leftpanel-build-sources.wiring.ts`, `src/tabs/build/leftpanel-tab-provider.contracts.ts`
- **Likely legacy source(s):** `src/tabs/build/BuildSurface.logic.ts`
- **Risk:** Medium
- **Notes:** keep provider contracts thin and host-facing.

### 6) Build Entry Repoint Slice (Forwarder-Aware)
- **Objective:** repoint Build entry/mount path toward new host wiring seam.
- **Likely target file(s):** `src/tabs/build/index.tsx`, `src/tabs/BuildTab.tsx`, `src/App.tsx`
- **Likely legacy source(s):** forwarding paths currently anchored on BuildSurface legacy entry.
- **Risk:** High
- **Notes:** isolate repoint from new extraction; allow temporary forwarder if needed.

---

## Deferred Decisions (Intentional)

- final immutable slice order is deferred; this playbook provides draft-safe guidance only
- final global semantic root rename decisions remain deferred to future architecture control
- any role-registry expansion remains deferred and out of scope for this playbook
