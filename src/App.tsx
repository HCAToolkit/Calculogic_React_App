/**
 * Configuration: cfg-appFrame (App Frame)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-appFrame.md
 * Responsibility: Render the global frame shell, theme toggle anchor, and Build tab mount.
 * Invariants: Frame anchor remains stable; Build tab stays mounted inside the shell.
 */
import BuildTab from './tabs/BuildTab';
import { useAppFrameLogic } from './App.logic';
import './App.css';

// ─────────────────────────────────────────────
// 3. Build – cfg-appFrame (App Frame)
// NL Sections: §3.1–3.3 in cfg-appFrame.md
// Purpose: Provide structural anchors for the app frame and host nested configurations.
// Constraints: Stay pure render logic; receive all state via hooks.
// ─────────────────────────────────────────────

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

  // [3.1] cfg-appFrame · Container · "App Frame Shell"
  // Concern: Build · Parent: "—" · Catalog: layout.shell
  // Notes: Wraps the entire application frame and exposes anchors for nested configs.
  return (
    <div data-anchor="app-frame">
      {themeToggle}
      {buildTabMount}
    </div>
  );
}
