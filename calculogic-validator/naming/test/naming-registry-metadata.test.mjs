import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prepareNamingRuntimeInputs,
  runNamingValidator,
} from '../src/naming-validator.host.mjs';

const assertDigestShape = (digest) => {
  assert.equal(typeof digest, 'string');
  assert.match(digest, /^[a-f0-9]{64}$/u);
};

test('runNamingValidator returns registry metadata envelope', () => {
  const result = runNamingValidator(process.cwd(), { scope: 'system' });

  assert.ok(result.registry);
  assert.match(result.registry.registryState, /^(builtin|custom)$/u);
  assert.match(result.registry.registrySource, /^(builtin|custom|config)$/u);
  assertDigestShape(result.registry.registryDigests?.builtin);
  assertDigestShape(result.registry.registryDigests?.custom);
  assertDigestShape(result.registry.registryDigests?.resolved);
});

test('prepareNamingRuntimeInputs exposes prepared dependencies and stable registry metadata', () => {
  const prepared = prepareNamingRuntimeInputs({});
  assert.ok(prepared.reportableExtensions instanceof Set);
  assert.ok(prepared.namingRolesRuntime.roleMetadata instanceof Map);
  assert.ok(prepared.namingRolesRuntime.activeRoles instanceof Set);
  assert.ok(Array.isArray(prepared.namingRolesRuntime.roleSuffixes));
  assert.ok(prepared.walkExclusions.excludedDirectories instanceof Set);
  assert.equal(typeof prepared.walkExclusions.skipDotDirectories, 'boolean');
  assert.ok(prepared.walkExclusions.allowDotFiles instanceof Set);
  assert.ok(prepared.registry);

  const result = runNamingValidator(process.cwd(), { scope: 'system', config: {} });
  assert.deepEqual(result.registry, prepared.registry);
});
