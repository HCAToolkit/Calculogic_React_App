import type { GlobalHeaderShellResultsBindings } from './GlobalHeaderShell.logic';

export function GlobalHeaderShellResults({ debugPanel }: GlobalHeaderShellResultsBindings) {
  if (!debugPanel.visible) {
    return null;
  }

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
    </aside>
  );
}
