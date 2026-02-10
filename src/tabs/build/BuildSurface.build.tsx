/**
 * Configuration: cfg-buildSurface (Build Surface Configuration)
 * Concern File: Build
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Render the Build tab's structural layout and anchor map.
 * Invariants: Section order mirrors logic bindings; resizable panes respect anchor contracts.
 */
import type { ReactNode } from 'react';
import { BUILD_ANCHORS } from './anchors';
import type { BuildSurfaceBindings, SectionId, SectionLogicBinding } from './BuildSurface.logic';
import { sectionTitle } from './BuildSurface.logic';
import { BUILD_PLACEHOLDER_COPY } from './BuildSurface.knowledge';

// ─────────────────────────────────────────────
// 3. Build – cfg-buildSurface (Build Surface Configuration)
// NL Sections: §3.2–§3.6 in cfg-buildSurface.md
// Purpose: Assemble Build surface structure, reusable chrome, and anchored layout.
// Constraints: No styling or state mutations beyond structural composition.
// ─────────────────────────────────────────────

// [3.2] cfg-buildSurface · Primitive · "Chevron Left Icon"
// Concern: Build · Parent: "Section Panel Template" · Catalog: chrome.icon
// Notes: Points inward to signal an expanded panel state within catalog shells.
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
// Notes: Points outward to communicate collapsed panel affordances.
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

interface SectionContentConfig {
  id: SectionId;
  render: () => ReactNode;
}

// [3.4] cfg-buildSurface · Primitive · "Section Content Catalog"
// Concern: Build · Parent: "Section Panel Template" · Catalog: layout.catalog
// Notes: Maps section identifiers to anchored placeholder content for catalog panels.
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

// [3.5] cfg-buildSurface · Subcontainer · "Section Panel Template"
// Concern: Build · Parent: "Catalog Column" · Catalog: layout.section
// Notes: Wraps section headers, content, and grips with deterministic anchors and ARIA bindings.
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

// [3.6] cfg-buildSurface · Container · "Build Surface Layout"
// Concern: Build · Parent: "Build Surface Composer" · Catalog: layout.shell
// Notes: Coordinates header chrome, catalog panels, preview stage, and inspector anchors.
export function BuildSurface({
  anchors,
  sectionOrder,
  sections,
  leftPanel,
  rightPanel,
}: BuildSurfaceBindings) {
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
        <p>{BUILD_PLACEHOLDER_COPY.preview}</p>
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
          {BUILD_PLACEHOLDER_COPY.settings}
        </div>
      </div>
    </aside>
  );

  return (
    <div data-anchor={anchors.root}>
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
