# Provider / Resolver Contract

## Contract summary

Providers and resolvers communicate through explicit interfaces to keep source ingestion and semantic normalization decoupled.

## Provider responsibilities

A provider must:

- Expose a unique `providerId`.
- Return raw content units with stable `externalId` values.
- Include minimal source metadata (`uri`, `version`, `updatedAt` when available).
- Avoid view-specific transformations.

### Provider output shape (conceptual)

```ts
interface ProviderRecord {
  providerId: string;
  externalId: string;
  type: string;
  title?: string;
  body?: unknown;
  links?: Array<{ rel: string; targetExternalId: string }>;
  source: {
    uri: string;
    version?: string;
    updatedAt?: string;
  };
  metadata?: Record<string, unknown>;
}
```

## Resolver responsibilities

A resolver must:

- Accept a list of `ProviderRecord` entries.
- Emit one or more valid `ContentNode` entries.
- Map provider-specific types into canonical node kinds.
- Resolve relationships and preserve provenance.
- Report recoverable issues (e.g., dangling links) without hard-failing entire batches.

### Resolver output shape (conceptual)

```ts
interface ResolverResult {
  nodes: ContentNode[];
  warnings?: Array<{
    code: string;
    message: string;
    providerId?: string;
    externalId?: string;
  }>;
}
```

## Compatibility rules

- Contract changes must be additive when possible.
- Any breaking change requires version bump in both provider and resolver package boundaries.
- Resolvers should ignore unknown provider fields.
- Providers should tolerate resolver-side optional metadata extensions.
