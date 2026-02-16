/**
 * Configuration: cfg-contentResolver (Doc Engine Content Resolver Configuration)
 * Concern File: Knowledge
 * Source NL: doc/nl-doc-engine/cfg-contentResolver.md
 * Responsibility: Define canonical doc identifiers and docs namespace formatting helpers for header content packs.
 * Invariants: Doc ids remain stable across shell consumers; docs namespace prefixing is deterministic.
 */

export const HEADER_DOC_IDS = {
  build: 'doc-build',
  logic: 'doc-logic',
  knowledge: 'doc-knowledge',
  results: 'doc-results',
} as const;

export type HeaderDocId = (typeof HEADER_DOC_IDS)[keyof typeof HEADER_DOC_IDS];

export function toDocsContentId(docId: string): string {
  return `docs:${docId}`;
}

export function isHeaderDocId(docId: string): docId is HeaderDocId {
  return Object.values(HEADER_DOC_IDS).includes(docId as HeaderDocId);
}
