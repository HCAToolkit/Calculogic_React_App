import { parseRepeatableTargetArgument } from '../../../src/core/cli/validator-cli-targets.logic.mjs';

export const parseNamingCliArguments = (argv) => {
  let selectedScope = 'repo';
  let configPath;
  let strict = false;
  const targets = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument.startsWith('--scope=')) {
      selectedScope = argument.slice('--scope='.length);
      continue;
    }

    const targetArgumentResult = parseRepeatableTargetArgument({
      argv,
      index,
      argument,
      targets,
    });

    if (targetArgumentResult.handled) {
      index = targetArgumentResult.nextIndex;
      continue;
    }

    if (argument === '--help' || argument === '-h') {
      return { helpRequested: true, selectedScope, configPath, strict, targets };
    }

    if (argument.startsWith('--config=')) {
      configPath = argument.slice('--config='.length);
      continue;
    }

    if (argument === '--strict') {
      strict = true;
      continue;
    }

    throw new Error(`Invalid argument: ${argument}`);
  }

  return { helpRequested: false, selectedScope, configPath, strict, targets };
};
