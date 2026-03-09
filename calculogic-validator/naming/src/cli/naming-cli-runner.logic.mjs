import { runNamingValidator, getScopeProfile } from '../naming-validator.host.mjs';
import { loadValidatorConfigFromFile } from '../../../src/core/config/validator-config.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../../../src/core/validator-report-meta.logic.mjs';
import { deriveExitCodeFromFindings } from '../../../src/core/validator-exit-code.logic.mjs';
import { getSourceSnapshot } from '../../../src/core/source-snapshot.logic.mjs';
import {
  writeValidatorReportToStdout,
  setValidatorReportExitCode,
} from '../../../src/core/cli/validator-cli-output.logic.mjs';
import {
  printValidatorUsageToStdout,
  printValidatorUsageErrorToStderr,
} from '../../../src/core/cli/validator-cli-usage.logic.mjs';
import { parseNamingCliArguments } from './naming-cli-args.logic.mjs';
import { buildNamingValidatorReport } from './naming-report-builder.logic.mjs';

export const runNamingCli = ({ argv, usageLines, repositoryRoot, npmArgForwardingMessage }) => {
  if (npmArgForwardingMessage) {
    printValidatorUsageErrorToStderr(npmArgForwardingMessage, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  let parsed;
  try {
    parsed = parseNamingCliArguments(argv);
  } catch (error) {
    printValidatorUsageErrorToStderr(error.message, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  if (parsed.helpRequested) {
    printValidatorUsageToStdout(usageLines);
    return { shouldExit: true, exitCode: 0 };
  }

  const selectedScopeProfile = getScopeProfile(parsed.selectedScope);
  if (!selectedScopeProfile) {
    printValidatorUsageErrorToStderr(`Invalid scope: ${parsed.selectedScope}`, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  let config;
  try {
    config = parsed.configPath
      ? loadValidatorConfigFromFile(parsed.configPath, { cwd: process.cwd() })
      : undefined;
  } catch (error) {
    printValidatorUsageErrorToStderr(error.message, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  const startedAtDate = new Date();
  let validatorResult;
  try {
    validatorResult = runNamingValidator(repositoryRoot, {
      scope: parsed.selectedScope,
      config,
      targets: parsed.targets,
    });
  } catch (error) {
    printValidatorUsageErrorToStderr(error.message, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  const endedAtDate = new Date();
  const report = buildNamingValidatorReport({
    ...validatorResult,
    registry: validatorResult.registry,
    toolVersion: getValidatorToolVersion(),
    configDigest: config ? computeConfigDigest(config) : undefined,
    sourceSnapshot: getSourceSnapshot({ cwd: repositoryRoot }),
    selectedScopeProfile,
    startedAtDate,
    endedAtDate,
  });

  const effectiveStrictExit = parsed.strict ? true : config?.strictExit === true;

  writeValidatorReportToStdout(report);
  setValidatorReportExitCode(
    deriveExitCodeFromFindings(validatorResult.findings, { strict: effectiveStrictExit }),
  );

  return { shouldExit: false };
};
