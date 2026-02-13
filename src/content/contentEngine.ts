/**
 * Configuration: cfg-providerRegistry – Doc Engine Provider Registry Configuration
 * Concern File: Logic
 * Source NL: doc/nl-doc-engine/cfg-providerRegistry.md
 * Responsibility: Compose the app-level content provider registry singleton and register built-in providers.
 * Invariants: Singleton instance is created once per module load, docs provider is registered under the `docs` namespace.
 */

import { ContentProviderRegistry, DOCS_PROVIDER } from '../doc-engine';

// ─────────────────────────────────────────────
// 5. Logic – cfg-providerRegistry (Doc Engine Provider Registry Configuration)
// NL Sections: §5.1–§5.3 in cfg-providerRegistry.md
// Purpose: Instantiate and wire deterministic provider registration for application-level content resolution.
// Constraints: Registration must be explicit and namespace-stable.
// ─────────────────────────────────────────────

// [5.3.2] cfg-providerRegistry · Primitive · "Registry Mutation"
// Concern: Logic · Parent: "ProviderRegistryLogic" · Catalog: resolver.provider
// Notes: Singleton registry receives explicit docs namespace registration for deterministic lookup.
export const contentProviderRegistry = new ContentProviderRegistry();
contentProviderRegistry.registerProvider('docs', DOCS_PROVIDER);
