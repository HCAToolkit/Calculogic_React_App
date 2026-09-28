// Offline pin-consistency checks for the Git-pinned @calculogic/validator dependency (Refs #713).
// Contract: doc/nl-config/cfg-validatorPinConsistency.md.
//
// Pure logic: every file content and filesystem/git probe is injected by the host or a test, so
// the checks are deterministic and never touch the network.

import {
  VALIDATOR_PACKAGE_NAME,
  VALIDATOR_PIN_DISCOVERY_EXCLUDED_PREFIXES,
  VALIDATOR_PIN_LINK_REGISTRY,
  VALIDATOR_REPOSITORY_BLOB_URL_PREFIX,
} from './validator-pin-links.knowledge.mjs';

const LOCK_ENTRY_KEY = `node_modules/${VALIDATOR_PACKAGE_NAME}`;
const COMMIT_ID_PATTERN = /^[0-9a-f]{40}$/u;

// Matches any pinned blob link to the standalone repository, including short commit ids, so a
// short or stale pin is found and then reported by the commit comparison.
const PINNED_LINK_PATTERN = new RegExp(
  `${VALIDATOR_REPOSITORY_BLOB_URL_PREFIX.replaceAll('.', '\\.').replaceAll('/', '\\/')}([0-9a-f]{7,40})\\/([^\\s)\\]"'\`<>]+)`,
  'gu',
);

export const INSTALLATION_RECORD_LIMITATION =
  'Matching installation records establish that npm recorded installing the declared commit; ' +
  'they do not prove that the installed file contents are byte-identical to that commit.';

export const parseCommitFromSpec = (spec) => {
  if (typeof spec !== 'string') {
    return null;
  }
  const hashIndex = spec.lastIndexOf('#');
  const candidate = hashIndex === -1 ? '' : spec.slice(hashIndex + 1);
  return COMMIT_ID_PATTERN.test(candidate) ? candidate : null;
};

export const extractPinnedLinks = (content) =>
  [...content.matchAll(PINNED_LINK_PATTERN)].map((match) => ({ commit: match[1], targetPath: match[2] }));

const shortCommit = (commit) => (commit ? commit.slice(0, 7) : '(none)');

export const checkDeclaredPin = ({ packageJson, packageLock }) => {
  const lockEntry = packageLock?.packages?.[LOCK_ENTRY_KEY];
  const sources = [
    { source: 'package.json', commit: parseCommitFromSpec(packageJson?.devDependencies?.[VALIDATOR_PACKAGE_NAME] ?? packageJson?.dependencies?.[VALIDATOR_PACKAGE_NAME]) },
    { source: 'package-lock.json root', commit: parseCommitFromSpec(packageLock?.packages?.['']?.devDependencies?.[VALIDATOR_PACKAGE_NAME] ?? packageLock?.packages?.['']?.dependencies?.[VALIDATOR_PACKAGE_NAME]) },
    { source: 'package-lock.json resolved', commit: parseCommitFromSpec(lockEntry?.resolved) },
  ];
  const commits = new Set(sources.map(({ commit }) => commit));
  const ok = !commits.has(null) && commits.size === 1;

  return {
    ok,
    declaredCommit: ok ? sources[0].commit : null,
    lockIntegrity: lockEntry?.integrity ?? null,
    sources,
    message: ok
      ? `declared pin ${shortCommit(sources[0].commit)} agrees across package.json and package-lock.json`
      : `declared pin disagrees or is unparsable: ${sources.map(({ source, commit }) => `${source}=${shortCommit(commit)}`).join(', ')}`,
  };
};

export const checkLinkPins = ({ declaredCommit, documents, trackedFiles, registry = VALIDATOR_PIN_LINK_REGISTRY }) => {
  const results = registry.map((entry) => {
    const content = documents.get(entry.sourceDocument);
    if (content === undefined) {
      return { ...entry, ok: false, message: `${entry.sourceDocument}: source document not found` };
    }
    const links = extractPinnedLinks(content);
    if (links.length !== 1) {
      return { ...entry, ok: false, message: `${entry.sourceDocument}: expected exactly one pinned link, found ${links.length}` };
    }
    const [link] = links;
    if (link.targetPath !== entry.targetPath) {
      return { ...entry, ok: false, link, message: `${entry.sourceDocument}: link targets ${link.targetPath}, registered target is ${entry.targetPath}` };
    }
    if (link.commit !== declaredCommit) {
      return { ...entry, ok: false, link, message: `${entry.sourceDocument}: link pins ${shortCommit(link.commit)}, declared pin is ${shortCommit(declaredCommit)}` };
    }
    return { ...entry, ok: true, link, message: `${entry.sourceDocument}: link pins the declared commit` };
  });

  const registeredSources = new Set(registry.map(({ sourceDocument }) => sourceDocument));
  const unregistered = trackedFiles
    .filter(({ path }) => !VALIDATOR_PIN_DISCOVERY_EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)))
    .filter(({ path }) => !registeredSources.has(path))
    .flatMap(({ path, content }) => extractPinnedLinks(content).map((link) => ({ path, ...link })));

  return {
    ok: results.every(({ ok }) => ok) && unregistered.length === 0,
    results,
    unregistered,
  };
};

