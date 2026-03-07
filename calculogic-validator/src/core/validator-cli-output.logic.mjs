const formatValidatorCliUsageLines = (usageLines) => usageLines.join('\n');

export const writeValidatorReportToStdout = (report) => {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
};

export const setValidatorReportExitCode = (exitCode) => {
  process.exitCode = exitCode;
};

export const printValidatorUsageToStdout = (usageLines) => {
  console.log(formatValidatorCliUsageLines(usageLines));
};

export const printValidatorUsageErrorToStderr = (message, usageLines) => {
  console.error(message);
  console.error(formatValidatorCliUsageLines(usageLines));
};
