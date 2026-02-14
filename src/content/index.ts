export {
  ContentProviderRegistry,
  splitNamespace,
  DOCS_PROVIDER,
} from '../doc-engine/index.ts';
export type {
  ContentNode,
  ContentProvider,
  ContentResolutionRequest,
  NotFound,
  ContentMeta,
  HeaderDocDefinition,
  HeaderDocLink,
  HeaderDocSection,
} from '../doc-engine/index.ts';

// NOTE: contentProviderRegistry is intentionally not re-exported from this barrel.
// Import it from ./contentEngine to keep a single canonical ownership path.
