import type { GlobalHeaderShellBuildBindings } from './GlobalHeaderShell.logic';

function InfoIcon({
  label,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <button
      type="button"
      className="info-icon"
      aria-label={label}
      title={label}
      data-anchor="global-header.tab-info"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      ℹ️
    </button>
  );
}

function TabButton({
  label,
  isActive,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
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
    >
      {label}
    </button>
  );
}

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
}: GlobalHeaderShellBuildBindings) {
  const showTagline = !(isMobile || isTablet);

  return (
    <header data-anchor="global-header" className="global-header-shell">
      <div className="global-header-shell__zone global-header-shell__zone--brand" data-anchor="global-header.brand">
        <a
          href={brand.homeHref}
          className="brand-link"
          aria-label="Calculogic home"
          title={brand.tooltip}
        >
          <span aria-hidden="true" className="brand-logo" data-anchor="global-header.brand-logo">
            🧮
          </span>
          <span className="brand-wordmark" data-anchor="global-header.brand-wordmark">
            {brand.wordmark}
          </span>
        </a>
        {showTagline && (
          <span className="brand-tagline" data-anchor="global-header.brand-tagline">
            {brand.tagline}
          </span>
        )}
      </div>
      <div className="global-header-shell__zone global-header-shell__zone--tabs" data-anchor="global-header.tabs">
        <div className="tab-list" role="tablist" aria-label="Primary builder concerns">
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            const isHovered = hoveredTab === tab.id;
            return (
              <div key={tab.id} className="tab-list__item" data-anchor={`global-header.tab-${tab.id}`}>
                <TabButton
                  label={tab.label}
                  isActive={isActive}
                  isHovered={isHovered}
                  onSelect={() => selectTab(tab.id)}
                  onMouseEnter={() => hoverTab(tab.id)}
                  onMouseLeave={() => hoverTab(null)}
                />
                <InfoIcon
                  label={tab.hoverSummary}
                  onMouseEnter={() => hoverTab(tab.id)}
                  onMouseLeave={() => hoverTab(null)}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="global-header-shell__zone global-header-shell__zone--publish" data-anchor="global-header.publish">
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
