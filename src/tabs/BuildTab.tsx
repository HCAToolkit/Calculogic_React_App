import { useEffect, useRef, useState } from 'react';
import './BuildTab.css';

function ChevronLeftIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={style} aria-hidden="true" focusable="false">
      <polyline points="13 5 8 10 13 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRightIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={style} aria-hidden="true" focusable="false">
      <polyline points="7 5 12 10 7 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type SectionId = 'cs' | 'acs' | 'scs';

interface SectionPanelProps {
  id: SectionId;
  title: string;
  initialHeight?: number;
  children?: React.ReactNode;
  showGrip?: boolean;
}

function SectionPanel({ id, title, initialHeight = 200, children, showGrip = true }: SectionPanelProps) {
  const storageKey = `section-${id}-state`;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevHeightRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const startHRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [state, setState] = useState<{ height: number; collapsed: boolean }>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.height === 'number' && typeof parsed.collapsed === 'boolean') {
          return { height: parsed.height, collapsed: parsed.collapsed };
        }
      }
    } catch {}
    return { height: initialHeight, collapsed: false };
  });

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [storageKey, state]);

  function toggleCollapse() {
    setState(s => {
      if (!s.collapsed) {
        prevHeightRef.current = s.height;
        return { ...s, collapsed: true, height: 32 };
      } else {
        const restored = Math.max(prevHeightRef.current ?? initialHeight, 120);
        return { ...s, collapsed: false, height: restored };
      }
    });
  }

  function startResize(clientY: number) {
    if (!panelRef.current) return;
    startYRef.current = clientY;
    startHRef.current = panelRef.current.getBoundingClientRect().height;
    function onMove(ev: MouseEvent | TouchEvent) {
      const client = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      const dy = client - startYRef.current;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setState(s => {
          const min = 32;
          const parent = panelRef.current?.parentElement;
          const parentH = parent ? parent.getBoundingClientRect().height : 1000;
          const max = Math.max(min, parentH - 2 * min);
          const newH = Math.max(min, Math.min(max, Math.round(startHRef.current + dy)));
          return { ...s, height: newH, collapsed: newH <= min };
        });
      });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    window.addEventListener('mousemove', onMove as any, { passive: true });
    window.addEventListener('touchmove', onMove as any, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function onGripMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startResize(e.clientY);
  }
  function onGripTouchStart(e: React.TouchEvent) {
    startResize(e.touches[0].clientY);
  }
  function onGripKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 24 : 8;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setState(s => {
        const min = 32;
        const parent = panelRef.current?.parentElement;
        const parentH = parent ? parent.getBoundingClientRect().height : 1000;
        const max = Math.max(min, parentH - 2 * min);
        const delta = e.key === 'ArrowUp' ? -step : step;
        const newH = Math.max(min, Math.min(max, s.height + delta));
        return { ...s, height: newH, collapsed: newH <= min };
      });
    }
  }

  return (
    <div
      ref={panelRef}
      className={`section-panel ${state.collapsed ? 'collapsed' : ''}`}
      style={{ height: state.height, transition: 'height 160ms ease' }}
    >
      <div className="section-header">
        <button
          className="section-collapse-btn"
          role="button"
          aria-controls={id}
          aria-expanded={!state.collapsed}
          onClick={toggleCollapse}
          title={state.collapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {state.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
        <h4 id={`${id}-title`}>{title}</h4>
      </div>

      <div id={id} className="section-content" aria-hidden={state.collapsed} style={{ overflow: 'auto', flex: 1 }}>
        {children}
      </div>

      {showGrip && (
        <div
          className="section-grip"
          role="separator"
          aria-orientation="horizontal"
          tabIndex={0}
          onMouseDown={onGripMouseDown}
          onTouchStart={onGripTouchStart}
          onKeyDown={onGripKeyDown}
          aria-label={`Resize ${title}`}
        />
      )}
    </div>
  );
}

export default function BuildTab() {
  // left panel width with persistence
  const leftKey = 'left-panel-width';
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(leftKey);
      return raw ? Math.max(160, Math.min(800, Number(raw))) : 320;
    } catch {
      return 320;
    }
  });
  const startXRef = useRef(0);
  const startWRef = useRef(leftWidth);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(leftKey, String(leftWidth));
    } catch {}
  }, [leftWidth]);

  function startLeftResize(clientX: number) {
    startXRef.current = clientX;
    startWRef.current = leftWidth;
    function onMove(ev: MouseEvent | TouchEvent) {
      const client = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const dx = client - startXRef.current;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const min = 160;
        const max = Math.max(min, window.innerWidth - 320);
        const newW = Math.max(min, Math.min(max, Math.round(startWRef.current + dx)));
        setLeftWidth(newW);
      });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    window.addEventListener('mousemove', onMove as any, { passive: true });
    window.addEventListener('touchmove', onMove as any, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  }

  function onLeftGripMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startLeftResize(e.clientX);
  }
  function onLeftGripTouchStart(e: React.TouchEvent) {
    startLeftResize(e.touches[0].clientX);
  }
  function onLeftGripKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 32 : 8;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftWidth(w => {
        const min = 160;
        const max = Math.max(min, window.innerWidth - 320);
        const delta = e.key === 'ArrowLeft' ? -step : step;
        return Math.max(min, Math.min(max, w + delta));
      });
    }
  }

  return (
    <div className="build-container">
      {/* Header */}
      <header className="builder-header">
        <h1>🔧 Calculogic Builder</h1>
        <nav className="main-tabs">
          {['Build', 'Calculogic', 'View', 'Knowledge', 'Results'].map((tab) => (
            <button key={tab} className={tab === 'Build' ? 'tab active' : 'tab'}>{tab}</button>
          ))}
          <button className="tab publish">Publish</button>
        </nav>
      </header>

      <div className="split-container">
        <div className="left-panel" style={{ width: leftWidth }}>
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
          onKeyDown={onLeftGripKeyDown}
          aria-label="Resize left panel"
        />

        <div className="center-panel">
          <div className="canvas-inner"><p>Form preview placeholder</p></div>
        </div>

        <div className="right-panel">
          <div className="config-settings">
            <h4>Configuration Settings</h4>
            <div className="box placeholder">Select a field on the canvas to edit its settings.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
