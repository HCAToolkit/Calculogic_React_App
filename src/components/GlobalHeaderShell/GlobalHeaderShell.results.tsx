/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Results
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Render optional debug panel mirroring live header state.
 * Invariants: Debug remains hidden unless enabled; output stays read-only diagnostic copy.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GlobalHeaderShellResultsBindings } from './GlobalHeaderShell.logic';

// ─────────────────────────────────────────────
// 7. Results – shell-globalHeader (Global Header Shell)
// NL Sections: §7.1–§7.3 in shell-globalHeader.md
// Purpose: Provide diagnostic rendering for header shell state without mutating data.
// Constraints: Avoid side effects; render plain text only.
// ─────────────────────────────────────────────

// [7.1] shell-globalHeader · Container · "Global Header Debug Panel"
// Concern: Results · Catalog: diagnostics.panel
// Notes: Wraps optional debug rows for shell instrumentation and ARIA announcements.
export function GlobalHeaderShellResults({ debugPanel }: GlobalHeaderShellResultsBindings) {
  // [7.2] shell-globalHeader · Primitive · "Live Region Announcement Queue"
  // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: accessibility.liveRegion
  // Notes: Accumulates user-facing announcements when tab or mode selections change.
  const [announcements, setAnnouncements] = useState<{ id: number; message: string }[]>([]);
  const announcementIdRef = useRef(0);
  const previousStateRef = useRef(debugPanel.state);

  useEffect(() => {
    const previous = previousStateRef.current;
    const current = debugPanel.state;
    const updates: string[] = [];

    if (previous.currentActiveTab !== current.currentActiveTab) {
      const tabMessage =
        {
          build: 'Switched to Build.',
          logic: 'Switched to Logic.',
          knowledge: 'Switched to Knowledge.',
          results: 'Switched to Results.',
        }[current.currentActiveTab];
      updates.push(tabMessage);
    }

    if (previous.currentBuildMode !== current.currentBuildMode) {
      updates.push(
        current.currentBuildMode === 'style'
          ? 'Switched to Build Style mode.'
          : 'Switched to Build Base mode.',
      );
    }

    if (previous.currentResultsMode !== current.currentResultsMode) {
      updates.push(
        current.currentResultsMode === 'style'
          ? 'Switched to Results Style mode.'
          : 'Switched to Results Base mode.',
      );
    }

    if (updates.length > 0) {
      setAnnouncements(prevAnnouncements => {
        const nextAnnouncements = [...prevAnnouncements];
        updates.forEach(message => {
          announcementIdRef.current += 1;
          nextAnnouncements.push({ id: announcementIdRef.current, message });
        });
        return nextAnnouncements.slice(-5);
      });
    }

    previousStateRef.current = current;
  }, [debugPanel.state]);

  const debugContent = debugPanel.visible ? (
    // [7.1] shell-globalHeader · Primitive · "Debug State Rows"
    // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: diagnostics.readout
    // Notes: Surface current shell state values for developer inspection.
    <aside className="global-header-shell__debug" data-anchor="global-header.debug">
      <div>
        <strong>Current tab:</strong> {debugPanel.state.currentActiveTab}
      </div>
      <div>
        <strong>Build mode:</strong> {debugPanel.state.currentBuildMode}
      </div>
      <div>
        <strong>Results mode:</strong> {debugPanel.state.currentResultsMode}
      </div>
      <div>
        <strong>Visible mode menu:</strong> {debugPanel.state.modeMenuVisibleForTab ?? 'none'}
      </div>
      <div>
        <strong>Viewport breakpoint:</strong> {debugPanel.state.viewportBreakpoint}
      </div>
      <div>
        <strong>Active content:</strong> {debugPanel.state.activeContentId ?? 'none'}
      </div>
      <div>
        <strong>Content anchor:</strong> {debugPanel.state.activeContentAnchorId ?? 'none'}
      </div>
    </aside>
  ) : null;

  const liveRegionContent = useMemo(
    () =>
      announcements.length > 0 ? (
        <div className="visually-hidden" aria-live="polite" aria-atomic="false" data-anchor="global-header.aria-live">
          {announcements.map(announcement => (
            <div key={announcement.id}>{announcement.message}</div>
          ))}
        </div>
      ) : null,
    [announcements],
  );

  if (!debugContent && !liveRegionContent) {
    return null;
  }

  return (
    <>
      {debugContent}
      {liveRegionContent}
    </>
  );
}
