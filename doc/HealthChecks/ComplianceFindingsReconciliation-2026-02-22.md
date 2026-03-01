# Compliance Findings Reconciliation (Backfill Delta) — 2026-02-22

> **Pass type:** One-time retrospective reconciliation pass (backfill delta).  
> **Not performed:** New baseline compliance audit, broad refactor/fix pass, or in-place rewriting of historical audit docs.

## 1) Repo Reality Preflight (Required)

### 1.1 Current repo + branch
- Repo root confirmed: `/workspace/Calculogic_React_App`
- Branch confirmed: `work`

### 1.2 Prior compliance source locations (in scope)
- `doc/ComplianceAudits/ComplianceAudit-2026-02-10.md`
- `doc/ComplianceAudits/Alignment-Audit-2026-02-21.md`
- `doc/nl-doc-engine/Increment-Audit-2026-02-10.md`

### 1.3 Current validation document locations
- Convention routines used as binding validation baseline:
  - `calculogic-validator/doc/ConventionRoutines/CCPP.md`
  - `calculogic-validator/doc/ConventionRoutines/CSCS.md`
  - `doc/ConventionRoutines/General-NL-Skeletons.md`
  - `doc/ConventionRoutines/NL-First-Workflow.md`
- Active NL skeleton references used during reconciliation checks:
  - `doc/nl-config/cfg-appFrame.md`
  - `doc/nl-config/cfg-buildSurface.md`
  - `doc/nl-shell/shell-globalHeader.md`
  - `doc/nl-shell/shell-spaHost.md`
  - `doc/nl-doc-engine/*.md` (for doc-engine mappings)

### 1.4 Available scripts/tools in `package.json`
- `npm test`
- `npm run lint`
- `npm run build`

### 1.5 Scope/restatement and mismatch notes
- Reconciliation scope is constrained to **traceable prior compliance findings** from the three source docs above.
- This repo currently includes some implementation paths that differ from NL Assembly examples (e.g., `src/main.tsx` / `src/index.css` for spaHost and doc-engine implementation under `src/content*` + `src/components/ContentDrawer`), which was treated as status evidence rather than auto-fail unless tied to a prior finding.

---

## 2) Backfill Source Set — Extracted Prior Findings

The historical findings were normalized into the checklist below. Duplicates across audits were merged into one normalized item while preserving source references.

### Normalized status legend
- **Resolved**: Prior finding no longer true based on direct repo evidence.
- **Partially Resolved**: Some required intent implemented, but material parts remain open.
- **Still Open**: Prior finding remains materially true.
- **Superseded**: Repo evolution changed the original target such that old finding no longer applies directly.
- **Unclear / Needs Fresh Audit**: Evidence insufficient for confident status mapping.

### Evidence confidence tags
- **Verified**: Directly confirmed in current files.
- **Inferred**: Likely true based on partial evidence and surrounding structure.
- **Not Checked**: Not verified in this pass.

---

## 3) Reconciliation Checklist (Normalized Findings → Current Status)

### A. `cfg-appFrame`

1. **AppFrame Build atomic numbering drift + missing NL-id parity**  
   - Sources: ComplianceAudit-2026-02-10 (`cfg-appFrame` Build numbering mismatch).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: Build comments still use coarse IDs (`[3.1]`, `[3.2]`, `[3.3]`) while NL uses `[3.1.1]`, `[3.3.1]`, `[3.3.2]`.

2. **Theme toggle `aria-pressed` contract missing**  
   - Sources: ComplianceAudit-2026-02-10 (`cfg-appFrame` contract mismatch).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: toggle button in `src/App.tsx` still lacks `aria-pressed`; NL contract still declares it.

3. **AppFrame Knowledge extraction not applied (copy/icon descriptors still inline)**  
   - Sources: ComplianceAudit-2026-02-10 (`cfg-appFrame` Knowledge purity issue).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: no `src/App.knowledge.ts` exists; toggle labels still inline in Build/Logic code.

