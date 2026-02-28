const parseOriginalArgv = npmConfigArgvJson => {
  if (!npmConfigArgvJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(npmConfigArgvJson);
    return Array.isArray(parsed?.original) ? parsed.original : null;
  } catch {
    return null;
  }
};

const findFlagTokenIndex = (tokens, supportedFlagNames) => {
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    for (const flagName of supportedFlagNames) {
      const canonicalFlag = `--${flagName}`;
      if (token === canonicalFlag || token.startsWith(`${canonicalFlag}=`)) {
        return index;
      }
    }
  }

  return -1;
};

const hasForwardedSupportedFlag = (argv, supportedFlagNames) => findFlagTokenIndex(argv, supportedFlagNames) >= 0;

const deriveHintArgs = (originalArgv, supportedFlagNames) => {
  const index = findFlagTokenIndex(originalArgv, supportedFlagNames);
  if (index < 0) {
    return null;
  }

  const token = originalArgv[index];
  if (token.includes('=')) {
    return token;
  }

  const nextToken = originalArgv[index + 1];
  if (nextToken && !nextToken.startsWith('--')) {
    return `${token}=${nextToken}`;
  }

  return token;
};

export const detectNpmArgForwardingFootgun = ({
  argv,
  npmConfigArgvJson,
  lifecycleEvent,
  expectedLifecycleEvent,
  supportedFlagNames,
}) => {
  if (lifecycleEvent !== expectedLifecycleEvent) {
    return null;
  }

  const originalArgv = parseOriginalArgv(npmConfigArgvJson);
  if (!originalArgv) {
    return null;
  }

  const hintArg = deriveHintArgs(originalArgv, supportedFlagNames);
  if (!hintArg) {
    return null;
  }

  if (hasForwardedSupportedFlag(argv, supportedFlagNames)) {
    return null;
  }

  return `Detected npm argument forwarding issue: use "npm run ${expectedLifecycleEvent} -- ${hintArg}" (note the extra --).`;
};
