/**
 * Concern: BuildSurfaceStructure
 * Layer: Build
 * BuildIndex: 20.00
 * AttachesTo: builder-root
 * Responsibility: Render the Build tab's structural layout and anchor map.
 * Invariants: Section order aligns with logic bindings, resizable panes respect anchor contracts.
 */
import type { ReactNode } from 'react';
import { BUILD_ANCHORS } from './anchors';
import type { BuildSurfaceBindings, SectionId, SectionLogicBinding } from './BuildSurface.logic';
import { sectionTitle } from './BuildSurface.logic';

// [Section 20.10] PanelChrome
// Purpose: Provide reusable iconography for collapsible controls.
// Inputs: Panel collapsed state
// Outputs: Chevron icon components
// Constraints: Icons remain accessible and purely presentational.

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <polyline
        points="13 5 8 10 13 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// [3.3] cfg-buildSurface · Primitive · "Chevron Right Icon"
// Concern: Build · Parent: "Section Panel Template" · Catalog: chrome.icon
// Notes: Points outward to indicate collapsing behavior for section panels.
function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <polyline
        points="7 5 12 10 7 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// [Section 20.20] SectionCatalog
// Purpose: Describe left-panel sections and their structural anchors.
// Inputs: SectionId order from logic bindings
// Outputs: Structured React nodes bound to BUILD_ANCHORS
// Constraints: Anchor names stay deterministic; placeholders preserve layout spacing.
interface SectionContentConfig {
  id: SectionId;
  render: () => ReactNode;
}

