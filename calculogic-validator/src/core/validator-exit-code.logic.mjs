import { getBuiltinExitPolicies } from '../registries/validator-exit-policy.registry.runtime.mjs';

const toBooleanStrictOption = (options) => Boolean(options?.strict);

const getExitSemantics = (findings, options) => ({
  strictMode: toBooleanStrictOption(options),
  anyWarnFindings: findings.some((finding) => finding?.severity === 'warn'),
  anyLegacyExceptionFindings: findings.some(
    (finding) => finding?.classification === 'legacy-exception',
  ),
});

const doesPolicyMatchSemantics = (policy, semantics) => {
  const { predicate } = policy;

  if (predicate.always) {
    return true;
  }

  if (predicate.strictMode && !semantics.strictMode) {
    return false;
  }

  if (predicate.anyWarnFindings && !semantics.anyWarnFindings) {
    return false;
  }

  if (predicate.noWarnFindings && semantics.anyWarnFindings) {
    return false;
  }

  if (predicate.anyLegacyExceptionFindings && !semantics.anyLegacyExceptionFindings) {
    return false;
  }

  return true;
};

export const deriveExitCodeFromFindings = (findings = [], options = {}) => {
  const semantics = getExitSemantics(findings, options);
  const matchingPolicy = getBuiltinExitPolicies().find((policy) =>
    doesPolicyMatchSemantics(policy, semantics),
  );

  return matchingPolicy?.exitCode ?? 0;
};

export const deriveExitCodeFromRunnerReport = (report, options = {}) => {
  const findings = Array.isArray(report?.validators)
    ? report.validators.flatMap((validator) =>
        Array.isArray(validator?.findings) ? validator.findings : [],
      )
    : [];

  return deriveExitCodeFromFindings(findings, options);
};
