import { runNamingValidator, summarizeFindings } from '../naming/naming-validator.host.mjs';
import {
  runTreeStructureAdvisor,
  summarizeFindings as summarizeTreeStructureAdvisorFindings,
} from '../tree-structure-advisor.host.mjs';

const runNamingValidatorHook = (repositoryRoot, options = {}) => {
  const scope = options.scope;
  const config = options.config;
  const targets = options.targets;
  const namingResult = runNamingValidator(repositoryRoot, { scope, config, targets });
  const summary = summarizeFindings(namingResult.findings);
  const meta = {};

  if (namingResult.filters?.isFiltered) {
    meta.filters = {
      isFiltered: true,
      targets: namingResult.filters.targets,
    };
  }

  if (namingResult.registry) {
    meta.registry = namingResult.registry;
  }

  return {
    scope: namingResult.scope,
    totalFilesScanned: namingResult.totalFilesScanned,
    findings: namingResult.findings,
    summary,
    ...(Object.keys(meta).length > 0 ? { meta } : {}),
  };
};

const runTreeStructureAdvisorHook = (repositoryRoot, options = {}) => {
  const scope = options.scope;
  const config = options.config;
  const targets = options.targets;
  const treeStructureAdvisorResult = runTreeStructureAdvisor(repositoryRoot, {
    scope,
    config,
    targets,
  });
  const summary = summarizeTreeStructureAdvisorFindings(treeStructureAdvisorResult.findings);

  return {
    scope: treeStructureAdvisorResult.scope,
    totalFilesScanned: treeStructureAdvisorResult.totalFilesScanned,
    findings: treeStructureAdvisorResult.findings,
    summary,
  };
};

export const VALIDATOR_REGISTRY = [
  {
    id: 'naming',
    description: 'Filename naming validator (report-mode).',
    run: runNamingValidatorHook,
  },
  {
    id: 'tree-structure-advisor',
    description: 'Repository tree structure advisory validator (report-only).',
    run: runTreeStructureAdvisorHook,
  },
];

export const listRegisteredValidators = () =>
  VALIDATOR_REGISTRY.map((validator) => validator.id).sort((a, b) => a.localeCompare(b));

export const getValidatorById = (id) =>
  VALIDATOR_REGISTRY.find((validator) => validator.id === id) ?? null;
