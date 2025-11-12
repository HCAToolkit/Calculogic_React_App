/**
 * Configuration: cfg-buildSurface (Build Surface)
 * Concern File: Knowledge
 * Source NL: doc/nl-config/cfg-buildSurface.md
 * Responsibility: Publish stable anchor identifiers consumed across Build concerns.
 * Invariants: Anchor strings remain deterministic; mutations occur only with NL updates.
 */

// ─────────────────────────────────────────────
// 6. Knowledge – cfg-buildSurface (Build Surface)
// NL Sections: §6.1–6.2 in cfg-buildSurface.md
// Purpose: Provide anchor naming contracts for structural attachments.
// Constraints: Maintain pure data; avoid cross-concern imports beyond types.
// ─────────────────────────────────────────────

// [6.1] cfg-buildSurface · Primitive · "Anchor Registry"
// Concern: Knowledge · Parent: "—" · Catalog: contract.anchors
// Notes: Central source for anchor IDs and factories referenced by Build, BuildStyle, and Logic.
export const BUILD_ANCHORS = {
  root: 'builder-root',
  header: 'builder-header',
  tabList: 'builder-tabs',
  tabButton: (name: string) => `builder-tab-${name}`,
  layout: 'builder-layout',
  leftPanel: 'builder-left-panel',
  leftGrip: 'builder-left-grip',
  section: (id: string) => `builder-section-${id}`,
  sectionContent: (id: string) => `builder-section-${id}-content`,
  sectionGrip: (id: string) => `builder-section-${id}-grip`,
  centerPanel: 'builder-center-panel',
  centerInner: 'builder-center-inner',
  rightGrip: 'builder-right-grip',
  rightPanel: 'builder-right-panel',
  rightContent: 'builder-right-content',
  buttonGroup: (id: string) => `builder-button-group-${id}`,
  placeholder: (id: string) => `builder-placeholder-${id}`,
  list: (id: string) => `builder-list-${id}`,
} as const;

// [6.2] cfg-buildSurface · Primitive · "Anchor Type Alias"
// Concern: Knowledge · Parent: "Anchor Registry" · Catalog: contract.types
// Notes: Provides compile-time safety for anchor string usage across concerns.
export type BuildAnchorId = typeof BUILD_ANCHORS[keyof typeof BUILD_ANCHORS];
