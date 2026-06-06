import path from 'node:path';
import {
  normalizeValidatorCandidatePolicy,
  toValidatorCandidatePolicyInputSets,
} from './validator-candidate-policy.contracts.mjs';
import { normalizePath } from './scoped-target-paths.logic.mjs';

export const isValidatorCandidatePath = (relativePath, candidatePolicy) => {
  const normalizedPath = normalizePath(relativePath);
  const policySets = toValidatorCandidatePolicyInputSets(candidatePolicy);
  const extension = path.extname(normalizedPath);

  if (policySets.candidateExtensions.has(extension)) {
    return true;
  }

  return policySets.candidateRootFiles.has(path.basename(normalizedPath));
};

export const createValidatorCandidatePolicyFromValues = ({
  candidateExtensions,
  candidateRootFiles,
  walkExclusions,
} = {}) =>
  normalizeValidatorCandidatePolicy({
    candidateExtensions,
    candidateRootFiles,
    walkExcludedDirectories: walkExclusions?.excludedDirectories ?? [],
    skipDotDirectories: walkExclusions?.skipDotDirectories ?? true,
  });
