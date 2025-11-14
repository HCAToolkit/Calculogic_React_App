# shell-globalHeader – Global Header Shell

This document is an instance of the ProjectShell-Level NL Skeleton defined in ../General-NL-Skeletons.md.

## 1. Purpose and Scope
### 1.1 Purpose
Provide a reusable header shell that anchors Calculogic experiences with brand identity, primary concern navigation, and a publish action surface.

### 1.2 Context
Wraps the top of the single-page application hosted by shell-spaHost and appears above cfg-appFrame.

### 1.3 Interactions
Coordinates with cfg-appFrame to mount the active configuration, routes publish actions to downstream handlers, and exposes navigation state to other shells.

## 2. Configuration Contracts
### 2.1 TypeScript Interfaces
- `GlobalHeaderProps` – Props for supplying publish callbacks and optional debug toggles.
- `GlobalHeaderState` – Shape describing active tab, hovered tab, breakpoint flags, and debug state.

### 2.2 Global State Requirements
- Consumes optional `onPublish` handler provided by parent shell or host.
- Reads responsive breakpoint information derived from window size (local to this shell).

### 2.3 Routing & Context
- Relies on shell-spaHost for SPA routing; does not manipulate URLs directly.
- Exposes selected concern id for cfg-appFrame to mount the matching configuration.

## 3. Build Concern (Structure)
### 3.0 Dependencies & Hierarchy Notes
- Mounts within shell-spaHost and sits above cfg-appFrame.
- Provides anchors `global-header.*` for styling, logic, and Results concerns.

### 3.1 Atomic Components — Containers (Build)
- **[3.1.1] Container – "Global Header Shell Frame"**
  - Element: `<header>`
  - Anchor: `data-anchor="global-header"`
  - Children: `[3.2.1] Brand Identity Zone`, `[3.2.2] Tab Navigation Zone`, `[3.2.3] Publish Action Zone`.
- **[3.1.2] Container – "Tab List Track"**
  - Element: `<div role="tablist">`
  - Anchor: `data-anchor="global-header.tabs"`
  - Children: `[3.2.4] Tab Item Row` instances.

### 3.2 Atomic Components — Subcontainers (Build)
- **[3.2.1] Subcontainer – "Brand Identity Zone"**
  - Anchor: `data-anchor="global-header.brand"`
  - Children: `[3.3.1] Brand Home Link`, `[3.3.2] Brand Logo Glyph`, `[3.3.3] Brand Wordmark`, `[3.3.4] Brand Tagline`.
- **[3.2.2] Subcontainer – "Tab Navigation Zone"**
  - Anchor: `data-anchor="global-header.tabs-zone"`
  - Purpose: Flex wrapper aligning tab list between brand and publish zones.
- **[3.2.3] Subcontainer – "Publish Action Zone"**
  - Anchor: `data-anchor="global-header.publish"`
  - Children: `[3.3.8] Publish Button`.
- **[3.2.4] Subcontainer – "Tab Item Row"**
  - Anchor pattern: `data-anchor="global-header.tab-{id}"`
  - Children: `[3.3.5] Primary Tab Button`, `[3.3.6] Tab Info Icon`.
- **[3.2.5] Subcontainer – "Debug Panel Container"**
  - Anchor: `data-anchor="global-header.debug"`
  - Purpose: Hosts Results concern output when enabled.

### 3.3 Atomic Components — Primitives (Build)
- **[3.3.1] Primitive – "Brand Home Link"**
  - Element: `<a>`
  - Attributes: `href="/"`, `aria-label` from Knowledge.
- **[3.3.2] Primitive – "Brand Logo Glyph"**
  - Element: `<span aria-hidden="true">`
  - Content: Emoji or SVG glyph.
- **[3.3.3] Primitive – "Brand Wordmark Label"**
  - Element: `<span>` with accessible text.
- **[3.3.4] Primitive – "Brand Tagline"**
  - Element: `<span>` optional supporting copy with `data-anchor="global-header.brand-tagline"`.
- **[3.3.5] Primitive – "Primary Tab Button"**
  - Element: `<button role="tab">`
  - Data attributes: `data-tab-id`.
- **[3.3.6] Primitive – "Tab Info Icon"**
  - Element: `<button>`
  - Purpose: Displays hover tooltip and additional info.
- **[3.3.7] Primitive – "Tab Tooltip Portal"**
  - Optional structure for richer hover content anchored near the info icon.
