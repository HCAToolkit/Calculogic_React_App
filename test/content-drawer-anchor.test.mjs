import test from 'node:test';
import assert from 'node:assert/strict';
import { toAnchorId } from '../src/components/ContentDrawer/ContentDrawer.anchor.ts';

test('toAnchorId normalizes heading punctuation and spacing', () => {
  assert.equal(toAnchorId('  Build + Logic: Overview  '), 'build-logic-overview');
});

test('toAnchorId preserves existing hyphens while trimming output', () => {
  assert.equal(toAnchorId('Results - Score Card'), 'results---score-card');
});
