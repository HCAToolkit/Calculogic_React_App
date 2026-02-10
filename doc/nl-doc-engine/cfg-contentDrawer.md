# cfg-contentDrawer – Doc Engine Content Drawer Configuration

This document is a configuration-level NL skeleton for the planned Doc Engine Content Drawer.

## 1. Purpose and Scope
### 1.1 Purpose
Define the UI and interaction contract for opening, browsing, and selecting content nodes from a side drawer in the Doc Engine.

### 1.2 Context
Appears as a supporting panel within doc-authoring surfaces that need quick node navigation.

### 1.3 Interactions
Consumes structured nodes from `cfg-contentResolver`, can filter by provider metadata from `cfg-providerRegistry`, and emits selected `ContentNode` references defined in `cfg-contentNodeSchema`.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `ContentDrawerProps` – inputs like `isOpen`, `activeNodeId`, and callbacks.
- `ContentDrawerState` – local UI state (search query, expanded groups, keyboard focus index).

### 2.2 Data & State Requirements
- Local state: query string, drawer section expansion map, highlighted result index.
- Global context: active document context ID, current provider selection.
- External data sources: resolved tree/list of `ContentNode` items and provider capability metadata.

### 2.3 Dependencies
- UI libs: React and accessibility helpers for focus trapping.
- Routing: optional deep-link anchor updates for selected node.
- Shared hooks / utilities: resolver query hook, keyboard navigation utility.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Requires parent layout mount anchor for right/left side panel.
- Top-level structure is a single container with nested subcontainers for header, filters, and results.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "Drawer Surface"**
  - Anchor: `data-anchor="doc-content-drawer"`
  - Children: `[3.2.1] Drawer Header`, `[3.2.2] Filter Strip`, `[3.2.3] Node Results Region`, `[3.3.5] Drawer Empty State`.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Drawer Header"**
  - Parent: `[3.1.1]`
  - Children: `[3.3.1] Drawer Title`, `[3.3.2] Drawer Close Action`.
- **[3.2.2] Subcontainer – "Filter Strip"**
  - Parent: `[3.1.1]`
  - Children: `[3.3.3] Search Input`, `[3.3.4] Provider Filter Select`.
- **[3.2.3] Subcontainer – "Node Results Region"**
  - Parent: `[3.1.1]`
  - Children: `[3.2.4] Grouped Node Section`.
- **[3.2.4] Subcontainer – "Grouped Node Section"**
  - Parent: `[3.2.3]`
  - Children: repeated `[3.3.6] Group Header Toggle`, repeated `[3.3.7] Node Row Item`.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Drawer Title"**
- **[3.3.2] Primitive – "Drawer Close Action"**
- **[3.3.3] Primitive – "Search Input"**
- **[3.3.4] Primitive – "Provider Filter Select"**
- **[3.3.5] Primitive – "Drawer Empty State"**
- **[3.3.6] Primitive – "Group Header Toggle"**
- **[3.3.7] Primitive – "Node Row Item"**

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
Uses shared spacing/typography tokens and z-index layering rules.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Drawer Layout Styling"** for `doc-content-drawer` sizing/position.

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Header Styling"**
- **[4.2.2] Primitive – "Filter Control Styling"**
- **[4.2.3] Primitive – "Result Row Styling"**
- **[4.2.4] Primitive – "Empty State Styling"**

### 4.3 Responsive Rules
- Collapse width and switch to overlay mode below tablet breakpoint.

### 4.4 Interaction Styles
- Hover/focus/active states for rows and toggle controls.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
Relies on resolver query hook and debounced search utility.

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "ContentDrawerLogic"** orchestrates filtering, focus movement, and selection dispatch.

### 5.2 Atomic Components — Subcontainers (Logic)
- **[5.2.1] Subcontainer – "Filtering Pipeline"**
- **[5.2.2] Subcontainer – "Keyboard Navigation Pipeline"**

### 5.3 Atomic Components — Primitives (Logic)
- **[5.3.1] Primitive – "Open/Close State Sync"**
- **[5.3.2] Primitive – "Search Query Update"**
- **[5.3.3] Primitive – "Provider Filter Update"**
- **[5.3.4] Primitive – "Visible Node Computation"**
- **[5.3.5] Primitive – "Selection Emit"**

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- Provider display map and node type icon map.

### 6.2 Constants
- Drawer labels, aria text, keyboard hint strings, debounce timing.

### 6.3 Shared / Global Reference
- References IDs and enum values from `cfg-contentNodeSchema` and `cfg-providerRegistry`.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Selected node signal and optional recent-node list.

### 7.2 Dev / Debug Outputs
- Optional debug counters for nodes scanned and filtered.

### 7.3 Accessibility Outputs
- Live region updates when search results change.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Styling for result count and recent selection chip list.

### 8.2 Debug Display Styles
- Muted compact style for debug counters when enabled.

## 9. Assembly Pattern
### 9.1 File Structure
- `src/docEngine/contentDrawer/ContentDrawer.build.tsx`
- `src/docEngine/contentDrawer/ContentDrawer.build.css`
- `src/docEngine/contentDrawer/ContentDrawer.logic.ts`
- `src/docEngine/contentDrawer/ContentDrawer.knowledge.ts`
- `src/docEngine/contentDrawer/ContentDrawer.results.tsx`
- `src/docEngine/contentDrawer/ContentDrawer.results.css`

### 9.2 Assembly Logic
- Public index composes Build + Logic, with style concerns imported by concern-specific files.

### 9.3 Integration
- Mounted by doc-authoring frame; receives resolver outputs and provider filters through props/context.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: NL skeleton + anchors.
- Pass 1: Build and BuildStyle baseline.
- Pass 2: Logic filtering and keyboard interactions.
- Pass 3: Knowledge centralization.
- Pass 4: Results/ResultsStyle for status telemetry.

### 10.2 Export Checklist
- Container/subcontainer/primitive IDs remain stable for CCPP atomic comment mapping.
- Build anchors align with style selectors.
- Selection workflow emits schema-valid node references.
