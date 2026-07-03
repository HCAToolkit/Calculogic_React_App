import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PACKAGE_ROOT = path.resolve(MODULE_DIR, '..', '..');

const normalizeExistingPath = (candidatePath) => {
  const resolvedPath = path.resolve(candidatePath);
  try {
    return fs.realpathSync.native(resolvedPath);
  } catch {
    return resolvedPath;
  }
};

const samePath = (left, right) => normalizeExistingPath(left) === normalizeExistingPath(right);

export const resolveValidatorDevelopmentContext = ({
  targetRepositoryRoot,
  packageRoot = DEFAULT_PACKAGE_ROOT,
} = {}) => {
  if (!targetRepositoryRoot) {
    throw new Error('Validator development context requires targetRepositoryRoot.');
  }

  const normalizedTargetRepositoryRoot = normalizeExistingPath(targetRepositoryRoot);
  const normalizedPackageRoot = normalizeExistingPath(packageRoot);
  const embeddedPackageRoot = normalizeExistingPath(
    path.join(normalizedTargetRepositoryRoot, 'calculogic-validator'),
  );

  if (samePath(normalizedPackageRoot, normalizedTargetRepositoryRoot)) {
    return {
      targetRepositoryRoot: normalizedTargetRepositoryRoot,
      packageRoot: normalizedPackageRoot,
      kind: 'standalone-development',
      validatorDevelopmentRoot: normalizedTargetRepositoryRoot,
    };
  }

  if (samePath(normalizedPackageRoot, embeddedPackageRoot)) {
    return {
      targetRepositoryRoot: normalizedTargetRepositoryRoot,
      packageRoot: normalizedPackageRoot,
      kind: 'embedded-development',
      validatorDevelopmentRoot: normalizedPackageRoot,
    };
  }

  return {
    targetRepositoryRoot: normalizedTargetRepositoryRoot,
    packageRoot: normalizedPackageRoot,
    kind: 'installed-consumer',
    validatorDevelopmentRoot: null,
  };
};
