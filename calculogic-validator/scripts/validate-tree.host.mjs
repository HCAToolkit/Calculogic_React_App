import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import {
  buildDirectValidatorRunnerUsageLines,
  parseDirectValidatorRunnerCliArgs,
} from '../src/core/cli/validator-cli-direct.logic.mjs';
import { runValidatorRunnerCli } from '../src/core/cli/validator-cli-runner.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const usageLines = buildDirectValidatorRunnerUsageLines({
  validatorId: 'tree-structure-advisor',
  defaultScopeLine: 'Default scope: validator default (repo for tree-structure-advisor)',
  examples: [
    '  ✅ npm run validate:tree -- --scope=repo',
    '  ✅ npm run validate:tree -- --scope=app --target src/tree',
    '  ✅ npm run validate:tree -- --target calculogic-validator/tree/src',
    '  ✅ npm run validate:all -- --validators=tree-structure-advisor --scope=repo',
  ],
});

const result = runValidatorRunnerCli({
  argv: process.argv.slice(2),
  usageLines,
  repositoryRoot,
  expectedLifecycleEvent: 'validate:tree',
  supportedFlagNames: ['scope', 'target', 'config'],
  parseCliArgs: parseDirectValidatorRunnerCliArgs,
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
