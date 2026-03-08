export const writeValidatorReportToStdout = (report) => {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
};

export const setValidatorReportExitCode = (exitCode) => {
  process.exitCode = exitCode;
};
