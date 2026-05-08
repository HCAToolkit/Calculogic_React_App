import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const STRUCTURAL_HOME_SIGNAL_POLICY_REGISTRY_PATH = new URL(
  '../src/registries/_builtin/structural-home-signal-policy.registry.json',
  import.meta.url,
);

const ALLOWED_SIGNAL_CATEGORIES = new Set(['strong', 'contextual', 'weak', 'anti-pattern']);
const ALLOWED_STATUSES = new Set(['active']);

test('structural-home-signal-policy registry has deterministic shape and coverage', () => {
  const payload = JSON.parse(fs.readFileSync(STRUCTURAL_HOME_SIGNAL_POLICY_REGISTRY_PATH, 'utf8'));

  assert.equal(typeof payload.version, 'string');
  assert.equal(payload.version.length > 0, true);
  assert.equal(Array.isArray(payload.structuralHomeSignalPolicy), true);
  assert.equal(payload.structuralHomeSignalPolicy.length > 0, true);

  const seenTokens = new Set();
  const seenCategories = new Set();

  payload.structuralHomeSignalPolicy.forEach((entry, index) => {
    assert.equal(typeof entry.token, 'string', `structuralHomeSignalPolicy[${index}].token should be a string`);
    assert.equal(entry.token.length > 0, true, `structuralHomeSignalPolicy[${index}].token should not be empty`);
    assert.equal(
      seenTokens.has(entry.token),
      false,
      `structuralHomeSignalPolicy[${index}].token should be unique`,
    );
    seenTokens.add(entry.token);

    assert.equal(
      ALLOWED_SIGNAL_CATEGORIES.has(entry.signalCategory),
      true,
      `structuralHomeSignalPolicy[${index}].signalCategory should be an allowed category`,
    );
    seenCategories.add(entry.signalCategory);

    assert.equal(
      ALLOWED_STATUSES.has(entry.status),
      true,
      `structuralHomeSignalPolicy[${index}].status should be an allowed status`,
    );

    assert.equal(
      typeof entry.definition,
      'string',
      `structuralHomeSignalPolicy[${index}].definition should be a string`,
    );
    assert.equal(
      entry.definition.length > 0,
      true,
      `structuralHomeSignalPolicy[${index}].definition should not be empty`,
    );
    assert.equal(
      typeof entry.evidenceMeaning,
      'string',
      `structuralHomeSignalPolicy[${index}].evidenceMeaning should be a string`,
    );
    assert.equal(
      entry.evidenceMeaning.length > 0,
      true,
      `structuralHomeSignalPolicy[${index}].evidenceMeaning should not be empty`,
    );
    assert.equal(typeof entry.notes, 'string', `structuralHomeSignalPolicy[${index}].notes should be a string`);
    assert.equal(entry.notes.length > 0, true, `structuralHomeSignalPolicy[${index}].notes should not be empty`);
  });

  ALLOWED_SIGNAL_CATEGORIES.forEach((category) => {
    assert.equal(
      seenCategories.has(category),
      true,
      `structuralHomeSignalPolicy should include at least one ${category} entry`,
    );
  });
});
