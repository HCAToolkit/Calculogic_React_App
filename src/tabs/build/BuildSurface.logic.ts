/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Manage pane sizing, persistence, and bindings for the Build surface.
 * Invariants: Anchor usage mirrors Build structure; persisted dimensions stay within safe bounds.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';
import { clampNumber } from '../../shared/interaction/pointerDrag.ts';
import { usePointerDrag } from '../../shared/interaction/usePointerDrag.ts';
import { BUILD_ANCHORS } from './anchors.ts';
import {
  defaultBuildSurfacePersistenceReporter,
  readBuildSurfaceStorage,
  writeBuildSurfaceStorage,
} from './buildSurfacePersistence.ts';

// ─────────────────────────────────────────────
// 5. Logic – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §5.1–§5.5 in cfg-buildSurface.md
// Purpose: Supply persistent panel state, binding helpers, and aggregated Build surface logic.
// Constraints: Hooks stay local to the Build tab and clean up global listeners.
// ─────────────────────────────────────────────

// [5.1] cfg-buildSurface · Container · "Section Contracts"
// Concern: Logic · Catalog: contract.section
// Notes: Declares section identifiers, binding shapes, order, and helpers shared with Build.
export type SectionId = 'configurations' | 'atomic-components' | 'search-configurations';

interface SectionState {
  version: 1;
  height: number;
  collapsed: boolean;
}

interface SectionLogicOptions {
  initialHeight: number;
  storageKey: string;
  gripVisible?: boolean;
}

export interface SectionLogicBinding {
  id: SectionId;
  containerRef: RefObject<HTMLDivElement | null>;
  height: number;
  collapsed: boolean;
  isDragging: boolean;
  gripVisible: boolean;
  headerButtonProps: {
    onClick: () => void;
    'aria-controls': string;
    'aria-expanded': boolean;
    title: string;
  };
  contentAnchor: string;
  gripProps: {
    role: 'separator';
    tabIndex: number;
    'aria-orientation': 'horizontal';
    'aria-label': string;
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  };
}

interface LeftPanelLogic {
  width: number;
  isDragging: boolean;
  gripProps: {
    role: 'separator';
    tabIndex: number;
    'aria-orientation': 'vertical';
    'aria-label': string;
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  };
}

interface RightPanelState {
  version: 1;
  width: number;
  collapsed: boolean;
}

interface RightPanelLogic {
  width: number;
  collapsed: boolean;
  isDragging: boolean;
  toggle: () => void;
  contentAnchor: string;
  gripProps: {
    role: 'separator';
    tabIndex: number;
    'aria-orientation': 'vertical';
    'aria-label': string;
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  };
}

export interface BuildSurfaceBindings {
  anchors: typeof BUILD_ANCHORS;
  sectionOrder: SectionId[];
  sections: Record<SectionId, SectionLogicBinding>;
  leftPanel: LeftPanelLogic;
  rightPanel: RightPanelLogic;
}

const SECTION_ORDER: SectionId[] = [
  'configurations',
  'atomic-components',
  'search-configurations',
];

export function clamp(value: number, min: number, max: number) {
  return clampNumber(value, min, max);
}



// [5.2.7] cfg-buildSurface · Primitive · "Versioned Payload Contract"
// Concern: Logic · Parent: "Section Contracts" · Catalog: contract.persistence
// Notes: Keeps localStorage payloads forward-compatible by writing versioned state and accepting legacy unversioned payloads.
const BUILD_SURFACE_PERSISTENCE_VERSION = 1 as const;

function toVersionedSectionState(state: Omit<SectionState, 'version'>): SectionState {
  return {
    version: BUILD_SURFACE_PERSISTENCE_VERSION,
    height: state.height,
    collapsed: state.collapsed,
  };
}

