export const formatValidatorCliUsageLines = (usageLines) => usageLines.join('\n');

export const printValidatorUsageToStdout = (usageLines) => {
  console.log(formatValidatorCliUsageLines(usageLines));
};

export const printValidatorUsageErrorToStderr = (message, usageLines) => {
  console.error(message);
  console.error(formatValidatorCliUsageLines(usageLines));
};
