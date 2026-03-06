import { getSemanticNameCaseRule } from '../registries/naming-case-rules.knowledge.mjs';

export const isCanonicalSemanticName = (semanticName) =>
  getSemanticNameCaseRule().pattern.test(semanticName);
