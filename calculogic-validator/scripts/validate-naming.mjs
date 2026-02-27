import {
  runNamingValidator,
  summarizeFindings,
  listNamingValidatorScopes,
  getScopeProfile,
} from '../src/naming/naming-validator.host.mjs';
import { resolveRepositoryRoot } from '../src/repository-root.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();

const parseScopeFromCli = argv => {
  let selectedScope = 'repo';
  let configPath;

  for (const argument of argv) {
    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, configPath };
    }

    if (argument.startsWith('--config=')) {
      configPath = argument.slice('--config='.length);
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, configPath };
};

const usageLines = [
  'Usage: npm run validate:naming -- [--scope=<repo|app|docs>] [--config=<path>]',
  'Scopes:',
  ...listNamingValidatorScopes().map(scope => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: repo',
];

let parsed;
try {
  parsed = parseScopeFromCli(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

const { helpRequested, selectedScope, configPath } = parsed;

if (helpRequested) {
  console.log(usageLines.join('\n'));
  process.exit(0);
}

if (!getScopeProfile(selectedScope)) {
  console.error(`Invalid scope: ${selectedScope}`);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

const selectedScopeProfile = getScopeProfile(selectedScope);

let config;
try {
  config = configPath ? loadValidatorConfigFromFile(configPath, { cwd: process.cwd() }) : undefined;
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

const { findings, totalFilesScanned, scope } = runNamingValidator(repositoryRoot, { scope: selectedScope, config });
const summary = summarizeFindings(findings);

const report = {
  mode: 'report',
  scope,
  totalFilesScanned,
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

console.log(JSON.stringify(report, null, 2));
process.exit(0);
