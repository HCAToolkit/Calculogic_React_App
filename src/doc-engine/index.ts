import { ContentProviderRegistry, splitNamespace } from './registry.ts';
import { DOCS_PROVIDER } from './providers/docs.provider.ts';

export { ContentProviderRegistry, splitNamespace, DOCS_PROVIDER };
export type { ContentNode, ContentProvider, ContentResolutionRequest, NotFound } from './types.ts';
export type { ContentMeta, HeaderDocDefinition, HeaderDocLink, HeaderDocSection } from './catalogs/header-docs.catalog.ts';
export { HEADER_DOC_DEFINITIONS, resolveHeaderDoc } from './catalogs/header-docs.catalog.ts';
