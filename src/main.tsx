/**
 * Concern: ClientBootstrap
 * Layer: Build
 * BuildIndex: 00.00
 * AttachesTo: #root
 * Responsibility: Mount the Calculogic React tree with StrictMode safeguards.
 * Invariants: Root element exists before mount, StrictMode wraps the entire tree.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // Ensure this path is correct
import './index.css';

// [Section 00.10] ReactRootMount
// Purpose: Provide deterministic bootstrapping for the single-page app.
// Inputs: document.getElementById('root')
// Outputs: React root rendering of <App />
// Constraints: Remains synchronous to satisfy Vite's client hydration.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
