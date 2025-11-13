/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Results
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Render optional debug panel mirroring live header state.
 * Invariants: Debug remains hidden unless enabled; output stays read-only diagnostic copy.
 */
import type { GlobalHeaderShellResultsBindings } from './GlobalHeaderShell.logic';

// ─────────────────────────────────────────────
// 7. Results – shell-globalHeader (Global Header Shell)
// NL Sections: §7.1–§7.3 in shell-globalHeader.md
// Purpose: Provide diagnostic rendering for header shell state without mutating data.
// Constraints: Avoid side effects; render plain text only.
// ─────────────────────────────────────────────

// [7.1] shell-globalHeader · Container · "Global Header Debug Panel"
// Concern: Results · Catalog: diagnostics.panel
// Notes: Wraps optional debug rows for shell instrumentation.
export function GlobalHeaderShellResults({ debugPanel }: GlobalHeaderShellResultsBindings) {
  // [7.2] shell-globalHeader · Primitive · "Debug Visibility Gate"
  // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: logic.guard
  // Notes: Avoids DOM allocation unless debug is explicitly enabled.
  if (!debugPanel.visible) {
    return null;
  }

  // [7.3] shell-globalHeader · Primitive · "Debug State Rows"
  // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: diagnostics.readout
  // Notes: Surface current shell state values for developer inspection.
  return (
    <aside className="global-header-shell__debug" data-anchor="global-header.debug">
      <div>
        <strong>Active tab:</strong> {debugPanel.state.activeTab}
      </div>
      <div>
        <strong>Build mode:</strong> {debugPanel.state.activeModeByTab.build}
      </div>
      <div>
        <strong>Results mode:</strong> {debugPanel.state.activeModeByTab.results}
      </div>
      <div>
        <strong>Breakpoint:</strong> {debugPanel.state.viewportBreakpoint}
      </div>
      <div>
        <strong>Hovered tab:</strong> {debugPanel.state.hoveredTab ?? 'none'}
      </div>
      <div>
        <strong>Active doc:</strong> {debugPanel.state.activeDocId ?? 'none'}
      </div>
    </aside>
  );
}
