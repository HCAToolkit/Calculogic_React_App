import test from 'node:test';
// NOTE: Under `node --test --experimental-strip-types`, ESM resolution still requires
// fully qualified relative specifiers (including `.ts`) for TypeScript source imports.
import assert from 'node:assert/strict';
import {
  readBuildSurfaceStorage,
  writeBuildSurfaceStorage,
} from '../src/tabs/build/buildSurfacePersistence.ts';
import {
  clamp,
} from '../src/tabs/build/BuildSurface.logic.ts';
import {
  parseRightPanelStatePayload,
  parseSectionStatePayload,
  serializeSectionStatePayload,
} from '../src/tabs/build/buildSurfacePersistence.contracts.ts';

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


test('parseSectionStatePayload falls back to versioned defaults on malformed payload', () => {
  const fallback = { height: 180, collapsed: false };
  const parsed = parseSectionStatePayload('{"height":"bad","collapsed":false}', fallback);

  assert.deepEqual(parsed, {
    state: {
      version: 1,
      height: 180,
      collapsed: false,
    },
    wasFallback: true,
    wasMigrated: false,
    reasonCode: 'invalid-shape',
    reason: 'Malformed persisted section state payload: invalid-shape',
  });
});



test('parseSectionStatePayload handles malformed JSON syntax via non-fatal fallback metadata', () => {
  const fallback = { height: 180, collapsed: false };

  assert.doesNotThrow(() => {
    const parsed = parseSectionStatePayload('{"height":180,', fallback);

    assert.deepEqual(parsed, {
      state: {
        version: 1,
        height: 180,
        collapsed: false,
      },
      wasFallback: true,
      wasMigrated: false,
      reasonCode: 'malformed-json',
      reason: 'Malformed persisted section state payload: malformed-json',
    });
  });
});

test('parseRightPanelStatePayload upgrades legacy payloads without version', () => {
  const fallback = { width: 320, collapsed: false };
  const parsed = parseRightPanelStatePayload('{"width":280,"collapsed":true}', fallback);

  assert.deepEqual(parsed, {
    state: {
      version: 1,
      width: 280,
      collapsed: true,
    },
    wasFallback: false,
    wasMigrated: true,
  });
});



test('parseRightPanelStatePayload resets unsupported versions with diagnosable reason', () => {
  const fallback = { width: 320, collapsed: false };
  const parsed = parseRightPanelStatePayload('{"version":2,"width":500,"collapsed":false}', fallback);

  assert.deepEqual(parsed, {
    state: {
      version: 1,
      width: 320,
      collapsed: false,
    },
    wasFallback: true,
    wasMigrated: false,
    reasonCode: 'unsupported-version',
    reason: 'Malformed persisted right panel state payload: unsupported-version',
  });
});

test('section payload round-trips through serializer and parser', () => {
  const serialized = serializeSectionStatePayload({ height: 222, collapsed: true });
  const parsed = parseSectionStatePayload(JSON.stringify(serialized), {
    height: 180,
    collapsed: false,
  });

  assert.deepEqual(parsed, {
    state: serialized,
    wasFallback: false,
    wasMigrated: false,
  });
});
