/**
 * ProjectShell/Config: shell-spaHost (SPA Host Shell)
 * Concern File: Build
 * Source NL: doc/nl-shell/shell-spaHost.md
 * Responsibility: Acquire #root and mount <App /> inside <StrictMode>.
 * Invariants: Mount target stays #root; shell remains stateless.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ─────────────────────────────────────────────
// 3. Build – shell-spaHost (SPA Host Shell)
// NL Sections: §3.3 in shell-spaHost.md
// Purpose: Execute the single Build primitive that mounts the React application tree.
// Constraints: No routing/state logic added in this shell host concern.
// ─────────────────────────────────────────────

// [3.3.1] shell-spaHost · Primitive · "React Root Mount"
// Concern: Build · Parent: "—" · Catalog: runtime.mount
// Notes: Uses the required #root anchor and renders the App tree under StrictMode.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
