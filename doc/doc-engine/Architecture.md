# Doc Engine Architecture (Interface Repo Phase)

## Goal

Deliver a fully operational right-side generic Content Drawer in the Interface repo before extracting doc-engine code to another repository.

Canonical identity/deployment/ownership model: see `Identity-Deployment-Ownership.md` in this hub.

## Boundary

### Stays host/UI (Interface repo)

- Drawer shell/UI composition
- Open/close state orchestration
- Provider registration wiring
- Host-specific providers and app-specific content packs

### Belongs to doc-engine core package boundary

- Content schema/contracts package
- Resolver and normalization utilities
- Provider registry and deterministic routing helpers
- Provider interfaces and normalized outcome semantics

### Belongs to doc-engine runtime/service boundary (optional)

- Official/runtime providers that require DB/governance/search/indexing
- DB adapters and policy/governance enforcement
- Runtime API surface for remote resolution
- Deployment target may be standalone service or merged into headless runtime engine

## Core components

1. **Content Drawer UI (Host-owned shell)**
   - Generic renderer for normalized `ContentNode`/DocNode blocks/sections.
2. **Provider Registry (Core)**
   - Namespace-routed providers (`docs:*`, `knowledge:*`, etc.).
3. **Resolver (Core)**
   - Deterministic `resolveContent` pipeline returning normalized outcomes.
4. **Static Docs Provider (Host/provider class example)**
   - In-memory registry for builder docs.
5. **Future Providers (Qualified by provider class)**
   - Host-specific providers stay with host/UI repo.
   - Official/runtime providers may move with runtime/service extraction.
   - Plugin providers can remain third-party and contract-compatible.

## Deterministic routing model

- Parse namespace from `contentId`.
- Resolve via matching provider.
- Apply optional anchor targeting.
- Return normalized output; do not mutate provider source.
