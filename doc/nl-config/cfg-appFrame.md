# cfg-appFrame – App Frame Configuration

## 1. Purpose
Provide the global frame for the Calculogic application, expose the theme toggle, and host the Build tab configuration within a stable anchor structure.

## 2. Scope
### In-Scope
- Rendering the outer application shell and theme toggle control.
- Managing the user's dark mode preference and syncing it to the document body.
- Styling the frame container and toggle affordance, including dark-mode CSS variables.

### Out-of-Scope
- Tab routing logic beyond mounting the Build tab.
- Application-wide data fetching or persistence unrelated to theme preference.
- Nested configuration styling handled by downstream configs (e.g., Build surface).

## 3. Concern Responsibilities
- **Build (3)**: Render the frame container, theme toggle button, and embed the Build tab configuration.
- **BuildStyle (4)**: Style the frame shell and toggle, and provide dark-mode variable overrides.
- **Logic (5)**: Derive, persist, and toggle the dark-mode preference while mutating the body class.
- **Knowledge / Results / ResultsStyle (6–8)**: Not present.

## 4. Anchors
- `app-frame` – Root container for the application frame.
- `theme-toggle` – Control for switching themes.

## 5. Inputs
- `window.matchMedia('(prefers-color-scheme: dark)')` for initial preference.
- User interaction with the theme toggle button.

## 6. Outputs
- Frame structure hosting the Build tab configuration.
- Body class `dark` when dark mode is active.
- CSS custom property overrides when dark mode is active.

## 7. Invariants
- Theme toggle remains mounted and accessible regardless of theme state.
- Body class accurately reflects the current dark mode boolean.
- Build tab remains mounted inside the frame to simplify routing.

## 8. Dependencies
- React state/effect hooks.
- Document body classList for theme propagation.

## 9. Atomic Components
### 3. Build – cfg-appFrame
- **[3.1] Container – "App Frame Shell"**: Wraps the entire application UI and hosts theme toggle plus Build tab.
- **[3.2] Primitive – "Theme Toggle Control"**: Button enabling light/dark mode switching.
- **[3.3] Primitive – "Build Tab Mount"**: Embeds the Build tab configuration within the frame.

### 4. BuildStyle – cfg-appFrame
- **[4.1] Container – "Frame Surface Styling"**: Sets viewport fill, typography, and color tokens for the frame.
- **[4.2] Primitive – "Theme Toggle Styling"**: Positions and styles the toggle button, including focus treatment.
- **[4.3] Primitive – "Dark Theme Variables"**: Defines CSS custom property overrides when `body.dark` is present.

### 5. Logic – cfg-appFrame
- **[5.1] Primitive – "Theme Preference State"**: Initializes dark-mode state from media query.
- **[5.2] Primitive – "Body Class Synchronization"**: Effects that mirror the theme boolean to `body`.
- **[5.3] Primitive – "Toggle Handler"**: Inverts the theme boolean when the control is activated.

## 10. Assembly & Implementation Notes
- Keep theme state local to the frame; share via context in future features if additional tabs need access.
- Body mutation is the only side effect; ensure cleanup is unnecessary by always toggling on render.
