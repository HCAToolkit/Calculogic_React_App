# Doc Engine Core Package Extraction + Repoint Imports Checklist

Use this checklist when moving doc-engine **core package boundaries** into an external package (planned name: `@calculogic/doc-engine`).

## 1) Public API surface to preserve

The core package should export the same API currently provided by `src/doc-engine/index.ts`:

- `ContentProviderRegistry`
- `splitNamespace`
- `ContentNode`
- `ContentProvider`
- `ContentResolutionRequest`
- `NotFound`

## 2) Interface import rule after extraction

In the interface app, import doc-engine APIs from the package root only:

- ✅ `import { ContentProviderRegistry } from '@calculogic/doc-engine';`
- ❌ `import { ContentProviderRegistry } from '@calculogic/doc-engine/registry';`
- ❌ `import type { ContentProvider } from '@calculogic/doc-engine/types';`

Until extraction is complete, keep using the same discipline with the local barrel:

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

## 4) Repointing steps (core package)

1. Create `@calculogic/doc-engine` with the `src/doc-engine/*` **core** module contents.
2. Publish/consume package in the interface repository.
3. Replace local imports from `src/doc-engine/index.ts` with `@calculogic/doc-engine`.
4. Keep provider registration in app composition (for example, `src/content/contentEngine.ts`).
5. Run tests to ensure registry behavior (`namespaced ids`, provider resolution, normalized misses) still passes.

## 5) Runtime/service note (separate phase)

Runtime/service extraction is a separate phase decision:
- It may become a standalone doc-engine runtime service, or
- It may be merged into the headless runtime engine.

DB adapters, governance/search/indexing, and official runtime providers are **not** required to move during core package extraction.
