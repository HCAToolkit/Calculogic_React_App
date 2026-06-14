import {
  attachTreeShimDiagnosticsContributor,
} from './contributors/tree-shim-diagnostics-contributor.wiring.mjs';
import {
  attachTreeNamingSemanticFamilyBridgeContributor,
} from './contributors/tree-naming-semantic-family-bridge-contributor.wiring.mjs';

export const collectDefaultTreeStructureAdvisorContributors = ({
  repositoryRoot,
  selectedPaths,
  namingSemanticFamilyBridge,
  preparedAddressKeyedJoinEvidence,
}) => [
  attachTreeShimDiagnosticsContributor({
    repositoryRoot,
    selectedPaths,
  }),
  attachTreeNamingSemanticFamilyBridgeContributor({
    namingSemanticFamilyBridge,
    preparedAddressKeyedJoinEvidence,
  }),
].filter(Boolean);
