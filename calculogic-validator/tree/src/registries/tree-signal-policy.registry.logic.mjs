import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUILTIN_REGISTRY_ROOT = new URL('./_builtin/', import.meta.url);

export const BUILTIN_VALIDATOR_OWNED_SIGNALS_REGISTRY_PATH = fileURLToPath(
  new URL('validator-owned-signals.registry.json', BUILTIN_REGISTRY_ROOT),
);

export const BUILTIN_SHIM_DETECTION_SIGNALS_REGISTRY_PATH = fileURLToPath(
  new URL('shim-detection-signals.registry.json', BUILTIN_REGISTRY_ROOT),
);

const VALIDATOR_OWNED_SIGNAL_CLASSES = new Set([
  'validator-module-surface',
  'validator-cli-entrypoint',
  'validator-quality-surface',
]);

const assertStringList = ({ payload, keyPath }) => {
  if (!Array.isArray(payload)) {
    throw new Error(`Invalid builtin tree-signal registry: ${keyPath} must be an array.`);
  }

  payload.forEach((value, index) => {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(
        `Invalid builtin tree-signal registry: ${keyPath}[${index}] must be a non-empty string.`,
      );
    }
  });

  return payload.map((value) => value.toLowerCase());
};

const loadValidatorOwnedSignalsRegistryPayload = (registryPath) => {
  const payload = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin tree-signal registry: validator-owned payload must be an object.');
  }

  if (!Array.isArray(payload.validatorOwnedBasenameSignals)) {
    throw new Error(
      'Invalid builtin tree-signal registry: validatorOwnedBasenameSignals must be an array.',
    );
  }

  const validatorOwnedBasenameSignalMatchers = payload.validatorOwnedBasenameSignals.map(
    (signal, index) => {
      if (!signal || typeof signal !== 'object') {
        throw new Error(
          `Invalid builtin tree-signal registry: validatorOwnedBasenameSignals[${index}] must be an object.`,
        );
      }

      if (!VALIDATOR_OWNED_SIGNAL_CLASSES.has(signal.signalClass)) {
        throw new Error(
          `Invalid builtin tree-signal registry: validatorOwnedBasenameSignals[${index}].signalClass must be one of validator-module-surface, validator-cli-entrypoint, validator-quality-surface.`,
        );
      }

      if (signal.matchType !== 'regex') {
        throw new Error(
          `Invalid builtin tree-signal registry: validatorOwnedBasenameSignals[${index}].matchType must be "regex".`,
        );
      }

      if (typeof signal.pattern !== 'string' || signal.pattern.length === 0) {
        throw new Error(
          `Invalid builtin tree-signal registry: validatorOwnedBasenameSignals[${index}].pattern must be a non-empty string.`,
        );
      }

      let pattern;
      try {
        pattern = new RegExp(signal.pattern, 'u');
      } catch (error) {
        throw new Error(
          `Invalid builtin tree-signal registry: validatorOwnedBasenameSignals[${index}].pattern must compile as a regex: ${error.message}`,
        );
      }

      return {
        signalClass: signal.signalClass,
        matcher: pattern,
      };
    },
  );

  return {
    validatorOwnedBasenameSignalMatchers,
  };
};

const loadShimDetectionSignalsRegistryPayload = (registryPath) => {
  const payload = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid builtin tree-signal registry: shim-detection payload must be an object.');
  }

  const shimDetectionSignals = payload.shimDetectionSignals;
  const shimSuppressionVocabularies = payload.shimSuppressionVocabularies;
  const shimExtensionAllowlist = payload.shimExtensionAllowlist;

  if (!shimDetectionSignals || typeof shimDetectionSignals !== 'object') {
    throw new Error('Invalid builtin tree-signal registry: shimDetectionSignals must be an object.');
  }

  if (!shimSuppressionVocabularies || typeof shimSuppressionVocabularies !== 'object') {
    throw new Error(
      'Invalid builtin tree-signal registry: shimSuppressionVocabularies must be an object.',
    );
  }

  if (!shimExtensionAllowlist || typeof shimExtensionAllowlist !== 'object') {
    throw new Error('Invalid builtin tree-signal registry: shimExtensionAllowlist must be an object.');
  }

  return {
    shimFolderSignals: new Set(
      assertStringList({
        payload: shimDetectionSignals.folderSignals,
        keyPath: 'shimDetectionSignals.folderSignals',
      }),
    ),
    shimNameTokenSignals: new Set(
      assertStringList({
        payload: shimDetectionSignals.nameTokenSignals,
        keyPath: 'shimDetectionSignals.nameTokenSignals',
      }),
    ),
    shimSurfaceSegmentSignals: new Set(
      assertStringList({
        payload: shimDetectionSignals.surfaceSegmentSignals,
        keyPath: 'shimDetectionSignals.surfaceSegmentSignals',
      }),
    ),
    nonRuntimeWeakSignalSuppressedSurfaces: new Set(
      assertStringList({
        payload: shimSuppressionVocabularies.nonRuntimeWeakSignalSurfaces,
        keyPath: 'shimSuppressionVocabularies.nonRuntimeWeakSignalSurfaces',
      }),
    ),
    shimDetectorImplementationTokens: new Set(
      assertStringList({
        payload: shimSuppressionVocabularies.detectorImplementationTokens,
        keyPath: 'shimSuppressionVocabularies.detectorImplementationTokens',
      }),
    ),
    shimRelevantFileExtensions: new Set(
      assertStringList({
        payload: shimExtensionAllowlist.relevantFileExtensions,
        keyPath: 'shimExtensionAllowlist.relevantFileExtensions',
      }),
    ),
  };
};

let cachedBuiltinTreeSignalPolicy = null;

export const loadBuiltinTreeSignalPolicy = ({
  validatorOwnedSignalsRegistryPath = BUILTIN_VALIDATOR_OWNED_SIGNALS_REGISTRY_PATH,
  shimDetectionSignalsRegistryPath = BUILTIN_SHIM_DETECTION_SIGNALS_REGISTRY_PATH,
} = {}) => {
  const validatorOwnedSignals = loadValidatorOwnedSignalsRegistryPayload(
    validatorOwnedSignalsRegistryPath,
  );
  const shimDetectionSignals = loadShimDetectionSignalsRegistryPayload(shimDetectionSignalsRegistryPath);

  return {
    ...validatorOwnedSignals,
    ...shimDetectionSignals,
  };
};

export const getBuiltinTreeSignalPolicy = () => {
  if (cachedBuiltinTreeSignalPolicy === null) {
    cachedBuiltinTreeSignalPolicy = loadBuiltinTreeSignalPolicy();
  }

  return cachedBuiltinTreeSignalPolicy;
};
