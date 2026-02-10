# cfg-appFrame – App Frame Configuration

This document is an instance of the Configuration-Level NL Skeleton defined in ../General-NL-Skeletons.md.

## 1. Purpose and Scope
### 1.1 Purpose
Provide the global frame for the Calculogic application, expose the theme toggle, and host the Build tab configuration within a stable anchor structure.

### 1.2 Context
Appears as the persistent outer shell that wraps all configuration tabs within the single-page host.

### 1.3 Interactions
Embeds the Build tab configuration via a mount anchor and coordinates with the global header shell for navigation.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `AppFrameProps` – Props for mounting downstream configurations (currently empty placeholder for future extension).
- `AppFrameState` – Local dark-mode preference boolean.

### 2.2 Data & State Requirements
- Local state: `isDarkMode` derived from `window.matchMedia('(prefers-color-scheme: dark)')` with user override.
- Global context: None.
- External data sources: Browser color scheme preference only.

### 2.3 Dependencies
- UI libs: React, including `useState` and `useEffect`.
- Routing: None (routing handled by shells).
- Shared hooks / utilities: None initially; future context sharing noted in Assembly notes.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Requires hosting from shell-spaHost to mount into the document body.
- Provides anchors `app-frame` (root) and `theme-toggle` (control) for other concerns.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "App Frame Shell"**
  - Catalog base: layout.shell
  - Anchor: `data-anchor="app-frame"`
  - Children: `[3.3.1] Theme Toggle Primitive`, `[3.3.2] Build Tab Mount Primitive`

### 3.2 Atomic Components — Subcontainers (Build)
- None.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Theme Toggle Control"**
  - Catalog base: ui.button
  - Anchor: `data-anchor="theme-toggle"`
  - Props: `aria-pressed`, icon slot, label from Knowledge concern.
- **[3.3.2] Primitive – "Build Tab Mount"**
  - Catalog base: layout.slot
  - Purpose: Stable mount point for cfg-buildSurface (and future tabs).

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
- Consumes project tokens for color, spacing, typography.
- Implemented in CSS or CSS-Module files that target anchors emitted by the Build concern.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Frame Surface Styling"**
  - Selector: `[data-anchor="app-frame"]`
  - Layout: Column flex, full viewport height, brand background tokens.

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Theme Toggle Styling"**
  - Selector: `[data-anchor="theme-toggle"]`
  - Notes: Rounded toggle pill, focus outline, high-contrast icon color.
- **[4.2.2] Primitive – "Dark Theme Variables"**
  - Selector: `body.dark`
  - Notes: Overrides surface/background tokens, updates icon treatment.

### 4.3 Responsive Rules
- At min-width 768px widen frame padding and align toggle to top-right without overlap.

### 4.4 Interaction Styles
- Hover: Slight background tint on toggle.
- Focus: Visible outline referencing Knowledge-provided label.
- Active: Depressed button effect.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
- Uses `window.matchMedia` for initial preference detection.

### 5.1 Atomic Components — Containers (Logic)
- None (primitives sufficient for current workflow).

### 5.2 Atomic Components — Primitives (Logic)
- **[5.2.1] Primitive – "Theme Preference State"**
  - State: `const [isDarkMode, setIsDarkMode] = useState<boolean>(...)`.
- **[5.2.2] Primitive – "Toggle Handler"**
  - Function: `const handleToggle = () => setIsDarkMode(!isDarkMode);`
- **[5.2.3] Primitive – "Body Class Synchronization"**
  - Effect: Adds/removes `dark` class on `document.body` when `isDarkMode` changes.

### 5.2.3 Derived Values
- None currently; future derived theme tokens will be captured here.

### 5.2.4 Side Effects
- Covered by `[5.2.3]` effect; no additional subscriptions.

### 5.2.5 Workflows
- Toggle workflow: User clicks control → `[5.2.2]` updates state → `[5.2.3]` syncs body class.

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- None (no enumerations required yet).

### 6.2 Constants
- **[6.2.1] Primitive – "Theme Toggle Copy"**
  - Label string and aria-label for the toggle control.
- **[6.2.2] Primitive – "Theme Icon Descriptions"**
  - Text alternatives for light/dark icons.

### 6.3 Shared / Global Reference
- All static text and aria strings for the toggle must live here; component files must import instead of inlining.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Not present; the frame does not compute derived results.

### 7.2 Dev / Debug Outputs
- None.

### 7.3 Accessibility Outputs
- None beyond Knowledge-provided aria content.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Not present.

### 8.2 Debug Display Styles
- Not present.

## 9. Assembly Pattern
### 9.1 File Structure
- src/App.tsx
- src/App.css
- src/App.logic.ts
- src/App.knowledge.ts
- (No Results/ResultsStyle files until required)

### 9.2 Assembly Logic
- `App.tsx` assembles Build with Logic and Knowledge imports, and wires `App.css` as BuildStyle.

### 9.3 Integration
- Mounted by shell-spaHost within the root application container; provides mount slot for cfg-buildSurface and other main-pane configs.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: Author NL skeleton and stub files with anchors.
- Pass 1: Implement Build and BuildStyle concerns.
- Pass 2: Implement Logic concern and Knowledge copy.
- Pass 3+: Add Results concerns when the frame surfaces derived telemetry.

### 10.2 Export Checklist
- Build anchors `app-frame` and `theme-toggle` exist.
- BuildStyle selectors reference anchors only.
- Logic toggles body class without leaks.
- Knowledge exports label text consumed by Build and BuildStyle.
- No Results concerns required; verify absence is intentional.
