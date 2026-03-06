import builtinCaseRulesRegistry from './_builtin/case-rules.registry.json' with { type: 'json' };

// Transitional naming note:
// - The `.knowledge` filename is retained to avoid broad-churn import rewrites.
// - Runtime ownership lives in builtin registry payloads plus getter-backed access.
// - This module acts as a registry loader seam (assert + style resolver + getter export).
const CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Registry loader seam: validates builtin case-rules registry payload shape.
const assertBuiltinCaseRulesRegistry = (registry) => {
  if (typeof registry !== 'object' || registry === null) {
    throw new TypeError('Builtin case-rules registry must be an object.');
  }

  if (typeof registry.semanticName !== 'object' || registry.semanticName === null) {
    throw new TypeError('Builtin case-rules registry semanticName must be an object.');
  }

  if (typeof registry.semanticName.style !== 'string') {
    throw new TypeError('Builtin case-rules registry semanticName.style must be a string.');
  }
};

// Primary runtime path: canonical semantic-name matcher selection by declared builtin style.
const resolveSemanticNamePatternByStyle = (semanticNameStyle) => {
  if (semanticNameStyle === 'kebab-case') {
    return CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN;
  }

  throw new Error(`Unsupported builtin semantic-name style: ${semanticNameStyle}`);
};

assertBuiltinCaseRulesRegistry(builtinCaseRulesRegistry);

const semanticNameStyle = builtinCaseRulesRegistry.semanticName.style;
const canonicalSemanticPattern = resolveSemanticNamePatternByStyle(semanticNameStyle);

// Primary runtime path: getter-backed semantic-name case rule for runtime and tests.
export const getSemanticNameCaseRule = () => ({
  style: semanticNameStyle,
  pattern: canonicalSemanticPattern,
});
