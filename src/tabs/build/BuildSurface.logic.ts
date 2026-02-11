/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Manage pane sizing, persistence, and bindings for the Build surface.
 * Invariants: Anchor usage mirrors Build structure; persisted dimensions stay within safe bounds.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, TouchEvent, RefObject } from 'react';
import { BUILD_ANCHORS } from './anchors.ts';

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
    onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
    onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
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
    onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
    onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  };
}

interface RightPanelState {
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
    onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
    onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
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
  return Math.max(min, Math.min(max, value));
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
  const lastY = useRef<number | null>(null);
  const previousHeight = useRef<number | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [state, setState] = useState<SectionState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { height: initialHeight, collapsed: false };
      const parsed = JSON.parse(raw) as Partial<SectionState>;
      if (
        typeof parsed.height === 'number' &&
        Number.isFinite(parsed.height) &&
        typeof parsed.collapsed === 'boolean'
      ) {
        return {
          height: parsed.height,
          collapsed: parsed.collapsed,
        };
      }
    } catch {
      // ignore storage errors
    }
    return { height: initialHeight, collapsed: false };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state, storageKey]);

  const onMove = useCallback((event: MouseEvent | TouchEvent) => {
    const client =
      'touches' in event && event.touches.length
        ? event.touches[0].clientY
        : (event as MouseEvent).clientY;
    const previousClient = lastY.current ?? client;
    const delta = client - previousClient;
    lastY.current = client;
    setState(previous => {
      const min = 32;
      const parent = containerRef.current?.parentElement;
      const parentHeight = parent
        ? parent.getBoundingClientRect().height
        : window.innerHeight;
      const max = Math.max(min, parentHeight - 2 * min);
      const height = clamp(Math.round(previous.height + delta), min, max);
      return { ...previous, height, collapsed: height <= min };
    });
  }, []);

  const stopDrag = useCallback(() => {
    window.removeEventListener('mousemove', onMove as unknown as EventListener);
    window.removeEventListener('touchmove', onMove as unknown as EventListener);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
    lastY.current = null;
    setDragging(false);
    document.body.style.userSelect = '';
  }, [onMove]);

  const startDrag = useCallback(
    (clientY: number) => {
      lastY.current = clientY;
      setDragging(true);
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('touchmove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    },
    [onMove, stopDrag]
  );

  useEffect(() => () => stopDrag(), [stopDrag]);

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startDrag(event.clientY);
    },
    [startDrag]
  );

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length) startDrag(event.touches[0].clientY);
    },
    [startDrag]
  );

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
    isDragging,
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
      onMouseDown,
      onTouchStart,
      onKeyDown,
    },
  };
}

// [5.3] cfg-buildSurface · Container · "Left Panel Logic"
// Concern: Logic · Parent: "Section Logic Hook" · Catalog: hook.panel
// Notes: Persists catalog column width and exposes accessible grip bindings.
function useLeftPanelLogic(): LeftPanelLogic {
  const STORAGE_KEY = 'left-panel-width';
  const [width, setWidth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 320;
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return clamp(parsed, 160, Math.max(160, window.innerWidth - 320));
      }
    } catch {
      // ignore storage errors
    }
    return 320;
  });
  const [isDragging, setDragging] = useState(false);
  const lastX = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(width));
    } catch {
      // ignore
    }
  }, [width]);

  const onMove = useCallback((event: MouseEvent | TouchEvent) => {
    const client =
      'touches' in event && event.touches.length
        ? event.touches[0].clientX
        : (event as MouseEvent).clientX;
    const previous = lastX.current ?? client;
    const delta = client - previous;
    lastX.current = client;
    setWidth(previousWidth => {
      const min = 160;
      const max = Math.max(min, window.innerWidth - 320);
      return clamp(Math.round(previousWidth + delta), min, max);
    });
  }, []);

  const stopDrag = useCallback(() => {
    window.removeEventListener('mousemove', onMove as unknown as EventListener);
    window.removeEventListener('touchmove', onMove as unknown as EventListener);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
    lastX.current = null;
    setDragging(false);
    document.body.style.userSelect = '';
  }, [onMove]);

  const startDrag = useCallback(
    (clientX: number) => {
      lastX.current = clientX;
      setDragging(true);
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('touchmove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    },
    [onMove, stopDrag]
  );

  useEffect(() => () => stopDrag(), [stopDrag]);

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startDrag(event.clientX);
    },
    [startDrag]
  );

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length) startDrag(event.touches[0].clientX);
    },
    [startDrag]
  );

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
    isDragging,
    gripProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'vertical',
      'aria-label': 'Resize left panel',
      onMouseDown,
      onTouchStart,
      onKeyDown,
    },
  };
}

// [5.4] cfg-buildSurface · Container · "Right Panel Logic"
// Concern: Logic · Parent: "Left Panel Logic" · Catalog: hook.panel
// Notes: Manages inspector width persistence, collapse toggles, and grip bindings.
function useRightPanelLogic(): RightPanelLogic {
  const STORAGE_KEY = 'right-panel-state';
  const [state, setState] = useState<RightPanelState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<RightPanelState>;
        if (
          typeof parsed.width === 'number' &&
          Number.isFinite(parsed.width) &&
          typeof parsed.collapsed === 'boolean'
        ) {
          return parsed as RightPanelState;
        }
      }
    } catch {
      // ignore storage errors
    }
    return { width: 320, collapsed: false };
  });
  const [isDragging, setDragging] = useState(false);
  const lastX = useRef<number | null>(null);
  const previousWidth = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const onMove = useCallback((event: MouseEvent | TouchEvent) => {
    const client =
      'touches' in event && event.touches.length
        ? event.touches[0].clientX
        : (event as MouseEvent).clientX;
    const previous = lastX.current ?? client;
    const delta = previous - client;
    lastX.current = client;
    setState(previousState => {
      const min = 40;
      const max = Math.max(160, window.innerWidth - 320);
      const width = clamp(Math.round(previousState.width + delta), min, max);
      return { ...previousState, width };
    });
  }, []);

  const stopDrag = useCallback(() => {
    window.removeEventListener('mousemove', onMove as unknown as EventListener);
    window.removeEventListener('touchmove', onMove as unknown as EventListener);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchend', stopDrag);
    lastX.current = null;
    setDragging(false);
    document.body.style.userSelect = '';
  }, [onMove]);

  const startDrag = useCallback(
    (clientX: number) => {
      lastX.current = clientX;
      setDragging(true);
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('touchmove', onMove as unknown as EventListener, { passive: true });
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchend', stopDrag);
    },
    [onMove, stopDrag]
  );

  useEffect(() => () => stopDrag(), [stopDrag]);

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startDrag(event.clientX);
    },
    [startDrag]
  );

  const onTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (event.touches.length) startDrag(event.touches[0].clientX);
    },
    [startDrag]
  );

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
        return { ...previous, collapsed: true, width: 40 };
      }
      const restored = Math.max(previousWidth.current ?? 320, 200);
      return { ...previous, collapsed: false, width: restored };
    });
  }, []);

  return {
    width: state.width,
    collapsed: state.collapsed,
    isDragging,
    toggle,
    contentAnchor: BUILD_ANCHORS.rightContent,
    gripProps: {
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'vertical',
      'aria-label': 'Resize right panel',
      onMouseDown,
      onTouchStart,
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
