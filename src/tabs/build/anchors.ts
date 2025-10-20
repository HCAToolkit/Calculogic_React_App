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

export type BuildAnchorId = typeof BUILD_ANCHORS[keyof typeof BUILD_ANCHORS];
