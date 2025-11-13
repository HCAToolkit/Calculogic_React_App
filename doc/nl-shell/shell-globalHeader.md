# shell-globalHeader – Global Header Shell

## 1. Purpose
Provide a reusable header shell that anchors Calculogic experiences with brand identity, primary concern navigation, and a publish action surface.

## 2. Scope
### In-Scope
- Three-zone header frame covering brand, concern tabs, and publish action.
- Responsive visibility and layout adjustments across desktop, tablet, and mobile breakpoints.
- Debug surface exposing live header state when requested.

### Out-of-Scope
- Downstream concern bodies, configuration dashboards, or document modals triggered from header actions.
- Theme token definitions beyond local CSS variables.
- Global routing or application-level state beyond header interaction state.

## 3. Concern Responsibilities
- **Build**: Compose semantic DOM structure for the header frame, tab interactions, and publish CTA.
- **BuildStyle**: Style the header shell, zones, and interactive affordances across breakpoints.
- **Logic**: Manage active/hovered tabs, breakpoint detection, document toggles, and publish dispatching.
- **Knowledge**: Define canonical tabs, copy, and breakpoint metadata consumed by the shell.
- **Results**: Render optional debug panel reflecting the shell's live interaction state.
- **ResultsStyle**: Style the debug panel to align with the shell's aesthetic without overpowering core UI.

## 4. Anchors
- `global-header` – root header shell wrapper.
- `global-header.brand` – brand identity zone container.
- `global-header.brand-logo` – brand glyph span for iconography.
- `global-header.brand-wordmark` – textual brand label.
- `global-header.brand-tagline` – optional supporting copy.
- `global-header.tabs` – navigation zone for concern tabs.
- `global-header.tab-{id}` – individual tab row wrapper.
- `global-header.tab-info` – info icon exposing hover summary content.
- `global-header.publish` – publish zone wrapper.
- `global-header.publish-button` – actionable publish trigger.
- `global-header.debug` – debug panel container (results concern).

## 5. Inputs
- `HEADER_TAB_DEFINITIONS` knowledge constants describing concern tabs.
- Breakpoint definitions for desktop, tablet, and mobile widths.
- Brand copy constants for wordmark, tagline, tooltip, and home route.
- Optional `onPublish` callback supplied by downstream host.

## 6. Outputs
- Header DOM structure with correctly annotated anchors and ARIA roles.
- Responsive CSS ensuring header readability and interaction affordances.
- Publish handler invocation or console notice when callback absent.
- Debug panel surface (when enabled) presenting active header state.

## 7. Invariants
- Tab order always matches knowledge definitions after sort by `order`.
- Exactly one tab is marked active; hovered tab resets on selection and close events.
- Publish button remains accessible with semantic `<button>` element.
- Breakpoint detection relies exclusively on viewport width and updates on resize.
- Debug panel remains hidden by default and mirrors build concern state when shown.

## 8. Dependencies
- React with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Browser `window` API for resize events (guarded for SSR).
- CSS custom properties supplied by host theme (fallbacks included).

## 9. Atomic Components
### 3. Build – shell-globalHeader
- **[3.1] Container – "Global Header Shell Frame"**: `<header>` root establishing shell anchors and landmark semantics.
- **[3.2] Subcontainer – "Brand Identity Zone"**: Brand zone wrapper balancing glyph, wordmark, and optional tagline.
- **[3.3] Primitive – "Brand Home Link"**: Anchor routing to home with tooltip and accessible labeling.
- **[3.4] Primitive – "Brand Logo Glyph"**: Emoji span providing recognizable glyph, hidden from assistive tech.
- **[3.5] Primitive – "Brand Wordmark Label"**: Text span presenting the Calculogic name.
- **[3.6] Primitive – "Brand Tagline"**: Optional supporting copy hidden on constrained breakpoints.
- **[3.7] Subcontainer – "Tab Navigation Zone"**: Wrapper aligning tab list centrally while flexing between brand/publish zones.
- **[3.8] Subcontainer – "Tab List Track"**: `role="tablist"` container enabling keyboard navigation semantics.
- **[3.9] Subcontainer – "Tab Item Row"**: Wrapper combining tab button and info icon per concern.
- **[3.10] Primitive – "Primary Tab Button"**: `role="tab"` button toggling active concern.
- **[3.11] Primitive – "Tab Info Icon"**: Button exposing hover summary and reinforcing accessible labeling.
- **[3.12] Subcontainer – "Publish Action Zone"**: Right-aligned zone holding the publish CTA.
- **[3.13] Primitive – "Publish Button"**: High-contrast CTA dispatching publish intent.

