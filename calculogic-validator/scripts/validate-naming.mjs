import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import { detectNpmArgForwardingFootgun } from '../src/core/npm-arg-forwarding-guard.logic.mjs';
import { buildNamingCliUsageLines } from '../naming/src/cli/naming-cli-usage.logic.mjs';
import { runNamingCli } from '../naming/src/cli/naming-cli-runner.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();
const usageLines = buildNamingCliUsageLines({
  commandPrefix: 'npm run validate:naming --',
  strictExampleCommand: 'npm run validate:naming -- --scope=repo --strict',
});

const npmArgForwardingMessage = detectNpmArgForwardingFootgun({
  argv: process.argv.slice(2),
  npmConfigArgvJson: process.env.npm_config_argv,
  lifecycleEvent: process.env.npm_lifecycle_event,
  expectedLifecycleEvent: 'validate:naming',
  supportedFlagNames: ['scope', 'target', 'config', 'strict'],
});

const result = runNamingCli({
  argv: process.argv.slice(2),
  usageLines,
  repositoryRoot,
  npmArgForwardingMessage,
});

if (result.shouldExit) {
  process.exit(result.exitCode);
}
