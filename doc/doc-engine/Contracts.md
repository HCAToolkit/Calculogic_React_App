# Doc Engine Contracts

Canonical terminology and boundary model: see `Identity-Deployment-Ownership.md`.

## Content Addressing
- `contentId` (aka doc identity key): stable identifier with namespace prefix.
  - Examples: `docs.builder.logic.overview`, `knowledge.public.naming.guide`
- `anchorId`: optional stable heading/block identifier.

## Provider interface (conceptual)
- `supports(contentId: string): boolean`
- `resolve(input: { contentId: string; anchorId?: string; context?: Record<string, unknown> }): ContentNode | NotFound`

## Resolver interface (conceptual)
- `resolveContent(input) -> ContentNode | NotFound`
- Deterministic behavior, no side effects.

## Normalized ContentNode shape (minimum)
- `contentId: string`
- `meta: { title, summary?, artifactType, tags[], keywords[], conceptIds[], intentTags[], sourceTier, visibility, status, scope, version }`
- `content: { headings[], blocks[] }`

## ContextEnvelope (optional)
Used for analytics and routing without changing content identity.

```
{
  "uiArea": "builder.logic",
  "controlId": "logicRuleEditor",
  "projectType": "form",
  "mode": "edit"
}
```

## Contract stability across embedded + remote deployments
- **Embedded deployment**: host imports core and `resolveContent()` returns normalized outcomes in-process.
- **Remote deployment**: host calls runtime API (HTTP/IPC) and receives the same normalized outcome shape.
- Deployment location must not change contract semantics; only transport/location changes.

Normalized outcome classes to preserve across both modes:
- `Found`
- `Missing`
- `NoProvider`
- `InvalidRef`

## Provider classes and ownership
- **Host providers (UI repo)**: app-specific docs, workflow-specific packs, and local integrations.
- **Official providers (doc-engine/runtime)**: centrally maintained providers for governed/runtime-backed stores.
- **Plugin providers (third party)**: external providers that implement the same provider contract.

## Extraction staging contract (current)
- Core-package implementation is staged in `src/doc-engine/*` as the future package lift boundary.
- Modules in this boundary must not import from `src/components/*` or `src/tabs/*`.
- Default app wiring registers a host `docs` provider so existing ids (for example `docs:doc-build`) remain valid.
- Runtime/service extraction is a later topology decision and may be merged into the headless runtime engine.
