/**
 * ProjectShell/Config: Global Header Shell (shell-globalHeader)
 * Concern File: Build
 * Source NL: doc/nl-shell/shell-globalHeader.md
 * Responsibility: Compose semantic header frame with brand identity, tab navigation, and publish CTA anchors.
 * Invariants: Preserve tab order, retain ARIA roles, keep publish CTA as button element.
 */
import type { GlobalHeaderShellBuildBindings } from './GlobalHeaderShell.logic';

// ─────────────────────────────────────────────
// 3. Build – shell-globalHeader (Global Header Shell)
// NL Sections: §3.1–§3.13 in shell-globalHeader.md
// Purpose: Lay out header structure spanning brand, tabs, and publish zones.
// Constraints: No additional wrappers beyond enumerated atoms; maintain anchor consistency.
// ─────────────────────────────────────────────

// [3.11] shell-globalHeader · Primitive · "Tab Info Icon"
// Concern: Build · Parent: "Tab Item Row" · Catalog: action.icon
// Notes: Shares hover state with tab button while exposing hover summary.
function InfoIcon({
  label,
  docId,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
  describedById,
}: {
  label: string;
  docId: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
  describedById?: string;
}) {
  return (
    <button
      type="button"
      className="info-icon"
      aria-label={label}
      aria-haspopup="dialog"
      aria-describedby={describedById}
      title={label}
      data-anchor="global-header.tab-info"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onClick}
    >
      ℹ️
    </button>
  );
}

// [3.10] shell-globalHeader · Primitive · "Primary Tab Button"
// Concern: Build · Parent: "Tab Item Row" · Catalog: navigation.tab
// Notes: Role `tab` exposes active state and click handler per concern.
function TabButton({
  label,
  isActive,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  label: string;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <button
      type="button"
      className="tab-button"
      data-active={isActive ? 'true' : 'false'}
      data-hovered={isHovered ? 'true' : 'false'}
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {label}
    </button>
  );
}

// [3.1] shell-globalHeader · Container · "Global Header Shell Frame"
// Concern: Build · Catalog: layout.shell
// Notes: Header landmark orchestrating all header zones and anchors.
export function GlobalHeaderShell({
  tabs,
  activeTab,
  hoveredTab,
  brand,
  publishLabel,
  selectTab,
  hoverTab,
  triggerPublish,
  isMobile,
  isTablet,
  openDoc,
}: GlobalHeaderShellBuildBindings) {
  // [3.6] shell-globalHeader · Primitive · "Brand Tagline"
  // Concern: Build · Parent: "Brand Identity Zone" · Catalog: content.copy
  // Notes: Controlled here to suppress tagline on constrained viewports.
  const showTagline = !(isMobile || isTablet);

  return (
    // [3.1] shell-globalHeader · Container · "Global Header Shell Frame"
    // Concern: Build · Catalog: layout.shell
    // Notes: Landmark wrapper distributing three primary header zones.
    <header data-anchor="global-header" className="global-header-shell">
      {/* [3.2] shell-globalHeader · Subcontainer · "Brand Identity Zone"
          Concern: Build · Parent: "Global Header Shell Frame" · Catalog: layout.group
          Notes: Houses brand anchor, glyph, wordmark, and optional tagline. */}
      <div className="global-header-shell__zone global-header-shell__zone--brand" data-anchor="global-header.brand">
        {/* [3.3] shell-globalHeader · Primitive · "Brand Home Link"
            Concern: Build · Parent: "Brand Identity Zone" · Catalog: navigation.link
            Notes: Wraps brand visuals and routes to home with tooltip copy. */}
        <a
          href={brand.homeHref}
          className="brand-link"
          aria-label="Calculogic home"
          title={brand.tooltip}
        >
          {/* [3.4] shell-globalHeader · Primitive · "Brand Logo Glyph"
              Concern: Build · Parent: "Brand Home Link" · Catalog: content.icon
              Notes: Emoji glyph treated as decorative via aria-hidden. */}
          <span aria-hidden="true" className="brand-logo" data-anchor="global-header.brand-logo">
            🧮
          </span>
          {/* [3.5] shell-globalHeader · Primitive · "Brand Wordmark Label"
              Concern: Build · Parent: "Brand Home Link" · Catalog: content.copy
              Notes: Presents Calculogic brand name within anchor. */}
          <span className="brand-wordmark" data-anchor="global-header.brand-wordmark">
            {brand.wordmark}
          </span>
        </a>
        {showTagline && (
          /* [3.6] shell-globalHeader · Primitive · "Brand Tagline"
             Concern: Build · Parent: "Brand Identity Zone" · Catalog: content.copy
             Notes: Optional supporting copy hidden on tablet/mobile breakpoints. */
          <span className="brand-tagline" data-anchor="global-header.brand-tagline">
            {brand.tagline}
          </span>
        )}
      </div>
      {/* [3.7] shell-globalHeader · Subcontainer · "Tab Navigation Zone"
          Concern: Build · Parent: "Global Header Shell Frame" · Catalog: layout.group
          Notes: Flexes to occupy middle column and center align tab list. */}
      <div className="global-header-shell__zone global-header-shell__zone--tabs" data-anchor="global-header.tabs">
        {/* [3.8] shell-globalHeader · Subcontainer · "Tab List Track"
            Concern: Build · Parent: "Tab Navigation Zone" · Catalog: navigation.list
            Notes: Tablist semantic wrapper providing scrollable rail. */}
        <div className="tab-list" role="tablist" aria-label="Primary builder concerns">
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            const isHovered = hoveredTab === tab.id;
            const infoLabelId = `global-header-tab-${tab.id}-summary`;
            return (
              // [3.9] shell-globalHeader · Subcontainer · "Tab Item Row"
              // Concern: Build · Parent: "Tab List Track" · Catalog: layout.row
              // Notes: Couples tab button and info icon for a single concern.
              <div key={tab.id} className="tab-list__item" data-anchor={`global-header.tab-${tab.id}`}>
                <TabButton
                  label={tab.label}
                  isActive={isActive}
                  isHovered={isHovered}
                  onSelect={() => selectTab(tab.id)}
                  onMouseEnter={() => hoverTab(tab.id)}
                  onMouseLeave={() => hoverTab(null)}
                  onFocus={() => hoverTab(tab.id)}
                  onBlur={() => hoverTab(null)}
                />
                <InfoIcon
                  label={tab.hoverSummary}
                  onMouseEnter={() => {
                    hoverTab(tab.id);
                  }}
                  onMouseLeave={() => {
                    hoverTab(null);
                  }}
                  onFocus={() => hoverTab(tab.id)}
                  onBlur={() => hoverTab(null)}
                  onClick={() => openDoc(tab.docId)}
                  describedById={infoLabelId}
                />
                <span id={infoLabelId} className="visually-hidden">
                  {tab.hoverSummary}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* [3.12] shell-globalHeader · Subcontainer · "Publish Action Zone"
          Concern: Build · Parent: "Global Header Shell Frame" · Catalog: layout.group
          Notes: Right-aligned zone hosting publish CTA. */}
      <div className="global-header-shell__zone global-header-shell__zone--publish" data-anchor="global-header.publish">
        {/* [3.13] shell-globalHeader · Primitive · "Publish Button"
            Concern: Build · Parent: "Publish Action Zone" · Catalog: action.button
            Notes: High-signal CTA dispatching publish handler. */}
        <button
          type="button"
          className="publish-button"
          data-anchor="global-header.publish-button"
          onClick={triggerPublish}
        >
          {publishLabel}
        </button>
      </div>
    </header>
  );
}
