/**
 * Configuration: cfg-appFrame (App Frame)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-appFrame.md
 * Responsibility: Provide the top-level frame and theme toggle that hosts Calculogic tabs.
 * Invariants: Body class mirrors theme state; Build tab remains mounted inside the frame.
 */
import BuildTab from './tabs/BuildTab';
import GlobalHeaderShell from './components/GlobalHeaderShell';
import { useAppFrameLogic } from './App.logic';
import { ContentProvider } from './content/ContentContext';
import ContentDrawer from './components/ContentDrawer/ContentDrawer';
import './App.css';

export default function App() {
  const { dark, toggleDark } = useAppFrameLogic();

  // ─────────────────────────────────────────────
  // 3. Build – cfg-appFrame (App Frame)
  // NL Sections: §3.1–3.3 in cfg-appFrame.md
  // Purpose: Assemble the frame container, theme toggle, and Build tab mount.
  // Constraints: Keep the Build tab mounted and expose the toggle within the frame shell.
  // ─────────────────────────────────────────────

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
  // Concern: Build · Parent: "—" · Catalog: layout.container
  // Notes: Hosts the global header, theme toggle, and persistent Build tab mount.
  return (
    <ContentProvider>
      <div data-anchor="app-frame">
        <GlobalHeaderShell />
        {themeToggle}
        {buildTabMount}
      </div>
      <ContentDrawer />
    </ContentProvider>
  );
}
