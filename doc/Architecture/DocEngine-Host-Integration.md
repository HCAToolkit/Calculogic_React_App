# Doc-Engine ↔ Host Integration Map (This Repository)

This document records the concrete call chain used by this host app to integrate with `@calculogic/doc-engine`.

## Package boundary rule

The host consumes doc-engine through `@calculogic/doc-engine` package-root exports only.
No deep imports from package internals are used in host runtime code.

## Call chain in this repository

1. **Registry composition** — `src/content/contentEngine.ts`
   - Instantiates `ContentProviderRegistry`.
   - Registers host-provided namespace providers.

2. **Provider implementation** — `src/content/providers/docs.logic.ts`
   - Implements docs namespace provider behavior (`ContentProvider`).
   - Resolves host knowledge payloads for docs IDs.

3. **Adapter boundary** — `src/content/contentResolutionAdapter.ts`
   - Calls `contentProviderRegistry.resolveContent(...)`.
   - Narrows outcomes for drawer-specific UX states (for example, unsupported namespace handling).

4. **State and interaction wiring** — `src/content/ContentContext.tsx`
   - Manages selected content id/anchor and open-close behavior.
   - Triggers adapter resolution for active drawer content.

5. **UI rendering** — `src/components/ContentDrawer/ContentDrawer.tsx`
   - Renders drawer states from adapter results.
   - Handles anchor scrolling and in-drawer navigation interactions.

## Integration invariants

- Doc-engine package provides registry/parser/contracts; host provides providers and UI.
- Resolver returns deterministic union results consumed by host adapter/UI.
- UI concerns remain in host repo; package remains framework-agnostic.