- **[3.3.8] Primitive – "Publish Button"**
  - Element: `<button>`
  - Attributes: `type="button"`, `data-anchor="global-header.publish-button"`.

## 4. BuildStyle Concern (Visual Styling of Structure)
### 4.0 Dependencies
- Consumes design tokens for spacing, typography, and color from cfg-appFrame knowledge exports.

### 4.1 Atomic Components — Containers / Groups (BuildStyle)
- **[4.1.1] Container – "Shell Frame Layout"**
  - Selector: `[data-anchor="global-header"]`
  - Layout: Flex row with baseline border.
- **[4.1.2] Container – "Zone Alignment Baseline"**
  - Selector: `[data-anchor="global-header.brand"], [data-anchor="global-header.tabs-zone"], [data-anchor="global-header.publish"]`
  - Purpose: Shared alignment system for zones.
- **[4.1.3] Container – "Tab List Track Styling"**
  - Selector: `[data-anchor="global-header.tabs"]`
  - Behavior: Horizontal scroll with overflow guards.
- **[4.1.4] Container – "Debug Panel Styling"**
  - Selector: `[data-anchor="global-header.debug"]`
  - Layout: Inline status banner.

### 4.2 Atomic Components — Primitives (BuildStyle)
- **[4.2.1] Primitive – "Brand Link Styling"**
  - Typography, spacing, and inline alignment for brand anchor.
- **[4.2.2] Primitive – "Brand Logo Scaling"**
  - Sets font size and baseline alignment for glyph.
- **[4.2.3] Primitive – "Brand Tagline Styling"**
  - Lightweight typography and truncation safeguards.
- **[4.2.4] Primitive – "Tab Button Baseline"**
  - Neutral button visuals supporting focus/active modifiers.
- **[4.2.5] Primitive – "Tab Button Active State"**
  - Underline and background adjustments for selected tab.
- **[4.2.6] Primitive – "Tab Button Hover State"**
  - Soft highlight for hovered but inactive tabs.
- **[4.2.7] Primitive – "Info Icon Baseline"**
  - Icon size, padding, and hit target.
- **[4.2.8] Primitive – "Info Icon Focus/Hover"**
  - Outline and color adjustments on interaction.
- **[4.2.9] Primitive – "Publish Button Baseline"**
  - Gradient CTA styling with strong contrast.
- **[4.2.10] Primitive – "Publish Button Hover State"**
  - Lift and shadow feedback for pointer/keyboard interaction.
- **[4.2.11] Primitive – "Debug Panel Typography"**
  - Text treatment for debug readouts.

### 4.3 Responsive Rules
- Tablet breakpoint (≤1023px): Reduce padding, hide tagline, compress tab spacing.
- Mobile breakpoint (≤767px): Stack zones vertically and convert tab list to horizontal scroll chips.

### 4.4 Interaction Styles
- Focus outlines use Knowledge-provided tokens; ensure visible contrast.
- Hover states align with Build-defined anchors only.

## 5. Logic Concern (Workflow)
### 5.0 Dependencies
- Uses React hooks for state management and window resize listeners (SSR guarded).

### 5.1 Atomic Components — Containers (Logic)
- **[5.1.1] Container – "Global Header Logic Hook"**
  - `useGlobalHeader` producing Build and Results bindings.

### 5.2 Atomic Components — Primitives (Logic)
- **[5.2.1] Primitive – "State Initialization"**
  - Sets default active tab based on Knowledge order.
- **[5.2.2] Primitive – "Viewport Resize Subscription"**
  - Listens for window resize to update breakpoint flags.
- **[5.2.3] Primitive – "Tab Selection Handler"**
  - Updates active tab and resets hover state.
- **[5.2.4] Primitive – "Tab Hover Handler"**
  - Stores hovered tab id while avoiding redundant updates.
- **[5.2.5] Primitive – "Publish Trigger Handler"**
  - Invokes `onPublish` or logs fallback notice.
- **[5.2.6] Primitive – "Debug Toggle Handler"**
  - Enables/disables Results concern display.
- **[5.2.7] Primitive – "Knowledge Ordering Memo"**
  - Memoizes sorted tab definitions for Build consumption.
- **[5.2.8] Primitive – "Breakpoint Flag Derivation"**
  - Derives desktop/tablet/mobile booleans from viewport width.
- **[5.2.9] Primitive – "Build Bindings Assembly"**
  - Maps Knowledge definitions and handlers into Build-ready props.
