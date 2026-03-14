import fs from 'node:fs';
import {
  runTreeStructureAdvisor as runTreeStructureAdvisorRuntime,
  summarizeFindings,
} from './tree-structure-advisor.logic.mjs';
import {
  collectDefaultTreeStructureAdvisorContributors,
} from './tree-structure-advisor-contributors.assembly.wiring.mjs';
import {
  collectSuiteScopedSnapshotInputs,
} from '../../src/core/suite-scoped-snapshot-input.logic.mjs';

const TOP_LEVEL_SCAN_EXCLUSIONS = new Set(['.git', 'node_modules']);
const WALK_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.reports',
  '.turbo',
  '.yarn',
  'coverage',
  'dist',
  'node_modules',
]);

const collectTopLevelDirectoryNames = (repositoryRoot) =>
  fs
    .readdirSync(repositoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((directoryName) => !TOP_LEVEL_SCAN_EXCLUSIONS.has(directoryName))
    .filter((directoryName) => !directoryName.startsWith('.'))
    .sort((left, right) => left.localeCompare(right));

export const prepareTreeStructureAdvisorInputs = (repositoryRoot, { scope, targets } = {}) => {
  const scopedSnapshotInputs = collectSuiteScopedSnapshotInputs(repositoryRoot, {
    scope,
    targets,
    walkExcludedDirectories: WALK_EXCLUDED_DIRECTORIES,
    skipDotDirectories: true,
  });
  const selectedPaths = scopedSnapshotInputs.selectedPaths;

  return {
    scope: scopedSnapshotInputs.scope,
    selectedPaths,
    topLevelDirectoryNames: collectTopLevelDirectoryNames(repositoryRoot),
    targets: scopedSnapshotInputs.targets,
    findingContributors: collectDefaultTreeStructureAdvisorContributors({
      repositoryRoot,
      selectedPaths,
    }),
  };
};

export const runTreeStructureAdvisor = (repositoryRoot, { scope, targets } = {}) => {
  const preparedInputs = prepareTreeStructureAdvisorInputs(repositoryRoot, { scope, targets });
  return runTreeStructureAdvisorRuntime(preparedInputs);
};

export { summarizeFindings };
