/**
 * Configuration: cfg-contentDrawer (Content Drawer Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentDrawer.md
 * Responsibility: Manage active drawer content state and expose open/close orchestration APIs.
 * Invariants: Only one active content id at a time, anchor ids normalize to null when absent.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface ActiveContentPayload {
  contentId: string;
  anchorId?: string | null;
}

export interface ActiveContentState {
  activeContentId: string | null;
  activeContentAnchorId: string | null;
}

interface ContentContextValue extends ActiveContentState {
  openContent: (payload: ActiveContentPayload) => void;
  closeContent: () => void;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// 5. Logic – cfg-contentDrawer (Content Drawer Configuration)
// NL Sections: §5.1 in cfg-contentDrawer.md
// Purpose: Expose state orchestrator for drawer open/close lifecycles.
// Constraints: Preserve referential stability for callbacks used by consuming concerns.
// ─────────────────────────────────────────────

// [5.1] cfg-contentDrawer · Container · "Drawer State Orchestrator"
// Concern: Logic · Parent: "Content Drawer Configuration" · Catalog: state.container
// Notes: Provides source-of-truth state and controlled mutations for drawer visibility/content.
export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActiveContentState>({
    activeContentId: null,
    activeContentAnchorId: null,
  });

  // [5.1] cfg-contentDrawer · Primitive · "Open Drawer Mutation"
  // Concern: Logic · Parent: "Drawer State Orchestrator" · Catalog: state.mutation
  // Notes: Deduplicates id/anchor updates to avoid unnecessary rerender churn.
  const openContent = useCallback(({ contentId, anchorId }: ActiveContentPayload) => {
    setState(prev => {
      if (prev.activeContentId === contentId && prev.activeContentAnchorId === (anchorId ?? null)) {
        return prev;
      }
      return {
        activeContentId: contentId,
        activeContentAnchorId: anchorId ?? null,
      };
    });
  }, []);

  // [5.1] cfg-contentDrawer · Primitive · "Close Drawer Mutation"
  // Concern: Logic · Parent: "Drawer State Orchestrator" · Catalog: state.mutation
  // Notes: Resets both identifiers atomically so consumers observe a clean close transition.
  const closeContent = useCallback(() => {
    setState(prev => {
      if (!prev.activeContentId && !prev.activeContentAnchorId) {
        return prev;
      }
      return {
        activeContentId: null,
        activeContentAnchorId: null,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      activeContentId: state.activeContentId,
      activeContentAnchorId: state.activeContentAnchorId,
      openContent,
      closeContent,
    }),
    [state.activeContentId, state.activeContentAnchorId, openContent, closeContent],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentState() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentState must be used within a ContentProvider.');
  }
  return context;
}
