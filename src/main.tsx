/**
 * ProjectShell: SPA Host Shell (shell-spaHost)
 * Concern File: Build
 * Source NL: doc/nl-shell/shell-spaHost.md
 * Responsibility: Mount the Calculogic React tree into #root under StrictMode.
 * Invariants: Root element exists prior to mount; StrictMode always wraps <App />.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ─────────────────────────────────────────────
// 3. Build – shell-spaHost (SPA Host Shell)
// NL Sections: §3.1 in shell-spaHost.md
// Purpose: Mount the SPA synchronously using React 18 root API.
// Constraints: Avoid async bootstrapping; assume #root exists at load time.
// ─────────────────────────────────────────────

// [3.1] shell-spaHost · Primitive · "React Root Mount"
// Concern: Build · Parent: "—" · Catalog: runtime.bootstrap
// Notes: Creates the React root once and renders <App /> within StrictMode for lifecycle checks.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
