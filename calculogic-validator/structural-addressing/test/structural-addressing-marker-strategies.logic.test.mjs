import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStructuralAddressingMarker } from '../src/structural-addressing-marker-strategies.logic.mjs';



test('marker options must be an object for null/non-object input', () => {
  assert.throws(() => buildStructuralAddressingMarker(null), /Marker options must be an object\./u);
  assert.throws(() => buildStructuralAddressingMarker('upper-alpha'), /Marker options must be an object\./u);
});

test('undefined options fall through deterministic validation', () => {
  assert.throws(() => buildStructuralAddressingMarker(undefined), /Marker index is required\./u);
});
test('upper-alpha marker generation is deterministic', () => {
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 1 }), 'A');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 2 }), 'B');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 26 }), 'Z');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 27 }), 'AA');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 28 }), 'AB');
});

test('arabic-number marker generation is deterministic', () => {
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'arabic-number', index: 1 }), '1');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'arabic-number', index: 2 }), '2');
  assert.equal(buildStructuralAddressingMarker({ markerStrategy: 'arabic-number', index: 10 }), '10');
});

test('unsupported marker strategy fails deterministically', () => {
  assert.throws(
    () => buildStructuralAddressingMarker({ markerStrategy: 'unsupported', index: 1 }),
    /Unsupported marker strategy: unsupported\./u,
  );
});

test('invalid marker index fails deterministically', () => {
  assert.throws(() => buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 0 }), /greater than zero/u);
  assert.throws(() => buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: -1 }), /greater than zero/u);
  assert.throws(() => buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha', index: 1.5 }), /positive integer/u);
  assert.throws(() => buildStructuralAddressingMarker({ markerStrategy: 'upper-alpha' }), /required/u);
});
