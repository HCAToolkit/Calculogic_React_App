import { useEffect, useMemo, useRef } from 'react';
import { resolveContent } from '../../content/contentProviders';
import { useContentState } from '../../content/ContentContext';
import './ContentDrawer.css';

function toAnchorId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ContentDrawer() {
  const { activeContentId, activeContentAnchorId, closeContent, openContent } = useContentState();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const resolution = useMemo(
    () => (activeContentId ? resolveContent(activeContentId) : null),
    [activeContentId],
  );

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

  if (!resolution) {
    return (
      <aside className="content-drawer" data-anchor="content-drawer">
        <div className="content-drawer__header">
          <div>
            <p className="content-drawer__eyebrow">Content</p>
            <h2 className="content-drawer__title">Unavailable content</h2>
            <p className="content-drawer__summary">
              No provider could resolve <strong>{activeContentId}</strong>.
            </p>
          </div>
          <button type="button" className="content-drawer__close" onClick={closeContent}>
            Close
          </button>
        </div>
      </aside>
    );
  }

  if (resolution.kind === 'missing') {
    return (
      <aside className="content-drawer" data-anchor="content-drawer">
        <div className="content-drawer__header">
          <div>
            <p className="content-drawer__eyebrow">Content</p>
            <h2 className="content-drawer__title">Content not found</h2>
            <p className="content-drawer__summary">
              The provider could not resolve <strong>{resolution.contentId}</strong>.
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
    const doc = resolution.doc;
    return (
      <aside className="content-drawer" data-anchor="content-drawer">
        <div className="content-drawer__card" ref={drawerRef}>
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
