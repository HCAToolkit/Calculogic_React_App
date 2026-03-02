# Health Check Findings Reconciliation (Backfill Delta) — 2026-02-22

> **Pass type (required):** One-time retrospective reconciliation pass (backfill delta), **not** a fresh baseline health check.

## 1) Repo Reality Preflight

- **Repo root:** `/workspace/Calculogic_React_App`
- **Branch:** `work`
- **Historical health check docs location:** `doc/HealthChecks/`
- **Available scripts from `package.json`:**
  - `npm test`
  - `npm run lint`
  - `npm run build`
- **Current module/folder reality snapshot (high-level):**
  - UI shell/features: `src/components/`, `src/tabs/`, `src/App.tsx`
  - Doc-engine runtime boundary: `src/doc-engine/`
  - App-side content composition/adapters/providers: `src/content/`
  - Legacy content constants: `calculogic-doc-engine/src/`
  - Architecture + conventions: `doc/Architecture/`, `doc/ConventionRoutines/`, `doc/nl-*`

### Repo-evolution notes affecting reconciliation
- Several old findings from early baseline reviews were about **in-flight extraction and missing quality gates**. Current repo now has a `test` script and green build/lint (warnings remain), so some items are now resolved or partially resolved.
- Folder ownership assumptions changed materially after doc-engine extraction prep (`src/doc-engine` core vs `src/content` app composition), so some early findings are now better classified as **Superseded** rather than strictly open.

---

## 2) Source Docs Reviewed

1. `doc/HealthChecks/RepositoryHealthReview-2026-02-10.md`
2. `doc/HealthChecks/RepositoryHealthReview-2026-02-11.md`
3. `doc/HealthChecks/RepositoryHealthReview-2026-02-14.md`
4. `doc/HealthChecks/RepositoryHealthReview-2026-02-14-DeepDive.md`
5. `doc/HealthChecks/FolderOrganizationHealthCheck-2026-02-14.md`
6. `doc/HealthChecks/ConvergenceHealthCheck-2026-02-20.md`
7. `doc/HealthChecks/RepositoryHealthReview-2026-02-21.md`

---

## 3) Normalized Findings + Reconciliation Status

Legend:
- **Status:** Resolved | Partially Resolved | Still Open | Superseded | Unclear / Needs Fresh Baseline Review
- **Confidence:** Verified | Inferred | Not Checked

### A) Test/Lint/Build posture

1. **Missing automated test posture / no test script**
   - Source refs: 2026-02-10 review top issues + test gap sections.
   - **Status:** **Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** `package.json` includes `test`; `npm test` passes with 18 tests.

2. **Build breakage via ContentDrawer barrel mismatch**
   - Source refs: 2026-02-10 high-risk finding.
   - **Status:** **Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** `npm run build` passes.

3. **Lint gate breakage from explicit `any` patterns**
   - Source refs: 2026-02-10 high-risk finding.
   - **Status:** **Superseded**
   - **Confidence:** **Verified**
   - **Current evidence:** current lint output has 0 errors and only two `react-refresh/only-export-components` warnings; the prior `any`-error finding no longer maps to current top lint blockers.

4. **Lint warning hotspots (`react-refresh/only-export-components`)**
   - Source refs: 2026-02-11, 2026-02-21 top issues.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** warnings remain in `src/components/ContentDrawer/index.tsx` and `src/content/ContentContext.tsx`.

### B) Architecture boundaries / convergence

5. **Doc-engine vs app-content boundary hardening**
   - Source refs: 2026-02-14 folder-organization health check; 2026-02-20 convergence check.
   - **Status:** **Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** prior extraction-prep moves/checks are already recorded as completed; canonical resolver path remains adapter -> registry.

6. **Resolver split-brain / duplicate policy ownership risk**
   - Source refs: 2026-02-10, 2026-02-11, 2026-02-21.
   - **Status:** **Partially Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** single app-facing adapter exists, but `contentResolutionAdapter` still maps `no_provider` to drawer-specific `unsupported_namespace`, so policy narrowing remains adapter-specific and can drift if contracts evolve.

7. **Unsupported namespace handling clarity**
   - Source refs: 2026-02-21 risks around namespace mapping semantics.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** drawer logic still treats `unsupported_namespace` and `no_provider` branches together for user-facing fallback copy.

### C) Maintainability hotspots / module concentration

8. **Build surface logic as a maintainability hotspot (“god file”)**
   - Source refs: 2026-02-10/11/21 top issues and refactor recommendations.
   - **Status:** **Partially Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** `BuildSurface.logic.ts` remains large (435 LOC), though smaller than older baseline snapshots.

9. **Header logic concentration risk**
   - Source refs: 2026-02-21 top issues.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** `GlobalHeaderShell.logic.ts` remains a large multi-domain hook module (335 LOC).

10. **GlobalHeader knowledge corpus hotspot**
   - Source refs: 2026-02-10/11 concern around mixed schema + large corpus.
   - **Status:** **Partially Resolved**
   - **Confidence:** **Inferred**
   - **Current evidence:** file size is now materially smaller (174 LOC), and docs content appears moved into content packs; still requires fresh baseline to confirm all schema/content concerns are fully addressed.

