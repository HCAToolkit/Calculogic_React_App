/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Logic
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Orchestrate header state, breakpoint awareness, and bindings for build/results concerns.
 * Invariants: Breakpoints derive solely from knowledge catalog; callbacks stay referentially stable; publish handler always resolves.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BRAND_TAGLINE,
  BRAND_TOOLTIP,
  BRAND_WORDMARK,
  BREAKPOINTS,
  HEADER_MODE_DEFINITIONS,
  HEADER_MODE_SEQUENCE,
  HEADER_TAB_DEFINITIONS,
  PUBLISH_LABEL,
  type HeaderModeCatalog,
  type HeaderModeId,
  type HeaderModeSequence,
  type HeaderTabDefinition,
  type HeaderTabId,
} from './GlobalHeaderShell.knowledge';

// ─────────────────────────────────────────────
// 5. Logic – shell-globalHeader (Global Header Shell)
// NL Sections: §5.1–§5.2.11 in shell-globalHeader.md
// Purpose: Produce deterministic header state machine and derived bindings.
// Constraints: Remain SSR-safe; depend solely on knowledge catalog for defaults.
// ─────────────────────────────────────────────

export interface GlobalHeaderShellState {
  activeTab: HeaderTabId;
  activeModeByTab: {
    build: HeaderModeId;
    results: HeaderModeId;
  };
  hoveredTab: HeaderTabId | null;
  modeMenuVisibleForTab: HeaderTabId | null;
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
  modeMetadata: HeaderModeCatalog;
  modeSequence: HeaderModeSequence;
  brand: {
    wordmark: string;
    tagline: string;
    tooltip: string;
    homeHref: string;
  };
  publishLabel: string;
  selectTab: (tab: HeaderTabId) => void;
  selectTabMode: (tab: 'build' | 'results', mode: HeaderModeId) => void;
  hoverTab: (tab: HeaderTabId | null) => void;
  triggerPublish: () => void;
  openDoc: (docId: string) => void;
  closeDoc: () => void;
}