export function parseSectionStatePayload(raw: string, fallback: Omit<SectionState, 'version'>): SectionState {
  const parsed = JSON.parse(raw) as Partial<SectionState>;
  if (
    parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION &&
    typeof parsed.height === 'number' &&
    Number.isFinite(parsed.height) &&
    typeof parsed.collapsed === 'boolean'
  ) {
    return parsed as SectionState;
  }

  if (
    parsed.version === undefined &&
    typeof parsed.height === 'number' &&
    Number.isFinite(parsed.height) &&
    typeof parsed.collapsed === 'boolean'
  ) {
    return toVersionedSectionState({
      height: parsed.height,
      collapsed: parsed.collapsed,
    });
  }

  return toVersionedSectionState(fallback);
}

export function parseRightPanelStatePayload(raw: string, fallback: Omit<RightPanelState, 'version'>): RightPanelState {
  const parsed = JSON.parse(raw) as Partial<RightPanelState>;
  if (
    parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION &&
    typeof parsed.width === 'number' &&
    Number.isFinite(parsed.width) &&
    typeof parsed.collapsed === 'boolean'
  ) {
    return parsed as RightPanelState;
  }

  if (
    parsed.version === undefined &&
    typeof parsed.width === 'number' &&
    Number.isFinite(parsed.width) &&
    typeof parsed.collapsed === 'boolean'
  ) {
    return {
      version: BUILD_SURFACE_PERSISTENCE_VERSION,
      width: parsed.width,
      collapsed: parsed.collapsed,
    };
  }

  return {
    version: BUILD_SURFACE_PERSISTENCE_VERSION,
    width: fallback.width,
    collapsed: fallback.collapsed,
  };
}

export function sectionTitle(id: SectionId) {
  switch (id) {
    case 'configurations':
      return 'Configurations';
    case 'atomic-components':
      return 'Atomic Components';
    case 'search-configurations':
      return 'Search Configurations';
    default:
      return id;
  }
}

// [5.2] cfg-buildSurface · Container · "Section Logic Hook"
// Concern: Logic · Parent: "Section Contracts" · Catalog: hook.section
// Notes: Persists section height/collapse state and emits ARIA-aware bindings.
function useSectionLogic(
  id: SectionId,
  { initialHeight, storageKey, gripVisible = true }: SectionLogicOptions
): SectionLogicBinding {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousHeight = useRef<number | null>(null);
  const [state, setState] = useState<SectionState>(() =>
    readBuildSurfaceStorage(
      storageKey,
      () => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return toVersionedSectionState({ height: initialHeight, collapsed: false });
        const parsed = JSON.parse(raw) as Partial<SectionState>;
        if (
          (parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION || parsed.version === undefined) &&
          typeof parsed.height === 'number' &&
          Number.isFinite(parsed.height) &&
          typeof parsed.collapsed === 'boolean'
        ) {
          return parseSectionStatePayload(raw, { height: initialHeight, collapsed: false });
        }

        defaultBuildSurfacePersistenceReporter({
          operation: 'read',
          storageKey,
          error: new Error('Malformed persisted section state payload'),
        });

        return toVersionedSectionState({ height: initialHeight, collapsed: false });
      },
      toVersionedSectionState({ height: initialHeight, collapsed: false })
    )
  );

  useEffect(() => {
    writeBuildSurfaceStorage(storageKey, () => {
      localStorage.setItem(storageKey, JSON.stringify(toVersionedSectionState(state)));
    });
  }, [state, storageKey]);

  const sectionPointerDrag = usePointerDrag({
    axis: 'y',
    onMove: ({ dy }) => {
      setState(previous => {
        const min = 32;
        const parent = containerRef.current?.parentElement;
        const parentHeight = parent
          ? parent.getBoundingClientRect().height
          : window.innerHeight;
        const max = Math.max(min, parentHeight - 2 * min);
        const height = clamp(Math.round(previous.height + dy), min, max);
        return { ...previous, height, collapsed: height <= min };
      });
    },
  });

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 24 : 8;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      setState(previous => {
        const min = 32;
        const parent = containerRef.current?.parentElement;
        const parentHeight = parent
          ? parent.getBoundingClientRect().height
          : window.innerHeight;
        const max = Math.max(min, parentHeight - 2 * min);
        const delta = event.key === 'ArrowUp' ? -step : step;
        const height = clamp(previous.height + delta, min, max);
        return { ...previous, height, collapsed: height <= min };
      });
    }
  }, []);

  const toggle = useCallback(() => {
    setState(previous => {
      if (!previous.collapsed) {
        previousHeight.current = previous.height;
        return { ...previous, collapsed: true, height: 32 };
      }
      const restored = Math.max(previousHeight.current ?? initialHeight, 120);
      return { ...previous, collapsed: false, height: restored };
    });
  }, [initialHeight]);

  return {
    id,
    containerRef,
    height: state.height,
    collapsed: state.collapsed,
    isDragging: sectionPointerDrag.isDragging,
    gripVisible,
    headerButtonProps: {
      onClick: toggle,
      'aria-controls': BUILD_ANCHORS.sectionContent(id),
      'aria-expanded': !state.collapsed,
      title: state.collapsed
        ? `Expand ${sectionTitle(id)}`
        : `Collapse ${sectionTitle(id)}`,
    },
    contentAnchor: BUILD_ANCHORS.sectionContent(id),
    gripProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'horizontal',
      'aria-label': `Resize ${sectionTitle(id)}`,
      onPointerDown: sectionPointerDrag.onPointerDown,
      onKeyDown,
    },
  };
}