4. **AppFrame Logic/BuildStyle numbering alignment gaps**  
   - Sources: ComplianceAudit-2026-02-10 (`cfg-appFrame` Logic and BuildStyle numbering mismatch).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: `src/App.logic.ts` uses `[5.1]`/`[5.2]`/`[5.3]`; NL uses `[5.2.1]`–`[5.2.3]`. `src/App.css` still has mixed coarse numbering (`[4.1]`, `[4.2]`, `[4.3]`) versus NL atomics.

### B. `cfg-buildSurface`

5. **Missing Header Chrome subcontainer in Build**  
   - Sources: ComplianceAudit-2026-02-10 (`cfg-buildSurface [3.2.2] Header Chrome missing`).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: Build returns root/layout + columns/stage/inspector only; no explicit Header Chrome structure in rendered tree.

6. **BuildStyle orphan selectors tied to non-emitted header anchors**  
   - Sources: ComplianceAudit-2026-02-10 (BuildStyle attachment leak).  
   - Current status: **Still Open** (**Verified**).  
   - Evidence: CSS includes `builder-header`, `builder-tabs`, `.publish` selectors while Build structure does not emit matching header/tab anchors.

7. **Knowledge tokens for section labels/aria/placeholders not fully centralized**  
   - Sources: ComplianceAudit-2026-02-10 (`[6.2.1]`–`[6.2.3]` intent).  
   - Current status: **Partially Resolved** (**Verified**).  
   - Evidence: anchor contracts are centralized in `src/tabs/build/anchors.ts`, but section titles and several aria/placeholder strings remain generated inline in logic/build.

8. **BuildSurface comment numbering drift noted by Alignment-Audit-2026-02-21**  
   - Sources: Alignment-Audit-2026-02-21 (`cfg-buildSurface` Build/Logic/Knowledge numbering).  
   - Current status: **Partially Resolved** (**Verified**).  
   - Evidence: many comments now use deeper IDs (`[5.1.1]`, `[6.1.1]`), but parity is incomplete because Build currently omits NL-declared header subcontainer and some numbering remains non-atomic/coarse in adjacent files.

### C. `shell-globalHeader`

9. **Mode-menu NL ↔ Code drift (Build/Logic/Knowledge)**  
   - Sources: ComplianceAudit-2026-02-10 + Alignment-Audit-2026-02-21.  
   - Current status: **Resolved** (**Verified**).  
   - Evidence: NL includes mode-menu structures and knowledge atoms; Build/Logic/Knowledge files contain aligned mode-menu primitives/handlers/catalog structures.

10. **ResultsStyle live-region atom missing NL mapping**  
    - Sources: ComplianceAudit-2026-02-10 + Alignment-Audit-2026-02-21.  
    - Current status: **Resolved** (**Verified**).  
    - Evidence: NL now declares `[8.2.1] Live Region Anchor`; CSS includes matching `[8.2.1]` rule for `data-anchor='global-header.aria-live'`.

### D. `shell-spaHost`

11. **CCPP header/section/atomic format mismatch in spaHost implementation files**  
    - Sources: ComplianceAudit-2026-02-10 (`shell-spaHost` CCPP format issues).  
    - Current status: **Still Open** (**Verified**).  
    - Evidence: `src/main.tsx` and `src/index.css` still use abbreviated `CCPP:` headers and coarse comments (`[3]`, `[3.1]`, `[4.1]`, `[4.2]`) instead of full routine format.

12. **spaHost NL assembly path drift (`src/shells/spaHost/...` vs actual implementation paths)**  
    - Sources: ComplianceAudit-2026-02-10 (assembly path drift).  
    - Current status: **Partially Resolved** (**Verified**).  
    - Evidence: NL acknowledges `src/main.tsx (or equivalent)` integration, but primary file-structure section still points to `src/shells/spaHost/...`, so full parity remains incomplete.

### E. doc-engine increment audit (`cfg-contentNodeSchema`, `cfg-contentResolver`, `cfg-providerRegistry`, `cfg-contentDrawer`)

13. **Concern-file mismatch between NL assembly paths and real code locations**  
    - Sources: Increment-Audit-2026-02-10 finding #1.  
    - Current status: **Partially Resolved** (**Verified**).  
    - Evidence: implementation still primarily lives under `src/content*` + `src/components/ContentDrawer`; mismatch remains, but NL/docs and code have evolved with explicit transitional structure in places.

