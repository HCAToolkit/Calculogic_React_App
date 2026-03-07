import builtinCaseRulesRegistry from '../registries/_builtin/case-rules.registry.json' with { type: 'json' };

const CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

const resolveSemanticNamePatternByStyle = (semanticNameStyle) => {
  if (semanticNameStyle === 'kebab-case') {
    return CANONICAL_KEBAB_CASE_SEMANTIC_PATTERN;
  }

  throw new Error(`Unsupported builtin semantic-name style: ${semanticNameStyle}`);
};

assertBuiltinCaseRulesRegistry(builtinCaseRulesRegistry);

const semanticNameStyle = builtinCaseRulesRegistry.semanticName.style;
const canonicalSemanticPattern = resolveSemanticNamePatternByStyle(semanticNameStyle);

export const getSemanticNameCaseRule = () => ({
  style: semanticNameStyle,
  pattern: canonicalSemanticPattern,
});

export const isCanonicalSemanticName = (semanticName) =>
  getSemanticNameCaseRule().pattern.test(semanticName);
