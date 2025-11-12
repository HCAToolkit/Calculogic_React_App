# cfg-buildSurface – Build Surface Configuration

## 1. Purpose
Present the Calculogic Build tab surface, including navigation chrome, the catalog of configuration panels, the preview canvas, and the inspector column, while exposing stable anchors for styling and logic concerns.

## 2. Scope
### In-Scope
- Structural composition of the Build tab shell and its resizable panes.
- Logic for panel sizing, persistence, collapse, and section ordering.
- Anchor registry shared by Build, BuildStyle, and Logic concerns.
- Styling for header chrome, catalog panels, preview canvas, and inspector.

### Out-of-Scope
- Actual configuration data loading or server communication.
- Rendering of dynamic form previews beyond placeholder content.
- Publishing workflows, notifications, or cross-tab navigation behavior.

## 3. Concern Responsibilities
- **Build (3)**: Provide the DOM structure, anchors, and reusable panel components for the Build tab.
- **BuildStyle (4)**: Skin the Build shell, catalog panels, preview area, and inspector without altering structure.
- **Logic (5)**: Manage local panel state, persisted heights/widths, and bind accessible resize/collapse affordances.
- **Knowledge (6)**: Centralize anchor naming contracts for reuse across concerns.
- **Results (7)** / **ResultsStyle (8)**: Not present.

## 4. Anchors
- `builder-root`, `builder-header`, `builder-tabs`, `builder-tab-<id>` – Global surface chrome.
- `builder-layout`, `builder-left-panel`, `builder-left-grip`, `builder-right-grip`, `builder-right-panel` – Pane layout anchors.
- `builder-section-<id>`, `builder-section-<id>-content`, `builder-section-<id>-grip` – Catalog section anchors.
- `builder-center-panel`, `builder-center-inner` – Preview area anchors.
- `builder-right-content` – Inspector content anchor.
- `builder-button-group-<id>`, `builder-placeholder-<id>`, `builder-list-<id>` – Utility anchors for section content.

## 5. Inputs
- React props supplied by `useBuildSurfaceLogic()` (anchor map, section order, binding objects).
- LocalStorage for persisted panel dimensions and collapse state.
- DOM pointer/keyboard events for resize interactions.

## 6. Outputs
- Rendered Build tab surface with interactive collapsible panels and resizable panes.
- Structured bindings consumed by Build for consistent ARIA attributes and event handlers.
- Stable anchors for styling and downstream instrumentation.

## 7. Invariants
- Section order remains stable unless explicitly changed in logic and Build simultaneously.
- Panel widths/heights clamp to readable ranges and persist between sessions.
- BuildStyle never introduces new anchors or DOM nodes.
- Anchor registry stays deterministic; concerns refer only to defined anchors.

## 8. Dependencies
- React state/effect hooks for interaction logic.
- Browser LocalStorage API for persistence.
- Standard DOM keyboard/mouse/touch events for resizing.

## 9. Atomic Components
### 3. Build – cfg-buildSurface
- **[3.1] Container – "Build Tab Forwarder"**: Barrel export that keeps App imports stable while delegating to the build folder (`src/tabs/BuildTab.tsx`).
- **[3.1.1] Subcontainer – "Build Surface Composer"**: Default export binding logic to the Build surface view (`src/tabs/build/index.tsx`).
- **[3.2] Primitive – "Chevron Left Icon"**: SVG primitive used by collapsible headers (`BuildSurface.build.tsx`).
- **[3.3] Primitive – "Chevron Right Icon"**: SVG primitive mirroring the left icon (`BuildSurface.build.tsx`).
- **[3.4] Primitive – "Section Content Catalog"**: Declarative mapping of section anchors to placeholder content (`BuildSurface.build.tsx`).
- **[3.5] Subcontainer – "Section Panel Template"**: Renders collapsible section shells with resize grips (`BuildSurface.build.tsx`).
- **[3.6] Container – "Build Surface Layout"**: Assembles header chrome, catalog panel column, preview stage, and inspector (`BuildSurface.build.tsx`).
  - **[3.6.1] Subcontainer – "Header Chrome"**: Title, navigation tabs, and publish CTA within the surface header.
  - **[3.6.2] Subcontainer – "Catalog Column"**: Left panel wrapper that renders section panels with resizable width.
  - **[3.6.3] Primitive – "Catalog Grip"**: Separator element exposing left panel resize grip anchors.
  - **[3.6.4] Subcontainer – "Preview Stage"**: Placeholder main region for future canvas rendering.
  - **[3.6.5] Primitive – "Inspector Grip"**: Resize handle separating preview and inspector regions.
  - **[3.6.6] Subcontainer – "Inspector Column"**: Collapsible inspector structure hosting settings placeholder content.

### 4. BuildStyle – cfg-buildSurface
- **[4.1] Container – "Surface Chrome Styling"**: Styles root container, header, and navigation tabs.
  - **[4.1.1] Primitive – "Root Surface"**: Base layout for `builder-root`.
  - **[4.1.2] Primitive – "Header Bar"**: Header shell styling and divider.
  - **[4.1.3] Primitive – "Header Title"**: Typography treatment for the builder title.
  - **[4.1.4] Primitive – "Tab List Container"**: Layout for navigation container.
  - **[4.1.5] Primitive – "Tab Button Base"**: Base styling for tab buttons.
  - **[4.1.6] Primitive – "Active Tab"**: Visual state for current tab.
  - **[4.1.7] Primitive – "Publish CTA"**: Accent styling for publish button.
  - **[4.1.8] Primitive – "Surface Layout Shell"**: Flex shell for left/center/right panes.
