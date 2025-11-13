import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BRAND_TAGLINE,
  BRAND_TOOLTIP,
  BRAND_WORDMARK,
  BREAKPOINTS,
  HEADER_TAB_DEFINITIONS,
  PUBLISH_LABEL,
  type HeaderModeId,
  type HeaderTabDefinition,
  type HeaderTabId,
} from './GlobalHeaderShell.knowledge';

export interface GlobalHeaderShellState {
  activeTab: HeaderTabId;
  activeModeByTab: {
    build: HeaderModeId;
    results: HeaderModeId;
  };
  hoveredTab: HeaderTabId | null;
  viewportBreakpoint: 'desktop' | 'tablet' | 'mobile';
  activeDocId: string | null;
}

export interface GlobalHeaderShellProps {
  onPublish?: () => void;
}

export interface GlobalHeaderShellBuildBindings extends GlobalHeaderShellState {
  tabs: HeaderTabDefinition[];
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  brand: {
    wordmark: string;
    tagline: string;
    tooltip: string;
    homeHref: string;
  };
  publishLabel: string;
  selectTab: (tab: HeaderTabId) => void;
  hoverTab: (tab: HeaderTabId | null) => void;
  triggerPublish: () => void;
  openDoc: (docId: string) => void;
  closeDoc: () => void;
}

export interface GlobalHeaderShellResultsBindings {
  debugPanel: {
    visible: boolean;
    state: Pick<
      GlobalHeaderShellState,
      'activeTab' | 'activeModeByTab' | 'viewportBreakpoint' | 'hoveredTab'
    >;
  };
}

export interface GlobalHeaderShellBindings {
  build: GlobalHeaderShellBuildBindings;
  results: GlobalHeaderShellResultsBindings;
}

const DEFAULT_STATE: GlobalHeaderShellState = {
  activeTab: 'build',
  activeModeByTab: {
    build: 'default',
    results: 'default',
  },
  hoveredTab: null,
  viewportBreakpoint: 'desktop',
  activeDocId: null,
};

function determineBreakpoint(width: number): 'desktop' | 'tablet' | 'mobile' {
  if (width >= BREAKPOINTS[0].minWidth) return 'desktop';
  if (width >= BREAKPOINTS[1].minWidth) return 'tablet';
  return 'mobile';
}

export function useGlobalHeaderShellLogic({ onPublish }: GlobalHeaderShellProps = {}): GlobalHeaderShellBindings {
  const [state, setState] = useState<GlobalHeaderShellState>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_STATE;
    }
    return {
      ...DEFAULT_STATE,
      viewportBreakpoint: determineBreakpoint(window.innerWidth),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleResize = () => {
      setState(prev => {
        const nextBreakpoint = determineBreakpoint(window.innerWidth);
        if (prev.viewportBreakpoint === nextBreakpoint) {
          return prev;
        }
        return {
          ...prev,
          viewportBreakpoint: nextBreakpoint,
        };
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectTab = useCallback((tab: HeaderTabId) => {
    setState(prev => {
      const nextActiveModeByTab = { ...prev.activeModeByTab };
      if (tab === 'build') {
        nextActiveModeByTab.build = 'default';
      }
      if (tab === 'results') {
        nextActiveModeByTab.results = 'default';
      }
      return {
        ...prev,
        activeTab: tab,
        hoveredTab: null,
        activeModeByTab: nextActiveModeByTab,
      };
    });
  }, []);

  const hoverTab = useCallback((tab: HeaderTabId | null) => {
    setState(prev => {
      if (prev.hoveredTab === tab) {
        return prev;
      }
      return {
        ...prev,
        hoveredTab: tab,
      };
    });
  }, []);

  const triggerPublish = useCallback(() => {
    if (onPublish) {
      onPublish();
    } else {
      // eslint-disable-next-line no-console
      console.info('Publish triggered from GlobalHeaderShell.');
    }
  }, [onPublish]);

  const openDoc = useCallback((docId: string) => {
    setState(prev => {
      if (prev.activeDocId === docId) {
        return prev;
      }
      return {
        ...prev,
        activeDocId: docId,
      };
    });
  }, []);

  const closeDoc = useCallback(() => {
    setState(prev => {
      if (!prev.activeDocId) {
        return prev;
      }
      return {
        ...prev,
        activeDocId: null,
      };
    });
  }, []);

  const tabs = useMemo(() => [...HEADER_TAB_DEFINITIONS].sort((a, b) => a.order - b.order), []);

  const { viewportBreakpoint } = state;
  const isDesktop = viewportBreakpoint === 'desktop';
  const isTablet = viewportBreakpoint === 'tablet';
  const isMobile = viewportBreakpoint === 'mobile';

  const buildBindings: GlobalHeaderShellBuildBindings = {
    ...state,
    tabs,
    isDesktop,
    isTablet,
    isMobile,
    brand: {
      wordmark: BRAND_WORDMARK,
      tagline: BRAND_TAGLINE,
      tooltip: BRAND_TOOLTIP,
      homeHref: '/',
    },
    publishLabel: PUBLISH_LABEL,
    selectTab,
    hoverTab,
    triggerPublish,
    openDoc,
    closeDoc,
  };

  const resultsBindings: GlobalHeaderShellResultsBindings = {
    debugPanel: {
      visible: false,
      state: {
        activeTab: state.activeTab,
        activeModeByTab: state.activeModeByTab,
        viewportBreakpoint: state.viewportBreakpoint,
        hoveredTab: state.hoveredTab,
      },
    },
  };

  return {
    build: buildBindings,
    results: resultsBindings,
  };
}
