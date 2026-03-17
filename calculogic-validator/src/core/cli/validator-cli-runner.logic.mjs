import { getValidatorScopeProfile } from '../validator-scopes.runtime.mjs';
import { runValidatorRunner } from '../validator-runner.logic.mjs';
import { loadValidatorConfigFromFile } from '../config/validator-config.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../validator-report-meta.logic.mjs';
import { deriveExitCodeFromRunnerReport } from '../validator-exit-code.logic.mjs';
import { detectNpmArgForwardingFootgun } from '../npm-arg-forwarding-guard.logic.mjs';
import {
  writeValidatorReportToStdout,
  setValidatorReportExitCode,
} from './validator-cli-output.logic.mjs';
import {
  printValidatorUsageToStdout,
  printValidatorUsageErrorToStderr,
} from './validator-cli-usage.logic.mjs';

export const runValidatorRunnerCli = ({
  argv,
  usageLines,
  repositoryRoot,
  expectedLifecycleEvent,
  supportedFlagNames,
  parseCliArgs,
  buildRunnerOptions,
  buildExitCodeOptions,
}) => {
  const npmArgForwardingMessage = detectNpmArgForwardingFootgun({
    argv,
    npmConfigArgvJson: process.env.npm_config_argv,
    lifecycleEvent: process.env.npm_lifecycle_event,
    expectedLifecycleEvent,
    supportedFlagNames,
  });

  if (npmArgForwardingMessage) {
    printValidatorUsageErrorToStderr(npmArgForwardingMessage, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  let parsed;
  try {
    parsed = parseCliArgs(argv);
  } catch (error) {
    printValidatorUsageErrorToStderr(error.message, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  if (parsed.helpRequested) {
    printValidatorUsageToStdout(usageLines);
    return { shouldExit: true, exitCode: 0 };
  }

  if (parsed.selectedScope && !getValidatorScopeProfile(parsed.selectedScope)) {
    printValidatorUsageErrorToStderr(`Invalid scope: ${parsed.selectedScope}`, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  try {
    const config = parsed.configPath
      ? loadValidatorConfigFromFile(parsed.configPath, { cwd: process.cwd() })
      : undefined;

    const toolVersion = getValidatorToolVersion();

    const report = runValidatorRunner(
      repositoryRoot,
      buildRunnerOptions({
        parsed,
        config,
        toolVersion,
        configDigest: config ? computeConfigDigest(config) : undefined,
      }),
    );

    writeValidatorReportToStdout(report);
    setValidatorReportExitCode(
      deriveExitCodeFromRunnerReport(
        report,
        buildExitCodeOptions ? buildExitCodeOptions({ parsed, config }) : {},
      ),
    );
  } catch (error) {
    printValidatorUsageErrorToStderr(error.message, usageLines);
    return { shouldExit: true, exitCode: 1 };
  }

  return { shouldExit: false };
};
