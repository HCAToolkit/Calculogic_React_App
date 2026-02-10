# Documentation Engine Extraction Plan

This document maps the current documentation engine signals in the builder UI and proposes a clean extraction boundary for moving the doc engine to a dedicated repository in the future.

## Inventory: Current Doc Engine Touchpoints

### Knowledge layer (content model + source of truth)
- `src/components/GlobalHeaderShell/GlobalHeaderShell.knowledge.ts`
  - Structured doc content model (`HeaderDocDefinition`, sections, links).
  - Tab definitions include `docId` and `hoverSummary`.
  - `resolveHeaderDoc` provides a lookup accessor.

### Logic layer (state + orchestration)
- `src/components/GlobalHeaderShell/GlobalHeaderShell.logic.ts`
  - `activeDocId` tracked in state.
  - `openDoc` and `closeDoc` handlers exposed via bindings.
  - Doc state is already decoupled from rendering.

### Build layer (UI entry points)
- `src/components/GlobalHeaderShell/GlobalHeaderShell.build.tsx`
  - `InfoIcon` triggers `openDoc(tab.docId)`.
  - Tab metadata surfaces `hoverSummary`.

### Results layer (diagnostics)
- `src/components/GlobalHeaderShell/GlobalHeaderShell.results.tsx`
  - Debug panel + live region uses the same shell state; can optionally surface doc state later.

## Extraction Boundary (Proposed)

### 1) New doc-engine package responsibilities
Create a dedicated package/repo that owns the following:
- Doc content model and types (definitions, sections, links).
- Doc catalogs (the actual content data).
- Accessors/resolvers (e.g., `resolveHeaderDoc`).
- Optional helpers for search, indexing, and content normalization.

**Suggested module boundary (future package):**
```
@calculogic/doc-engine
├─ src
│  ├─ types.ts              // HeaderDocDefinition, Section, Link
│  ├─ catalog.ts            // HEADER_DOC_DEFINITIONS (or equivalent registry)
│  ├─ resolvers.ts          // resolveHeaderDoc
│  └─ index.ts              // public exports
```

### 2) Builder UI responsibilities (this repo)
Keep UI wiring and interactions here:
- Doc entry points (icons, buttons, hover summaries).
- `openDoc/closeDoc` state management (or delegate to a hook that consumes the doc-engine).
- Modal or panel rendering (when added).

## Transitional Refactor Steps (Low-risk)

1. **Extract types + catalog**
   - Move doc-related types and data from `GlobalHeaderShell.knowledge.ts` into a dedicated module (even inside this repo first, e.g., `src/doc-engine/`).
2. **Replace inline imports**
   - Swap local `resolveHeaderDoc` and doc definitions with imports from the new module.
3. **Promote to standalone repo**
   - Lift `src/doc-engine/` into the separate repo and repoint imports to the package.

## Why this boundary is clean

- The doc content is already isolated in a single knowledge file.
- The UI only needs `docId` and `hoverSummary` metadata plus a lookup resolver.
- Logic is already expressed via `openDoc/closeDoc`, so the rendering surface can evolve independently.

## Notes for plugin architecture alignment

If the builder tabs become plugin-defined later, the doc-engine can support:
- Plugin-supplied doc catalogs merged at runtime.
- Namespace or owner fields in doc IDs.
- Registration APIs to append docs without modifying core UI code.

## CCPP Alignment Checklist for Doc Engine Work

When you add or refactor doc-engine code, keep these CCPP requirements in scope:
- File headers must include the NL source, responsibility, and invariants.
- Section headers must mirror NL skeleton ordering.
- Atomic comments must precede each Container/Subcontainer/Primitive.
- Decision notes and TODOs must follow the CCPP format (owner + date).
- Provenance blocks only when external sources influence logic.

Reference: `doc/CCPP.md`.

## Modal MVP Plan (Before Extraction)

To validate the doc engine inside this repo, implement a minimal modal flow:
1. **Trigger**: reuse `openDoc(docId)` from the header shell logic.
2. **Resolve**: call the doc resolver for a `HeaderDocDefinition` payload.
3. **Render**: show title, summary, and sections (heading + body list).
4. **Close**: add `closeDoc()` handler, escape key support, and focus return.
5. **Accessibility**: apply `role="dialog"`, `aria-modal="true"`, and focus trap.

This keeps the UI and doc engine behavior stable before extracting the catalog into a separate package/repo.

## Doc-Engine Standards and Documentation Hub

A dedicated in-repo documentation hub now exists for standards alignment and implementation planning:
- `doc/doc-engine/README.md`
- `doc/doc-engine/StandardsSummary.md`
- `doc/doc-engine/ContributionChecklist.md`
- `doc/doc-engine/Architecture.md`
- `doc/doc-engine/Contracts.md`
- `doc/doc-engine/ContentDrawerMVP.md`
- `doc/nl-doc-engine/cfg-contentDrawer.md`
