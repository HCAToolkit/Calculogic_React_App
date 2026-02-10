# Repository Health Review — 2026-02-10

## Scope and method
- Reviewed architecture, representative modules, and runtime/tooling contracts across app shell, build surface, global header, and content drawer subsystems.
- Executed quality checks via `npm run lint` and `npm run build`.

## 1) Architecture map

### Subsystems and responsibilities
1. **Shell / App frame** (`src/main.tsx`, `src/App.tsx`, `src/App.logic.ts`)
   - Mounts React app, provides top-level shell composition, theme state, and context boundaries.
2. **Global header shell** (`src/components/GlobalHeaderShell/*`)
   - Knowledge file provides tabs/modes/docs metadata.
   - Logic file orchestrates active tab/mode, hover state, breakpoints, publish callback, and content drawer triggers.
   - Build + Results files render navigation and diagnostics/live announcements.
3. **Build tab surface** (`src/tabs/build/*`, `src/tabs/BuildTab.tsx`)
   - Build file renders layout and sections.
   - Logic file manages section heights, drag interactions, keyboard resizing, and localStorage persistence.
   - Anchors file centralizes public anchor ids.
4. **Content drawer runtime** (`src/content/*`, `src/content-drawer/*`, `src/components/ContentDrawer/*`)
   - Context tracks active content and anchor.
   - `contentProviders.ts` resolves docs content for the drawer.
   - `ContentProviderRegistry.ts` implements a parallel provider-registry abstraction (currently not used by drawer view).

### Data/control flow
- `main.tsx` mounts `<App/>`.
- `App` composes `ContentProvider`, `GlobalHeaderShell`, `BuildTab`, and `ContentDrawer`.
- `GlobalHeaderShell.logic` calls `openContent/closeContent` from `ContentContext`.
- `ContentDrawer` listens to `activeContentId` and resolves content via `resolveContent(...)` from `src/content/contentProviders.ts`.
- Build surface state is local to hooks in `BuildSurface.logic.ts` and persisted in localStorage.

### Key architecture observations
1. The codebase follows a clear concern split (Build/Logic/Knowledge/Results) and consistent naming, which improves local discoverability.
2. **God modules exist** in `BuildSurface.logic.ts` (566 LOC) and `GlobalHeaderShell.knowledge.ts` (420 LOC); each carries multiple reasons to change.
3. There are **parallel content-resolution paths** (`contentProviders.ts` and `ContentProviderRegistry.ts`) that are intentionally split during extraction; convergence is still needed on one normalized runtime API.
4. Boundary ownership is mostly clear, but `ContentDrawer` currently imports the simpler resolver path directly, bypassing the registry abstraction.
5. No obvious circular imports detected in sampled files; dependency direction is mostly downward (shell → feature logic → knowledge/constants).
6. State and side effects are mostly localized in hooks, but event listener logic is repeated in multiple resizing hooks.
7. LocalStorage and JSON parse failures are silently ignored in several places, reducing debuggability.
8. Build system currently fails due to a barrel-export mismatch in `src/components/ContentDrawer/index.tsx`.

## 2) Code health assessment

### Strengths
- Strong file-level documentation and explicit invariants in headers.
- Consistent naming for concern files (`*.build.tsx`, `*.logic.ts`, `*.knowledge.ts`, `*.results.tsx`).
- Hooks and bindings pattern is generally cohesive and easy to trace.

### Smells and maintainability issues
- **Overloaded modules**:
  - `BuildSurface.logic.ts` contains section logic + left/right panel logic + persistence + keyboard/drag handlers.
  - `GlobalHeaderShell.knowledge.ts` mixes types, tab metadata, mode metadata, and full documentation corpus.
- **Transitional dual-path abstraction**:
  - `resolveContent(...)` currently acts as an in-repo convenience adapter while `ContentProviderRegistry` is the extraction-ready canonical design; contract convergence is still required at the UI boundary.
- **Inconsistent public API contracts**:
  - `src/components/ContentDrawer/index.tsx` re-exports named symbols not present in default-exported `ContentDrawer` file.
- **Error reporting gaps**:
  - localStorage/JSON parsing catches suppress context (`catch {}`), making production diagnosis harder.
- **Conventions drift**:
  - README states Jest/RTL and a different project structure than what the repository actually includes.

