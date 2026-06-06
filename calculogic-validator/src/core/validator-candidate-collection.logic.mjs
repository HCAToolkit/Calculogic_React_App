import { collectSuiteScopedSnapshotInputs } from './suite-scoped-snapshot-input.logic.mjs';
import {
  normalizeValidatorCandidatePolicy,
  toValidatorCandidatePolicyInputSets,
} from './validator-candidate-policy.contracts.mjs';
import { isValidatorCandidatePath } from './validator-candidate-policy.logic.mjs';

const sortPaths = (paths) => Array.from(paths).sort((left, right) => left.localeCompare(right));

export const filterValidatorCandidatePaths = (relativePaths, candidatePolicy) => {
  const normalizedPolicy = normalizeValidatorCandidatePolicy(candidatePolicy);
  const candidatePaths = relativePaths.filter((relativePath) =>
    isValidatorCandidatePath(relativePath, normalizedPolicy),
  );

  return sortPaths(new Set(candidatePaths));
};

export const collectValidatorCandidatePaths = (
  repositoryRoot,
  {
    scope,
    targets = [],
    candidatePolicy,
    skipSymlinkedCandidateScopeRoots = false,
  } = {},
) => {
  const normalizedPolicy = normalizeValidatorCandidatePolicy(candidatePolicy);
  const policySets = toValidatorCandidatePolicyInputSets(normalizedPolicy);
  const scopedSnapshot = collectSuiteScopedSnapshotInputs(repositoryRoot, {
    scope,
    targets,
    walkExcludedDirectories: policySets.walkExcludedDirectories,
    skipDotDirectories: policySets.skipDotDirectories,
    skipSymlinkedCandidateScopeRoots,
  });
  const inScopeCandidatePaths = filterValidatorCandidatePaths(
    scopedSnapshot.inScopePaths,
    normalizedPolicy,
  );

  return {
    candidatePolicy: normalizedPolicy,
    scope: scopedSnapshot.scope,
    includeRoots: scopedSnapshot.includeRoots,
    includeRootFiles: scopedSnapshot.includeRootFiles,
    inScopePaths: inScopeCandidatePaths,
    selectedPaths: filterValidatorCandidatePaths(scopedSnapshot.selectedPaths, normalizedPolicy),
    targetDescriptors: scopedSnapshot.targetDescriptors,
    targets: scopedSnapshot.targets,
  };
};
