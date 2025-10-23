/**
 * Concern: AppFrame
 * Layer: Build
 * BuildIndex: 01.00
 * AttachesTo: #root
 * Responsibility: Provide the top-level frame and theme toggle that hosts Calculogic tabs.
 * Invariants: Body class mirrors theme state, Build tab is always mounted.
 */
import { useEffect, useState } from 'react';
import BuildTab from './tabs/BuildTab';
import './App.css';

// [Section 01.10] ThemeState
// Purpose: Derive and persist the user's dark-mode preference.
// Inputs: prefers-color-scheme media query, toggle intent
// Outputs: dark boolean state, body class mutation
// Constraints: Never flicker on first paint; body mutation stays side-effect only.

export default function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  function toggleDark() {
    setDark(prev => !prev);
  }

  // [Section 01.20] BuilderHost
  // Purpose: Expose anchors for downstream layers and render the Build tab shell.
  // Inputs: dark state, toggle handler
  // Outputs: App frame structure, theme toggle control
  // Constraints: Theme toggle remains accessible, Build tab stays mounted for routing simplicity.
  return (
    <div data-anchor="app-frame">
      <button
        data-anchor="theme-toggle"
        onClick={toggleDark}
        aria-label="Toggle dark mode"
      >
        {dark ? '🌙 Dark' : '☀️ Light'}
      </button>
      <BuildTab />
    </div>
  );
}
