import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  BUILTIN_SHIM_DETECTION_SIGNALS_REGISTRY_PATH,
  BUILTIN_VALIDATOR_OWNED_SIGNALS_REGISTRY_PATH,
  loadBuiltinTreeSignalPolicy,
} from '../src/registries/tree-signal-policy.registry.logic.mjs';

test('tree signal policy loader compiles validator-owned basename matchers deterministically', () => {
  const policy = loadBuiltinTreeSignalPolicy();

  assert.equal(Array.isArray(policy.validatorOwnedBasenameSignalMatchers), true);
  assert.equal(policy.validatorOwnedBasenameSignalMatchers.length, 7);
  assert.equal(policy.validatorOwnedBasenameSignalMatchers[0].matcher.test('naming-validator.logic.mjs'), true);
  assert.equal(policy.validatorOwnedBasenameSignalMatchers[0].matcher.test('unknown.logic.mjs'), false);
});

test('tree signal policy loader normalizes shim vocabularies into lowercased allowlists', () => {
  const policy = loadBuiltinTreeSignalPolicy();

  assert.equal(policy.shimFolderSignals.has('compat'), true);
  assert.equal(policy.shimRelevantFileExtensions.has('.mjs'), true);
  assert.equal(policy.nonRuntimeWeakSignalSuppressedSurfaces.has('quality'), true);
});

test('tree signal policy loader fails deterministically on malformed validator-owned registry payloads', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-signal-validator-owned-invalid-'));

  try {
    const invalidPath = path.join(fixtureDir, 'validator-owned-signals.registry.json');
    await fs.writeFile(
      invalidPath,
      JSON.stringify(
        {
          validatorOwnedBasenameSignals: [{ signalClass: 'validator-module-surface', matchType: 'regex' }],
        },
        null,
        2,
      ),
      'utf8',
    );

    assert.throws(
      () =>
        loadBuiltinTreeSignalPolicy({
          validatorOwnedSignalsRegistryPath: invalidPath,
          shimDetectionSignalsRegistryPath: BUILTIN_SHIM_DETECTION_SIGNALS_REGISTRY_PATH,
        }),
      /validatorOwnedBasenameSignals\[0\]\.pattern must be a non-empty string/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});

test('tree signal policy loader fails deterministically on malformed shim-detection registry payloads', async () => {
  const fixtureDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tree-signal-shim-invalid-'));

  try {
    const invalidPath = path.join(fixtureDir, 'shim-detection-signals.registry.json');
    await fs.writeFile(
      invalidPath,
      JSON.stringify(
        {
          shimDetectionSignals: {
            folderSignals: ['compat'],
            nameTokenSignals: ['shim'],
            surfaceSegmentSignals: ['shims'],
          },
          shimSuppressionVocabularies: {
            nonRuntimeWeakSignalSurfaces: ['quality'],
            detectorImplementationTokens: ['detector'],
          },
          shimExtensionAllowlist: {
            relevantFileExtensions: '.mjs',
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    assert.throws(
      () =>
        loadBuiltinTreeSignalPolicy({
          validatorOwnedSignalsRegistryPath: BUILTIN_VALIDATOR_OWNED_SIGNALS_REGISTRY_PATH,
          shimDetectionSignalsRegistryPath: invalidPath,
        }),
      /shimExtensionAllowlist\.relevantFileExtensions must be an array/u,
    );
  } finally {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
});
