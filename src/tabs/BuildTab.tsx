import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import './BuildTab.css';

export default function BuildTab() {
  return (
    <div className="build-container">
      {/* Header with tabs */}
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

      {/* Outer split: Left (Atomic Control) vs Middle+Right */}
      <PanelGroup direction="horizontal">
        {/* LEFT: Atomic Control with internal vertical splits */}
        <Panel defaultSize={20}>
          <PanelGroup direction="vertical">
            {/* Section 1: Atomic Components */}
            <Panel defaultSize={40}>
              <div className="atomic-section">
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

            <PanelResizeHandle className="resize-handle" />

            {/* Section 2: Configurations */}
            <Panel defaultSize={30}>
              <div className="atomic-section">
                <h4>Configurations</h4>
                <div className="button-group">
                  {['All', 'User', 'Public', 'Official', 'Favs'].map((t) => (
                    <button key={t}>{t}</button>
                  ))}
                </div>
                <div className="box placeholder">[ configurations list ]</div>
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle" />

            {/* Section 3: Search Configurations */}
            <Panel defaultSize={30}>
              <div className="atomic-section">
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
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* CENTER: Canvas */}
        <Panel defaultSize={60}>
          <div className="canvas">
            <div className="canvas-inner">
              <p>Form preview placeholder</p>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* RIGHT: Config Settings */}
        <Panel defaultSize={20}>
          <div className="config-settings">
            <h4>Configuration Settings</h4>
            <div className="box placeholder">
              Select a field on the canvas to edit its settings.
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
