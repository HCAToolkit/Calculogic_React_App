import { useRef, useEffect } from 'react';
import { Panel, PanelGroup, type ImperativePanelHandle } from 'react-resizable-panels';
import './BuildTab.css';

export default function BuildTab() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const panelGroupRef = useRef<any>(null);

  // Refs for left vertical sections
  const atomicRef = useRef<ImperativePanelHandle>(null);
  const configRef = useRef<ImperativePanelHandle>(null);
  const searchRef = useRef<ImperativePanelHandle>(null);

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
              onMouseDown={e => handlePanelDrag('left', e)}
            >
              <div className="grip">
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
                <div className="grip-dot"></div>
              </div>
            </div>
            <PanelGroup direction="vertical" className="left-vertical-group">
              {/* Section B: Configurations (moved above Atomic Components) */}
              <Panel
                ref={configRef}
                defaultSize={30}
                minSize={10}
                collapsible
                collapsedSize={6}
                className="left-section-panel"
              >
                <div className="atomic-section">
                  <button
                    className="section-collapse-btn"
                    aria-label="Collapse/Expand Section"
                    data-tooltip
                    onClick={e => {
                      e.stopPropagation();
                      if (configRef.current?.isCollapsed()) {
                        configRef.current.expand();
                      } else {
                        configRef.current?.collapse();
                      }
                    }}
                    title="Collapse/Expand Section"
                  >&#x25BC;</button>
                  <h4>Configurations</h4>
                  <div className="button-group">
                    {['All', 'User', 'Public', 'Official', 'Favs'].map((t) => (
                      <button key={t}>{t}</button>
                    ))}
                  </div>
                  <div className="box placeholder">[ configurations list ]</div>
                </div>
              </Panel>

              {/* Section A: Atomic Components (now below Configurations) */}
              <Panel
                ref={atomicRef}
                defaultSize={40}
                minSize={10}
                collapsible
                collapsedSize={6}
                className="left-section-panel"
              >
                <div className="atomic-section">
                  <button
                    className="section-collapse-btn"
                    aria-label="Collapse/Expand Section"
                    data-tooltip
                    onClick={e => {
                      e.stopPropagation();
                      if (atomicRef.current?.isCollapsed()) {
                        atomicRef.current.expand();
                      } else {
                        atomicRef.current?.collapse();
                      }
                    }}
                    title="Collapse/Expand Section"
                  >&#x25BC;</button>
                  <h4>Atomic Components</h4>
                  <ul className="list">
                    <li>Container Field</li>
                    <li>Sub-Container Field</li>
                    <li>Text Input Field</li>
                    <li>Number Input Field</li>
                    <li>Checkbox Field</li>
                  </ul>
                </div>
              </Panel>

              {/* Section C: Search Configurations */}
              <Panel
                ref={searchRef}
                defaultSize={30}
                minSize={10}
                collapsible
                collapsedSize={6}
                className="left-section-panel"
              >
                <div className="atomic-section">
                  <button
                    className="section-collapse-btn"
                    aria-label="Collapse/Expand Section"
                    data-tooltip
                    onClick={e => {
                      e.stopPropagation();
                      if (searchRef.current?.isCollapsed()) {
                        searchRef.current.expand();
                      } else {
                        searchRef.current?.collapse();
                      }
                    }}
                    title="Collapse/Expand Section"
                  >&#x25BC;</button>
                  <h4>Search Configurations</h4>
                  <div className="button-group">
                    {['Official', 'Public'].map((t) => (
                      <button key={t}>{t}</button>
                    ))}
                  </div>
                  <div className="box placeholder">[ search results ]</div>
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
              onMouseDown={e => handlePanelDrag('right', e)}
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
