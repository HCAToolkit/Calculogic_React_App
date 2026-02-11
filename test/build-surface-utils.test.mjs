import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp } from '../src/tabs/build/BuildSurface.logic.ts';

test('clamp enforces lower and upper boundaries', () => {
  assert.equal(clamp(100, 120, 240), 120);
  assert.equal(clamp(180, 120, 240), 180);
  assert.equal(clamp(260, 120, 240), 240);
});
