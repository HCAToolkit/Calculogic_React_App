/**
 * Concern: AppFrame
 * Layer: Build
 * BuildIndex: 01.00
 * AttachesTo: #root
 * Responsibility: Provide the top-level frame and theme toggle that hosts Calculogic tabs.
 * Invariants: Body class mirrors theme state, Build tab is always mounted.
 */
import BuildTab from './tabs/BuildTab';
import GlobalHeaderShell from './components/GlobalHeaderShell';
import { useAppFrameLogic } from './App.logic';
import './App.css';

// [Section 01.10] ThemeState
// Purpose: Derive and persist the user's dark-mode preference.
// Inputs: prefers-color-scheme media query, toggle intent
// Outputs: dark boolean state, body class mutation
// Constraints: Never flicker on first paint; body mutation stays side-effect only.

export default function App() {
  const { dark, toggleDark } = useAppFrameLogic();

  // [3.2] cfg-appFrame · Primitive · "Theme Toggle Control"
  // Concern: Build · Parent: "App Frame Shell" · Catalog: control.toggle
  // Notes: Surface-level button that flips between dark and light modes.
  const themeToggle = (
    <button
      data-anchor="theme-toggle"
      onClick={toggleDark}
      aria-label="Toggle dark mode"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );

  // [3.3] cfg-appFrame · Primitive · "Build Tab Mount"
  // Concern: Build · Parent: "App Frame Shell" · Catalog: layout.mount
  // Notes: Always renders the Build tab to keep routing simple and anchors stable.
  const buildTabMount = <BuildTab />;

  // [Section 01.20] BuilderHost
  // Purpose: Expose anchors for downstream layers and render the Build tab shell.
  // Inputs: dark state, toggle handler
  // Outputs: App frame structure, theme toggle control
  // Constraints: Theme toggle remains accessible, Build tab stays mounted for routing simplicity.
  return (
    <div data-anchor="app-frame">
      <GlobalHeaderShell />
      {themeToggle}
      {buildTabMount}
    </div>
  );
}
