import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT,
  GET_TREE_RENDER_VIEW,
  STRUCTURAL_ADDRESSING_MARKER_STRATEGIES,
  STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES,
  TREE_CODEBASE_ADDRESSING_PROFILE,
} from '../src/structural-addressing-profile.knowledge.mjs';

test('TREE_CODEBASE_ADDRESSING_PROFILE uses expected identity and addressing constants', () => {
  assert.equal(TREE_CODEBASE_ADDRESSING_PROFILE.profileId, 'tree-codebase');
  assert.equal(TREE_CODEBASE_ADDRESSING_PROFILE.domainPrefix, 'T');
  assert.equal(TREE_CODEBASE_ADDRESSING_PROFILE.snapshotOutputId, 'addressedTreeSnapshot');
  assert.equal(TREE_CODEBASE_ADDRESSING_PROFILE.counterReset, 'per-parent');
  assert.equal(TREE_CODEBASE_ADDRESSING_PROFILE.lineageSeparator, '.');
});

test('TREE_CODEBASE_ADDRESSING_PROFILE includes folder/file occurrence types and marker strategy rules', () => {
  assert.deepEqual(TREE_CODEBASE_ADDRESSING_PROFILE.occurrenceTypes, [
    STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FOLDER,
    STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FILE,
  ]);

  const folderRule = TREE_CODEBASE_ADDRESSING_PROFILE.levelRules.find(
    (rule) => rule.occurrenceType === STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FOLDER,
  );
  const fileRule = TREE_CODEBASE_ADDRESSING_PROFILE.levelRules.find(
    (rule) => rule.occurrenceType === STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FILE,
  );

  assert.equal(folderRule?.markerStrategy, STRUCTURAL_ADDRESSING_MARKER_STRATEGIES.UPPER_ALPHA);
  assert.equal(fileRule?.markerStrategy, STRUCTURAL_ADDRESSING_MARKER_STRATEGIES.ARABIC_NUMBER);
});

test('GET_TREE_RENDER_VIEW uses expected identifiers and format support', () => {
  assert.equal(GET_TREE_RENDER_VIEW.renderViewId, 'get-tree');
  assert.equal(GET_TREE_RENDER_VIEW.inputBridgeOutputId, 'addressedTreeSnapshot');
  assert.equal(GET_TREE_RENDER_VIEW.profileId, 'tree-codebase');
  assert.deepEqual(GET_TREE_RENDER_VIEW.supportedFormats, ['text', 'json', 'both']);
  assert.equal(GET_TREE_RENDER_VIEW.defaultFormat, 'text');
});

test('ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT uses expected bridge and profile references', () => {
  assert.equal(ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT.bridgeOutputId, 'addressedTreeSnapshot');
  assert.equal(ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT.profileId, 'tree-codebase');
  assert.equal(ADDRESSED_TREE_SNAPSHOT_BRIDGE_OUTPUT.domainPrefix, 'T');
});