- **[5.2.10] Primitive – "Results Snapshot Assembly"**
  - Packages state summary for Results concern.

### 5.2.3 Derived Values
- Derived booleans for viewport categories and debug enablement.

### 5.2.4 Side Effects
- Window resize listener attaches/detaches on mount/unmount.
- Console warning emitted when publish callback is absent.

### 5.2.5 Workflows
- Tab switch: `[5.2.3]` updates active tab → `[5.2.7]` ensures deterministic ordering → `[5.2.9]` provides Build bindings → Build updates selected state.
- Publish action: `[5.2.5]` triggers callback → Results snapshot logs latest timestamp when debug enabled.

## 6. Knowledge Concern (Reference Data)
### 6.1 Maps / Dictionaries
- **[6.1.1] Primitive – "Header Tab Identifier Types"**
  - Type aliases enumerating valid tab ids (build, logic, knowledge, results, resultsStyle).
- **[6.1.2] Primitive – "Breakpoint Definition Schema"**
  - Interface describing breakpoint metadata for responsive logic.

### 6.2 Constants
- **[6.2.1] Primitive – "Header Tab Knowledge Base"**
  - Ordered array of concern tab definitions with hover summaries.
- **[6.2.2] Primitive – "Brand Wordmark Copy"**
  - Display string for Calculogic wordmark.
- **[6.2.3] Primitive – "Brand Tagline Copy"**
  - Optional supporting copy string.
- **[6.2.4] Primitive – "Brand Tooltip Copy"**
  - Tooltip text for brand home link.
- **[6.2.5] Primitive – "Publish Label Copy"**
  - Label for publish button.
- **[6.2.6] Primitive – "Breakpoint Catalog"**
  - Array of desktop/tablet/mobile breakpoint definitions.

### 6.3 Shared / Global Reference
- Exposes tab ordering and copy for cfg-appFrame to reference when rendering nested surfaces.

## 7. Results Concern (Outputs)
### 7.1 User-Facing Outputs
- **[7.1.1] Container – "Global Header Debug Panel"**
  - Displays live header state when debug mode enabled.

### 7.2 Dev / Debug Outputs
- **[7.2.1] Primitive – "Debug Visibility Gate"**
  - Guards render until debug toggle is true.
- **[7.2.2] Primitive – "Debug State Rows"**
  - Lists active tab, hovered tab, breakpoint flags, and publish readiness.

### 7.3 Accessibility Outputs
- Provide `aria-live="polite"` announcements when publish action completes (future extension).

## 8. ResultsStyle Concern (Output Styling)
### 8.1 Results Layout Styles
- **[8.1.1] Primitive – "Debug Panel Styling"**
  - Visual treatment for debug panel: background tint, typography, spacing.

### 8.2 Debug Display Styles
- Additional states not yet required.

## 9. Assembly Pattern
### 9.1 File Structure
- src/shells/globalHeader/GlobalHeader.build.tsx
- src/shells/globalHeader/GlobalHeader.buildStyle.tsx
- src/shells/globalHeader/GlobalHeader.logic.ts
- src/shells/globalHeader/GlobalHeader.knowledge.ts
- src/shells/globalHeader/GlobalHeader.results.tsx
- src/shells/globalHeader/GlobalHeader.resultsStyle.tsx
- src/shells/globalHeader/index.ts

### 9.2 Assembly Logic
- `src/shells/globalHeader/index.ts` composes Build with Logic hook outputs, imports BuildStyle for side effects, and exports Results/ResultsStyle components for optional mounting.

### 9.3 Integration
- Mounted inside shell-spaHost above cfg-appFrame; publishes selected concern id to cfg-appFrame for tab swapping.

## 10. Implementation Passes
### 10.1 Pass Mapping
- Pass 0: Author NL skeleton and stub Build anchors.
- Pass 1: Implement Build containers and primitives.
- Pass 2: Apply BuildStyle responsive rules.
- Pass 3: Implement Logic hook and knowledge constants.
- Pass 4: Implement Results panel and styling.
- Pass 5+: Extend Knowledge/Results when new tabs or diagnostics emerge.

### 10.2 Export Checklist
- Build anchors align with Knowledge definitions and BuildStyle selectors.
- Logic hook guards window access for SSR and cleans up listeners.
- Results panel renders only when debug is enabled.
- BuildStyle references tokens from Knowledge or cfg-appFrame as needed.
- Publish actions bubble through provided callback or log fallback message.
