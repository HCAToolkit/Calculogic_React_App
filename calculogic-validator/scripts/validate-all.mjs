import {
  getValidatorScopeProfile,
  listValidatorScopes,
} from '../src/core/validator-scopes.runtime.mjs';
import { runValidatorRunner } from '../src/core/validator-runner.logic.mjs';
import { listRegisteredValidators } from '../src/core/validator-registry.knowledge.mjs';
import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../src/core/validator-report-meta.logic.mjs';
import { deriveExitCodeFromRunnerReport } from '../src/core/validator-exit-code.logic.mjs';
import { detectNpmArgForwardingFootgun } from '../src/core/npm-arg-forwarding-guard.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const supportedScopes = listValidatorScopes();
const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];
const supportedScopesToken = preferredScopeOrder
  .filter((scope) => supportedScopes.includes(scope))
  .join('|');

const usageLines = [
  `Usage: npm run validate:all -- [--scope=<${supportedScopesToken}>] [--validators=<id1,id2>] [--target=<path>]... [--config=<path>] [--strict]`,
  'Validators:',
  ...listRegisteredValidators().map((validatorId) => `  - ${validatorId}`),
  'Scopes:',
  ...supportedScopes.map((scope) => {
    const profile = getValidatorScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
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

    if (argument === '--target') {
      const rawTarget = argv[index + 1];
      if (!rawTarget || rawTarget.startsWith('--')) {
        throw new Error('Missing required value for --target');
      }

      targets.push(rawTarget.trim().replaceAll('\\', '/'));
      index += 1;
      continue;
    }

    if (argument.startsWith('--target=')) {
      targets.push(argument.slice('--target='.length).trim().replaceAll('\\', '/'));
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

let parsed;

const npmArgForwardingMessage = detectNpmArgForwardingFootgun({
  argv: process.argv.slice(2),
  npmConfigArgvJson: process.env.npm_config_argv,
  lifecycleEvent: process.env.npm_lifecycle_event,
  expectedLifecycleEvent: 'validate:all',
  supportedFlagNames: ['scope', 'target', 'config', 'strict', 'validators'],
});

if (npmArgForwardingMessage) {
  console.error(npmArgForwardingMessage);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

try {
  parsed = parseCliArgs(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

if (parsed.helpRequested) {
  console.log(usageLines.join('\n'));
  process.exit(0);
}

if (parsed.selectedScope && !getValidatorScopeProfile(parsed.selectedScope)) {
  console.error(`Invalid scope: ${parsed.selectedScope}`);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

try {
  const config = parsed.configPath
    ? loadValidatorConfigFromFile(parsed.configPath, { cwd: process.cwd() })
    : undefined;

  const toolVersion = getValidatorToolVersion();

  const report = runValidatorRunner(repositoryRoot, {
    scope: parsed.selectedScope,
    validators: parsed.validators,
    config,
    targets: parsed.targets,
    toolVersion,
    ...(config ? { configDigest: computeConfigDigest(config) } : {}),
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(deriveExitCodeFromRunnerReport(report, { strict: parsed.strict }));
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}
