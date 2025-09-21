import React, { useEffect, useRef, useState } from 'react';
import './BuildTab.css';

function ChevronLeftIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={style} aria-hidden="true" focusable="false">
      <polyline points="13 5 8 10 13 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={style} aria-hidden="true" focusable="false">
      <polyline points="7 5 12 10 7 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SectionId = 'cs' | 'acs' | 'scs';
type SectionState = { height: number; collapsed: boolean };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

interface SectionPanelProps {
  id: SectionId;
  title: string;
  initialHeight?: number;
  children?: React.ReactNode;
  showGrip?: boolean;
}

function SectionPanel({ id, title, initialHeight = 200, children, showGrip = true }: SectionPanelProps) {
  const storageKey = `section-${id}-state`;
  const ref = useRef<HTMLDivElement | null>(null);
  const lastY = useRef<number | null>(null);
  const prevHeight = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [state, setState] = useState<SectionState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.height === 'number' && typeof parsed.collapsed === 'boolean') return parsed;
      }
    } catch {}
    return { height: initialHeight, collapsed: false };
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [storageKey, state]);

  function toggleCollapse() {
    setState(s => {
      if (!s.collapsed) {
        prevHeight.current = s.height;
        return { ...s, collapsed: true, height: 32 };
      } else {
        const restored = Math.max(prevHeight.current ?? initialHeight, 120);
        return { ...s, collapsed: false, height: restored };
      }
    });
  }

  function startDrag(clientY: number) {
    if (!ref.current) return;
    lastY.current = clientY;
    setIsDragging(true);
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent | TouchEvent) {
      const client = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      const prev = lastY.current ?? client;
      const delta = client - prev;
      lastY.current = client;
      setState(s => {
        const min = 32;
        const parent = ref.current?.parentElement;
        const parentH = parent ? parent.getBoundingClientRect().height : 1000;
        const max = Math.max(min, parentH - 2 * min);
        const newH = clamp(Math.round(s.height + delta), min, max);
        return { ...s, height: newH, collapsed: newH <= min };
      });
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      lastY.current = null;
      setIsDragging(false);
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', onMove as any, { passive: true });
    window.addEventListener('touchmove', onMove as any, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function onMouseDown(e: React.MouseEvent) { e.preventDefault(); startDrag(e.clientY); }
  function onTouchStart(e: React.TouchEvent) { startDrag(e.touches[0].clientY); }
  function onGripKey(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 24 : 8;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setState(s => {
        const min = 32;
        const parent = ref.current?.parentElement;
        const parentH = parent ? parent.getBoundingClientRect().height : 1000;
        const max = Math.max(min, parentH - 2 * min);
        const delta = e.key === 'ArrowUp' ? -step : step;
        const newH = clamp(s.height + delta, min, max);
        return { ...s, height: newH, collapsed: newH <= min };
      });
    }
  }

  const style: React.CSSProperties = { height: state.height, transition: isDragging ? 'none' : 'height 160ms ease' };

  return (
    <div ref={ref} className={`section-panel ${state.collapsed ? 'collapsed' : ''}`} style={style}>
      <header className="section-header">
        <span className="section-title">{title}</span>
        <button
          className="toggle-btn"
          aria-controls={`${id}-content`}
          aria-expanded={!state.collapsed}
          onClick={toggleCollapse}
          title={state.collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {state.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </header>

      <div id={`${id}-content`} className="section-content" aria-hidden={state.collapsed}>
        {children}
      </div>

      {showGrip && (
        <div
          className="section-grip"
          role="separator"
          aria-orientation="horizontal"
          tabIndex={0}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onKeyDown={onGripKey}
          aria-label={`Resize ${title}`}
        />
      )}
    </div>
  );
}

export default function BuildTab() {
  // left panel width
  const LEFT_KEY = 'left-panel-width';
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(LEFT_KEY);
      return raw ? clamp(Number(raw), 160, Math.max(160, window.innerWidth - 320)) : 320;
    } catch { return 320; }
  });
  const [leftDragging, setLeftDragging] = useState(false);
  const lastLeftX = useRef<number | null>(null);

  useEffect(() => { try { localStorage.setItem(LEFT_KEY, String(leftWidth)); } catch {} }, [leftWidth]);

  function startLeftDrag(clientX: number) {
    lastLeftX.current = clientX;
    setLeftDragging(true);
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent | TouchEvent) {
      const client = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const prev = lastLeftX.current ?? client;
      const delta = client - prev;
      lastLeftX.current = client;
      setLeftWidth(w => {
        const min = 160;
        const max = Math.max(min, window.innerWidth - 320);
        return clamp(Math.round(w + delta), min, max);
      });
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      lastLeftX.current = null;
      setLeftDragging(false);
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', onMove as any, { passive: true });
    window.addEventListener('touchmove', onMove as any, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function onLeftGripMouseDown(e: React.MouseEvent) { e.preventDefault(); startLeftDrag(e.clientX); }
  function onLeftGripTouchStart(e: React.TouchEvent) { startLeftDrag(e.touches[0].clientX); }
  function onLeftGripKey(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 32 : 8;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftWidth(w => clamp(w + (e.key === 'ArrowLeft' ? -step : step), 160, Math.max(160, window.innerWidth - 320)));
    }
  }

  // right panel width + collapse
  const RIGHT_KEY = 'right-panel-state';
  const [right, setRight] = useState<{ width: number; collapsed: boolean }>(() => {
    try { const raw = localStorage.getItem(RIGHT_KEY); if (raw) return JSON.parse(raw); } catch {}
    return { width: 320, collapsed: false };
  });
  useEffect(() => { try { localStorage.setItem(RIGHT_KEY, JSON.stringify(right)); } catch {} }, [right]);

  const [rightDragging, setRightDragging] = useState(false);
  const lastRightX = useRef<number | null>(null);
  const prevRightWidth = useRef<number | null>(null);

  function startRightDrag(clientX: number) {
    lastRightX.current = clientX;
    setRightDragging(true);
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent | TouchEvent) {
      const client = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const prev = lastRightX.current ?? client;
      const delta = prev - client; // invert so dragging left increases width
      lastRightX.current = client;
      setRight(r => {
        const min = 40;
        const max = Math.max(160, window.innerWidth - 320);
        return { ...r, width: clamp(Math.round(r.width + delta), min, max) };
      });
    }

    function onUp() {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      lastRightX.current = null;
      setRightDragging(false);
      document.body.style.userSelect = '';
    }

    window.addEventListener('mousemove', onMove as any, { passive: true });
    window.addEventListener('touchmove', onMove as any, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function onRightGripMouseDown(e: React.MouseEvent) { e.preventDefault(); startRightDrag(e.clientX); }
  function onRightGripTouchStart(e: React.TouchEvent) { startRightDrag(e.touches[0].clientX); }
  function onRightGripKey(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 32 : 8;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setRight(r => ({ ...r, width: clamp(r.width + (e.key === 'ArrowLeft' ? step : -step), 40, Math.max(160, window.innerWidth - 320)) }));
    }
  }

  function toggleRightCollapse() {
    setRight(r => {
      if (!r.collapsed) {
        prevRightWidth.current = r.width;
        return { ...r, collapsed: true, width: 40 };
      } else {
        const restored = Math.max(prevRightWidth.current ?? 320, 200);
        return { ...r, collapsed: false, width: restored };
      }
    });
  }

  const leftStyle: React.CSSProperties = { width: leftWidth, transition: leftDragging ? 'none' : 'width 160ms ease' };
  const rightStyle: React.CSSProperties = { width: right.width, transition: rightDragging ? 'none' : 'width 160ms ease' };

  return (
    <div className="build-container">
      <header className="builder-header">
        <h1>🔧 Calculogic Builder</h1>
        <nav className="main-tabs">
          {['Build', 'Calculogic', 'View', 'Knowledge', 'Results'].map(t => (
            <button key={t} className={t === 'Build' ? 'tab active' : 'tab'}>{t}</button>
          ))}
          <button className="tab publish">Publish</button>
        </nav>
      </header>

      <div className="split-container">
        <div className="left-panel" style={leftStyle}>
          <SectionPanel id="cs" title="Configurations" initialHeight={180}>
            <div className="button-group">
              {['All', 'User', 'Public', 'Official', 'Favs'].map(t => <button key={t}>{t}</button>)}
            </div>
            <div className="box placeholder">[ configurations list ]</div>
          </SectionPanel>

          <SectionPanel id="acs" title="Atomic Components" initialHeight={260}>
            <ul className="list">
              <li>Container Field</li>
              <li>Sub-Container Field</li>
              <li>Text Input Field</li>
              <li>Number Input Field</li>
              <li>Checkbox Field</li>
            </ul>
          </SectionPanel>

          <SectionPanel id="scs" title="Search Configurations" initialHeight={180}>
            <div className="button-group">
              {['Official', 'Public'].map(t => <button key={t}>{t}</button>)}
            </div>
            <div className="box placeholder">[ search results ]</div>
          </SectionPanel>
        </div>

        <div
          className="left-panel-grip"
          role="separator"
          aria-orientation="vertical"
          tabIndex={0}
          onMouseDown={onLeftGripMouseDown}
          onTouchStart={onLeftGripTouchStart}
          onKeyDown={onLeftGripKey}
          aria-label="Resize left panel"
        />

        <div style={{ display: 'flex', flex: '1 1 auto', minWidth: 0, alignItems: 'stretch' }}>
          <div className="center-panel" style={{ flex: 1, minWidth: 0 }}>
            <div className="canvas-inner"><p>Form preview placeholder</p></div>
          </div>

          <div
            className="right-panel-grip"
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onMouseDown={onRightGripMouseDown}
            onTouchStart={onRightGripTouchStart}
            onKeyDown={onRightGripKey}
            aria-label="Resize right panel"
          />

          <div className="right-panel" style={rightStyle}>
            <header className="section-header">
              <span className="section-title">Configuration Settings</span>
              <button
                className="toggle-btn"
                aria-controls="right-panel-content"
                aria-expanded={!right.collapsed}
                onClick={toggleRightCollapse}
                title={right.collapsed ? 'Expand Configuration Settings' : 'Collapse Configuration Settings'}
              >
                {right.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </button>
            </header>

            <div id="right-panel-content" style={{ display: right.collapsed ? 'none' : 'block', padding: 12 }}>
              <div className="box placeholder">Select a field on the canvas to edit its settings.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