## 3) Stability & correctness risk scan

### High-risk findings
1. **Build breakage**: `src/components/ContentDrawer/index.tsx` exports non-existent named exports/types, causing `tsc -b` failure.
2. **Lint gate breakage**: `BuildSurface.logic.ts` uses `as any` for event listener registration/removal across multiple lines, failing `@typescript-eslint/no-explicit-any`.

### Medium-risk findings
3. Silent fallbacks in localStorage parsing/writes across panel/section hooks can mask corrupted persisted state.
4. Registry + adapter split is intentional for MVP iteration, but still creates short-term convergence risk until both paths share one normalized contract.
5. Large stateful hooks increase regression risk when extending drag/resize behaviors.

### Boundary handling observations
- Guarding is generally present for absent content (`if (!activeContentId) return null`, missing-provider fallback shell).
- Anchor scrolling properly checks element existence before scroll.
- There is minimal contextual error propagation for malformed payloads.

## 4) Test strategy and coverage gaps

### Current state
- No test files detected (`test/spec` patterns absent).
- No `test` script in `package.json`.

### Prioritized test backlog (high to lower priority)
1. **Unit**: `splitNamespace` parser in `ContentProviderRegistry` for valid/invalid ids.
2. **Unit**: `resolveContent` in `contentProviders.ts` for doc hit/miss/unknown provider.
3. **Unit**: `toAnchorId` normalization in `ContentDrawer.tsx` with punctuation/whitespace edge cases.
4. **Unit**: `determineBreakpoint` in `GlobalHeaderShell.logic.ts` boundary values.
5. **Unit**: `sectionTitle` and clamp behavior in `BuildSurface.logic.ts`.
6. **Unit**: reducer-like transitions for tab/mode state (select tab, hover tab, select mode).
7. **Integration (React Testing Library)**: GlobalHeader tab interactions update mode menu and announce state changes.
8. **Integration**: Clicking doc info opens drawer and renders correct doc payload.
9. **Integration**: Drawer related-link button updates active doc id and content.
10. **Integration**: Build surface keyboard resizing updates styles and persisted localStorage values.
11. **Integration**: Restoring from localStorage with malformed JSON falls back safely and reports diagnostics.
12. **Contract tests**: Header doc definitions satisfy minimal schema (id/title/sections/link docIds).

## 5) Documentation & developer experience

### Findings
- README tech stack is stale (claims React 18 + Jest/RTL/Prettier) vs package dependencies (React 19, no Jest/RTL/Prettier).
- README project structure references directories (`builder/`, `engine/`) that do not match current `src/` layout.
- CI/quality expectations are unclear because lint/build currently fail in default state.
- Good internal docs exist (`doc/`, `docs/`) but no concise architecture source-of-truth for runtime module ownership and resolver strategy.

## 6) Refactoring opportunities (incremental)

1. **Unify content resolution pipeline**
   - Impact: Removes duplicated abstractions and reduces divergence risk.
   - Risk: Medium.
   - Effort: 1–2 days.
   - Safe sequence:
     1) Introduce adapter so `ContentDrawer` calls registry API.
     2) Port current `docsProvider` behavior into registry provider.
     3) Deprecate/remove `contentProviders.ts` after behavior parity tests.

2. **Extract reusable drag listener hook**
   - Impact: Reduces repeated logic in section/left/right panel handlers.
   - Risk: Medium.
   - Effort: 1 day.
   - Safe sequence:
     1) Add tested internal utility hook for pointer/keyboard drag handling.
     2) Migrate one panel first.
     3) Migrate remaining panels; compare behavior snapshots.

3. **Split GlobalHeader knowledge corpus**
   - Impact: Improves maintainability and reviewability.
   - Risk: Low.
   - Effort: 0.5–1 day.
   - Safe sequence:
     1) Move docs payload to `GlobalHeaderShell.docs.ts`.
     2) Keep type exports centralized.
     3) Update imports with no behavioral change.

### API sketch (before/after)
- Before:
  - `resolveContent(contentId: string): ContentResolution | null`
  - `contentProviderRegistry.resolveContent({ contentId, anchorId }): ContentNode | NotFound`
- After:
  - `resolveContent(request: ContentResolutionRequest): ContentNode | NotFound`
  - single implementation behind `contentProviderRegistry`, with one normalized result type used by `ContentDrawer`.

