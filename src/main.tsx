/**
 * CCPP: shell-spaHost
 * Concern: Build
 * Reference: doc/nl-shell/shell-spaHost.md
 * Responsibility: Acquire the #root anchor and mount <App /> within <StrictMode>.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// [3] Build — shell-spaHost
// [3.1] React Root Mount — Invoke createRoot on #root and render <App /> inside <StrictMode>.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
