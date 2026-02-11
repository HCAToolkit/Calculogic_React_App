# shell-spaHost – SPA Host Shell

This document is an instance of the ProjectShell-Level NL Skeleton defined in ../ConventionRoutines/General-NL-Skeletons.md.

## 1. Purpose and Scope
### 1.1 Purpose
Host the Calculogic single-page application within the browser by mounting the React tree into `#root` and establishing the baseline document styling contract required by downstream shells and configurations.

### 1.2 Context
Wraps the entire experience at the document root and mounts cfg-appFrame and shell-globalHeader within its rendered tree.

### 1.3 Interactions
Coordinates with build tooling to ensure hydration entry points, but delegates navigation and configuration rendering to nested shells.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `SpaHostProps` – Placeholder for future hydration metadata.
- `SpaHostState` – Not currently used (stateless shell).

### 2.2 Global State Requirements
- None; the shell only consumes the static DOM root.

### 2.3 Routing & Context
- Provides React root for router providers defined in downstream shells; no direct routing responsibilities.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Requires an element with id `root` to exist in index.html.
- Owns creation of the React root and StrictMode wrapper.

### 3.1 Atomic Components — Containers (Build)
- None; structure is a single primitive mount operation.

### 3.2 Atomic Components — Subcontainers (Build)
- None.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "React Root Mount"**
  - Calls `createRoot(document.getElementById('root')!)`.
  - Renders `<StrictMode><App /></StrictMode>`.

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
- No theme tokens; uses neutral baseline values only.
- Implemented in CSS or CSS-Module files that target document/root anchors emitted by the Build concern.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- None.

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Document Baseline Reset"**
  - Applies zero margins, border-box sizing, and neutral typography to `html` and `body`.
- **[4.2.2] Primitive – "Root Flex Column"**
  - Forces `#root` to occupy full height and expose a flex column container for nested shells.

### 4.3 Responsive Rules
- Not required; baseline rules are invariant across viewports.

### 4.4 Interaction Styles
- None.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
- None beyond React DOM client utilities.

### 5.1 Atomic Components — Containers (Logic)
- Not present.

### 5.2 Atomic Components — Primitives (Logic)
- Not present.

### 5.2.3 Derived Values
- Not present.

### 5.2.4 Side Effects
- Not present beyond Build's mount (handled in Build to keep Logic empty).

### 5.2.5 Workflows
- Not applicable.

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- Not present.

### 6.2 Constants
- Not present.

### 6.3 Shared / Global Reference
- Not present.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- Not present.

### 7.2 Dev / Debug Outputs
- Not present.

### 7.3 Accessibility Outputs
- Not present.

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- Not present.

### 8.2 Debug Display Styles
- Not present.

## 9. Assembly Pattern
### 9.1 File Structure
- src/shells/spaHost/SpaHost.build.tsx
- src/shells/spaHost/SpaHost.build.css
- src/shells/spaHost/index.ts

### 9.2 Assembly Logic
- `src/shells/spaHost/index.ts` calls the Build primitive to mount the React tree and imports the BuildStyle CSS file for global baseline rules.

### 9.3 Integration
- Entry point referenced by src/main.tsx (or equivalent) to bootstrap the Calculogic application.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: Author NL skeleton and confirm `#root` anchor availability.
- Pass 1: Implement Build mount primitive.
- Pass 2: Implement BuildStyle baseline reset.
- Pass 3+: No additional passes expected unless Knowledge/Results concerns become necessary.

### 10.2 Export Checklist
- Build successfully mounts `<App />` under StrictMode.
- BuildStyle touches only `html`, `body`, and `#root` selectors.
- No extra concerns introduced; confirm absence is intentional each review.
