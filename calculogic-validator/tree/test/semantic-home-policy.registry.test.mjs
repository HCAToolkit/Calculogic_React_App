import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const SEMANTIC_HOME_POLICY_REGISTRY_PATH = new URL(
  '../src/registries/_builtin/semantic-home-policy.registry.json',
  import.meta.url,
);

const ALLOWED_INPUT_LANES = new Set([
  'folder-context',
  'parent-lineage',
  'naming-bridge',
  'structural-home-boundary',
  'structural-signal-boundary',
  'known-root-compatibility-boundary',
]);
const ALLOWED_STATUSES = new Set(['active']);

test('semantic-home-policy registry has deterministic shape and boundary coverage', () => {
  const payload = JSON.parse(fs.readFileSync(SEMANTIC_HOME_POLICY_REGISTRY_PATH, 'utf8'));

  assert.equal(typeof payload.version, 'string');
  assert.equal(payload.version.length > 0, true);
  assert.equal(Array.isArray(payload.semanticHomePolicy), true);
  assert.equal(payload.semanticHomePolicy.length > 0, true);

  const seenPolicyIds = new Set();
  const seenInputLanes = new Set();

  payload.semanticHomePolicy.forEach((entry, index) => {
    assert.equal(typeof entry.policyId, 'string', `semanticHomePolicy[${index}].policyId should be a string`);
    assert.equal(entry.policyId.length > 0, true, `semanticHomePolicy[${index}].policyId should not be empty`);
    assert.equal(seenPolicyIds.has(entry.policyId), false, `semanticHomePolicy[${index}].policyId should be unique`);
    seenPolicyIds.add(entry.policyId);

    assert.equal(typeof entry.inputLane, 'string', `semanticHomePolicy[${index}].inputLane should be a string`);
    assert.equal(entry.inputLane.length > 0, true, `semanticHomePolicy[${index}].inputLane should not be empty`);
    assert.equal(
      ALLOWED_INPUT_LANES.has(entry.inputLane),
      true,
      `semanticHomePolicy[${index}].inputLane should be an allowed vocabulary value`,
    );
    seenInputLanes.add(entry.inputLane);

    assert.equal(ALLOWED_STATUSES.has(entry.status), true, `semanticHomePolicy[${index}].status should be allowed`);

    assert.equal(typeof entry.definition, 'string', `semanticHomePolicy[${index}].definition should be a string`);
    assert.equal(entry.definition.length > 0, true, `semanticHomePolicy[${index}].definition should not be empty`);

    assert.equal(
      typeof entry.derivationMeaning,
      'string',
      `semanticHomePolicy[${index}].derivationMeaning should be a string`,
    );
    assert.equal(
      entry.derivationMeaning.length > 0,
      true,
      `semanticHomePolicy[${index}].derivationMeaning should not be empty`,
    );

    assert.equal(typeof entry.guardrails, 'string', `semanticHomePolicy[${index}].guardrails should be a string`);
    assert.equal(entry.guardrails.length > 0, true, `semanticHomePolicy[${index}].guardrails should not be empty`);
  });

  assert.equal(seenInputLanes.has('naming-bridge'), true, 'registry should include naming-bridge evidence lane');
  assert.equal(
    seenInputLanes.has('known-root-compatibility-boundary'),
    true,
    'registry should preserve known-root compatibility boundary lane',
  );
  assert.equal(
    seenInputLanes.has('structural-home-boundary'),
    true,
    'registry should preserve structural-home boundary lane',
  );
});
