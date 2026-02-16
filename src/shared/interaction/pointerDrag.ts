/**
 * Shared Interaction Utility: pointerDrag
 * Concern File: Logic
 * Responsibility: Provide clamp and drag-time document selection helpers for pointer interactions.
 * Invariants: Helpers are side-effect free except explicit document selection toggles.
 */

export function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function disableDocumentUserSelect() {
  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';

  return () => {
    document.body.style.userSelect = previousUserSelect;
  };
}
