import fs from 'node:fs';

const toPositiveInteger = (value, label) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid missing-role patterns registry: ${label} must be a non-negative integer.`);
  }

  return value;
};

const canonicalizeExtensionSegmentIndexes = (indexes) => {
  if (!Array.isArray(indexes) || indexes.length === 0) {
    throw new Error(
      'Invalid missing-role patterns registry: extensionSegmentIndexes must be a non-empty array.',
    );
  }

  const deduped = new Set(indexes.map((index) => toPositiveInteger(index, 'extension segment index')));

  return [...deduped].sort((left, right) => left - right);
};

const canonicalizeLiteralSegmentConstraints = (literalSegmentConstraints = {}) => {
  if (
    !literalSegmentConstraints ||
    typeof literalSegmentConstraints !== 'object' ||
    Array.isArray(literalSegmentConstraints)
  ) {
    throw new Error(
      'Invalid missing-role patterns registry: literalSegmentConstraints must be an object when provided.',
    );
  }

  return Object.fromEntries(
    Object.entries(literalSegmentConstraints)
      .map(([segmentIndexRaw, literalValue]) => {
        const segmentIndex = toPositiveInteger(Number(segmentIndexRaw), 'literal segment index');

        if (typeof literalValue !== 'string' || !literalValue.trim()) {
          throw new Error(
            'Invalid missing-role patterns registry: constrained literal values must be non-empty strings.',
          );
        }

        return [segmentIndex, literalValue.trim()];
      })
      .sort(([left], [right]) => left - right),
  );
};

const canonicalizeMissingRolePattern = (patternEntry) => {
  if (!patternEntry || typeof patternEntry !== 'object' || Array.isArray(patternEntry)) {
    throw new Error('Invalid missing-role patterns registry: each pattern must be an object.');
  }

  const patternId = typeof patternEntry.patternId === 'string' ? patternEntry.patternId.trim() : '';
  const dotSegments = toPositiveInteger(patternEntry.dotSegments, 'dotSegments');
  const semanticSegmentIndex = toPositiveInteger(
    patternEntry.semanticSegmentIndex,
    'semanticSegmentIndex',
  );
  const extensionSegmentIndexes = canonicalizeExtensionSegmentIndexes(
    patternEntry.extensionSegmentIndexes,
  );
  const literalSegmentConstraints = canonicalizeLiteralSegmentConstraints(
    patternEntry.literalSegmentConstraints,
  );

  if (!patternId) {
    throw new Error('Invalid missing-role patterns registry: patternId must be a non-empty string.');
  }

  if (semanticSegmentIndex >= dotSegments) {
    throw new Error(
      'Invalid missing-role patterns registry: semanticSegmentIndex must be inside dot segment bounds.',
    );
  }

  if (extensionSegmentIndexes.some((index) => index >= dotSegments)) {
    throw new Error(
      'Invalid missing-role patterns registry: extensionSegmentIndexes must be inside dot segment bounds.',
    );
  }

  const literalConstraintIndexes = Object.keys(literalSegmentConstraints).map(Number);
  if (literalConstraintIndexes.some((index) => index >= dotSegments)) {
    throw new Error(
      'Invalid missing-role patterns registry: literalSegmentConstraints must be inside dot segment bounds.',
    );
  }

  if (typeof patternEntry.compoundExtension === 'string' && !patternEntry.compoundExtension.trim()) {
    throw new Error(
      'Invalid missing-role patterns registry: compoundExtension must be non-empty when provided.',
    );
  }

  const compoundExtension =
    typeof patternEntry.compoundExtension === 'string'
      ? patternEntry.compoundExtension.trim()
      : extensionSegmentIndexes.map((index) => literalSegmentConstraints[index]).filter(Boolean).join('.');

  return {
    patternId,
    dotSegments,
    semanticSegmentIndex,
    extensionSegmentIndexes,
    literalSegmentConstraints,
    compoundExtension,
  };
};

export const loadMissingRolePatternsFromFile = (registryFilePath) => {
  const parsed = JSON.parse(fs.readFileSync(registryFilePath, 'utf8'));

  if (!Array.isArray(parsed?.missingRolePatterns)) {
    throw new Error(
      'Invalid missing-role patterns registry: expected missingRolePatterns array.',
    );
  }

  const dedupedPatterns = new Map();

  for (const patternEntry of parsed.missingRolePatterns) {
    const pattern = canonicalizeMissingRolePattern(patternEntry);
    if (!dedupedPatterns.has(pattern.patternId)) {
      dedupedPatterns.set(pattern.patternId, pattern);
    }
  }

  return [...dedupedPatterns.values()];
};
