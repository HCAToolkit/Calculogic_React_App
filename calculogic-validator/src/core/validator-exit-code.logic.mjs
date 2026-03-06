const toBooleanStrictOption = (options) => Boolean(options?.strict);

export const deriveExitCodeFromFindings = (findings = [], options = {}) => {
  const hasWarn = findings.some((finding) => finding?.severity === 'warn');
  const hasLegacyException = findings.some(
    (finding) => finding?.classification === 'legacy-exception',
  );

  if (hasWarn) {
    return 2;
  }

  if (toBooleanStrictOption(options) && hasLegacyException) {
    return 1;
  }

  return 0;
};

export const deriveExitCodeFromRunnerReport = (report, options = {}) => {
  const findings = Array.isArray(report?.validators)
    ? report.validators.flatMap((validator) =>
        Array.isArray(validator?.findings) ? validator.findings : [],
      )
    : [];

  return deriveExitCodeFromFindings(findings, options);
};
