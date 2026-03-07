import {
  getValidatorScopeProfile,
  listValidatorScopes,
} from '../src/core/validator-scopes.runtime.mjs';
import { runValidatorRunner } from '../src/core/validator-runner.logic.mjs';
import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../src/core/validator-report-meta.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';
import { deriveExitCodeFromRunnerReport } from '../src/core/validator-exit-code.logic.mjs';
import { detectNpmArgForwardingFootgun } from '../src/core/npm-arg-forwarding-guard.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const supportedScopes = listValidatorScopes();
const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];
const supportedScopesToken = preferredScopeOrder
  .filter((scope) => supportedScopes.includes(scope))
  .join('|');

const usageLines = [
  `Usage: npm run validate:tree -- [--scope=<${supportedScopesToken}>] [--target=<path>]... [--config=<path>]`,
  'Scopes:',
  ...supportedScopes.map((scope) => {
    const profile = getValidatorScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: validator default (repo for tree-structure-advisor)',
  'Validator: tree-structure-advisor',
  'Examples:',
  '  ✅ npm run validate:tree -- --scope=repo',
  '  ✅ npm run validate:tree -- --scope=app --target src/tree',
  '  ✅ npm run validate:tree -- --target calculogic-validator/src/tree',
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

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, configPath, targets };
};

const npmArgForwardingMessage = detectNpmArgForwardingFootgun({
  argv: process.argv.slice(2),
  npmConfigArgvJson: process.env.npm_config_argv,
  lifecycleEvent: process.env.npm_lifecycle_event,
  expectedLifecycleEvent: 'validate:tree',
  supportedFlagNames: ['scope', 'target', 'config'],
});

if (npmArgForwardingMessage) {
  console.error(npmArgForwardingMessage);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

let parsed;
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
    validators: ['tree-structure-advisor'],
    config,
    targets: parsed.targets,
    toolVersion,
    ...(config ? { configDigest: computeConfigDigest(config) } : {}),
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(deriveExitCodeFromRunnerReport(report));
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}
