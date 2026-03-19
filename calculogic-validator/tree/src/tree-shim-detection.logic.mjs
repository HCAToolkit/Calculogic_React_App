import path from 'node:path';
import { getBuiltinTreeSignalPolicy } from './registries/tree-signal-policy.registry.logic.mjs';

const TREE_SIGNAL_POLICY = getBuiltinTreeSignalPolicy();

const tokenizeBasename = (basename) =>
  basename
    .toLowerCase()
    .replace(/\.[^.]+$/u, '')
    .split(/[^a-z0-9]+/u)
    .filter(Boolean);

export const inferArtifactSurface = (relativePath) => {
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

export const collectPathShimSignals = (relativePath) => {
  const segments = relativePath.split('/').filter(Boolean);
  const directorySegments = segments.slice(0, -1);
  const basename = segments.at(-1) ?? '';
  const normalizedDirectories = directorySegments.map((segment) => segment.toLowerCase());

  const folderSignals = normalizedDirectories.filter((segment) => TREE_SIGNAL_POLICY.shimFolderSignals.has(segment));
  const basenameTokens = tokenizeBasename(basename).filter((token) => TREE_SIGNAL_POLICY.shimNameTokenSignals.has(token));

  return {
    folderSignals,
    basenameTokens,
    insideCompatSurface: normalizedDirectories.some((segment) => TREE_SIGNAL_POLICY.shimSurfaceSegmentSignals.has(segment)),
  };
};

const isDeterministicShimContentCandidate = (relativePath, pathSignals) => {
  if (pathSignals.insideCompatSurface) {
    return true;
  }

  if (pathSignals.folderSignals.length > 0 || pathSignals.basenameTokens.length > 0) {
    return true;
  }

  const basename = path.posix.basename(relativePath);
  if (basename.includes('.host.')) {
    return true;
  }

  if (TREE_SIGNAL_POLICY.validatorOwnedBasenameSignalMatchers.some(({ matcher }) => matcher.test(basename))) {
    return true;
  }

  return relativePath === 'calculogic-validator/src/index.mjs';
};

export const parseThinReexportShim = (rawContent) => {
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

export const parsePublicEntrypointBarrelPassThrough = (relativePath, rawContent) => {
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
    /^(?:\.\/(?:core|naming)\/|\.\.\/tree\/src\/|(?:\.\/)?tree\/)/u.test(targetPath),
  );
  if (!hasCanonicalTargetOnly) {
    return null;
  }

  return {
    isPublicEntrypointBarrelPassThrough: true,
    barrelTargetCount: barrelTargets.length,
  };
};

export const detectCanonicalHostPassThrough = (relativePath, thinReexportSignal) => {
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

export const detectPublicEntrypointPassThrough = (relativePath, rawContent) =>
  parsePublicEntrypointBarrelPassThrough(relativePath, rawContent) !== null;

export const collectShimEvidence = (relativePath, rawContent) => {
  const shimSignals = collectPathShimSignals(relativePath);
  const thinReexportSignal = parseThinReexportShim(rawContent);
  const surface = inferArtifactSurface(relativePath);
  const basenameTokens = tokenizeBasename(path.posix.basename(relativePath));
  const isCanonicalHostPassThrough = detectCanonicalHostPassThrough(relativePath, thinReexportSignal);
  const isPublicEntryPointPassThrough = detectPublicEntrypointPassThrough(relativePath, rawContent);
  const isShimDetectorImplementationModule =
    relativePath.startsWith('calculogic-validator/tree/src/') &&
    basenameTokens.includes('shim') &&
    basenameTokens.some((token) => TREE_SIGNAL_POLICY.shimDetectorImplementationTokens.has(token));

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
    isShimDetectorImplementationModule,
  };
};

const collectPathOnlyShimEvidence = (relativePath) => {
  const shimSignals = collectPathShimSignals(relativePath);
  const basenameTokens = tokenizeBasename(path.posix.basename(relativePath));

  return {
    surface: inferArtifactSurface(relativePath),
    folderSignals: shimSignals.folderSignals,
    nameTokenSignals: shimSignals.basenameTokens,
    insideCompatSurface: shimSignals.insideCompatSurface,
    shouldReadContent: isDeterministicShimContentCandidate(relativePath, shimSignals),
    isShimDetectorImplementationModule:
      relativePath.startsWith('calculogic-validator/tree/src/') &&
      basenameTokens.includes('shim') &&
      basenameTokens.some((token) => TREE_SIGNAL_POLICY.shimDetectorImplementationTokens.has(token)),
  };
};

const collectContentBackedShimEvidence = (relativePath, rawContent) => {
  const thinReexportSignal = parseThinReexportShim(rawContent);

  return {
    thinReexportShim: thinReexportSignal !== null,
    canonicalTargetPath: thinReexportSignal?.canonicalTargetPath,
    reexportTargetCount: thinReexportSignal?.reexportTargetCount ?? 0,
    isCanonicalHostPassThrough: detectCanonicalHostPassThrough(relativePath, thinReexportSignal),
    isPublicEntryPointPassThrough: detectPublicEntrypointPassThrough(relativePath, rawContent),
  };
};

export const collectShimCompatFindings = (paths, getFileContent) => {
  const findings = [];

  for (const relativePath of paths) {
    const extension = path.posix.extname(relativePath).toLowerCase();
    if (!TREE_SIGNAL_POLICY.shimRelevantFileExtensions.has(extension)) {
      continue;
    }

    const pathEvidence = collectPathOnlyShimEvidence(relativePath);

    let contentEvidence = {
      thinReexportShim: false,
      canonicalTargetPath: undefined,
      reexportTargetCount: 0,
      isCanonicalHostPassThrough: false,
      isPublicEntryPointPassThrough: false,
    };

    if (pathEvidence.shouldReadContent && typeof getFileContent === 'function') {
      const rawContent = getFileContent(relativePath);
      contentEvidence = collectContentBackedShimEvidence(relativePath, rawContent);
    }

    const evidence = {
      ...pathEvidence,
      ...contentEvidence,
    };
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

    if (hasWeakSignalOnly && TREE_SIGNAL_POLICY.nonRuntimeWeakSignalSuppressedSurfaces.has(evidence.surface)) {
      continue;
    }

    if (hasWeakSignalOnly && evidence.isShimDetectorImplementationModule) {
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
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
      details: {
        artifactSurface: evidence.surface,
        matchedShimSignals,
        insideCompatSurface: evidence.insideCompatSurface,
        canonicalTargetPath: evidence.canonicalTargetPath,
        reexportTargetCount: evidence.reexportTargetCount,
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
      ruleRef: 'calculogic-validator/doc/ValidatorSpecs/tree-structure-advisor-validator.spec.md',
      details: {
        artifactSurface: evidence.surface,
        matchedShimSignals,
        insideCompatSurface: evidence.insideCompatSurface,
        canonicalTargetPath: evidence.canonicalTargetPath,
        reexportTargetCount: evidence.reexportTargetCount,
      },
    });
  }

  return findings;
};
