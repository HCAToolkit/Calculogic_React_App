import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getScopeProfile, listNamingValidatorScopes } from '../src/naming/naming-validator.host.mjs';
import { runValidatorRunner } from '../src/validator-runner.logic.mjs';
import { listRegisteredValidators } from '../src/validator-registry.knowledge.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, '..', '..');

const usageLines = [
  'Usage: npm run validate:all -- [--scope=<repo|app|docs>] [--validators=<id1,id2>]',
  'Validators:',
  ...listRegisteredValidators().map(validatorId => `  - ${validatorId}`),
  'Scopes:',
  ...listNamingValidatorScopes().map(scope => {
    const profile = getScopeProfile(scope);
    return `  - ${scope}: ${profile?.description ?? ''}`;
  }),
  'Default scope: validator default (repo for naming)',
  'Default validators: all registered validators',
];

const parseCliArgs = argv => {
  let selectedScope;
  let validators;

  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, validators };
    }

    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
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

  return { helpRequested: false, selectedScope, validators };
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

if (parsed.selectedScope && !getScopeProfile(parsed.selectedScope)) {
  console.error(`Invalid scope: ${parsed.selectedScope}`);
  console.error(usageLines.join('\n'));
  process.exit(1);
}

try {
  const report = runValidatorRunner(repositoryRoot, {
    scope: parsed.selectedScope,
    validators: parsed.validators,
  });

  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
} catch (error) {
  console.error(error.message);
  console.error(usageLines.join('\n'));
  process.exit(1);
}
