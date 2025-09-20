import { useRef, useEffect, useState } from 'react';
import { Panel, PanelGroup, type ImperativePanelHandle } from 'react-resizable-panels';
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

export default function BuildTab() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const panelGroupRef = useRef<any>(null);

  // Refs for left vertical sections
  const atomicRef = useRef<ImperativePanelHandle>(null);
  const configRef = useRef<ImperativePanelHandle>(null);
  const searchRef = useRef<ImperativePanelHandle>(null);

  // Track collapsed state for each section for icon and class
  const [collapsed, setCollapsed] = useState({
    atomic: false,
    config: false,
    search: false,
  });

  // Persistent layout: load on mount, save on change
  useEffect(() => {
    const saved = localStorage.getItem('panel-layout');
    if (saved && panelGroupRef.current) {
      try {
        const layout = JSON.parse(saved);
        panelGroupRef.current.setLayout(layout);
      } catch {}
    }
  }, []);

  function handleLayoutChange(sizes: number[]) {
    localStorage.setItem('panel-layout', JSON.stringify(sizes));
  }

  // Drag logic for resizing panels
  function handlePanelDrag(side: 'left' | 'right', e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();

    document.body.style.userSelect = 'none';
    let lastX = e.clientX;

    function onMouseMove(ev: MouseEvent) {
      const container = document.querySelector('.dock-panel-group') as HTMLElement;
      if (!container || !panelGroupRef.current) return;
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const dx = ev.clientX - lastX;
      lastX = ev.clientX;

      const sizes = panelGroupRef.current.getLayout() ?? [20, 60, 20];
      let [left, , right] = sizes;

      if (side === 'left') {
        let newLeft = left + (dx / totalWidth) * 100;
        newLeft = Math.max(0, Math.min(newLeft, 100 - right - 10)); // allow 0%
        let newCenter = 100 - newLeft - right;
        if (newCenter < 10) {
          newLeft = 100 - right - 10;
        }
        panelGroupRef.current.setLayout([newLeft, 100 - newLeft - right, right]);
      } else if (side === 'right') {
        let newRight = right - (dx / totalWidth) * 100;
        newRight = Math.max(0, Math.min(newRight, 100 - left - 10)); // allow 0%
        let newCenter = 100 - left - newRight;
        if (newCenter < 10) {
          newRight = 100 - left - 10;
        }
        panelGroupRef.current.setLayout([left, 100 - left - newRight, newRight]);
      }
    }

    function onMouseMoveRAF(ev: MouseEvent) {
      requestAnimationFrame(() => onMouseMove(ev));
    }

    function onMouseUp() {
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMoveRAF);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMoveRAF);
    window.addEventListener('mouseup', onMouseUp);
  }

  // Helper to update collapsed state
  function handleSectionToggle(ref: React.RefObject<ImperativePanelHandle | null>, key: keyof typeof collapsed) {
      if (ref.current?.isCollapsed()) {
        ref.current.expand();
        setCollapsed(c => ({ ...c, [key]: false }));
      } else {
        ref.current?.collapse();
        setCollapsed(c => ({ ...c, [key]: true }));
      }
    }

  // Sync collapsed state on mount (in case of persisted layout)
  useEffect(() => {
    setCollapsed({
      atomic: !!atomicRef.current?.isCollapsed?.() && atomicRef.current.isCollapsed(),
      config: !!configRef.current?.isCollapsed?.() && configRef.current.isCollapsed(),
      search: !!searchRef.current?.isCollapsed?.() && searchRef.current.isCollapsed(),
    });
  }, []);

  return (
    <div className="build-container">
      {/* Header */}
      <header className="builder-header">
        <h1>🔧 Calculogic Builder</h1>
        <nav className="main-tabs">
          {['Build', 'Calculogic', 'View', 'Knowledge', 'Results'].map((tab) => (
            <button
              key={tab}
              className={tab === 'Build' ? 'tab active' : 'tab'}
            >
              {tab}
            </button>
          ))}
          <button className="tab publish">Publish</button>
        </nav>
      </header>

      {/* Outer vertical split: Atomic Control | (Canvas + Inspector) */}
      <PanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        className="dock-panel-group"
        id="main-panel-group"
        onLayout={handleLayoutChange}
      >
        {/* LEFT: Atomic Control with internal vertical splits */}
        <Panel
          ref={leftPanelRef}
          defaultSize={20}
          minSize={1} // allow nearly collapsed, but not 0
          collapsible={false} // no collapse button
          collapsedSize={1}
        >
          <div className="atomic-section dock-panel" style={{ position: 'relative' }}>
            {/* Drag handle for left panel */}
            <div
              className="panel-drag-handle left"
              tabIndex={-1}
              aria-label="Drag panel"
              onMouseDown={e => handlePanelDrag('left', e)}    // <-- ensure binding is here on the container
            >
              <div className="grip">
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
              </div>
            </div>
            <PanelGroup direction="vertical" className="left-vertical-group">
              {/* Section B: Configurations */}
              <Panel
                ref={configRef}
                defaultSize={30}
                minSize={10}
                collapsible
                collapsedSize={6}
                id="cs" // Updated from id="rr"
                className={`left-section-panel${collapsed.config ? ' collapsed' : ''}`}
                onCollapse={() => setCollapsed(c => ({ ...c, config: true }))}
                onExpand={() => setCollapsed(c => ({ ...c, config: false }))}
              >
                <div className="atomic-section section">
                  <div className="section-header">
                    <button
                      className="section-collapse-btn"
                      aria-label={collapsed.config ? "Expand Section" : "Collapse Section"}
                      aria-expanded={!collapsed.config}
                      data-tooltip
                      onClick={e => {
                        e.stopPropagation();
                        handleSectionToggle(configRef, 'config');
                      }}
                      title={collapsed.config ? "Expand Section" : "Collapse Section"}
                    >
                      {collapsed.config ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </button>
                    <h4>Configurations</h4>
                  </div>
                  <div className="section-content">
                    <div className="button-group">
                      {['All', 'User', 'Public', 'Official', 'Favs'].map((t) => (
                        <button key={t}>{t}</button>
                      ))}
                    </div>
                    <div className="box placeholder">[ configurations list ]</div>
                  </div>
                </div>
              </Panel>

              {/* Section A: Atomic Components */}
              <Panel
                ref={atomicRef}
                defaultSize={40}
                minSize={10}
                collapsible
                collapsedSize={6}
                id="acs" // Updated from id="rs"
                className={`left-section-panel${collapsed.atomic ? ' collapsed' : ''}`}
                onCollapse={() => setCollapsed(c => ({ ...c, atomic: true }))}
                onExpand={() => setCollapsed(c => ({ ...c, atomic: false }))}
              >
                <div className="atomic-section section">
                  <div className="section-header">
                    <button
                      className="section-collapse-btn"
                      aria-label={collapsed.atomic ? "Expand Section" : "Collapse Section"}
                      aria-expanded={!collapsed.atomic}
                      data-tooltip
                      onClick={e => {
                        e.stopPropagation();
                        handleSectionToggle(atomicRef, 'atomic');
                      }}
                      title={collapsed.atomic ? "Expand Section" : "Collapse Section"}
                    >
                      {collapsed.atomic ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </button>
                    <h4>Atomic Components</h4>
                  </div>
                  <div className="section-content">
                    <ul className="list">
                      <li>Container Field</li>
                      <li>Sub-Container Field</li>
                      <li>Text Input Field</li>
                      <li>Number Input Field</li>
                      <li>Checkbox Field</li>
                    </ul>
                  </div>
                </div>
              </Panel>

              {/* Section C: Search Configurations */}
              <Panel
                ref={searchRef}
                defaultSize={30}
                minSize={10}
                collapsible
                collapsedSize={6}
                id="scs" // Updated from id="rt"
                className={`left-section-panel${collapsed.search ? ' collapsed' : ''}`}
                onCollapse={() => setCollapsed(c => ({ ...c, search: true }))}
                onExpand={() => setCollapsed(c => ({ ...c, search: false }))}
              >
                <div className="atomic-section section">
                  <div className="section-header">
                    <button
                      className="section-collapse-btn"
                      aria-label={collapsed.search ? "Expand Section" : "Collapse Section"}
                      aria-expanded={!collapsed.search}
                      data-tooltip
                      onClick={e => {
                        e.stopPropagation();
                        handleSectionToggle(searchRef, 'search');
                      }}
                      title={collapsed.search ? "Expand Section" : "Collapse Section"}
                    >
                      {collapsed.search ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </button>
                    <h4>Search Configurations</h4>
                  </div>
                  <div className="section-content">
                    <div className="button-group">
                      {['Official', 'Public'].map((t) => (
                        <button key={t}>{t}</button>
                      ))}
                    </div>
                    <div className="box placeholder">[ search results ]</div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
        {/* CENTER: Canvas */}
        <Panel defaultSize={60} minSize={10}>
          <div className="canvas dock-panel">
            <div className="canvas-inner">
              <p>Form preview placeholder</p>
            </div>
          </div>
        </Panel>
        {/* RIGHT: Config Settings */}
        <Panel
          ref={rightPanelRef}
          defaultSize={20}
          minSize={1} // allow nearly collapsed, but not 0
          collapsible={false} // no collapse button
          collapsedSize={1}
        >
          <div className="dock-panel right-dock-panel" style={{ position: 'relative' }}>
            {/* Drag handle for right panel */}
            <div
              className="panel-drag-handle right"
              tabIndex={-1}
              aria-label="Drag panel"
              onMouseDown={e => handlePanelDrag('right', e)}   // <-- ensure binding is here on the container
            >
              <div className="grip">
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
              </div>
            </div>
            <div className="config-settings">
              <h4>Configuration Settings</h4>
              <div className="box placeholder">
                Select a field on the canvas to edit its settings.
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
