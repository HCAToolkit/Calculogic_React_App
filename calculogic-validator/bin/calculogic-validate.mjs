#!/usr/bin/env node

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
import {
  writeValidatorReportToStdout,
  setValidatorReportExitCode,
} from '../src/core/cli/validator-cli-output.logic.mjs';
import {
  printValidatorUsageToStdout,
  printValidatorUsageErrorToStderr,
} from '../src/core/cli/validator-cli-usage.logic.mjs';

const supportedScopes = listValidatorScopes();
const preferredScopeOrder = ['repo', 'app', 'docs', 'validator', 'system'];
const supportedScopesToken = preferredScopeOrder
  .filter((scope) => supportedScopes.includes(scope))
  .join('|');

const usageLines = [
  `Usage: calculogic-validate [--scope=<${supportedScopesToken}>] [--validators=<id1,id2>] [--config=<path>] [--strict]`,
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
  '  ✅ node calculogic-validator/bin/calculogic-validate-naming.mjs --scope=app',
  '  ✅ node calculogic-validator/bin/calculogic-validate.mjs --scope=docs',
  '  ✅ node calculogic-validator/bin/calculogic-validate.mjs --scope=repo --strict',
];

const parseCliArgs = (argv) => {
  let selectedScope;
  let validators;
  let configPath;
  let strict = false;

  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, validators, configPath, strict };
    }

    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
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

  return { helpRequested: false, selectedScope, validators, configPath, strict };
};

let parsed;
try {
  parsed = parseCliArgs(process.argv.slice(2));
} catch (error) {
  printValidatorUsageErrorToStderr(error.message, usageLines);
  process.exit(1);
}

if (parsed.helpRequested) {
  printValidatorUsageToStdout(usageLines);
  process.exit(0);
}

if (parsed.selectedScope && !getValidatorScopeProfile(parsed.selectedScope)) {
  printValidatorUsageErrorToStderr(`Invalid scope: ${parsed.selectedScope}`, usageLines);
  process.exit(1);
}

try {
  const repositoryRoot = resolveRepositoryRoot();
  const config = parsed.configPath
    ? loadValidatorConfigFromFile(parsed.configPath, { cwd: process.cwd() })
    : undefined;

  const report = runValidatorRunner(repositoryRoot, {
    scope: parsed.selectedScope,
    validators: parsed.validators,
    config,
    toolVersion: getValidatorToolVersion(),
    ...(config ? { configDigest: computeConfigDigest(config) } : {}),
  });

  writeValidatorReportToStdout(report);
  setValidatorReportExitCode(deriveExitCodeFromRunnerReport(report, { strict: parsed.strict }));
} catch (error) {
  printValidatorUsageErrorToStderr(error.message, usageLines);
  process.exit(1);
}
