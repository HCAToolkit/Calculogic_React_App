#!/usr/bin/env node

import {
  runNamingValidator,
  summarizeFindings,
  listNamingValidatorScopes,
  getScopeProfile,
} from '../src/naming/naming-validator.host.mjs';
import { resolveRepositoryRoot } from '../src/repository-root.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';
import { computeConfigDigest, getValidatorToolVersion } from '../src/validator-report-meta.logic.mjs';
import { deriveExitCodeFromFindings } from '../src/validator-exit-code.logic.mjs';

const parseScopeFromCli = argv => {
  let selectedScope = 'repo';
  let configPath;
  let strict = false;

  for (const argument of argv) {
    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, configPath, strict };
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

  return { helpRequested: false, selectedScope, configPath, strict };
};

const supportedScopes = listNamingValidatorScopes();
const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];
const supportedScopesToken = preferredScopeOrder.filter(scope => supportedScopes.includes(scope)).join('|');

const usageLines = [
  `Usage: calculogic-validate-naming [--scope=<${supportedScopesToken}>] [--config=<path>] [--strict]`,
  'Scopes:',
  ...supportedScopes.map(scope => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: repo',
  'Examples:',
  '  ✅ npm run validate:naming -- --scope=app',
  '  ✅ npm run validate:all -- --validators=naming --scope=docs',
  '  ✅ node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app',
  '  ✅ node calculogic-validator/bin/calculogic-validate.mjs --scope=docs',
  '  ✅ node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=repo --strict',
];

let parsed;
try {
  parsed = parseScopeFromCli(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

if (parsed.helpRequested) {
  console.log(usageLines.join('\n'));
  process.exit(0);
}

if (!getScopeProfile(parsed.selectedScope)) {
  console.error(`Invalid scope: ${parsed.selectedScope}`);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

const selectedScopeProfile = getScopeProfile(parsed.selectedScope);
const repositoryRoot = resolveRepositoryRoot();

let config;
try {
  config = parsed.configPath
    ? loadValidatorConfigFromFile(parsed.configPath, { cwd: process.cwd() })
    : undefined;
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

const toolVersion = getValidatorToolVersion();
const configDigest = config ? computeConfigDigest(config) : undefined;
const startedAtDate = new Date();
const { findings, totalFilesScanned, scope } = runNamingValidator(repositoryRoot, { scope: parsed.selectedScope, config });
const endedAtDate = new Date();
const summary = summarizeFindings(findings);

const report = {
  mode: 'report',
  toolVersion,
  ...(configDigest ? { configDigest } : {}),
  startedAt: startedAtDate.toISOString(),
  endedAt: endedAtDate.toISOString(),
  durationMs: endedAtDate.getTime() - startedAtDate.getTime(),
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
process.exit(deriveExitCodeFromFindings(findings, { strict: parsed.strict }));
