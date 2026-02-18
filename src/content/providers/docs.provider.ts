/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Resolve docs namespace requests from the header docs catalog.
 * Invariants: Missing docs return deterministic missing_content payloads matching existing runtime behavior.
 */

import { HEADER_DOC_DEFINITIONS, type HeaderDocDefinition } from '../packs/header-docs/header-docs.catalog.ts';
import { isHeaderDocId } from '../packs/header-docs/header-doc.ids.ts';
import type { ContentProvider } from '../../doc-engine/index.ts';

export const DOCS_PROVIDER: ContentProvider<unknown, HeaderDocDefinition> = {
  resolveContent: ({ contentId, anchorId }) => {
    const doc = isHeaderDocId(contentId) ? HEADER_DOC_DEFINITIONS[contentId] : null;

    if (!doc) {
      return {
        type: 'missing_content',
        namespace: 'docs',
        contentId,
        reason: 'Documentation entry was not found.',
      };
    }

    return {
      type: 'found',
      namespace: 'docs',
      contentId,
      anchorId,
      payload: doc,
    };
  },
};
