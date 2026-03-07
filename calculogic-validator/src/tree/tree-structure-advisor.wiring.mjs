import {
  runTreeStructureAdvisor as runTreeStructureAdvisorRuntime,
  summarizeFindings,
} from './tree-structure-advisor.logic.mjs';

export const runTreeStructureAdvisor = (repositoryRoot, { scope, config, targets } = {}) =>
  runTreeStructureAdvisorRuntime(repositoryRoot, { scope, config, targets });

export { summarizeFindings };
