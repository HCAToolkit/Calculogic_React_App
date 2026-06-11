import { listValidatorScopes } from '../validator-scopes.logic.mjs';
import { getValidatorById } from '../validator-registry.knowledge.mjs';
import { parseRepeatableTargetArgument } from './validator-cli-targets.logic.mjs';
import {
  buildSupportedScopeToken,
  buildValidatorScopeUsageLinesFromRuntimeProfiles,
} from './validator-cli-scopes.logic.mjs';

export const parseDirectValidatorRunnerCliArgs = (argv) => {
  let selectedScope;
  let configPath;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, configPath, targets };
    }

    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
      continue;
    }

    const targetArgumentResult = parseRepeatableTargetArgument({
      argv,
      index,
      argument,
      targets,
    });
    if (targetArgumentResult.handled) {
      index = targetArgumentResult.nextIndex;
      continue;
    }

    if (argument.startsWith('--config=')) {
      configPath = argument.slice('--config='.length);
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, configPath, targets };
};

export const buildDirectValidatorRunnerUsageLines = ({
  validatorId,
  defaultScopeLine,
  examples,
  supportedScopes = listValidatorScopes(),
}) => {
  const validator = getValidatorById(validatorId);
  if (!validator) {
    throw new Error(`Unknown validator: ${validatorId}`);
  }

  const repoLocalNpmInvocation = validator.metadata?.commands?.repoLocalNpmInvocation;
  if (!repoLocalNpmInvocation) {
    throw new Error(`Missing repo-local npm invocation metadata for validator: ${validatorId}`);
  }

  const supportedScopesToken = buildSupportedScopeToken(supportedScopes);

  return [
    `Usage: ${repoLocalNpmInvocation} [--scope=<${supportedScopesToken}>] [--target=<path>]... [--config=<path>]`,
    'Scopes:',
    ...buildValidatorScopeUsageLinesFromRuntimeProfiles(supportedScopes),
    defaultScopeLine,
    `Validator: ${validator.id}`,
    'Examples:',
    ...examples,
  ];
};
