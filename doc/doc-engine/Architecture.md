# Doc Engine Architecture (Interface Repo Phase)

## Goal
Deliver a fully operational right-side generic Content Drawer in the Interface repo before extracting doc-engine code to another repository.

## Boundary
### Stays in Interface repo
- Drawer shell/UI composition
- Open/close state orchestration
- Provider registration wiring

### Moves to doc-engine repo later
- Content schema package
- Providers (docs, knowledge DB, config/form/quiz extraction)
- Resolver and normalization utilities

## Core components
1. **Content Drawer UI**
   - Generic renderer for normalized `ContentNode` blocks/sections.
2. **Provider Registry**
   - Namespace-routed providers (`docs:*`, `knowledge:*`, etc.).
3. **Resolver**
   - Deterministic `resolveContent` pipeline returning `ContentNode | NotFound`.
4. **Static Docs Provider (Phase 0)**
   - In-memory registry for builder docs.
5. **Future Providers (Phase 1+)**
   - Governed Knowledge DB provider.
   - Config/form/quiz metadata extraction provider.

## Deterministic routing model
- Parse namespace from `contentId`.
- Resolve via matching provider.
- Apply optional anchor targeting.
- Return normalized output; do not mutate provider source.
