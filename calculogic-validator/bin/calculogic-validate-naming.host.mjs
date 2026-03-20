#!/usr/bin/env node

import { resolveRepositoryRoot } from '../src/core/repository-root.logic.mjs';
import { buildNamingCliUsageLines } from '../naming/src/cli/naming-cli-usage.logic.mjs';
import { runNamingCli } from '../naming/src/cli/naming-cli-runner.logic.mjs';

const repositoryRoot = resolveRepositoryRoot();
const usageLines = buildNamingCliUsageLines({
  commandPrefix: 'calculogic-validate-naming',
  strictExampleCommand: 'node calculogic-validator/bin/calculogic-validate-naming.host.mjs --scope=repo --strict',
});

const result = runNamingCli({
  argv: process.argv.slice(2),
  usageLines,
  repositoryRoot,
});

if (result.shouldExit) {
  process.exit(result.exitCode);
}
