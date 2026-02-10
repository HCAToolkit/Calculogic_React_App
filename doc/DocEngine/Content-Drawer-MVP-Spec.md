# Content Drawer MVP Spec

## Goal

Provide a right-side drawer that renders Doc Engine ContentNode details for the currently selected context in the app.

## MVP user outcomes

- Open contextual docs without leaving current workflow.
- Navigate parent/child/related links quickly.
- View source attribution for trust and debugging.

## Inputs

- `activeNodeId: string | null`
- `nodeById: Record<string, ContentNode>`
- `onNavigate(nodeId: string): void`
- `onClose(): void`

## Rendering requirements

1. Header: node title, kind badge, status badge (if present).
2. Body: summary then full body text (markdown rendering optional in MVP).
3. Relationships:
   - Parent link (if present).
   - Child list (if any).
   - Related list (if any).
4. Source footer: provider ID, external ID, uri (if available).

## Interaction requirements

- Drawer opens when `activeNodeId` is set and exists in `nodeById`.
- Drawer closes on explicit close action.
- Relationship links call `onNavigate` and update drawer content.
- Missing node fallback: show “Content unavailable” placeholder.

## Non-goals (MVP)

- Editing documentation content.
- Version comparison UI.
- Multi-select or split-view content panes.
