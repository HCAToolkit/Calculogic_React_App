import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  runNamingValidator,
  summarizeFindings,
  listNamingValidatorScopes,
  getScopeProfile,
} from '../src/validators/naming-validator.logic.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, '..');

const parseScopeFromCli = argv => {
  let selectedScope = 'repo';

  for (const argument of argv) {
    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope };
    }
  }

  return { helpRequested: false, selectedScope };
};

const usageLines = [
  'Usage: npm run validate:naming -- --scope=<repo|app|docs>',
  'Scopes:',
  ...listNamingValidatorScopes().map(scope => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: repo',
];

const { helpRequested, selectedScope } = parseScopeFromCli(process.argv.slice(2));

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
const { findings, totalFilesScanned, scope } = runNamingValidator(repositoryRoot, { scope: selectedScope });
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