// [5.3] cfg-buildSurface · Container · "Left Panel Logic"
// Concern: Logic · Parent: "Section Logic Hook" · Catalog: hook.panel
// Notes: Persists catalog column width and exposes accessible grip bindings.
function useLeftPanelLogic(): LeftPanelLogic {
  const STORAGE_KEY = 'left-panel-width';
  const [width, setWidth] = useState(() =>
    readBuildSurfaceStorage(
      STORAGE_KEY,
      () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return 320;
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          return clamp(parsed, 160, Math.max(160, window.innerWidth - 320));
        }

        defaultBuildSurfacePersistenceReporter({
          operation: 'read',
          storageKey: STORAGE_KEY,
          error: new Error('Malformed persisted left panel width payload'),
        });

        return 320;
      },
      320
    )
  );
  useEffect(() => {
    writeBuildSurfaceStorage(STORAGE_KEY, () => {
      localStorage.setItem(STORAGE_KEY, String(width));
    });
  }, [width]);

  const leftPointerDrag = usePointerDrag({
    axis: 'x',
    onMove: ({ dx }) => {
      setWidth(previousWidth => {
        const min = 160;
        const max = Math.max(min, window.innerWidth - 320);
        return clamp(Math.round(previousWidth + dx), min, max);
      });
    },
  });

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 32 : 8;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setWidth(previous => {
        const min = 160;
        const max = Math.max(min, window.innerWidth - 320);
        const delta = event.key === 'ArrowLeft' ? -step : step;
        return clamp(previous + delta, min, max);
      });
    }
  }, []);

  return {
    width,
    isDragging: leftPointerDrag.isDragging,
    gripProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'vertical',
      'aria-label': 'Resize left panel',
      onPointerDown: leftPointerDrag.onPointerDown,
      onKeyDown,
    },
  };
}

