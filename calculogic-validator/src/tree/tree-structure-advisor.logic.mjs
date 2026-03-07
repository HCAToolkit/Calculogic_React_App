import path from 'node:path';

const KNOWN_TOP_LEVEL_DIRECTORIES = new Set([
  'bin',
  'calculogic-validator',
  'doc',
  'docs',
  'public',
  'scripts',
  'src',
  'test',
  'tools',
]);

const VALIDATOR_OWNED_BASENAME_PATTERNS = [
  /^naming-validator\.(logic|host|wiring|contracts)\.mjs$/u,
  /^tree-structure-advisor\.(logic|host|wiring|contracts)\.mjs$/u,
  /^validator-(?:runner|registry|config|exit-code|report|scopes|health-check).+\.mjs$/u,
  /^validate-(?:all|naming)\.mjs$/u,
  /^calculogic-validate(?:-naming|-validator-health)?\.mjs$/u,
  /^validator-.+\.test\.mjs$/u,
  /^naming-.+\.test\.mjs$/u,
];

const SHIM_FOLDER_SIGNALS = new Set(['compat', 'shims', 'adapters', 'bridges']);
const SHIM_NAME_TOKEN_SIGNALS = new Set(['shim', 'compat', 'adapter', 'bridge', 'migration']);
const SHIM_SURFACE_SEGMENT_SIGNALS = new Set(['compat', 'shims']);
const SHIM_RELEVANT_FILE_EXTENSIONS = new Set(['.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx']);
const NON_RUNTIME_SHIM_SUPPRESSED_SURFACES = new Set(['quality', 'docs', 'examples', 'fixtures']);

const sortByPathThenCode = (left, right) => {
  const byPath = left.path.localeCompare(right.path);
  if (byPath !== 0) {
    return byPath;
  }

  return left.code.localeCompare(right.code);
};

const isValidatorOwnedBasenameSignal = (basename) =>
  VALIDATOR_OWNED_BASENAME_PATTERNS.some((pattern) => pattern.test(basename));

const tokenizeBasename = (basename) =>
  basename
    .toLowerCase()
    .replace(/\.[^.]+$/u, '')
    .split(/[^a-z0-9]+/u)
    .filter(Boolean);

const inferArtifactSurface = (relativePath) => {
  const normalizedPath = relativePath.toLowerCase();
  const segments = normalizedPath.split('/').filter(Boolean);
  const basename = segments.at(-1) ?? '';

  if (
    segments.includes('test') ||
    segments.includes('tests') ||
    segments.includes('__tests__') ||
    /\.(?:test|spec)\.[^.]+$/u.test(basename)
  ) {
    return 'quality';
  }

  if (segments.includes('doc') || segments.includes('docs') || basename.endsWith('.md')) {
    return 'docs';
  }

  if (segments.includes('examples') || segments.includes('demo')) {
    return 'examples';
  }

  if (
    segments.includes('fixtures') ||
    segments.includes('mocks') ||
    segments.includes('benchmarks')
  ) {
    return 'fixtures';
  }

  return 'runtimeish';
};

const collectPathShimSignals = (relativePath) => {
  const segments = relativePath.split('/').filter(Boolean);
  const directorySegments = segments.slice(0, -1);
  const basename = segments.at(-1) ?? '';
  const normalizedDirectories = directorySegments.map((segment) => segment.toLowerCase());

  const folderSignals = normalizedDirectories.filter((segment) => SHIM_FOLDER_SIGNALS.has(segment));
  const basenameTokens = tokenizeBasename(basename).filter((token) => SHIM_NAME_TOKEN_SIGNALS.has(token));

  return {
    folderSignals,
    basenameTokens,
    insideCompatSurface: normalizedDirectories.some((segment) => SHIM_SURFACE_SEGMENT_SIGNALS.has(segment)),
  };
};

