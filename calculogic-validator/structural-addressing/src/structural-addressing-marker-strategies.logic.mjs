import { STRUCTURAL_ADDRESSING_MARKER_STRATEGIES } from './structural-addressing-profile.knowledge.mjs';

const assertValidMarkerIndex = (index) => {
  if (index === undefined) {
    throw new Error('Marker index is required.');
  }

  if (!Number.isInteger(index)) {
    throw new Error('Marker index must be a positive integer.');
  }

  if (index <= 0) {
    throw new Error('Marker index must be greater than zero.');
  }
};

const toUpperAlphaMarker = (index) => {
  let marker = '';
  let remaining = index;

  while (remaining > 0) {
    const remainder = (remaining - 1) % 26;
    marker = String.fromCharCode(65 + remainder) + marker;
    remaining = Math.floor((remaining - 1) / 26);
  }

  return marker;
};

const toArabicNumberMarker = (index) => String(index);

export const buildStructuralAddressingMarker = (options = {}) => {
  if (!options || typeof options !== 'object') {
    throw new Error('Marker options must be an object.');
  }

  const { markerStrategy, index } = options;

  assertValidMarkerIndex(index);

  if (markerStrategy === STRUCTURAL_ADDRESSING_MARKER_STRATEGIES.UPPER_ALPHA) {
    return toUpperAlphaMarker(index);
  }

  if (markerStrategy === STRUCTURAL_ADDRESSING_MARKER_STRATEGIES.ARABIC_NUMBER) {
    return toArabicNumberMarker(index);
  }

  throw new Error(`Unsupported marker strategy: ${markerStrategy ?? '(missing)'}.`);
};
