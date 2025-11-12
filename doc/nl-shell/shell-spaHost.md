# shell-spaHost – SPA Host Shell

## 1. Purpose
Host the Calculogic single-page application within the browser by mounting the React tree into `#root` and establishing the baseline document styling contract required by downstream shells and configurations.

## 2. Scope
### In-Scope
- React root bootstrap logic and StrictMode mounting semantics.
- Global CSS reset that guarantees full-height layout participation and neutral typography defaults.

### Out-of-Scope
- Application routing, tab selection, or business logic (handled by downstream configurations).
- Theme tokens, visual palettes, or component-level styling (delegated to other configurations).

## 3. Concern Responsibilities
- **Build**: Acquire the DOM root, create the React root, and mount the application entry component under StrictMode.
- **BuildStyle**: Normalize document-level layout primitives (html, body, #root) without introducing visual branding or component styling.
- **Logic / Knowledge / Results / ResultsStyle**: Not present in this shell.

## 4. Anchors
- `#root` – Sole structural anchor exposed by the shell for downstream configurations.

## 5. Inputs
- Browser-provided `document` with an element matching `#root`.
- Application entry component (`<App />`) exported from `src/App.tsx`.

## 6. Outputs
- React root instance rendering `<App />` with StrictMode instrumentation.
- Document-level CSS rules ensuring the React root stretches to fill the viewport.

## 7. Invariants
- React root creation occurs exactly once per page load.
- StrictMode always wraps the application tree to catch lifecycle regressions.
- html, body, and #root all maintain `height: 100%` to unblock full-viewport layouts.

## 8. Dependencies
- React DOM client API (`createRoot`).
- Global CSS cascade; no framework-specific CSS tooling.

## 9. Atomic Components
### 3. Build – shell-spaHost
- **[3.1] Primitive – "React Root Mount"**: Invoke `createRoot` on `#root` and render `<App />` within `<StrictMode>`.

### 4. BuildStyle – shell-spaHost
- **[4.1] Primitive – "Document Baseline Reset"**: Apply zero margins, border-box sizing, and typography defaults to `html` and `body`.
- **[4.2] Primitive – "Root Flex Column"**: Force `#root` to occupy full height and expose a flex column container for child configurations.

## 10. Assembly & Implementation Notes
- Bootstrap logic remains synchronous to satisfy Vite's expectations; no async dynamic imports at the shell level.
- CSS reset must avoid interfering with downstream component namespaces; limit selectors to `html`, `body`, and `#root`.
