import {
  runNamingValidator,
  summarizeFindings,
  listNamingValidatorScopes,
  getScopeProfile,
} from '../naming/src/naming-validator.host.mjs';
import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/core/config/validator-config.logic.mjs';
import {
  computeConfigDigest,
  getValidatorToolVersion,
} from '../src/core/validator-report-meta.logic.mjs';
import { deriveExitCodeFromFindings } from '../src/core/validator-exit-code.logic.mjs';
import { detectNpmArgForwardingFootgun } from '../src/core/npm-arg-forwarding-guard.logic.mjs';
import { getSourceSnapshot } from '../src/core/source-snapshot.logic.mjs';
import {
  writeValidatorReportToStdout,
  setValidatorReportExitCode,
  printValidatorUsageToStdout,
  printValidatorUsageErrorToStderr,
} from '../src/core/validator-cli-output.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const parseScopeFromCli = (argv) => {
  let selectedScope = 'repo';
  let configPath;
  let strict = false;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

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

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, configPath, strict, targets };
    }

    if (argument.startsWith('--config=')) {
      configPath = argument.slice('--config='.length);
      continue;
    }

    if (argument === '--strict') {
      strict = true;
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, configPath, strict, targets };
};

const supportedScopes = listNamingValidatorScopes();
const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];
const supportedScopesToken = preferredScopeOrder
  .filter((scope) => supportedScopes.includes(scope))
  .join('|');

const usageLines = [
  `Usage: npm run validate:naming -- [--scope=<${supportedScopesToken}>] [--target=<path>]... [--config=<path>] [--strict]`,
  'Scopes:',
  ...supportedScopes.map((scope) => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: repo',
  'Examples:',
  '  ✅ npm run validate:naming -- --scope=app',
  '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface',
  '  ✅ npm run validate:naming -- --scope=app --target src/buildsurface --target src/shared',
  '  ✅ npm run validate:all -- --validators=naming --scope=docs',
  '  ✅ node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app',
  '  ✅ node calculogic-validator/bin/calculogic-validate.mjs --scope=docs',
  '  ✅ npm run validate:naming -- --scope=repo --strict',
];

let parsed;
const npmArgForwardingMessage = detectNpmArgForwardingFootgun({
  argv: process.argv.slice(2),
  npmConfigArgvJson: process.env.npm_config_argv,
  lifecycleEvent: process.env.npm_lifecycle_event,
  expectedLifecycleEvent: 'validate:naming',
  supportedFlagNames: ['scope', 'target', 'config', 'strict'],
});

if (npmArgForwardingMessage) {
  printValidatorUsageErrorToStderr(npmArgForwardingMessage, usageLines);
  process.exit(1);
}

try {
  parsed = parseScopeFromCli(process.argv.slice(2));
} catch (error) {
  printValidatorUsageErrorToStderr(error.message, usageLines);
  process.exit(1);
}

const { helpRequested, selectedScope, configPath, strict, targets } = parsed;

if (helpRequested) {
  printValidatorUsageToStdout(usageLines);
  process.exit(0);
}

if (!getScopeProfile(selectedScope)) {
  printValidatorUsageErrorToStderr(`Invalid scope: ${selectedScope}`, usageLines);
  process.exit(1);
}

const selectedScopeProfile = getScopeProfile(selectedScope);

let config;
try {
  config = configPath ? loadValidatorConfigFromFile(configPath, { cwd: process.cwd() }) : undefined;
} catch (error) {
  printValidatorUsageErrorToStderr(error.message, usageLines);
  process.exit(1);
}

const toolVersion = getValidatorToolVersion();
const configDigest = config ? computeConfigDigest(config) : undefined;
const startedAtDate = new Date();
let validatorResult;
try {
  validatorResult = runNamingValidator(repositoryRoot, { scope: selectedScope, config, targets });
} catch (error) {
  printValidatorUsageErrorToStderr(error.message, usageLines);
  process.exit(1);
}
const { findings, totalFilesScanned, scope, filters } = validatorResult;
const registry = validatorResult.registry;
const endedAtDate = new Date();
const summary = summarizeFindings(findings);

const report = {
  mode: 'report',
  validatorId: 'naming',
  toolVersion,
  ...(toolVersion ? { validatorVersion: toolVersion } : {}),
  ...(configDigest ? { configDigest } : {}),
  sourceSnapshot: getSourceSnapshot({ cwd: repositoryRoot }),
  ...(registry
    ? {
        registryState: registry.registryState,
        registrySource: registry.registrySource,
        registryDigests: registry.registryDigests,
      }
    : {}),
  startedAt: startedAtDate.toISOString(),
  endedAt: endedAtDate.toISOString(),
  durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
  scope,
  totalFilesScanned,
  filters,
  scopeSummary: {
    scope,
    reportableFilesInScope: totalFilesScanned,
    findingsGenerated: findings.length,
  },
  scopeContract: {
    description: selectedScopeProfile?.description ?? '',
    includeRoots: selectedScopeProfile?.includeRoots ?? [],
    includeRootFiles: selectedScopeProfile?.includeRootFiles ?? [],
  },
  counts: summary.counts,
  codeCounts: summary.codeCounts,
  specialCaseTypeCounts: summary.specialCaseTypeCounts,
  warningRoleStatusCounts: summary.warningRoleStatusCounts,
  warningRoleCategoryCounts: summary.warningRoleCategoryCounts,
  findings,
};

writeValidatorReportToStdout(report);
setValidatorReportExitCode(deriveExitCodeFromFindings(findings, { strict }));