export interface GlobalHeaderShellResultsBindings {
  debugPanel: {
    visible: boolean;
    state: {
      currentActiveTab: HeaderTabId;
      currentBuildMode: HeaderModeId;
      currentResultsMode: HeaderModeId;
      modeMenuVisibleForTab: HeaderTabId | null;
      viewportBreakpoint: 'desktop' | 'tablet' | 'mobile';
    };
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
  modeMenuVisibleForTab: 'build',
  viewportBreakpoint: 'desktop',
  activeDocId: null,
};

// [7.1.a] shell-globalHeader · Primitive · "Debug Panel Visibility Flag"
// Concern: Logic · Catalog: diagnostics.flag
// Notes: Enables results debug panel in non-production environments while remaining tree-shakeable.
const DEBUG_PANEL_VISIBLE = !!import.meta.env?.DEV;

function isModeMenuTab(tab: HeaderTabId | null): tab is 'build' | 'results' {
  return tab === 'build' || tab === 'results';
}

// [5.1] shell-globalHeader · Primitive · "Viewport Breakpoint Heuristic"
// Concern: Logic · Catalog: responsive.breakpoint
// Notes: Maps viewport widths to named breakpoints in descending priority.
function determineBreakpoint(width: number): 'desktop' | 'tablet' | 'mobile' {
  if (width >= BREAKPOINTS[0].minWidth) return 'desktop';
  if (width >= BREAKPOINTS[1].minWidth) return 'tablet';
  return 'mobile';
}

// [5.2] shell-globalHeader · Container · "Global Header Logic Hook"
// Concern: Logic · Catalog: logic.hook
// Notes: Central orchestrator bundling build/results bindings from React state.
export function useGlobalHeaderShellLogic({ onPublish }: GlobalHeaderShellProps = {}): GlobalHeaderShellBindings {
  // [5.2.1] shell-globalHeader · Primitive · "State Initialization & Bootstrapping"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: state.initialize
  // Notes: Hydrates initial state and adapts to SSR absence of window.
  const [state, setState] = useState<GlobalHeaderShellState>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_STATE;
    }
    return {
      ...DEFAULT_STATE,
      viewportBreakpoint: determineBreakpoint(window.innerWidth),
    };
  });

  // [5.2.2] shell-globalHeader · Primitive · "Viewport Resize Subscription"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: responsive.listener
  // Notes: Subscribes to resize to update breakpoint while avoiding redundant state writes.
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

  // [5.2.3] shell-globalHeader · Primitive · "Tab Selection Handler"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: interaction.handler
  // Notes: Resets hovered state and mode defaults when switching concerns.
  const selectTab = useCallback((tab: HeaderTabId) => {
    setState(prev => {
      const nextModeMenuVisibleForTab = isModeMenuTab(tab) ? tab : null;
      if (
        prev.activeTab === tab &&
        prev.hoveredTab === null &&
        prev.modeMenuVisibleForTab === nextModeMenuVisibleForTab
      ) {
        return prev;
      }
      return {
        ...prev,
        activeTab: tab,
        hoveredTab: null,
        modeMenuVisibleForTab: nextModeMenuVisibleForTab,
      };
    });
  }, []);

  // [5.2.4] shell-globalHeader · Primitive · "Tab Hover Handler"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: interaction.handler
  // Notes: Stores hovered tab id while skipping no-op updates.
  const hoverTab = useCallback((tab: HeaderTabId | null) => {
    setState(prev => {
      let nextModeMenuVisibleForTab = prev.modeMenuVisibleForTab;

      if (isModeMenuTab(tab)) {
        nextModeMenuVisibleForTab = tab;
      } else {
        const previouslyHovered = prev.hoveredTab;
        if (isModeMenuTab(previouslyHovered) && prev.activeTab !== previouslyHovered) {
          nextModeMenuVisibleForTab = isModeMenuTab(prev.activeTab) ? prev.activeTab : null;
        }
      }

      if (prev.hoveredTab === tab && prev.modeMenuVisibleForTab === nextModeMenuVisibleForTab) {
        return prev;
      }

      return {
        ...prev,
        hoveredTab: tab,
        modeMenuVisibleForTab: nextModeMenuVisibleForTab,
      };
    });
  }, []);

  // [5.2.4.a] shell-globalHeader · Primitive · "Tab Mode Selection Handler"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: interaction.handler
  // Notes: Pins requested tab and updates mode selection while clearing hover state.
  const selectTabMode = useCallback((tab: 'build' | 'results', mode: HeaderModeId) => {
    setState(prev => {
      const currentMode = prev.activeModeByTab[tab];
      const shouldUpdateMode = currentMode !== mode;
      const shouldUpdateTab = prev.activeTab !== tab;
      const shouldClearHover = prev.hoveredTab !== null;
      const shouldPinMenu = prev.modeMenuVisibleForTab !== tab;

      if (!shouldUpdateMode && !shouldUpdateTab && !shouldClearHover && !shouldPinMenu) {
        return prev;
      }

      return {
        ...prev,
        activeTab: tab,
        hoveredTab: null,
        modeMenuVisibleForTab: tab,
        activeModeByTab: {
          ...prev.activeModeByTab,
          [tab]: mode,
        },
      };
    });
  }, []);

  // [5.2.5] shell-globalHeader · Primitive · "Publish Trigger Handler"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: interaction.handler
  // Notes: Delegates to caller or logs intent when no callback provided.
  const triggerPublish = useCallback(() => {
    if (onPublish) {
      onPublish();
    } else {
      console.info('Publish triggered from GlobalHeaderShell.');
    }
  }, [onPublish]);

  // [5.2.6] shell-globalHeader · Primitive · "Doc Visibility Controls"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: interaction.handler
  // Notes: Manages doc modal activation while preventing redundant updates.
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

  // [5.2.7] shell-globalHeader · Primitive · "Tab Definition Ordering"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: data.transform
  // Notes: Ensures deterministic tab order based on knowledge-defined ordering.
  const tabs = useMemo(() => [...HEADER_TAB_DEFINITIONS].sort((a, b) => a.order - b.order), []);

  // [5.2.8.a] shell-globalHeader · Primitive · "Active Doc Resolver"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: state.derive
  // Notes: Resolves documentation payload for current doc id or null when absent.
  // [5.2.8] shell-globalHeader · Primitive · "Viewport Flag Derivation"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: state.derive
  // Notes: Convenience booleans for downstream build concern to avoid repeated comparisons.
  const { viewportBreakpoint } = state;
  const isDesktop = viewportBreakpoint === 'desktop';
  const isTablet = viewportBreakpoint === 'tablet';
  const isMobile = viewportBreakpoint === 'mobile';

  // [5.2.9] shell-globalHeader · Primitive · "Build Bindings Assembly"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: bindings.compose
  // Notes: Packages brand copy, tab metadata, and action handlers for build concern.
  const buildBindings: GlobalHeaderShellBuildBindings = {
    ...state,
    tabs,
    isDesktop,
    isTablet,
    isMobile,
    modeMetadata: HEADER_MODE_DEFINITIONS,
    modeSequence: HEADER_MODE_SEQUENCE,
    brand: {
      wordmark: BRAND_WORDMARK,
      tagline: BRAND_TAGLINE,
      tooltip: BRAND_TOOLTIP,
      homeHref: '/',
    },
    publishLabel: PUBLISH_LABEL,
    selectTab,
    selectTabMode,
    hoverTab,
    triggerPublish,
    openDoc,
    closeDoc,
  };

  // [5.2.10] shell-globalHeader · Primitive · "Results Bindings Assembly"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: bindings.compose
  // Notes: Exposes debug surface visibility plus current header state snapshot.
  const resultsBindings: GlobalHeaderShellResultsBindings = {
    debugPanel: {
      visible: DEBUG_PANEL_VISIBLE,
      state: {
        currentActiveTab: state.activeTab,
        currentBuildMode: state.activeModeByTab.build,
        currentResultsMode: state.activeModeByTab.results,
        modeMenuVisibleForTab: state.modeMenuVisibleForTab,
        viewportBreakpoint: state.viewportBreakpoint,
      },
    },
  };

  // [5.2.11] shell-globalHeader · Primitive · "Hook Return Envelope"
  // Concern: Logic · Parent: "Global Header Logic Hook" · Catalog: bindings.compose
  // Notes: Returns consolidated bindings for build and results concerns.
  return {
    build: buildBindings,
    results: resultsBindings,
  };
}
