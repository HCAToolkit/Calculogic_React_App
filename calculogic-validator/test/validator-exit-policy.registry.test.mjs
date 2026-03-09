import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getBuiltinExitPolicies,
  loadExitPolicyRegistryFromPayload,
} from '../src/registries/validator-exit-policy.registry.runtime.mjs';
import { deriveExitCodeFromFindings } from '../src/core/validator-exit-code.logic.mjs';

test('builtin exit policy registry preserves deterministic policy order', () => {
  const policies = getBuiltinExitPolicies();
  assert.deepEqual(
    policies.map((policy) => policy.id),
    ['warn-findings', 'strict-legacy-exception', 'default-success'],
  );
});

test('deriveExitCodeFromFindings preserves existing warn and strict legacy semantics', () => {
  assert.equal(
    deriveExitCodeFromFindings([{ severity: 'warn', classification: 'legacy-exception' }], {
      strict: false,
    }),
    2,
  );

  assert.equal(
    deriveExitCodeFromFindings([{ classification: 'legacy-exception' }], { strict: false }),
    0,
  );

  assert.equal(
    deriveExitCodeFromFindings([{ classification: 'legacy-exception' }], { strict: true }),
    1,
  );

  assert.equal(deriveExitCodeFromFindings([], { strict: true }), 0);
});

test('exit policy loader fails deterministically for malformed payloads', () => {
  assert.throws(
    () => loadExitPolicyRegistryFromPayload({ policies: [{ id: 'warn-findings', exitCode: 2 }] }),
    /predicate for policy "warn-findings" must be an object/,
  );

  assert.throws(
    () =>
      loadExitPolicyRegistryFromPayload({
        policies: [
          {
            id: 'warn-findings',
            exitCode: 2,
            predicate: { unsupported: true },
          },
        ],
      }),
    /unsupported predicate key "unsupported"/,
  );

  assert.throws(
    () => loadExitPolicyRegistryFromPayload({ policies: [] }),
    /policies array must not be empty/,
  );
});
