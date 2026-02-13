/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Resolve docs namespace requests from the header docs catalog.
 * Invariants: Missing docs return deterministic not_found payloads matching existing runtime behavior.
 */

import { HEADER_DOC_DEFINITIONS, type HeaderDocDefinition } from '../catalogs/header-docs.catalog.ts';
import type { ContentProvider } from '../types.ts';

export const DOCS_PROVIDER: ContentProvider<unknown, HeaderDocDefinition> = {
  resolveContent: ({ contentId, anchorId }) => {
    const doc = HEADER_DOC_DEFINITIONS[contentId];

    if (!doc) {
      return {
        type: 'not_found',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry was not found.',
      };
    }

    return {
      type: 'content',
      namespace: 'docs',
      contentId,
      anchorId,
      payload: doc,
    };
  },
};
