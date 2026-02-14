/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Render the content drawer shell, header, and body structure for resolved content nodes.
 * Invariants: Drawer anchor remains stable, header always exposes close control, body sections use deterministic anchors.
 * Notes: Includes anchor-jump orchestration colocated with structure.
 */

import { useEffect, useMemo, useRef } from 'react';
import { resolveDrawerContent } from '../../content/contentResolutionAdapter';
import { toAnchorId } from './ContentDrawer.anchor';
import { useContentState } from '../../content/ContentContext';
import './ContentDrawer.css';

// ─────────────────────────────────────────────
// 3. Build – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §3.1–§3.4 in cfg-contentDrawer.md
// Purpose: Provide shell, header, body, and anchor-target structure for drawer content.
// Constraints: Keep anchor identifiers deterministic and preserve right-side shell wrapper.
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 5. Logic – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §5.2–§5.3 in cfg-contentDrawer.md
// Purpose: Resolve content by namespace and scroll to requested anchor on open.
// Constraints: Resolution remains deterministic; anchor scrolling only runs when target exists.
// ─────────────────────────────────────────────

export default function ContentDrawer() {
  const { activeContentId, activeContentAnchorId, closeContent, openContent } = useContentState();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // [5.2] cfg-contentDrawer · Subcontainer · "Resolver Pipeline"
  // Concern: Logic · Parent: "Drawer State Orchestrator" · Catalog: resolver.pipeline
  // Notes: Active content id is resolved lazily and memoized per id transition.
  const resolution = useMemo(
    () =>
      activeContentId
        ? resolveDrawerContent(activeContentId, activeContentAnchorId ?? undefined)
        : null,
    [activeContentAnchorId, activeContentId],
  );

  // [5.3] cfg-contentDrawer · Primitive · "Anchor Scroll Handler"
  // Concern: Logic · Parent: "Resolver Pipeline" · Catalog: navigation.scroll
  // Notes: Scrolls only after content/anchor settle and a concrete HTMLElement target is found.
  useEffect(() => {
    if (!activeContentAnchorId || !drawerRef.current) {
      return;
    }
    const anchorTarget = drawerRef.current.querySelector(
      `[data-content-anchor="${activeContentAnchorId}"], #${activeContentAnchorId}`,
    );
    if (anchorTarget instanceof HTMLElement) {
      anchorTarget.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [activeContentAnchorId, activeContentId]);

  if (!activeContentId) {
    return null;
  }

  if (!resolution || resolution.kind === 'missing') {
    return (
      // [3.1] cfg-contentDrawer · Container · "Content Drawer Shell"
      // Concern: Build · Parent: "Content Drawer Configuration" · Catalog: layout.shell
      // Notes: Missing-resolution shell mirrors standard framing for predictable UX.
      <aside className="content-drawer" data-anchor="content-drawer">
        {/* [3.2] cfg-contentDrawer · Subcontainer · "Drawer Header"
            Concern: Build · Parent: "Content Drawer Shell" · Catalog: layout.header
            Notes: Shows not-found summary and recovery control. */}
        <div className="content-drawer__header">
          <div>
            <p className="content-drawer__eyebrow">Content</p>
            <h2 className="content-drawer__title">Content not found</h2>
            <p className="content-drawer__summary">
              The provider could not resolve <strong>{resolution?.contentId ?? activeContentId}</strong>.
            </p>
          </div>
          <button type="button" className="content-drawer__close" onClick={closeContent}>
            Close
          </button>
        </div>
      </aside>
    );
  }

  if (resolution.kind === 'doc') {
    const { doc } = resolution;
    return (
      // [3.1] cfg-contentDrawer · Container · "Content Drawer Shell"
      // Concern: Build · Parent: "Content Drawer Configuration" · Catalog: layout.shell
      // Notes: Primary shell path for successfully resolved documentation payloads.
      <aside className="content-drawer" data-anchor="content-drawer">
        {/* [3.3] cfg-contentDrawer · Subcontainer · "Drawer Body"
            Concern: Build · Parent: "Content Drawer Shell" · Catalog: content.body
            Notes: Hosts scrollable content card and section anchors. */}
        <div className="content-drawer__card" ref={drawerRef}>
          {/* [3.2] cfg-contentDrawer · Subcontainer · "Drawer Header"
              Concern: Build · Parent: "Content Drawer Shell" · Catalog: layout.header
              Notes: Renders concern context, title, and close action. */}
          <div className="content-drawer__header">
            <div>
              <p className="content-drawer__eyebrow">{doc.concern} documentation</p>
              <h2 className="content-drawer__title">{doc.title}</h2>
              <p className="content-drawer__summary">{doc.summary}</p>
            </div>
            <button type="button" className="content-drawer__close" onClick={closeContent}>
              Close
            </button>
          </div>
          {doc.recommendedWorkflows && doc.recommendedWorkflows.length > 0 ? (
            <div className="content-drawer__section" data-content-anchor="recommended-workflows">
              <h3 className="content-drawer__section-title">Recommended workflows</h3>
              <ul>
                {doc.recommendedWorkflows.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {doc.sections.map(section => {
            const sectionAnchor = toAnchorId(section.heading);
            return (
              <div
                key={section.heading}
                className="content-drawer__section"
                data-content-anchor={sectionAnchor}
              >
                <h3 className="content-drawer__section-title" id={sectionAnchor}>
                  {section.heading}
                </h3>
                {section.body.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            );
          })}
          {doc.links && doc.links.length > 0 ? (
            <div className="content-drawer__section" data-content-anchor="related-links">
              <h3 className="content-drawer__section-title">Related content</h3>
              <ul>
                {doc.links.map(link => (
                  <li key={link.label}>
                    <button
                      type="button"
                      className="content-drawer__link"
                      onClick={() =>
                        openContent({
                          contentId: `docs:${link.docId}`,
                        })
                      }
                    >
                      {link.label}
                    </button>
                    {link.description ? (
                      <p className="content-drawer__link-description">{link.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  return null;
}
