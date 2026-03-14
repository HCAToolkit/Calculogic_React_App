import {
  attachTreeShimDiagnosticsContributor,
} from './contributors/tree-shim-diagnostics.contributor.wiring.mjs';

export const collectDefaultTreeStructureAdvisorContributors = ({ repositoryRoot, selectedPaths }) => [
  attachTreeShimDiagnosticsContributor({
    repositoryRoot,
    selectedPaths,
  }),
];

