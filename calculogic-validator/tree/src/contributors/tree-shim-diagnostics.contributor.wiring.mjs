import { collectShimCompatFindings } from '../tree-shim-detection.logic.mjs';

export const createTreeShimDiagnosticsContributor = ({ selectedPaths, getFileContent }) => {
  if (!Array.isArray(selectedPaths)) {
    throw new Error('Tree shim diagnostics contributor requires selectedPaths[] prepared input.');
  }

  if (typeof getFileContent !== 'function') {
    throw new Error('Tree shim diagnostics contributor requires getFileContent(relativePath) prepared input.');
  }

  return () => collectShimCompatFindings(selectedPaths, getFileContent);
};