const parseThinReexportShim = (rawContent) => {
  if (typeof rawContent !== 'string') {
    return null;
  }

  const lines = rawContent
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  if (lines.length === 0) {
    return null;
  }

  const reexportTargets = [];
  for (const line of lines) {
    const match = line.match(/^export\s+(?:\*|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?$/u);
    if (!match) {
      return null;
    }

    reexportTargets.push(match[1]);
  }

  const canonicalTargetPath = reexportTargets[0];
  const hasCanonicalSegmentSignal = /(?:^|\/)(?:core|tree|naming|validators)\//u.test(canonicalTargetPath);
  if (!hasCanonicalSegmentSignal) {
    return null;
  }

  return {
    isThinReexportShim: true,
    canonicalTargetPath,
    reexportTargetCount: reexportTargets.length,
  };
};

const parsePublicEntrypointBarrelPassThrough = (relativePath, rawContent) => {
  if (relativePath !== 'calculogic-validator/src/index.mjs' || typeof rawContent !== 'string') {
    return null;
  }

  const lines = rawContent
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  if (lines.length === 0) {
    return null;
  }

  const barrelTargets = [];
  for (const line of lines) {
    const match = line.match(
      /^export\s+(?:\*|\*\s+as\s+[A-Za-z_$][\w$]*|\{[^}]+\})\s+from\s+['"]([^'"]+)['"];?$/u,
    );
    if (!match) {
      return null;
    }

    barrelTargets.push(match[1]);
  }

  const hasCanonicalTargetOnly = barrelTargets.every((targetPath) =>
    /^(?:\.\/)?(?:core|naming|tree)\//u.test(targetPath),
  );
  if (!hasCanonicalTargetOnly) {
    return null;
  }

  return {
    isPublicEntrypointBarrelPassThrough: true,
    barrelTargetCount: barrelTargets.length,
  };
};

const detectCanonicalHostPassThrough = (relativePath, thinReexportSignal) => {
  if (!thinReexportSignal || thinReexportSignal.reexportTargetCount !== 1) {
    return false;
  }

  const basename = path.posix.basename(relativePath);
  if (!basename.includes('.host.')) {
    return false;
  }

  const expectedSiblingWiringTarget = `./${basename.replace('.host.', '.wiring.')}`;
  return thinReexportSignal.canonicalTargetPath === expectedSiblingWiringTarget;
};

const detectPublicEntrypointPassThrough = (relativePath, rawContent) =>
  parsePublicEntrypointBarrelPassThrough(relativePath, rawContent) !== null;

const collectShimEvidence = (relativePath, rawContent) => {
  const shimSignals = collectPathShimSignals(relativePath);
  const thinReexportSignal = parseThinReexportShim(rawContent);
  const surface = inferArtifactSurface(relativePath);
  const isCanonicalHostPassThrough = detectCanonicalHostPassThrough(relativePath, thinReexportSignal);
  const isPublicEntryPointPassThrough = detectPublicEntrypointPassThrough(relativePath, rawContent);

  return {
    surface,
    folderSignals: shimSignals.folderSignals,
    nameTokenSignals: shimSignals.basenameTokens,
    insideCompatSurface: shimSignals.insideCompatSurface,
    thinReexportShim: thinReexportSignal !== null,
    canonicalTargetPath: thinReexportSignal?.canonicalTargetPath,
    reexportTargetCount: thinReexportSignal?.reexportTargetCount ?? 0,
    isCanonicalHostPassThrough,
    isPublicEntryPointPassThrough,
  };
};

