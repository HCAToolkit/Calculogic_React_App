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

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActiveContentState>({
    activeContentId: null,
    activeContentAnchorId: null,
  });

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
