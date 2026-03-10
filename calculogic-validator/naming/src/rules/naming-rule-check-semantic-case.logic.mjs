export const getSemanticNameCaseRule = (caseRulesRuntime) => caseRulesRuntime.semanticName;

export const isCanonicalSemanticName = (semanticName, caseRulesRuntime) =>
  getSemanticNameCaseRule(caseRulesRuntime).pattern.test(semanticName);
