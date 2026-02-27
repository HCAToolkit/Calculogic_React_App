import {
  runNamingValidator,
  summarizeFindings,
} from './naming/naming-validator.host.mjs';

const runNamingValidatorHook = (repositoryRoot, options = {}) => {
  const scope = options.scope;
  const namingResult = runNamingValidator(repositoryRoot, { scope });
  const summary = summarizeFindings(namingResult.findings);

  return {
    scope: namingResult.scope,
    totalFilesScanned: namingResult.totalFilesScanned,
    findings: namingResult.findings,
    summary,
  };
};

export const VALIDATOR_REGISTRY = [
  {
    id: 'naming',
    description: 'Filename naming validator (report-mode).',
    run: runNamingValidatorHook,
  },
];

export const listRegisteredValidators = () => VALIDATOR_REGISTRY.map(validator => validator.id).sort((a, b) => a.localeCompare(b));

export const getValidatorById = id => VALIDATOR_REGISTRY.find(validator => validator.id === id) ?? null;