## 7) Top 10 issues (ranked)

1. **High** — Build fails due to invalid `ContentDrawer` barrel exports (`src/components/ContentDrawer/index.tsx`).
2. **High** — Lint fails due to repeated `any` casts in drag listener registration (`src/tabs/build/BuildSurface.logic.ts`).
3. **High** — No automated tests or test script; critical interaction logic is unguarded (`package.json`, `src/tabs/build/*`, `src/components/*`).
4. **Medium** — Transitional resolver split (canonical registry + temporary adapter) needs a defined convergence checkpoint to avoid contract drift (`src/content/contentProviders.ts`, `src/content/ContentProviderRegistry.ts`).
5. **Medium** — God-module size in `BuildSurface.logic.ts` increases change risk and cognitive load.
6. **Medium** — Knowledge file mixes schemas and large content corpus (`GlobalHeaderShell.knowledge.ts`).
7. **Medium** — Silent catch blocks reduce operational visibility for storage/parsing failures (`App.logic.ts`, `BuildSurface.logic.ts`, `ContentProviderRegistry.ts`).
8. **Medium** — README accuracy gaps (tech stack and structure) harm onboarding (`README.md`, `package.json`, actual `src/`).
9. **Low** — Content drawer fallback states are duplicated in JSX and could be simplified (`ContentDrawer.tsx`).
10. **Low** — Weakly typed storage keys and payload shapes increase accidental mismatch risk (`BuildSurface.logic.ts`).

## 8) Next-steps roadmap

### Immediate (1–2 days)
1. Fix `ContentDrawer/index.tsx` export contract so TypeScript build passes.
2. Remove `any` event casts in resize handlers to make lint pass.
3. Update README tech stack + project structure to match reality.
4. Add a baseline test runner (`vitest` or Jest) and `npm test` script.

### Near-term (1–2 weeks)
1. Add tests for content resolution, breakpoint derivation, and resizing logic.
2. Converge UI calls onto the canonical provider-registry API; keep adapter delegation only as an explicit transition step.
3. Split oversized logic modules into focused hooks/helpers.
4. Add CI checks for lint/build/test on pull requests.

### Longer-term
1. Introduce typed persistence utility (versioned localStorage payloads + telemetry hooks).
2. Formalize architecture decision records for resolver design and concern boundaries.
3. Expand integration coverage for builder workflows and accessibility regressions.

## 9) Quick wins (small, low-risk)
1. Correct `ContentDrawer` barrel exports.
2. Replace `as any` listener casts with typed listener helpers.
3. Add `npm test` script even before broad coverage.
4. Add `assertNever` in mode/tab switch logic for exhaustiveness.
5. Hoist storage keys into constants enum/object.
6. Replace repeated fallback `<aside>` markup in drawer with a tiny reusable subcomponent.
7. Add debug logging utility for caught storage parse/write failures (DEV-only).
8. Document registry-as-canonical plus adapter transition policy in `doc/doc-engine/README.md`.

## 10) Open questions — clarifications + answers
1. **Is `ContentProviderRegistry` intended to replace `resolveContent` soon, or is it experimental?**  
   **Answer/decision:** `ContentProviderRegistry` is the canonical extraction-ready design for doc-engine content resolution (including plugin/user/official sources). `resolveContent(...)` is a transitional in-repo adapter for UI iteration and should delegate to the registry during convergence, then be removed once the normalized API boundary is fully adopted.

2. **Should docs payload live in code (`GlobalHeaderShell.knowledge.ts`) or external content files?**  
   **Answer/decision:** In-code docs are temporary for iteration speed. Target state is provider-backed resolution by `docId`; UI/engine should not import doc blobs directly. Storage format (TS/JSON/MD/MDX) is secondary to maintaining the provider boundary.

3. **Is SSR a target (beyond defensive checks), affecting current direct `window`/`document` usage patterns?**  
   **Answer/decision:** SSR is not a doc-engine MVP target. Keep modules reasonably import-safe where practical, but runtime can assume browser execution for now.

4. **Should Publish action integrate a backend/API soon (vs local callback/log)?**  
   **Answer/decision:** Keep Publish as a host-provided callback/adapter in MVP. Backend/API integration can be introduced later without making Publish a doc-engine concern.