- **[4.2] Container – "Catalog Column Styling"**: Layout/styling rules for left panel, section headers, and content.
  - **[4.2.1] Primitive – "Catalog Column"**: Wrapper constraints for the left column.
  - **[4.2.2] Primitive – "Section Wrapper"**: Baseline for section containers.
  - **[4.2.3] Primitive – "Section Header Bar"**: Header alignment and background.
  - **[4.2.4] Primitive – "Section Header Title"**: Typography for section labels.
  - **[4.2.5] Primitive – "Section Chevron Button"**: Chrome for collapse button.
  - **[4.2.6] Primitive – "Chevron Focus Treatment"**: Shared focus outline rules.
  - **[4.2.7] Primitive – "Section Hidden State"**: Hides collapsed content anchors.
  - **[4.2.8] Primitive – "Section Content"**: Scrollable content container styling.
  - **[4.2.9] Primitive – "Section Content Buttons"**: Button sizing within content.
  - **[4.2.10] Primitive – "Section Content List"**: UL spacing rules.
  - **[4.2.11] Primitive – "Section Content List Item"**: LI margin spacing.
  - **[4.2.12] Primitive – "Section Box Sizing"**: Box-sizing cascade for nested anchors.
- **[4.3] Primitive – "Grip Icon Styling"**: Shared pseudo-element styling for resize grips.
  - **[4.3.1] Primitive – "Section Grip Base"**: Structural styling for section separators.
  - **[4.3.2] Primitive – "Section Grip Icon"**: Decorative pseudo-element for section grips.
  - **[4.3.3] Primitive – "Section Grip Hover"**: Hover/focus background change.
  - **[4.3.4] Primitive – "Grip Focus Ring"**: Shared focus outline for all grips.
  - **[4.3.5] Primitive – "Side Panel Grips"**: Vertical separator styling for side panels.
  - **[4.3.6] Primitive – "Side Panel Grip Icon"**: Icon orientation for side panel grips.
- **[4.4] Container – "Center Preview Styling"**: Visual treatment for preview canvas placeholder.
  - **[4.4.1] Primitive – "Preview Shell"**: Layout for center panel container.
  - **[4.4.2] Primitive – "Preview Inner Frame"**: Dashed placeholder box styling.
  - **[4.4.3] Primitive – "Preview Placeholder Text"**: Typography for placeholder copy.
- **[4.5] Container – "Inspector Column Styling"**: Layout rules for right inspector, button groups, and placeholders.
  - **[4.5.1] Primitive – "Inspector Column"**: Column constraints and background.
  - **[4.5.2] Primitive – "Inspector Header"**: Header spacing and divider.
  - **[4.5.3] Primitive – "Inspector Header Title"**: Typography for header label.
  - **[4.5.4] Primitive – "Inspector Chevron"**: Collapse button chrome.
  - **[4.5.5] Primitive – "Inspector Content"**: Padding and type color for content body.
  - **[4.5.6] Primitive – "Button Group"**: Horizontal layout for grouped buttons.
  - **[4.5.7] Primitive – "Button Group Item"**: Individual button styling.
  - **[4.5.8] Primitive – "Button Group Hover"**: Hover feedback for grouped buttons.
  - **[4.5.9] Primitive – "Placeholder Panel"**: Reusable placeholder panel styling.
  - **[4.5.10] Primitive – "Anchor List Reset"**: Neutral list baseline.
  - **[4.5.11] Primitive – "Anchor List Item"**: Per-item padding and rounding.
  - **[4.5.12] Primitive – "Anchor List Alternation"**: Zebra striping for anchor lists.

### 5. Logic – cfg-buildSurface
- **[5.1] Container – "Section Contracts"**: Type definitions, section order constant, and helper utilities.
- **[5.2] Container – "Section Logic Hook"**: `useSectionLogic` managing individual section height/collapse.
- **[5.3] Container – "Left Panel Logic"**: `useLeftPanelLogic` handling width persistence and resizing.
- **[5.4] Container – "Right Panel Logic"**: `useRightPanelLogic` managing inspector width/collapse state.
- **[5.5] Container – "Surface Bindings"**: `useBuildSurfaceLogic` aggregator producing Build bindings.

### 6. Knowledge – cfg-buildSurface
- **[6.1] Primitive – "Anchor Registry"**: `BUILD_ANCHORS` map exposing string factories.
- **[6.2] Primitive – "Anchor Type Alias"**: `BuildAnchorId` type derived from the registry.

## 10. Assembly & Implementation Notes
- Build and Logic concerns must evolve together; any anchor changes require synchronized updates across all concerns.
- Resizable interactions rely on global pointer event listeners; ensure cleanup in hooks to avoid leaks.
- Placeholder content may be replaced by nested configurations later but must respect existing anchors.
