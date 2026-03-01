# Doc Engine Core Package Extraction + Repoint Imports Checklist

Use this checklist for doc-engine **core package boundaries** now that local package extraction is complete. Publishing/consumption as `@calculogic/doc-engine` is a later phase.

## 1) Public API surface to preserve

The core package should preserve the API currently exported by `calculogic-doc-engine/src/index.ts`:

- `ContentProviderRegistry`
- `parseContentRef`
- `splitNamespace`
- `ContentProvider`
- `ContentResolutionRequest`
- `ContentResolutionResult`
- `NotFound`
- `FoundContent`, `MissingContent`, `NoProvider`, `InvalidRef`, `ParsedContentRef`

## 2) Interface import rule after extraction

In the interface app, import doc-engine APIs from the package root only:

- ✅ `import { ContentProviderRegistry } from '@calculogic/doc-engine';`
- ❌ `import { ContentProviderRegistry } from '@calculogic/doc-engine/registry';`
- ❌ `import type { ContentProvider } from '@calculogic/doc-engine/types';`

The host app currently still uses shims under `src/doc-engine/*` (thin re-exports). Until host imports are repointed, keep using the same discipline with the local barrel:

- ✅ `from '../doc-engine/index.ts'`
- ❌ `from '../doc-engine/registry.ts'`
- ❌ `from '../doc-engine/types.ts'`

## 3) Explicitly not part of core package

Do **not** move these into `@calculogic/doc-engine` core package:

- App content providers under `src/content/providers/*`
- App content packs under `src/content/packs/*`
- UI adapters/composition under `src/content/*`
- UI drawer components under `src/components/ContentDrawer/*`

These are host-app responsibilities that consume doc-engine contracts.

## 4) Repointing steps (host import migration)

1. Keep `calculogic-doc-engine/src/*` as the source of truth for core modules.
2. Publish/consume package in the interface repository when ready.
3. Replace host imports from `src/doc-engine/index.ts` shims with `@calculogic/doc-engine`.
4. Keep provider registration in app composition (for example, `src/content/contentEngine.ts`).
5. Run tests to ensure registry behavior (`namespaced ids`, provider resolution, normalized misses) still passes.

## 5) Runtime/service note (separate phase)

Runtime/service extraction is a separate phase decision:
- It may become a standalone doc-engine runtime service, or
- It may be merged into the headless runtime engine.

DB adapters, governance/search/indexing, and official runtime providers are **not** required to move during core package extraction.
