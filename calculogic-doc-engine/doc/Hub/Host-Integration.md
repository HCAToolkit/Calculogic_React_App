# Host Integration Guide

This guide describes how a host application integrates with `@calculogic/doc-engine` while keeping the package UI-agnostic.

## What the package provides

- Namespace parsing and addressing helpers (`parseContentRef`, `splitNamespace`).
- Provider registry and resolver pipeline (`ContentProviderRegistry`).
- Request/response contracts:
  - `ContentResolutionRequest`
  - `ContentResolutionResult` + result unions (`found`, `invalid_ref`, `no_provider`, `missing_content`)
- Reusable content-node schema contracts (`ContentMeta`, `ContentBlock`, `ContentSection`, `ContentNode`).

## What the host app must provide

- Concrete namespace provider implementations (`ContentProvider`) for host-owned data sources.
- Payload shapes and mappings for each namespace.
- Provider registration wiring at app composition boundaries.

## Minimal integration example

```ts
import { ContentProviderRegistry, type ContentProvider } from '@calculogic/doc-engine';

const docsProvider: ContentProvider = {
  resolveContent: ({ contentId, anchorId }) => {
    const payload = resolveDocsPayload(contentId);
    if (!payload) {
      return {
        type: 'missing_content',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry not found.',
      };
    }

    return {
      type: 'found',
      namespace: 'docs',
      contentId,
      anchorId,
      payload,
    };
  },
};

const registry = new ContentProviderRegistry();
registry.registerProvider('docs', docsProvider);

const result = registry.resolveContent({
  contentId: 'docs:some-id',
  anchorId: 'overview',
});
```

## UI responsibility guidance

- UI components, state stores/contexts, and rendering policy are host concerns.
- If shared UI is needed later, publish a separate adapter/UI package rather than adding React dependencies to `@calculogic/doc-engine`.
