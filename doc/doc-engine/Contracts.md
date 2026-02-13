# Doc Engine Contracts

## Content Addressing
- `contentId`: stable identifier with namespace prefix.
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

## Context envelope (optional)
Used for analytics and routing without changing content identity.

```
{
  "uiArea": "builder.logic",
  "controlId": "logicRuleEditor",
  "projectType": "form",
  "mode": "edit"
}
```


## Extraction staging contract (current)
- Runtime implementation is staged in `src/doc-engine/*` as the future package lift boundary.
- Runtime modules in this boundary must not import from `src/components/*` or `src/tabs/*`.
- Default app wiring registers a `docs` provider so existing ids (for example `docs:doc-build`) remain valid.
