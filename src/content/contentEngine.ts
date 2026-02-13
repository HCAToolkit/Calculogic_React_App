/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Build
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Compose app-owned content providers into a singleton registry instance.
 * Invariants: Provider registration occurs in app composition root and remains side-effect free in doc-engine core.
 */

import { ContentProviderRegistry, DOCS_PROVIDER } from '../doc-engine/index.ts';

export const contentProviderRegistry = new ContentProviderRegistry();
contentProviderRegistry.registerProvider('docs', DOCS_PROVIDER);
