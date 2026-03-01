export { DOCS_PROVIDER } from './providers/docs.logic.ts';
export type {
  ContentMeta,
  HeaderDocDefinition,
  HeaderDocLink,
  HeaderDocSection,
} from './packs/header-docs/header-docs.knowledge.ts';
export { HEADER_DOC_DEFINITIONS, resolveHeaderDoc } from './packs/header-docs/header-docs.knowledge.ts';
export { HEADER_DOC_IDS, isHeaderDocId, toDocsContentId } from './packs/header-docs/header-doc.knowledge.ts';
export type { HeaderDocId } from './packs/header-docs/header-doc.knowledge.ts';

// NOTE: contentProviderRegistry is intentionally not re-exported from this barrel.
// Import it from ./contentEngine to keep a single canonical ownership path.