11. **Drawer branch duplication (invalid/missing/unsupported/found shells)**
   - Source refs: 2026-02-11 and 2026-02-21 refactor recommendations.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** `ContentDrawer.tsx` still contains repeated shell/header markup across non-happy-path branches.

### D) Reliability / observability

12. **Recoverable-error observability inconsistency**
   - Source refs: 2026-02-10/11/21.
   - **Status:** **Partially Resolved**
   - **Confidence:** **Verified**
   - **Current evidence:** persistence wrappers report via reporter callbacks, but interaction utilities still have silent catches with limited diagnostics.

13. **SSR/test-environment brittleness (`window.matchMedia`)**
   - Source refs: 2026-02-11/21.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** `useInitialDarkPreference` directly calls `window.matchMedia` without guard.

### E) Docs/DevEx posture

14. **Missing single runtime architecture ownership map**
   - Source refs: 2026-02-11 and 2026-02-21 docs gaps.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** no `doc/Architecture/Runtime-Ownership-Map.md` found.

15. **Missing local testing-strategy source-of-truth doc**
   - Source refs: 2026-02-11 and 2026-02-21 docs gaps.
   - **Status:** **Still Open**
   - **Confidence:** **Verified**
   - **Current evidence:** no `doc/Testing/Strategy.md` found.

16. **Conventions drift severity from earliest baseline reviews**
   - Source refs: 2026-02-10 conventions drift notes.
   - **Status:** **Unclear / Needs Fresh Baseline Review**
   - **Confidence:** **Not Checked**
   - **Current evidence:** this pass focused on prior specific findings and did not re-run a full CCPP/CCS/NL parity census across all configurations.

---

## 4) Summary Counts (Prior Findings Reconciled)

- **Total normalized prior findings reviewed:** 16
- **Resolved:** 3
- **Partially Resolved:** 4
- **Still Open:** 7
- **Superseded:** 1
- **Unclear / Needs Fresh Baseline Review:** 1

---

## 5) Current Unresolved / Partial Priorities (Required)

1. **Still Open — Lint warning hotspots in component/context barrels**
   - Priority: High (quality-gate hygiene)
   - Recommended next pass: **Short verification/delta pass** (lint-warning elimination).

2. **Still Open — Header/build logic concentration + drawer duplication**
   - Priority: High (maintainability + regression risk)
   - Recommended next pass: **Specialized pass** (module-boundary extraction + minimal contract tests).

3. **Partially Resolved — Resolver policy narrowing in adapter**
   - Priority: Medium-High (contract clarity during evolution)
   - Recommended next pass: **Convergence/contract pass** (lock resolver policy boundaries).

4. **Partially Resolved — Recoverable error observability coverage**
   - Priority: Medium
   - Recommended next pass: **Short delta pass** (error-reporting standardization for non-fatal catches).

5. **Still Open — SSR/test safety for theme preference hook**
   - Priority: Medium-Low
   - Recommended next pass: **Short delta pass** (browser guard + test case).

6. **Still Open — Missing runtime ownership map + testing strategy doc**
   - Priority: Medium-Low
   - Recommended next pass: **Short documentation delta pass**.

---

## 6) Superseded Findings Log (Recommended)

1. **Old explicit-any lint-breaker finding (2026-02-10)**
   - Superseded rationale: current lint profile no longer reports that failure class as an active error blocker; remaining lint issues are different (react-refresh warnings).

---

## 7) Traceability / Ambiguity Notes (Optional)

- The broad “conventions drift” claim in earliest baseline docs is too general to reclassify confidently without a fresh full NL/CCPP/CCS parity sweep.
- If that drift status must be definitive, run a **fresh Long Health Check baseline** focused on convention parity mapping by configuration/shell.

---

## 8) Verification and Execution Log (Required)

### Checks run
- `npm test` → pass (18 passing tests).
- `npm run lint` → pass with 2 warnings (`react-refresh/only-export-components`).
- `npm run build` → pass.

### Docs reviewed
- All seven source health-check docs listed in Section 2.

### Files/areas inspected for reconciliation evidence
- `package.json`
- `src/tabs/build/BuildSurface.logic.ts`
- `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts`
- `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`
- `src/components/ContentDrawer/ContentDrawer.tsx`
- `src/components/ContentDrawer/index.tsx`
- `src/content/contentResolutionAdapter.ts`
- `src/content/ContentContext.tsx`
- `src/shared/interaction/usePointerDrag.ts`
- `src/tabs/build/buildSurfacePersistence.ts`
- `src/App.logic.ts`
- `doc/Architecture/` index of current architecture docs

### Not checked
- Full project-wide CCPP/CCS/NL parity audit for every config/shell.
- UI-level manual regression pass of all interaction flows.

---

## 9) Backfill Acceptance Statement

Prior health check findings from pre-V2 baseline-style docs were reconciled against current repo reality, each normalized finding was status-classified with evidence confidence, and a current prioritized unresolved/partial list was produced.
