import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readBuildSurfaceStorage,
  writeBuildSurfaceStorage,
} from '../src/tabs/build/buildSurfacePersistence.ts';
import { clamp } from '../src/tabs/build/BuildSurface.logic.ts';

test('clamp enforces lower and upper boundaries', () => {
  assert.equal(clamp(100, 120, 240), 120);
  assert.equal(clamp(180, 120, 240), 180);
  assert.equal(clamp(260, 120, 240), 240);
});

test('readBuildSurfaceStorage falls back and reports on read failure', () => {
  const reports = [];
  const fallback = { width: 320, collapsed: false };

  const result = readBuildSurfaceStorage(
    'right-panel-state',
    () => {
      throw new Error('localStorage unavailable');
    },
    fallback,
    failure => reports.push(failure)
  );

  assert.deepEqual(result, fallback);
  assert.equal(reports.length, 1);
  assert.equal(reports[0].operation, 'read');
  assert.equal(reports[0].storageKey, 'right-panel-state');
  assert.match(String(reports[0].error), /localStorage unavailable/);
});

test('writeBuildSurfaceStorage reports on write failure without throwing', () => {
  const reports = [];

  assert.doesNotThrow(() => {
    writeBuildSurfaceStorage(
      'left-panel-width',
      () => {
        throw new Error('quota exceeded');
      },
      failure => reports.push(failure)
    );
  });

  assert.equal(reports.length, 1);
  assert.equal(reports[0].operation, 'write');
  assert.equal(reports[0].storageKey, 'left-panel-width');
  assert.match(String(reports[0].error), /quota exceeded/);
});
