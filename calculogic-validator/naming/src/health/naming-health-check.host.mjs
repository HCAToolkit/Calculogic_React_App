import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runNamingHealthCheck } from './naming-health-check.logic.mjs';
import { resolveRepositoryRoot } from '../../../src/core/repository-root.logic.mjs';

export const resolveNamingHealthPackageRoot = ({ moduleUrl = import.meta.url } = {}) =>
  path.resolve(path.dirname(fileURLToPath(moduleUrl)), '..', '..', '..');

const safeRealPath = (candidatePath) => {
  try {
    return fs.realpathSync(candidatePath);
  } catch {
    return path.resolve(candidatePath);
  }
};

export const shouldRequireEmbeddedDocsForNamingHealth = ({ repositoryRoot, packageRoot }) => {
  const embeddedPackageRoot = path.resolve(repositoryRoot, 'calculogic-validator');

  return safeRealPath(packageRoot) === safeRealPath(embeddedPackageRoot);
};

export const runNamingHealthCheckEntrypoint = () => {
  try {
    const repositoryRoot = resolveRepositoryRoot();
    const packageRoot = resolveNamingHealthPackageRoot();
    const requireDocs = shouldRequireEmbeddedDocsForNamingHealth({ repositoryRoot, packageRoot });
    const healthResult = runNamingHealthCheck(repositoryRoot, { requireDocs });

    console.log('OK: naming validator deterministic for repo|app|docs|validator|system');
    if (healthResult.docsChecked) {
      console.log('OK: docs match app scope roots');
    } else {
      console.log('OK: docs check skipped outside embedded repository docs host');
    }
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Validator health check failed: ${message}`);
    process.exit(1);
  }
};
