# ContentNode Schema

## Intent

`ContentNode` is the canonical schema used by Doc Engine to represent resolved, render-ready documentation entities.

## Type definition (MVP)

```ts
export interface ContentNode {
  id: string; // globally unique, stable across refresh when source is unchanged
  kind: 'topic' | 'section' | 'example' | 'reference' | 'note';
  title: string;
  summary?: string;
  body?: string; // markdown/plain text for MVP

  parentId?: string;
  childIds?: string[];
  relatedIds?: string[];

  tags?: string[];
  status?: 'draft' | 'published' | 'deprecated';

  source: {
    providerId: string;
    externalId: string;
    uri?: string;
    version?: string;
    updatedAt?: string;
  };

  metadata?: Record<string, unknown>;
}
```

## Field requirements

- Required: `id`, `kind`, `title`, `source.providerId`, `source.externalId`.
- Optional but recommended: `summary`, `body`, `relatedIds`, `tags`.
- `id` must remain stable for unchanged provider content to support caching and UI state retention.

## Validation rules (MVP)

- `childIds` cannot include `id` (no self-reference).
- `parentId` must reference an existing node when present.
- `relatedIds` may reference missing nodes but should emit a resolver warning.
- Unknown `metadata` fields are allowed.
