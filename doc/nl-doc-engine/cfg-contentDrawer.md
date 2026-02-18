# cfg-contentDrawer (Content Drawer Configuration)

## 3. Build
### §3.1 Container — "Content Drawer Shell"
- Right-side drawer container with stable anchor.

### §3.2 Subcontainer — "Drawer Header"
- Title, summary, close control.

### §3.3 Subcontainer — "Drawer Body"
- Scrollable content region.

### §3.4 Primitive — "Anchor Jump Target"
- Deterministic anchor alignment for `anchorId` navigation; utility remains pure and exportable for edge-case tests.

## 4. BuildStyle
### §4.1 Container — "Drawer Visual Shell"
- Right-side fixed layout, transitions, and spacing.

### §4.2 Primitive — "Header + Body Styling"
- Header typography and body overflow styling.

## 5. Logic
### §5.1 Container — "Drawer State Orchestrator"
- Open/close state and focus return.

### §5.2 Subcontainer — "Resolver Pipeline"
- Resolve through app-level content provider registry using request `{ contentId, anchorId }`.
- Keep resolver outputs explicit for drawer rendering (`found | invalid_ref | no_provider | missing_content | unsupported_namespace`).
- `resolveDrawerContent` never returns `null`; it always emits a typed outcome.
- Drawer adapter maps non-doc namespaces to `unsupported_namespace` while preserving doc-engine outcomes for docs refs.
- Drawer UI copy is explicit per outcome:
  - `found` → render resolved docs content.
  - `invalid_ref` → show malformed/bad link message.
  - `unsupported_namespace` / `no_provider` → show not supported here yet message.
  - `missing_content` → show content not found message.

### §5.3 Primitive — "Anchor Scroll Handler"
- Scroll to anchor when content resolves.

## 6. Knowledge
### §6.1 Container — "ContentNode Schema"
- Normalized node shape and metadata contract.

### §6.2 Subcontainer — "Static Docs Registry"
- Drawer-local docs registries are removed; docs payloads are sourced only through doc-engine providers backed by `header-docs.catalog`.

## 7. Results
### §7.1 Container — "Drawer Diagnostics"
- Optional debug info for resolver/provider selection.
