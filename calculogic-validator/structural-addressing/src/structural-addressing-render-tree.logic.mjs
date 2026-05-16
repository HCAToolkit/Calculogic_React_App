import { STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES } from './structural-addressing-profile.knowledge.mjs';

const assertValidSnapshotInput = (snapshot) => {
  if (snapshot === undefined) {
    throw new Error('Tree-codebase renderedTree snapshot input is required.');
  }

  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Tree-codebase renderedTree snapshot input must be an object.');
  }

  if (!Object.hasOwn(snapshot, 'occurrenceRecords')) {
    throw new Error('Tree-codebase renderedTree snapshot input must include occurrenceRecords.');
  }

  if (!Array.isArray(snapshot.occurrenceRecords)) {
    throw new Error('Tree-codebase renderedTree occurrenceRecords must be an array.');
  }
};

const assertValidOccurrenceRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('Tree-codebase renderedTree occurrence record must be an object.');
  }

  if (typeof record.addressPath !== 'string' || record.addressPath.length === 0) {
    throw new Error('Tree-codebase renderedTree occurrence record addressPath is required.');
  }

  if (typeof record.displayMarker !== 'string' || record.displayMarker.length === 0) {
    throw new Error('Tree-codebase renderedTree occurrence record displayMarker is required.');
  }

  if (
    record.occurrenceType !== STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FOLDER &&
    record.occurrenceType !== STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FILE
  ) {
    throw new Error(
      `Tree-codebase renderedTree occurrence type is unsupported: ${record.occurrenceType ?? '(missing)'}.`,
    );
  }

  if (typeof record.name !== 'string' || record.name.length === 0) {
    throw new Error('Tree-codebase renderedTree occurrence record name is required.');
  }

  if (typeof record.path !== 'string' || record.path.length === 0) {
    throw new Error('Tree-codebase renderedTree occurrence record path is required.');
  }

  if (!(record.parentAddressPath === null || typeof record.parentAddressPath === 'string')) {
    throw new Error('Tree-codebase renderedTree occurrence record parentAddressPath must be string or null.');
  }

  if (!Number.isInteger(record.depth) || record.depth < 0) {
    throw new Error('Tree-codebase renderedTree occurrence record depth must be a non-negative integer.');
  }

  if (!Number.isInteger(record.orderIndex) || record.orderIndex < 0) {
    throw new Error('Tree-codebase renderedTree occurrence record orderIndex must be a non-negative integer.');
  }
};

const hasLaterSibling = ({ sortedRecords, record, index }) =>
  sortedRecords.slice(index + 1).some(
    (candidate) =>
      candidate.depth === record.depth &&
      candidate.parentAddressPath === record.parentAddressPath &&
      candidate.orderIndex > record.orderIndex,
  );

const buildLaterSiblingMap = (sortedRecords) => {
  const hasLaterSiblingByAddressPath = new Map();

  for (let index = 0; index < sortedRecords.length; index += 1) {
    const record = sortedRecords[index];
    hasLaterSiblingByAddressPath.set(record.addressPath, hasLaterSibling({ sortedRecords, record, index }));
  }

  return hasLaterSiblingByAddressPath;
};

const buildRecordByAddressPathMap = (sortedRecords) => new Map(sortedRecords.map((record) => [record.addressPath, record]));

const collectAncestorContinuationState = ({ record, recordByAddressPath, hasLaterSiblingByAddressPath }) => {
  const ancestorHasLaterSiblings = [];
  const visitedAddressPaths = new Set();
  let cursorAddressPath = record.parentAddressPath;

  while (cursorAddressPath !== null) {
    if (visitedAddressPaths.has(cursorAddressPath)) {
      throw new Error(
        `Tree-codebase renderedTree parentAddressPath cycle detected at addressPath: ${cursorAddressPath}.`,
      );
    }

    visitedAddressPaths.add(cursorAddressPath);

    const ancestorRecord = recordByAddressPath.get(cursorAddressPath);
    if (!ancestorRecord) {
      break;
    }

    if (ancestorRecord.depth > 0) {
      ancestorHasLaterSiblings.unshift(Boolean(hasLaterSiblingByAddressPath.get(cursorAddressPath)));
    }

    cursorAddressPath = ancestorRecord.parentAddressPath;
  }

  return ancestorHasLaterSiblings;
};

const toTreeLine = ({ record, isLast, ancestorHasLaterSiblings }) => {
  const connector = isLast ? '└─' : '├─';
  const indentation = ancestorHasLaterSiblings.map((hasNext) => (hasNext ? '│  ' : '   ')).join('');
  const nameToken =
    record.occurrenceType === STRUCTURAL_ADDRESSING_OCCURRENCE_TYPES.FOLDER ? `${record.name}/` : record.name;

  if (record.depth === 0) {
    return `${record.displayMarker}: ${nameToken}`;
  }

  return `${indentation}${connector} ${record.displayMarker}: ${nameToken}`;
};

export const renderTreeCodebaseAddressedSnapshot = (snapshot) => {
  assertValidSnapshotInput(snapshot);

  const sortedRecords = [...snapshot.occurrenceRecords]
    .map((record) => {
      assertValidOccurrenceRecord(record);
      return record;
    })
    .sort((left, right) => left.orderIndex - right.orderIndex || left.addressPath.localeCompare(right.addressPath));

  if (sortedRecords.length === 0) {
    return { renderedTree: '' };
  }

  const hasLaterSiblingByAddressPath = buildLaterSiblingMap(sortedRecords);
  const recordByAddressPath = buildRecordByAddressPathMap(sortedRecords);

  const lines = sortedRecords.map((record) =>
    toTreeLine({
      record,
      isLast: !hasLaterSiblingByAddressPath.get(record.addressPath),
      ancestorHasLaterSiblings: collectAncestorContinuationState({
        record,
        recordByAddressPath,
        hasLaterSiblingByAddressPath,
      }),
    }),
  );

  return {
    renderedTree: lines.join('\n'),
  };
};