14. **Missing NL-numbered CCPP atomic comments across doc-engine concerns**  
    - Sources: Increment-Audit-2026-02-10 finding #2.  
    - Current status: **Partially Resolved** (**Verified**).  
    - Evidence: CCPP-style comments now exist in multiple doc-engine files, but IDs are often coarse/non-skeleton-exact and include ad-hoc forms (`6.5.a`, etc.), preventing full strict parity confirmation.

15. **Section-order parity could not be verified in 2026-02-10 increment audit**  
    - Sources: Increment-Audit-2026-02-10 finding #4.  
    - Current status: **Unclear / Needs Fresh Audit** (**Inferred**).  
    - Evidence: comment coverage improved, but exact section-order and one-to-one NL atomic mapping across all doc-engine concerns remains too broad/heterogeneous for confident closure in this backfill-only pass.

---

## 4) Status Counts Summary

- Total normalized findings reviewed: **15**
- **Resolved:** 2
- **Partially Resolved:** 5
- **Still Open:** 6
- **Superseded:** 0
- **Unclear / Needs Fresh Audit:** 1
- **Traceability gap (cross-cutting):** 1 item family (doc-engine full parity verification breadth)

---

## 5) Remaining Open Compliance Priorities (Required)

Priority order reflects impact on convention fidelity and likelihood of repeated drift.

1. **`cfg-appFrame` NL ↔ code contract/numbering fidelity** (open cluster)  
   - Why high: direct CCPP + NL-first conformance break on top-level app shell configuration.  
   - Next action: **Short compliance pass** focused on `src/App.tsx`, `src/App.logic.ts`, `src/App.css`, plus `src/App.knowledge.ts` creation.

2. **`cfg-buildSurface` Header Chrome + BuildStyle attachment parity**  
   - Why high: current BuildStyle selectors target anchors not emitted by Build, creating structural/style disconnect.  
   - Next action: **Short compliance pass** to either implement Header Chrome in Build or re-baseline NL + CSS atom set together.

3. **`shell-spaHost` CCPP format normalization in entry files**  
   - Why medium/high: global entry point still diverges from required file-header/section/atomic format.  
   - Next action: **Short compliance pass** on `src/main.tsx` and `src/index.css` with exact CCPP fields and NL IDs.

4. **doc-engine atomic parity completeness (multi-config)**  
   - Why medium: partial adoption exists but exact NL atom/order coverage is uncertain repo-wide.  
   - Next action: **Targeted V2 Long compliance pass** for doc-engine concerns (`cfg-contentNodeSchema`, `cfg-contentResolver`, `cfg-providerRegistry`, `cfg-contentDrawer`).

---

## 6) Superseded / Archived Findings Notes (Optional)

- No normalized finding was marked fully superseded in this pass.
- Some findings were marked **Partially Resolved** where repo evolution improved intent alignment without fully closing strict NL/CCPP parity.

---

## 7) Traceability Gaps (Optional)

1. **Doc-engine full NL atom/order reconciliation breadth**  
   - Gap type: legacy findings were broad across several configurations with evolving file layout.  
   - Recommendation: run a dedicated **V2 Long** pass scoped only to doc-engine NL docs and their mapped concern files.

---

## 8) Verification & Checks Run (Required)

Checks executed for context:
- `npm test`
- `npm run lint`
- `npm run build`

### Inspected docs/files
- Prior finding sources: compliance audits + increment audit listed in §1.2.
- Current repo areas inspected: `src/App*`, `src/tabs/build/*`, `src/components/GlobalHeaderShell/*`, `src/main.tsx`, `src/index.css`, `src/content*`, `src/components/ContentDrawer/*`, relevant NL docs.

### Not checked in this pass
- Exhaustive repo-wide fresh compliance baseline (explicitly out of scope).
- Full symbol-by-symbol parity for every doc-engine atom across all packages (flagged for targeted long pass).

---

## Acceptance Statement

Prior compliance findings from pre-V2 docs/notes were reconciled against current repo reality, each was status-classified with evidence, and a current prioritized list of remaining compliance issues was produced.
