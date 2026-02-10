import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import './ContentDrawer.css';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ContentNode {
  id?: string;
  title: string;
  summary?: string;
  blocks: ReactNode[];
}

export interface ContentDrawerProps {
  open: boolean;
  content?: ContentNode | null;
  contentId?: string;
  anchorId?: string;
  onClose: () => void;
  onResolveContent?: (contentId: string) => ContentNode | null | undefined;
}

export function ContentDrawer({
  open,
  content,
  contentId,
  anchorId,
  onClose,
  onResolveContent,
}: ContentDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const resolvedContent = useMemo(() => {
    if (content) return content;
    if (contentId && onResolveContent) {
      return onResolveContent(contentId) ?? null;
    }
    return null;
  }, [content, contentId, onResolveContent]);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const focusTarget = focusable[0] ?? drawer;
    focusTarget.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActive?.focus();
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !anchorId) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const anchorTarget =
      drawer.querySelector<HTMLElement>(`#${CSS.escape(anchorId)}`) ??
      drawer.querySelector<HTMLElement>(`[data-anchor="${anchorId}"]`);

    anchorTarget?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [anchorId, open, resolvedContent]);

  if (!open) return null;

  const titleId = resolvedContent?.id ? `${resolvedContent.id}-title` : 'content-drawer-title';
  const summaryId = resolvedContent?.id
    ? `${resolvedContent.id}-summary`
    : 'content-drawer-summary';

  return (
    <aside
      className="content-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={resolvedContent?.summary ? summaryId : undefined}
      ref={drawerRef}
      tabIndex={-1}
    >
      <header className="content-drawer__header">
        <div>
          <p className="content-drawer__eyebrow">Content Detail</p>
          <h2 id={titleId} className="content-drawer__title">
            {resolvedContent?.title ?? 'Content'}
          </h2>
          {resolvedContent?.summary && (
            <p id={summaryId} className="content-drawer__summary">
              {resolvedContent.summary}
            </p>
          )}
        </div>
        <button
          type="button"
          className="content-drawer__close"
          onClick={onClose}
          aria-label="Close content drawer"
        >
          ✕
        </button>
      </header>
      <div className="content-drawer__body">
        {resolvedContent ? (
          resolvedContent.blocks.map((block, index) => (
            <section key={`${resolvedContent.id ?? 'block'}-${index}`} className="content-drawer__block">
              {block}
            </section>
          ))
        ) : (
          <div className="content-drawer__empty">
            Select a content item to review its details.
          </div>
        )}
      </div>
    </aside>
  );
}
