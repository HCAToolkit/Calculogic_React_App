import fs from 'node:fs';
import path from 'node:path';
import { collectShimCompatFindings } from '../tree-shim-detection.logic.mjs';

export const attachTreeShimDiagnosticsContributor = ({ repositoryRoot, selectedPaths }) => {
  if (typeof repositoryRoot !== 'string' || repositoryRoot.length === 0) {
    throw new Error('Tree shim diagnostics attachment requires repositoryRoot prepared input.');
  }

  if (!Array.isArray(selectedPaths)) {
    throw new Error('Tree shim diagnostics attachment requires selectedPaths[] prepared input.');
  }

  const contentByPathCache = new Map();
  const selectedPathSet = new Set(selectedPaths);
  const getFileContent = (relativePath) => {
    if (!selectedPathSet.has(relativePath)) {
      throw new Error(
        `Tree shim diagnostics getFileContent received out-of-scope path: ${relativePath}`,
      );
    }

    if (contentByPathCache.has(relativePath)) {
      return contentByPathCache.get(relativePath);
    }

    const rawContent = fs.readFileSync(path.resolve(repositoryRoot, relativePath), 'utf8');
    contentByPathCache.set(relativePath, rawContent);
    return rawContent;
  };

  return () => collectShimCompatFindings(selectedPaths, getFileContent);
};
