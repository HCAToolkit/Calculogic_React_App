# Doc-Engine ↔ Host Ownership Map

This decision record defines ownership boundaries between the host app and `@calculogic/doc-engine`.

## Package-owned (`@calculogic/doc-engine`)

The package owns reusable, UI-agnostic content-resolution contracts and runtime:

- Namespaced content addressing grammar (`namespace:id`).
- Provider registry and resolver pipeline (`ContentProviderRegistry`).
- Request/response contracts (`ContentResolutionRequest`, `ContentResolutionResult` and related unions).
- Reusable normalized content-node schema contracts (`ContentMeta`, `ContentBlock`, `ContentSection`, `ContentNode`) in `calculogic-doc-engine/src/content-node.types.ts`.

## Host-owned (`Calculogic_React_App`)

The app owns UI state, React composition, and provider composition glue:

- React state and interaction wiring (`src/content/ContentContext.tsx`).
- Provider instances and registration composition (`src/content/**`, including `contentEngine.ts` and provider modules).
- Drawer UI rendering and anchor behavior (`src/components/ContentDrawer/**`).

## Directory ownership decisions in this repo

- `src/content/**` is host-owned integration/wiring.
- `src/components/ContentDrawer/**` is host-owned UI implementation.
- Legacy `content-drawer` schema contracts were moved to package ownership in `calculogic-doc-engine/src/content-node.types.ts`.

## Boundary rules

1. Host app consumes doc-engine via package root imports only (`@calculogic/doc-engine`).
2. Doc-engine remains UI-agnostic (no React dependencies in package core).
3. Host-specific adapters can narrow package unions for UI behavior, but must not redefine package contracts.
