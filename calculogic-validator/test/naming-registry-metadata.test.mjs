import test from 'node:test';
import assert from 'node:assert/strict';
import { runNamingValidator } from '../src/naming/naming-validator.host.mjs';

const assertDigestShape = digest => {
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
