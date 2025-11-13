/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Results
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Render optional debug panel mirroring live header state.
 * Invariants: Debug remains hidden unless enabled; output stays read-only diagnostic copy.
 */
import { useEffect, useMemo } from 'react';
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
export function GlobalHeaderShellResults({ debugPanel, docModal }: GlobalHeaderShellResultsBindings) {
  // [7.2] shell-globalHeader · Primitive · "Escape Key Close Handler"
  // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: interaction.handler
  // Notes: Closes documentation modal when Escape is pressed.
  useEffect(() => {
    if (!docModal.visible) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        docModal.closeDoc();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docModal.visible, docModal.closeDoc]);

  const debugContent = debugPanel.visible ? (
    // [7.3] shell-globalHeader · Primitive · "Debug State Rows"
    // Concern: Results · Parent: "Global Header Debug Panel" · Catalog: diagnostics.readout
    // Notes: Surface current shell state values for developer inspection.
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
  ) : null;

  const docTitleId = useMemo(() => (docModal.doc ? `global-header-doc-title-${docModal.doc.id}` : undefined), [docModal.doc]);
  const docSummaryId = useMemo(
    () => (docModal.doc ? `global-header-doc-summary-${docModal.doc.id}` : undefined),
    [docModal.doc],
  );

  const modalContent = docModal.visible && docModal.doc ? (
    <div className="global-header-shell__doc-overlay" role="presentation" onClick={docModal.closeDoc}>
      <div
        className="global-header-shell__doc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={docTitleId}
        aria-describedby={docSummaryId}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          className="global-header-shell__doc-close"
          onClick={docModal.closeDoc}
          aria-label="Close documentation"
        >
          ×
        </button>
        <header className="global-header-shell__doc-header">
          <p className="global-header-shell__doc-concern">{docModal.doc.concern}</p>
          <h2 id={docTitleId}>{docModal.doc.title}</h2>
          <p id={docSummaryId} className="global-header-shell__doc-summary">
            {docModal.doc.summary}
          </p>
        </header>
        {docModal.doc.recommendedWorkflows && docModal.doc.recommendedWorkflows.length > 0 && (
          <section className="global-header-shell__doc-section" aria-labelledby={`${docTitleId}-workflows`}>
            <h3 id={`${docTitleId}-workflows`}>Recommended workflows</h3>
            <ul>
              {docModal.doc.recommendedWorkflows.map(workflow => (
                <li key={workflow}>{workflow}</li>
              ))}
            </ul>
          </section>
        )}
        {docModal.doc.sections.map(section => (
          <section key={section.heading} className="global-header-shell__doc-section">
            <h3>{section.heading}</h3>
            {section.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        {docModal.doc.links && docModal.doc.links.length > 0 && (
          <section className="global-header-shell__doc-section" aria-labelledby={`${docTitleId}-links`}>
            <h3 id={`${docTitleId}-links`}>Cross-links</h3>
            <ul className="global-header-shell__doc-link-list">
              {docModal.doc.links.map(link => (
                <li key={link.docId}>
                  <button
                    type="button"
                    className="global-header-shell__doc-link"
                    onClick={() => docModal.openDoc(link.docId)}
                  >
                    <span className="global-header-shell__doc-link-label">{link.label}</span>
                    {link.description && <span className="global-header-shell__doc-link-desc">{link.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  ) : null;

  if (!debugContent && !modalContent) {
    return null;
  }

  return (
    <>
      {debugContent}
      {modalContent}
    </>
  );
}
