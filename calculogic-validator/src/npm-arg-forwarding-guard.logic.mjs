const parseOriginalArgv = (npmConfigArgvJson) => {
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

const KNOWN_SCOPES = new Set(['repo', 'app', 'docs', 'validator', 'system']);
const DETECTION_ORDER = ['scope', 'validators', 'target', 'config', 'strict'];

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

const hasForwardedSupportedFlag = (argv, supportedFlagNames) =>
  findFlagTokenIndex(argv, supportedFlagNames) >= 0;

const isTruthyNpmConfig = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const getSuspiciousNpmConfigFlags = (env, supportedFlagNames) => {
  const supported = new Set(supportedFlagNames);
  const detected = [];

  if (supported.has('scope') && KNOWN_SCOPES.has(env.npm_config_scope)) {
    detected.push('scope');
  }

  if (
    supported.has('validators') &&
    typeof env.npm_config_validators === 'string' &&
    env.npm_config_validators.trim() !== ''
  ) {
    const validatorsValue = env.npm_config_validators.trim();
    if (/(^|,)\s*naming\s*(,|$)/iu.test(validatorsValue) || validatorsValue.includes(',')) {
      detected.push('validators');
    }
  }

  if (
    supported.has('target') &&
    typeof env.npm_config_target === 'string' &&
    env.npm_config_target.trim() !== ''
  ) {
    detected.push('target');
  }

  if (
    supported.has('config') &&
    typeof env.npm_config_config === 'string' &&
    env.npm_config_config.trim() !== ''
  ) {
    detected.push('config');
  }

  if (supported.has('strict') && isTruthyNpmConfig(env.npm_config_strict)) {
    detected.push('strict');
  }

  return DETECTION_ORDER.filter((flagName) => detected.includes(flagName));
};

const buildFallbackMessage = (scriptName, detectedFlags) => {
  const sampleFlag = detectedFlags[0] ?? 'scope';
  const detectedSummary = detectedFlags.map((flagName) => `--${flagName}`).join(', ');

  return [
    'Detected npm argument forwarding issue: you passed validator flags to npm instead of the script. Use: npm run <script> -- <args>',
    ...(detectedSummary ? [`Detected npm_config flags: ${detectedSummary}`] : []),
    `Wrong: npm run ${scriptName} --${sampleFlag}=<value>`,
    `Right: npm run ${scriptName} -- --${sampleFlag}=<value>`,
  ].join('\n');
};

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
  env = process.env,
}) => {
  if (lifecycleEvent !== expectedLifecycleEvent) {
    return null;
  }

  const originalArgv = parseOriginalArgv(npmConfigArgvJson);
  if (originalArgv) {
    const hintArg = deriveHintArgs(originalArgv, supportedFlagNames);
    if (!hintArg) {
      return null;
    }

    if (hasForwardedSupportedFlag(argv, supportedFlagNames)) {
      return null;
    }

    return `Detected npm argument forwarding issue: use "npm run ${expectedLifecycleEvent} -- ${hintArg}" (note the extra --).`;
  }

  if (hasForwardedSupportedFlag(argv, supportedFlagNames)) {
    return null;
  }

  const suspiciousFlags = getSuspiciousNpmConfigFlags(env, supportedFlagNames);
  if (suspiciousFlags.length === 0) {
    return null;
  }

  return buildFallbackMessage(expectedLifecycleEvent, suspiciousFlags);
};