// [5.4] cfg-buildSurface · Container · "Right Panel Logic"
// Concern: Logic · Parent: "Left Panel Logic" · Catalog: hook.panel
// Notes: Manages inspector width persistence, collapse toggles, and grip bindings.
function useRightPanelLogic(): RightPanelLogic {
  const STORAGE_KEY = 'right-panel-state';
  const [state, setState] = useState<RightPanelState>(() =>
    readBuildSurfaceStorage(
      STORAGE_KEY,
      () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<RightPanelState>;
          if (
            (parsed.version === BUILD_SURFACE_PERSISTENCE_VERSION || parsed.version === undefined) &&
            typeof parsed.width === 'number' &&
            Number.isFinite(parsed.width) &&
            typeof parsed.collapsed === 'boolean'
          ) {
            return parseRightPanelStatePayload(raw, { width: 320, collapsed: false });
          }
        }

        defaultBuildSurfacePersistenceReporter({
          operation: 'read',
          storageKey: STORAGE_KEY,
          error: new Error('Malformed persisted right panel state payload'),
        });

        return { version: BUILD_SURFACE_PERSISTENCE_VERSION, width: 320, collapsed: false };
      },
      { version: BUILD_SURFACE_PERSISTENCE_VERSION, width: 320, collapsed: false }
    )
  );
  const previousWidth = useRef<number | null>(null);

  useEffect(() => {
    writeBuildSurfaceStorage(STORAGE_KEY, () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: BUILD_SURFACE_PERSISTENCE_VERSION,
        width: state.width,
        collapsed: state.collapsed,
      }));
    });
  }, [state]);

  const rightPointerDrag = usePointerDrag({
    axis: 'x',
    onMove: ({ dx }) => {
      setState(previousState => {
        const min = 40;
        const max = Math.max(160, window.innerWidth - 320);
        const width = clamp(Math.round(previousState.width - dx), min, max);
        return { ...previousState, version: BUILD_SURFACE_PERSISTENCE_VERSION, width };
      });
    },
  });

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 32 : 8;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setState(previous => {
        const min = 40;
        const max = Math.max(160, window.innerWidth - 320);
        const delta = event.key === 'ArrowLeft' ? step : -step;
        const width = clamp(previous.width + delta, min, max);
        return { ...previous, width };
      });
    }
  }, []);

  const toggle = useCallback(() => {
    setState(previous => {
      if (!previous.collapsed) {
        previousWidth.current = previous.width;
        return { ...previous, version: BUILD_SURFACE_PERSISTENCE_VERSION, collapsed: true, width: 40 };
      }
      const restored = Math.max(previousWidth.current ?? 320, 200);
      return { ...previous, version: BUILD_SURFACE_PERSISTENCE_VERSION, collapsed: false, width: restored };
    });
  }, []);

  return {
    width: state.width,
    collapsed: state.collapsed,
    isDragging: rightPointerDrag.isDragging,
    toggle,
    contentAnchor: BUILD_ANCHORS.rightContent,
    gripProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'vertical',
      'aria-label': 'Resize right panel',
      onPointerDown: rightPointerDrag.onPointerDown,
      onKeyDown,
    },
  };
}

// [5.5] cfg-buildSurface · Container · "Surface Bindings"
// Concern: Logic · Parent: "Right Panel Logic" · Catalog: hook.aggregator
// Notes: Bundles anchor map, ordered sections, and panel bindings for the Build layout.
export function useBuildSurfaceLogic(): BuildSurfaceBindings {
  const configurations = useSectionLogic('configurations', {
    initialHeight: 180,
    storageKey: 'section-configurations-state',
  });
  const atomicComponents = useSectionLogic('atomic-components', {
    initialHeight: 260,
    storageKey: 'section-atomic-components-state',
  });
  const searchConfigurations = useSectionLogic('search-configurations', {
    initialHeight: 180,
    storageKey: 'section-search-configurations-state',
  });

  const sections = useMemo(
    () => ({
      configurations,
      'atomic-components': atomicComponents,
      'search-configurations': searchConfigurations,
    }),
    [configurations, atomicComponents, searchConfigurations]
  ) as Record<SectionId, SectionLogicBinding>;

  const leftPanel = useLeftPanelLogic();
  const rightPanel = useRightPanelLogic();

  return {
    anchors: BUILD_ANCHORS,
    sectionOrder: SECTION_ORDER,
    sections,
    leftPanel,
    rightPanel,
  };
}