const collectShimCompatFindings = (paths, fileContentsByPath = {}) => {
  const findings = [];

  for (const relativePath of paths) {
    const extension = path.posix.extname(relativePath).toLowerCase();
    if (!SHIM_RELEVANT_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    const evidence = collectShimEvidence(relativePath, fileContentsByPath[relativePath]);
    const hasWeakSignalOnly =
      !evidence.thinReexportShim &&
      (evidence.folderSignals.length > 0 || evidence.nameTokenSignals.length > 0);
    const isIntentionalPassThrough =
      evidence.isCanonicalHostPassThrough || evidence.isPublicEntryPointPassThrough;
    const isShimLike = evidence.thinReexportShim || hasWeakSignalOnly;

    if (!isShimLike) {
      continue;
    }

    if (isIntentionalPassThrough) {
      continue;
    }

    if (hasWeakSignalOnly && NON_RUNTIME_SHIM_SUPPRESSED_SURFACES.has(evidence.surface)) {
      continue;
    }

    const matchedShimSignals = {
      folderSignals: evidence.folderSignals,
      nameTokenSignals: evidence.nameTokenSignals,
      thinReexportShim: evidence.thinReexportShim,
    };

    findings.push({
      code: 'TREE_SHIM_SURFACE_PRESENT',
      severity: 'info',
      path: relativePath,
      classification: 'advisory-structure',
      message: evidence.thinReexportShim
        ? 'Thin re-export shim signal detected; maintain a discoverable and deterministic compatibility surface while cleanup is pending.'
        : 'Shim/compat naming/path signals are present with no thin re-export evidence; treat this as low-confidence observability, not immediate shim debt.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
      details: {
        artifactSurface: evidence.surface,
        matchedShimSignals,
        insideCompatSurface: evidence.insideCompatSurface,
        canonicalTargetPath: evidence.canonicalTargetPath,
        reexportTargetCount: evidence.reexportTargetCount,
        suppressedAsIntentionalPassThrough: false,
        suppressedBySurfaceContext: false,
      },
    });

    if (!evidence.thinReexportShim || evidence.insideCompatSurface) {
      continue;
    }

    findings.push({
      code: 'TREE_SHIM_OUTSIDE_COMPAT',
      severity: 'warn',
      path: relativePath,
      classification: 'advisory-structure',
      message:
        'Shim-like path is outside a discoverable compat/shims surface; consider consolidating compat entries to support later cleanup work.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
      details: {
        artifactSurface: evidence.surface,
        matchedShimSignals,
        insideCompatSurface: evidence.insideCompatSurface,
        canonicalTargetPath: evidence.canonicalTargetPath,
        reexportTargetCount: evidence.reexportTargetCount,
        suppressedAsIntentionalPassThrough: false,
        suppressedBySurfaceContext: false,
      },
    });
  }

  return findings;
};

const collectTopLevelUnexpectedFolderFindings = (topLevelDirectoryNames, scope) => {
  if ((scope ?? 'repo') !== 'repo') {
    return [];
  }

  return topLevelDirectoryNames
    .filter((directoryName) => !KNOWN_TOP_LEVEL_DIRECTORIES.has(directoryName))
    .sort((left, right) => left.localeCompare(right))
    .map((directoryName) => ({
      code: 'TREE_UNEXPECTED_TOP_LEVEL_FOLDER',
      severity: 'info',
      path: directoryName,
      classification: 'advisory-structure',
      message:
        'Top-level folder is outside the known project shape for this repository and may indicate structural drift.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
      details: {
        knownRoots: Array.from(KNOWN_TOP_LEVEL_DIRECTORIES).sort((a, b) => a.localeCompare(b)),
      },
    }));
};

const collectValidatorOwnedOutsideTreeFindings = (paths) =>
  paths
    .filter((relativePath) => !relativePath.startsWith('calculogic-validator/'))
    .filter((relativePath) => isValidatorOwnedBasenameSignal(path.posix.basename(relativePath)))
    .sort((left, right) => left.localeCompare(right))
    .map((relativePath) => ({
      code: 'TREE_VALIDATOR_OWNED_FILE_OUTSIDE_TREE',
      severity: 'info',
      path: relativePath,
      classification: 'advisory-structure',
      message:
        'Path appears validator-owned by basename signal but is located outside calculogic-validator/**.',
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator-spec.md',
      details: {
        expectedRoot: 'calculogic-validator/',
      },
    }));

const incrementCounter = (counts, key) => {
  counts[key] = (counts[key] ?? 0) + 1;
};

const sortCountObject = (counts) =>
  Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));

export const summarizeFindings = (findings) => {
  const counts = {
    'advisory-structure': 0,
  };
  const codeCounts = {};

  for (const finding of findings) {
    incrementCounter(counts, finding.classification);
    incrementCounter(codeCounts, finding.code);
  }

  return {
    counts,
    codeCounts: sortCountObject(codeCounts),
  };
};

const assertPreparedTreeInputs = (preparedInputs) => {
  if (
    preparedInputs &&
    Array.isArray(preparedInputs.selectedPaths) &&
    Array.isArray(preparedInputs.topLevelDirectoryNames)
  ) {
    return preparedInputs;
  }

  throw new Error('Tree runtime requires prepared inputs from wiring/runtime adapter.');
};

export const runTreeStructureAdvisor = (preparedInputs = {}) => {
  const prepared = assertPreparedTreeInputs(preparedInputs);

  const findings = [
    ...collectTopLevelUnexpectedFolderFindings(prepared.topLevelDirectoryNames, prepared.scope),
    ...collectValidatorOwnedOutsideTreeFindings(prepared.selectedPaths),
    ...collectShimCompatFindings(prepared.selectedPaths, prepared.fileContentsByPath),
  ].sort(sortByPathThenCode);

  return {
    findings,
    totalFilesScanned: prepared.selectedPaths.length,
    scope: prepared.scope ?? 'repo',
    filters: {
      isFiltered: prepared.targets.length > 0,
      ...(prepared.targets.length > 0
        ? {
            targets: prepared.targets,
          }
        : {}),
    },
  };
};
