import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareTreeOccurrenceClassificationShadowReport } from '../src/tree-occurrence-classification-shadow-report.logic.mjs';

const baseInput = () => ({
  treeOccurrenceClassificationParityEvidence: {
    source: 'tree-occurrence-classification-parity-evidence',
    parityRecords: [
      {
        addressPath: 'A',
        parentAddressPath: null,
        path: 'src',
        name: 'src',
        occurrenceType: 'folder',
        currentStructuralClass: 'known-root',
        currentStructuralKind: 'structural',
        currentIsKnownTopRoot: true,
        currentIsStructuralRoot: true,
        currentIsSemanticRoot: false,
        replacementFolderKind: 'structural',
        replacementStructuralHome: 'workspace',
        replacementSemanticHome: null,
        parityStatus: 'matches',
        rationale: 'match rationale',
      },
      { path: 'docs', occurrenceType: 'folder', parityStatus: 'differs', rationale: 'diff rationale' },
      { path: 'tmp', occurrenceType: 'folder', parityStatus: 'insufficient-evidence', rationale: 'insufficient rationale' },
      { path: 'README.md', occurrenceType: 'file', parityStatus: 'not-applicable', rationale: 'not-applicable rationale' },
    ],
  },
  treeOccurrenceClassificationParitySummary: {
    source: 'tree-occurrence-classification-parity-summary',
    totalRecords: 4,
    comparableRecords: 3,
    matchedRecords: 1,
    differedRecords: 1,
    insufficientEvidenceRecords: 1,
    notApplicableRecords: 1,
    parityCoverageRatio: 2 / 3,
    parityMatchRatio: 1 / 3,
    replacementReadinessStatus: 'needs-review',
  },
});

test('creates deterministic shadow records from parity evidence without mutation', () => {
  const input = baseInput();
  const before = structuredClone(input);

  const result = prepareTreeOccurrenceClassificationShadowReport(input);

  assert.deepEqual(input, before);
  assert.equal(result.source, 'tree-occurrence-classification-shadow-report');
  assert.equal(result.shadowRecords.length, 4);
  assert.equal(result.summary.totalRecords, 4);
  assert.equal(result.summary.paritySummarySource, 'tree-occurrence-classification-parity-summary');
});

test('maps parity statuses to comparison statuses', () => {
  const result = prepareTreeOccurrenceClassificationShadowReport(baseInput());

  assert.equal(result.shadowRecords[0].comparisonStatus, 'aligned');
  assert.equal(result.shadowRecords[1].comparisonStatus, 'mismatch');
  assert.equal(result.shadowRecords[2].comparisonStatus, 'insufficient-evidence');
  assert.equal(result.shadowRecords[3].comparisonStatus, 'not-applicable');
});

test('carries current and replacement fields and replacement readiness metadata unchanged', () => {
  const result = prepareTreeOccurrenceClassificationShadowReport(baseInput());
  const record = result.shadowRecords[0];

  assert.equal(record.currentStructuralClass, 'known-root');
  assert.equal(record.currentStructuralKind, 'structural');
  assert.equal(record.currentIsKnownTopRoot, true);
  assert.equal(record.currentIsStructuralRoot, true);
  assert.equal(record.currentIsSemanticRoot, false);
  assert.equal(record.replacementFolderKind, 'structural');
  assert.equal(record.replacementStructuralHome, 'workspace');
  assert.equal(record.replacementSemanticHome, null);
  assert.equal(record.replacementReadinessStatus, 'needs-review');
  assert.equal(result.summary.replacementReadinessStatus, 'needs-review');
});

test('creates summary metadata from parity summary and keeps evidence-only boundaries', () => {
  const result = prepareTreeOccurrenceClassificationShadowReport(baseInput());

  assert.equal(result.summary.comparableRecords, 3);
  assert.equal(result.summary.matchedRecords, 1);
  assert.equal(result.summary.differedRecords, 1);
  assert.equal(result.summary.insufficientEvidenceRecords, 1);
  assert.equal(result.summary.notApplicableRecords, 1);
  assert.equal(result.summary.parityCoverageRatio, 2 / 3);
  assert.equal(result.summary.parityMatchRatio, 1 / 3);
  assert.equal(result.summary.shadowComparisonStatus, 'needs-review');

  const forbiddenKeys = ['finding', 'findingCode', 'severity', 'verdict', 'placementVerdict', 'advisorDecision'];
  for (const forbiddenKey of forbiddenKeys) {
    assert.equal(Object.hasOwn(result.summary, forbiddenKey), false);
    assert.equal(result.shadowRecords.some((record) => Object.hasOwn(record, forbiddenKey)), false);
  }
});

test('handles empty input safely', () => {
  const result = prepareTreeOccurrenceClassificationShadowReport({
    treeOccurrenceClassificationParityEvidence: { source: 'e', parityRecords: [] },
    treeOccurrenceClassificationParitySummary: {
      source: 'tree-occurrence-classification-parity-summary',
      totalRecords: 0,
      comparableRecords: 0,
      matchedRecords: 0,
      differedRecords: 0,
      insufficientEvidenceRecords: 0,
      notApplicableRecords: 0,
      parityCoverageRatio: 0,
      parityMatchRatio: 0,
      replacementReadinessStatus: 'not-ready',
    },
  });

  assert.deepEqual(result.shadowRecords, []);
  assert.equal(result.summary.shadowComparisonStatus, 'not-ready');
});

test('rejects invalid input deterministically', () => {
  assert.throws(() => prepareTreeOccurrenceClassificationShadowReport(), /input must be an object/u);
  assert.throws(
    () => prepareTreeOccurrenceClassificationShadowReport({ treeOccurrenceClassificationParitySummary: {} }),
    /must include treeOccurrenceClassificationParityEvidence object/u,
  );
  assert.throws(
    () => prepareTreeOccurrenceClassificationShadowReport({
      treeOccurrenceClassificationParityEvidence: { parityRecords: [] },
    }),
    /must include treeOccurrenceClassificationParitySummary object/u,
  );
});