export const classifyInstallation = ({ declaredCommit, lockIntegrity, installation }) => {
  if (installation.kind === 'missing') {
    return { state: 'failed', message: `${LOCK_ENTRY_KEY} is not installed; run npm ci` };
  }

  if (installation.kind === 'symlink') {
    if (!installation.link?.ok) {
      return { state: 'failed', message: `invalid npm link: ${installation.link?.reason ?? 'unknown reason'}` };
    }
    return {
      state: 'linked-development',
      linkedCheckout: installation.link.realPath,
      linkedHead: installation.link.head ?? null,
      message:
        `linked development: ${LOCK_ENTRY_KEY} links to ${installation.link.realPath} ` +
        `(HEAD ${shortCommit(installation.link.head)}); stable-install consistency is not verified`,
    };
  }

  const entry = installation.hiddenLockEntry;
  if (!installation.hiddenLockPresent) {
    return { state: 'failed', message: 'node_modules/.package-lock.json is missing, so the installation is unknown; run npm ci' };
  }
  if (!entry) {
    return { state: 'failed', message: `node_modules/.package-lock.json has no ${LOCK_ENTRY_KEY} entry; run npm ci` };
  }
  const installedCommit = parseCommitFromSpec(entry.resolved);
  if (installedCommit !== declaredCommit) {
    return {
      state: 'failed',
      installedCommit,
      message: `stale installation: npm installed ${shortCommit(installedCommit)}, declared pin is ${shortCommit(declaredCommit)}; run npm ci`,
    };
  }
  if (entry.integrity !== lockIntegrity) {
    return {
      state: 'failed',
      installedCommit,
      message: 'stale installation: installed integrity differs from package-lock.json; run npm ci',
    };
  }
  return {
    state: 'consistent',
    installedCommit,
    message: `stable installation record matches the declared pin ${shortCommit(declaredCommit)}`,
  };
};

export const checkLinkTargets = ({ declaredCommit, linkResults, installationState, installation, checkout }) => {
  const checkoutUsable = Boolean(checkout && checkout.hasCommit(declaredCommit));

  return linkResults.map((entry) => {
    if (checkoutUsable) {
      const exists = checkout.fileExistsAtCommit(declaredCommit, entry.targetPath);
      return {
        id: entry.id,
        targetPath: entry.targetPath,
        distribution: entry.distribution,
        status: exists ? 'verified' : 'missing',
        via: `checkout ${checkout.path} (${checkout.source})`,
      };
    }

    if (entry.distribution === 'packaged' && installationState === 'consistent') {
      const exists = installation.installedFileExists(entry.targetPath);
      return {
        id: entry.id,
        targetPath: entry.targetPath,
        distribution: entry.distribution,
        status: exists ? 'verified' : 'missing',
        via: 'installed package',
      };
    }

    let reason;
    if (checkout && !checkoutUsable) {
      reason = `checkout ${checkout.path} does not contain commit ${shortCommit(declaredCommit)} (fetch it)`;
    } else if (entry.distribution === 'unpackaged') {
      reason = 'unpackaged standalone document and no standalone checkout is available';
    } else {
      reason = 'packaged document, but stable-install consistency was not established';
    }
    return { id: entry.id, targetPath: entry.targetPath, distribution: entry.distribution, status: 'unverified', reason };
  });
};

export const evaluateValidatorPin = ({ packageJson, packageLock, documents, trackedFiles, installation, checkout = null }) => {
  const declaredPin = checkDeclaredPin({ packageJson, packageLock });
  const linkPins = checkLinkPins({ declaredCommit: declaredPin.declaredCommit, documents, trackedFiles });
  const installationResult = declaredPin.ok
    ? classifyInstallation({ declaredCommit: declaredPin.declaredCommit, lockIntegrity: declaredPin.lockIntegrity, installation })
    : { state: 'failed', message: 'installation not checked: the declared pin is inconsistent' };
  const targets = declaredPin.ok
    ? checkLinkTargets({
        declaredCommit: declaredPin.declaredCommit,
        linkResults: VALIDATOR_PIN_LINK_REGISTRY,
        installationState: installationResult.state,
        installation,
        checkout,
      })
    : [];

  const failed =
    !declaredPin.ok ||
    !linkPins.ok ||
    installationResult.state === 'failed' ||
    targets.some(({ status }) => status === 'missing');

  return {
    status: failed ? 'failed' : installationResult.state,
    declaredCommit: declaredPin.declaredCommit,
    declaredPin,
    linkPins,
    installation: installationResult,
    targets,
    unverifiedTargets: targets.filter(({ status }) => status === 'unverified'),
  };
};

export const formatValidatorPinReport = (result) => {
  const lines = [];
  const mark = (ok) => (ok ? 'ok  ' : 'FAIL');
  lines.push(`${mark(result.declaredPin.ok)} check 1  ${result.declaredPin.message}`);
  for (const entry of result.linkPins.results) {
    lines.push(`${mark(entry.ok)} check 2a ${entry.message}`);
  }
  for (const link of result.linkPins.unregistered) {
    lines.push(`FAIL check 2a ${link.path}: unregistered pinned link to ${link.targetPath} at ${shortCommit(link.commit)}`);
  }
  lines.push(`${mark(result.installation.state !== 'failed')} check 3  ${result.installation.message}`);
  for (const target of result.targets) {
    const label = target.status === 'verified' ? 'ok  ' : target.status === 'missing' ? 'FAIL' : 'note';
    const detail = target.status === 'unverified' ? `unverified: ${target.reason}` : `${target.status} via ${target.via}`;
    lines.push(`${label} check 2b ${target.targetPath} (${target.distribution}): ${detail}`);
  }
  lines.push(`result: ${result.status}`);
  if (result.status === 'consistent') {
    lines.push(`note: ${INSTALLATION_RECORD_LIMITATION}`);
  }
  if (result.status === 'linked-development') {
    lines.push('note: the installed Validator is a linked checkout; this is not verified stable-install consistency.');
  }
  return lines;
};
