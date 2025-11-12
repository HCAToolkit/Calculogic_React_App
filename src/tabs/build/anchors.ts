/**
 * Concern: BuildSurfaceAnchors
 * Layer: Build
 * BuildIndex: 20.00
 * AttachesTo: builder-root
 * Responsibility: Centralize public anchor contracts shared across Build layers.
 * Invariants: Anchor names remain stable, builder-root stays the ordering source.
 */

// [Section 20.10] AnchorRegistry
// Purpose: Define the canonical selectors that other layers attach to.
// Inputs: Build surface structure requirements
// Outputs: BUILD_ANCHORS constant map
// Constraints: Only expose stable anchors; computed segments remain pure.
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

// [Section 20.20] AnchorTypes
// Purpose: Export a type union for downstream compile-time safety.
// Inputs: BUILD_ANCHORS constant
// Outputs: BuildAnchorId type alias
// Constraints: Must stay in sync with anchor registry.
export type BuildAnchorId = typeof BUILD_ANCHORS[keyof typeof BUILD_ANCHORS];
