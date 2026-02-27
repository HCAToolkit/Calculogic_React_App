#!/usr/bin/env node

import { getValidatorScopeProfile, listValidatorScopes } from '../src/validator-scopes.knowledge.mjs';
import { runValidatorRunner } from '../src/validator-runner.logic.mjs';
import { listRegisteredValidators } from '../src/validator-registry.knowledge.mjs';
import { resolveRepositoryRoot } from '../src/repository-root.logic.mjs';
import { loadValidatorConfigFromFile } from '../src/validator-config.logic.mjs';
import { computeConfigDigest, getValidatorToolVersion } from '../src/validator-report-meta.logic.mjs';

const usageLines = [
  'Usage: calculogic-validate [--scope=<repo|app|docs>] [--validators=<id1,id2>] [--config=<path>]',
  'Validators:',
  ...listRegisteredValidators().map(validatorId => `  - ${validatorId}`),
  'Scopes:',
  ...listValidatorScopes().map(scope => {
    const profile = getValidatorScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: validator default (repo for naming)',
  'Default validators: all registered validators',
];

const parseCliArgs = argv => {
  let selectedScope;
  let validators;
  let configPath;

  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, validators, configPath };
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
        .map(value => value.trim())
        .filter(Boolean);
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, validators, configPath };
};

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

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}
