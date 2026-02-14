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

### Extraction staging area (implemented)
- `src/doc-engine/*` is now the in-repo staging area for future package extraction.
- Runtime rule: doc-engine runtime modules must not import UI feature code from `src/components/*` or `src/tabs/*`.

## Target Architecture (Platform-aligned)

This plan assumes a **provider + pack** model so the doc engine can be reused across multiple UIs (web/native) and can evolve toward multi-provider search without rewriting core contracts.

### A) `@calculogic/doc-engine` (core runtime)
**Scope:** stable, reusable, UI-agnostic library.

Responsibilities:
- Define canonical types and invariants:
  - `ContentId` (namespaced IDs like `docs:doc-build`)
  - canonical result union discriminant: `type: 'content' | 'not_found'`
  - `ContentNode` / `NotFound` shapes
- Provider contracts (plugins/adapters implement these):
  - `resolveContent({ contentId, anchorId?, context? })`
  - optional `search({ query, filters?, limit? })` (future)
- `ContentProviderRegistry` orchestration:
  - routes by namespace
  - merges/normalizes provider results
  - guarantees deterministic `not_found` semantics
- Pure helpers (no side effects):
  - namespacing utilities (e.g. `splitNamespace`)
  - ID parsing and validation helpers

Non-responsibilities (explicit):
- No UI components, no React, no app state
- No side-effect provider registration
- No assumption that docs “live in the app repo”
- No required ownership of catalog/content data (content comes from providers)

### B) Providers (adapters / plugins)
Providers define *where content comes from* and how it is loaded.

Examples (not required for MVP):
- In-memory catalog provider (dev/demo content)
- Filesystem / Git provider (docs in a separate repo or local workspace)
- Database provider (published user content, knowledge bases, etc.)
- Search-index provider (Meilisearch/Elastic/etc.) for multi-provider search

Providers may be shipped by plugins.

### C) Content packs (docs content)
“Packs” are content sources that providers read from:
- official docs repo/package
- plugin docs packs (namespaced)
- user-generated docs stored in DB (published)
- curated knowledge base docs

Core doc-engine does not own packs; it only resolves IDs through providers.

## Composition ownership (App layer)

The **host application owns composition**:
- It chooses which providers are enabled.
- It registers providers in an app-level composition root (e.g. `src/content/contentEngine.ts`).
- It may ship a small adapter layer for UI view models, but the doc-engine contract (`type: 'content' | 'not_found'`) remains canonical at the engine boundary.

This ensures the same `@calculogic/doc-engine` package can be reused by:
- the current web UI
- a future native mobile UI
- other clients (CLI tools, admin panels, plugin UIs)
without re-implementing the engine.

## Updated Extraction Steps (Provider + Pack aligned)

### Step 0 — Core must be side-effect free (precondition)
- `@calculogic/doc-engine` exports types, registry, helpers, and provider contracts.
- It does not create singletons or register providers on import.

### Step 1 — App owns provider wiring (precondition)
- The app creates a registry singleton in an app composition root.
- The app registers providers there (e.g. `docs` provider).

### Step 2 — Decide where catalogs live (temporary vs long-term)
Choose one:
- **Temporary:** keep current in-repo catalogs while extracting the engine.
- **Long-term:** move docs content into a separate “docs pack” repo/package and load via a provider.

Do NOT bake app-specific catalogs into core as a permanent requirement.

### Step 3 — Create the doc-engine repo/package
- Create a new repo (e.g. `HCAToolkit/calculogic-doc-engine`).
- Copy `src/doc-engine/**` into the package with a narrow public API (`src/index.ts`).
- Add package build output (ESM + types).

### Step 4 — Repoint app imports
- Replace `src/doc-engine/*` imports with the package import (e.g. `@calculogic/doc-engine`).

### Step 5 — Keep one integration test in the host app
- Verify a known `docs:*` id resolves to `type: 'content'`.
- Verify an unknown id resolves to `type: 'not_found'`.
This guards the engine/app boundary during future refactors.

## Why this boundary is clean

- The doc engine is reusable across multiple UI surfaces because composition remains in the host app.
- Provider contracts separate engine behavior from content storage choices.
- Canonical `type: 'content' | 'not_found'` semantics keep integrations deterministic.

## Plugin alignment (Providers + Packs)

Plugins may ship:
- **Providers** (new namespaces or new storage backends)
- **Content packs** (docs content owned by the plugin)

Namespacing guidance:
- Keep IDs namespaced and collision-safe (examples):
  - `docs:official:getting-started`
  - `docs:plugin-x:overview`
  - `kb:community:enneagram:type-5`
  - `forms:published:abc123:docs`

The doc engine remains the stable contract; plugins extend the ecosystem via providers/packs.

## CCPP Alignment Checklist for Doc Engine Work

When you add or refactor doc-engine code, keep these CCPP requirements in scope:
- File headers must include the NL source, responsibility, and invariants.
- Section headers must mirror NL skeleton ordering.
- Atomic comments must precede each Container/Subcontainer/Primitive.
- Decision notes and TODOs must follow the CCPP format (owner + date).
- Provenance blocks only when external sources influence logic.

Reference: `doc/ConventionRoutines/CCPP.md`.

## Modal MVP Plan (Before Extraction)

To validate the doc engine inside this repo, implement a minimal modal flow:
1. **Trigger**: reuse `openDoc(docId)` from the header shell logic.
2. **Resolve**: resolve by content ID and branch on `type: 'content' | 'not_found'`.
3. **Render**: show title, summary, and sections (heading + body list) when content exists.
4. **Close**: add `closeDoc()` handler, escape key support, and focus return.
5. **Accessibility**: apply `role="dialog"`, `aria-modal="true"`, and focus trap.

This keeps the UI and doc engine behavior stable before extracting catalogs into separate packs/providers.

## Doc-Engine Standards and Documentation Hub

A dedicated in-repo documentation hub now exists for standards alignment and implementation planning:
- `doc/doc-engine/README.md`
- `doc/doc-engine/StandardsSummary.md`
- `doc/doc-engine/ContributionChecklist.md`
- `doc/doc-engine/Architecture.md`
- `doc/doc-engine/Contracts.md`
- `doc/doc-engine/ContentDrawerMVP.md`
- `doc/nl-doc-engine/cfg-contentDrawer.md`
