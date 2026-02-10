# Content Drawer MVP (Interface Repo)

## Objective
Implement a fully operational right-side drawer that can render generic `ContentNode` payloads from a namespace-routed resolver.

## MVP behavior
1. Open via `openContent({ contentId, anchorId?, context? })`.
2. Resolve content through provider registry.
3. Render title, summary, headings/blocks, and internal links.
4. Scroll to `anchorId` when present.
5. Close via close button, Escape, and background/overlay action.
6. Restore focus to the trigger control.

## Accessibility
- `role="dialog"`
- `aria-modal="true"`
- Labelled by drawer title element
- Keyboard trap while open

## Phase-0 provider
- In-memory docs provider for existing header docs.

## Expansion path
- Add governed knowledge provider.
- Add config/form/quiz extractor provider.
- Keep resolver + `ContentNode` unchanged to minimize refactors.
