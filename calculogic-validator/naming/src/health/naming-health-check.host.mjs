import { runNamingHealthCheck } from './naming-health-check.logic.mjs';
import { resolveRepositoryRoot } from '../../../src/core/repository-root.logic.mjs';

export const runNamingHealthCheckEntrypoint = () => {
  try {
    const repositoryRoot = resolveRepositoryRoot();
    runNamingHealthCheck(repositoryRoot);

    console.log('OK: naming validator deterministic for repo|app|docs|validator|system');
    console.log('OK: docs match app scope roots');
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Validator health check failed: ${message}`);
    process.exit(1);
  }
};
