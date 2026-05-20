import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareNamingSemanticEvidenceBridge } from '../src/naming-semantic-evidence-bridge.logic.mjs';

test('prepareNamingSemanticEvidenceBridge returns deterministic evidence-only observations with stable ordering', () => {
  const input = {
    observations: [
      {
        path: 'src/z/order-payment.logic.ts',
        semanticName: 'order-payment',
        semanticFamily: 'order-payment',
        familyRoot: 'order',
        familySubgroup: 'payment',
        ambiguityFlags: ['family-boundary-heuristic', 'family-boundary-heuristic'],
      },
      {
        path: 'src/a/build-surface.logic.ts',
        semanticName: 'build-surface',
        semanticFamily: 'build-surface',
        familyRoot: 'build',
        splitFamilyFlags: ['family-root-observed-multiple-families'],
      },
    ],
  };

  const before = structuredClone(input);
  const result = prepareNamingSemanticEvidenceBridge(input);

  assert.deepEqual(input, before);
  assert.deepEqual(result, {
    observations: [
      {
        path: 'src/a/build-surface.logic.ts',
        semanticName: 'build-surface',
        semanticFamily: 'build-surface',
        familyRoot: 'build',
        semanticNameSource: 'naming-canonical-finding',
        semanticFamilySource: 'naming-family-derivation',
        evidenceSource: 'namingSemanticFamilyBridge',
        evidenceStrength: 'bounded',
        ambiguityStatus: 'present',
        splitMarkers: ['family-root-observed-multiple-families'],
      },
      {
        path: 'src/z/order-payment.logic.ts',
        semanticName: 'order-payment',
        semanticFamily: 'order-payment',
        familyRoot: 'order',
        familySubgroup: 'payment',
        semanticNameSource: 'naming-canonical-finding',
        semanticFamilySource: 'naming-family-derivation',
        evidenceSource: 'namingSemanticFamilyBridge',
        evidenceStrength: 'bounded',
        ambiguityStatus: 'present',
        splitMarkers: ['family-boundary-heuristic'],
      },
    ],
  });

  for (const observation of result.observations) {
    assert.equal('findingCode' in observation, false);
    assert.equal('severity' in observation, false);
    assert.equal('verdict' in observation, false);
    assert.equal('placementVerdict' in observation, false);
    assert.equal('addressPath' in observation, false);
    assert.equal('parentAddressPath' in observation, false);
    assert.equal('isKnownTopRoot' in observation, false);
    assert.equal('structuralClass' in observation, false);
  }
});

test('prepareNamingSemanticEvidenceBridge returns empty observations for empty payload', () => {
  assert.deepEqual(prepareNamingSemanticEvidenceBridge({}), { observations: [] });
});

test('prepareNamingSemanticEvidenceBridge deterministically rejects non-object payload', () => {
  assert.throws(
    () => prepareNamingSemanticEvidenceBridge([]),
    /requires an object payload/u,
  );
});
