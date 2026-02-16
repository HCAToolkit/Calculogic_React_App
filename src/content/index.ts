export { DOCS_PROVIDER } from './providers/docs.provider.ts';
export type {
  ContentMeta,
  HeaderDocDefinition,
  HeaderDocLink,
  HeaderDocSection,
} from './packs/header-docs/header-docs.catalog.ts';
export { HEADER_DOC_DEFINITIONS, resolveHeaderDoc } from './packs/header-docs/header-docs.catalog.ts';

// NOTE: contentProviderRegistry is intentionally not re-exported from this barrel.
// Import it from ./contentEngine to keep a single canonical ownership path.
