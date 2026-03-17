import {
  listValidatorScopes,
} from '../src/core/validator-scopes.runtime.mjs';
import { listRegisteredValidators } from '../src/core/validator-registry.knowledge.mjs';
import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import { parseRepeatableTargetArgument } from '../src/core/cli/validator-cli-targets.logic.mjs';
import {
  buildSupportedScopeToken,
  buildValidatorScopeUsageLinesFromRuntimeProfiles,
} from '../src/core/cli/validator-cli-scopes.logic.mjs';
import { runValidatorRunnerCli } from '../src/core/cli/validator-cli-runner.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const supportedScopes = listValidatorScopes();
const supportedScopesToken = buildSupportedScopeToken(supportedScopes);

const usageLines = [
  `Usage: npm run validate:all -- [--scope=<${supportedScopesToken}>] [--validators=<id1,id2>] [--target=<path>]... [--config=<path>] [--strict]`,
  'Validators:',
  ...listRegisteredValidators().map((validatorId) => `  - ${validatorId}`),
  'Scopes:',
  ...buildValidatorScopeUsageLinesFromRuntimeProfiles(supportedScopes),
  'Default scope: validator default (repo for naming)',
  'Default validators: all registered validators',
  'Examples:',
  '  ✅ npm run validate:naming -- --scope=app',
  '  ✅ npm run validate:all -- --validators=naming --scope=docs',
  '  ✅ npm run validate:all -- --validators=naming --scope=app --target src/buildsurface',
  '  ✅ npm run validate:all -- --target src --target test',
  '  ✅ node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app',
  '  ✅ node calculogic-validator/bin/calculogic-validate.mjs --scope=docs',
  '  ✅ npm run validate:all -- --scope=repo --strict',
];

const parseCliArgs = (argv) => {
  let selectedScope;
  let validators;
  let configPath;
  let strict = false;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, validators, configPath, strict, targets };
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

    if (argument.startsWith('--validators=')) {
      const raw = argument.slice('--validators='.length);
      validators = raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (argument === '--strict') {
      strict = true;
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, validators, configPath, strict, targets };
};

const result = runValidatorRunnerCli({
  argv: process.argv.slice(2),
  usageLines,
  repositoryRoot,
  expectedLifecycleEvent: 'validate:all',
  supportedFlagNames: ['scope', 'target', 'config', 'strict', 'validators'],
  parseCliArgs,
  buildRunnerOptions: ({ parsed, config, toolVersion, configDigest }) => ({
    scope: parsed.selectedScope,
    validators: parsed.validators,
    config,
    targets: parsed.targets,
    toolVersion,
    ...(config ? { configDigest } : {}),
  }),
  buildExitCodeOptions: ({ parsed }) => ({ strict: parsed.strict }),
});

if (result.shouldExit) {
  process.exit(result.exitCode);
}
