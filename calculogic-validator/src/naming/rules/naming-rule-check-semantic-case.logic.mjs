import { CANONICAL_SEMANTIC_PATTERN } from '../registries/naming-case-rules.knowledge.mjs';

export const isCanonicalSemanticName = (semanticName) =>
  CANONICAL_SEMANTIC_PATTERN.test(semanticName);
