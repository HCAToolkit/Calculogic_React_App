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
- Resolve through app-owned `contentProviderRegistry.resolveContent({ contentId, anchorId, context })` and map to drawer render model via thin adapter.

### §5.3 Primitive — "Anchor Scroll Handler"
- Scroll to anchor when content resolves.

## 6. Knowledge
### §6.1 Container — "ContentNode Schema"
- Normalized node shape and metadata contract.

### §6.2 Subcontainer — "Content Resolution Adapter"
- Thin deterministic adapter maps doc-engine `ContentNode | NotFound` responses into drawer render model (`doc` or `missing`) without rebuilding docs registries in UI layer.

## 7. Results
### §7.1 Container — "Drawer Diagnostics"
- Optional debug info for resolver/provider selection.
