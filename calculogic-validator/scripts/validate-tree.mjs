import {
  listValidatorScopes,
} from '../src/core/validator-scopes.runtime.mjs';
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
  `Usage: npm run validate:tree -- [--scope=<${supportedScopesToken}>] [--target=<path>]... [--config=<path>]`,
  'Scopes:',
  ...buildValidatorScopeUsageLinesFromRuntimeProfiles(supportedScopes),
  'Default scope: validator default (repo for tree-structure-advisor)',
  'Validator: tree-structure-advisor',
  'Examples:',
  '  ✅ npm run validate:tree -- --scope=repo',
  '  ✅ npm run validate:tree -- --scope=app --target src/tree',
  '  ✅ npm run validate:tree -- --target calculogic-validator/tree/src',
  '  ✅ npm run validate:all -- --validators=tree-structure-advisor --scope=repo',
];

const parseCliArgs = (argv) => {
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

const result = runValidatorRunnerCli({
  argv: process.argv.slice(2),
  usageLines,
  repositoryRoot,
  expectedLifecycleEvent: 'validate:tree',
  supportedFlagNames: ['scope', 'target', 'config'],
  parseCliArgs,
  buildRunnerOptions: ({ parsed, config, toolVersion, configDigest }) => ({
    scope: parsed.selectedScope,
    validators: ['tree-structure-advisor'],
    config,
    targets: parsed.targets,
    toolVersion,
    ...(config ? { configDigest } : {}),
  }),
});

if (result.shouldExit) {
  process.exit(result.exitCode);
}