// [3.4] cfg-buildSurface · Primitive · "Section Content Catalog"
// Concern: Build · Parent: "Section Panel Template" · Catalog: layout.catalog
// Notes: Supplies placeholder markup for each section using deterministic anchors.
const SECTION_CONTENT: SectionContentConfig[] = [
  {
    id: 'configurations',
    render: () => (
      <>
        <div data-anchor={BUILD_ANCHORS.buttonGroup('configurations')}>
          {['All', 'User', 'Public', 'Official', 'Favs'].map(filter => (
            <button
              type="button"
              key={filter}
              data-anchor={`${BUILD_ANCHORS.buttonGroup('configurations')}-${filter.toLowerCase()}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div data-anchor={BUILD_ANCHORS.placeholder('configurations')}>
          [ configurations list ]
        </div>
      </>
    ),
  },
  {
    id: 'atomic-components',
    render: () => (
      <ul data-anchor={BUILD_ANCHORS.list('atomic-components')}>
        <li>Container Field</li>
        <li>Sub-Container Field</li>
        <li>Text Input Field</li>
        <li>Number Input Field</li>
        <li>Checkbox Field</li>
      </ul>
    ),
  },
  {
    id: 'search-configurations',
    render: () => (
      <>
        <div data-anchor={BUILD_ANCHORS.buttonGroup('search')}>
          {['Official', 'Public'].map(filter => (
            <button
              type="button"
              key={filter}
              data-anchor={`${BUILD_ANCHORS.buttonGroup('search')}-${filter.toLowerCase()}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div data-anchor={BUILD_ANCHORS.placeholder('search')}>
          [ search results ]
        </div>
      </>
    ),
  },
];

function renderSectionContent(id: SectionId) {
  const match = SECTION_CONTENT.find(entry => entry.id === id);
  return match ? match.render() : null;
}

// [Section 20.30] SectionPanels
// Purpose: Render individual catalog panels with collapse and resize affordances.
// Inputs: SectionLogicBinding from logic layer
// Outputs: Section markup bound to anchors and ARIA contracts
// Constraints: Header buttons stay accessible; grip hidden when logic disallows drag.
function SectionPanel({ binding }: { binding: SectionLogicBinding }) {
  const title = sectionTitle(binding.id);
  return (
    <section
      data-anchor={BUILD_ANCHORS.section(binding.id)}
      ref={binding.containerRef}
      style={{
        height: binding.height,
        transition: binding.isDragging ? 'none' : 'height 160ms ease',
      }}
      data-collapsed={binding.collapsed ? 'true' : 'false'}
    >
      <header>
        <span>{title}</span>
        <button type="button" className="chevron" {...binding.headerButtonProps}>
          {binding.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </header>
      <div
        data-anchor={binding.contentAnchor}
        aria-hidden={binding.collapsed}
        hidden={binding.collapsed}
      >
        {renderSectionContent(binding.id)}
      </div>
      {binding.gripVisible && (
        <div data-anchor={BUILD_ANCHORS.sectionGrip(binding.id)} {...binding.gripProps} />
      )}
    </section>
  );
}

// [Section 20.40] SurfaceLayout
// Purpose: Assemble the builder frame, navigation chrome, and pane layout.
// Inputs: BuildSurfaceBindings including anchors, sections, and panel states
// Outputs: Complete Build tab DOM structure
// Constraints: Anchor contracts stay intact; layout transitions remain CSS-driven.
export function BuildSurface({
  anchors,
  sectionOrder,
  sections,
  leftPanel,
  rightPanel,
}: BuildSurfaceBindings) {
  // [3.6.1] cfg-buildSurface · Subcontainer · "Header Chrome"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: layout.header
  // Notes: Hosts title, primary nav tabs, and publish CTA with fixed anchor IDs.
  const headerChrome = (
    <header data-anchor={anchors.header}>
      <h1>🔧 Calculogic Builder</h1>
      <nav data-anchor={anchors.tabList} aria-label="Builder navigation">
        {['Build', 'Calculogic', 'View', 'Knowledge', 'Results'].map(tab => (
          <button
            key={tab}
            type="button"
            data-anchor={anchors.tabButton(tab.toLowerCase())}
            aria-current={tab === 'Build' ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
        <button
          type="button"
          data-anchor={anchors.tabButton('publish')}
          className="publish"
        >
          Publish
        </button>
      </nav>
    </header>
  );

  // [3.6.2] cfg-buildSurface · Subcontainer · "Catalog Column"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: layout.column
  // Notes: Lists section panels in logic-supplied order with live resize affordances.
  const catalogColumn = (
    <aside
      data-anchor={anchors.leftPanel}
      style={{
        width: `${leftPanel.width}px`,
        transition: leftPanel.isDragging ? 'none' : 'width 160ms ease',
      }}
    >
      {sectionOrder.map(sectionId => (
        <SectionPanel key={sectionId} binding={sections[sectionId]} />
      ))}
    </aside>
  );

  // [3.6.3] cfg-buildSurface · Primitive · "Catalog Grip"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: control.grip
  // Notes: Exposes left panel resize separator connected to logic grip props.
  const catalogGrip = <div data-anchor={anchors.leftGrip} {...leftPanel.gripProps} />;

  // [3.6.4] cfg-buildSurface · Subcontainer · "Preview Stage"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: layout.region
  // Notes: Placeholder canvas for future form preview anchored to center panel IDs.
  const previewStage = (
    <main data-anchor={anchors.centerPanel}>
      <div data-anchor={anchors.centerInner}>
        <p>Form preview placeholder</p>
      </div>
    </main>
  );

  // [3.6.5] cfg-buildSurface · Primitive · "Inspector Grip"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: control.grip
  // Notes: Provides resize handle between preview stage and inspector column.
  const inspectorGrip = <div data-anchor={anchors.rightGrip} {...rightPanel.gripProps} />;

  // [3.6.6] cfg-buildSurface · Subcontainer · "Inspector Column"
  // Concern: Build · Parent: "Build Surface Layout" · Catalog: layout.column
  // Notes: Collapsible inspector with settings placeholder anchored to logic-provided IDs.
  const inspectorColumn = (
    <aside
      data-anchor={anchors.rightPanel}
      data-collapsed={rightPanel.collapsed ? 'true' : 'false'}
      style={{
        width: `${rightPanel.width}px`,
        transition: rightPanel.isDragging ? 'none' : 'width 160ms ease',
      }}
    >
      <header>
        <span>Configuration Settings</span>
        <button
          type="button"
          className="chevron"
          onClick={rightPanel.toggle}
          aria-controls={rightPanel.contentAnchor}
          aria-expanded={!rightPanel.collapsed}
        >
          {rightPanel.collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </header>
      <div
        data-anchor={rightPanel.contentAnchor}
        aria-hidden={rightPanel.collapsed}
        hidden={rightPanel.collapsed}
      >
        <div data-anchor={BUILD_ANCHORS.placeholder('settings')}>
          Select a field on the canvas to edit its settings.
        </div>
      </div>
    </aside>
  );

  return (
    <div data-anchor={anchors.root}>
      {headerChrome}
      <div data-anchor={anchors.layout}>
        {catalogColumn}
        {catalogGrip}
        {previewStage}
        {inspectorGrip}
        {inspectorColumn}
      </div>
    </div>
  );
}
