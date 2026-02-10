/**
 * ProjectShell/Config: SPA Host Shell (shell-spaHost)
 * Concern File: Build
 * Source NL: doc/nl-shell/shell-spaHost.md
 * Responsibility: Acquire the #root anchor and mount <App /> within <StrictMode>.
 * Invariants: Mount target remains #root; StrictMode wraps the full App tree.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ─────────────────────────────────────────────
// 3. Build – shell-spaHost (SPA Host Shell)
// NL Sections: §3.1–§3.3 in shell-spaHost.md
// Purpose: Bootstrap the React tree into the document root anchor.
// Constraints: Keep mount logic side-effect minimal and deterministic.
// ─────────────────────────────────────────────

// [3.3.1] shell-spaHost · Primitive · "React Root Mount"
// Concern: Build · Parent: "SPA Host Shell" · Catalog: runtime.mount
// Notes: Invokes createRoot on #root and renders <StrictMode><App /></StrictMode>.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