### 4. BuildStyle – shell-globalHeader
- **[4.1] Container – "Shell Frame Layout"**: Flex alignment, spacing, and baseline border for header frame.
- **[4.2] Subcontainer – "Zone Layout Baseline"**: Shared flex alignment and spacing for each zone.
- **[4.3] Subcontainer – "Brand Zone Alignment"**: Prevents brand zone from stretching while preserving layout stability.
- **[4.4] Subcontainer – "Tab Zone Alignment"**: Centers tab navigation and allows it to flex.
- **[4.5] Subcontainer – "Publish Zone Alignment"**: Right-justifies publish zone without flex bleed.
- **[4.6] Primitive – "Brand Link Styling"**: Typography and spacing for brand anchor and inline content.
- **[4.7] Primitive – "Brand Logo Scaling"**: Enlarges glyph for legibility.
- **[4.8] Primitive – "Brand Tagline Styling"**: Lightweight typography and truncation safeguards.
- **[4.9] Subcontainer – "Tab List Track Styling"**: Horizontal scrollable rail for tab buttons.
- **[4.10] Subcontainer – "Tab Item Row Styling"**: Inline alignment for button + info icon pair.
- **[4.11] Primitive – "Tab Button Baseline"**: Neutral button visuals supporting active/hover modifiers.
- **[4.12] Primitive – "Tab Button Active State"**: Elevates selected tab via background and border.
- **[4.13] Primitive – "Tab Button Hover State"**: Soft highlight for hovered but inactive tabs.
- **[4.14] Primitive – "Info Icon Baseline"**: Icon button hit target and hover transition.
- **[4.15] Primitive – "Info Icon Focus/Hover"**: Visual affordance on hover or keyboard focus.
- **[4.16] Primitive – "Publish Button Baseline"**: Gradient CTA styling with weighty typography.
- **[4.17] Primitive – "Publish Button Hover State"**: Lift and shadow feedback on interaction.
- **[4.18] Variation – "Tablet Layout Adjustments"**: Reduces padding and hides tagline on <=1023px widths.
- **[4.19] Variation – "Mobile Layout Adjustments"**: Tightens spacing and font sizing for <=767px widths.

### 5. Logic – shell-globalHeader
- **[5.1] Primitive – "Viewport Breakpoint Heuristic"**: Helper mapping viewport widths to named breakpoints.
- **[5.2] Container – "Global Header Logic Hook"**: Primary hook producing build/results bindings.
  - **[5.2.1] Primitive – "State Initialization & Bootstrapping"**: `useState` initialization with SSR-safe defaults.
  - **[5.2.2] Primitive – "Viewport Resize Subscription"**: `useEffect` listener updating breakpoints responsively.
  - **[5.2.3] Primitive – "Tab Selection Handler"**: Callback resetting hovered tab and active modes on selection.
  - **[5.2.4] Primitive – "Tab Hover Handler"**: Callback storing hovered tab id while avoiding redundant updates.
  - **[5.2.5] Primitive – "Publish Trigger Handler"**: Callback invoking provided `onPublish` or logging fallback.
  - **[5.2.6] Primitive – "Doc Visibility Controls"**: Callbacks controlling contextual document panel visibility.
  - **[5.2.7] Primitive – "Tab Definition Ordering"**: Memo ensuring deterministic order from knowledge definitions.
  - **[5.2.8] Primitive – "Viewport Flag Derivation"**: Booleans for desktop/tablet/mobile convenience.
  - **[5.2.9] Primitive – "Build Bindings Assembly"**: Bundles build concern data and handlers.
  - **[5.2.10] Primitive – "Results Bindings Assembly"**: Packages results concern state snapshot.
  - **[5.2.11] Primitive – "Hook Return Envelope"**: Returns build/results bundles for shell consumption.

### 6. Knowledge – shell-globalHeader
- **[6.1] Primitive – "Header Tab Identifier Types"**: Type aliases enumerating valid tab and mode ids.
- **[6.2] Primitive – "Header Tab Definition Schema"**: Interface describing tab definition payloads.
- **[6.3] Primitive – "Header Tab Knowledge Base"**: Ordered array of concern tab definitions with hover summaries.
- **[6.4] Primitive – "Breakpoint Definition Schema"**: Interface describing breakpoint metadata.
- **[6.5] Primitive – "Responsive Breakpoint Catalog"**: Array describing desktop/tablet/mobile breakpoints.
- **[6.6] Primitive – "Brand Wordmark Copy"**: Constant providing Calculogic wordmark.
- **[6.7] Primitive – "Brand Tagline Copy"**: Constant providing supporting tagline text.
- **[6.8] Primitive – "Brand Tooltip Copy"**: Constant for brand link tooltip.
- **[6.9] Primitive – "Publish Label Copy"**: Constant for publish button text.

### 7. Results – shell-globalHeader
- **[7.1] Container – "Global Header Debug Panel"**: Results component rendering diagnostic grid.
- **[7.2] Primitive – "Debug Visibility Gate"**: Guard preventing render unless debug is enabled.
- **[7.3] Primitive – "Debug State Rows"**: Structured rows exposing live header state fields.

### 8. ResultsStyle – shell-globalHeader
- **[8.1] Primitive – "Debug Panel Styling"**: Visual treatment for debug surface including background, typography, and spacing.

## 10. Assembly & Implementation Notes
- `info` buttons and publish CTA remain `<button>` elements for keyboard accessibility; avoid replacing with anchors.
- Hover summaries rely on JS-driven hover state to support both icon and button interactions.
- Debug panel remains opt-in; expose toggles through higher-level configurations when required.
- Breakpoint thresholds should stay synchronized with broader design system tokens before release.
