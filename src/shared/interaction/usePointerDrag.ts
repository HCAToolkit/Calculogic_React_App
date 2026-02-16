/**
 * Shared Interaction Hook: usePointerDrag
 * Concern File: Logic
 * Responsibility: Encapsulate pointer drag lifecycle with optional pointer capture and user-select suppression.
 * Invariants: Drag cleanup always detaches listeners and restores temporary document state.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { disableDocumentUserSelect } from './pointerDrag';

export type PointerDragAxis = 'x' | 'y' | 'both';

export type UsePointerDragOptions = {
  axis: PointerDragAxis;
  onStart?: (ctx: { startX: number; startY: number; pointerId: number }) => void;
  onMove: (ctx: { dx: number; dy: number; x: number; y: number; pointerId: number }) => void;
  onEnd?: (ctx: { pointerId: number }) => void;
  disableUserSelectDuringDrag?: boolean;
  setPointerCapture?: boolean;
};

type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
  target: HTMLElement;
  moveListener: (event: PointerEvent) => void;
  upListener: (event: PointerEvent) => void;
  cancelListener: (event: PointerEvent) => void;
  lostCaptureListener: (event: PointerEvent) => void;
};

export function usePointerDrag(opts: UsePointerDragOptions): {
  onPointerDown: (e: ReactPointerEvent) => void;
  isDragging: boolean;
} {
  const {
    axis,
    onStart,
    onMove,
    onEnd,
    disableUserSelectDuringDrag = true,
    setPointerCapture = true,
  } = opts;
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
  const restoreUserSelectRef = useRef<(() => void) | null>(null);

  const safeReleasePointerCapture = useCallback(
    (target: HTMLElement, pointerId: number) => {
      if (!setPointerCapture) return;

      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
      } catch {
        // WHY: Some browsers can throw if the capture was already lost/released.
      }
    },
    [setPointerCapture]
  );

  const finishDrag = useCallback(
    (pointerId: number) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== pointerId) return;

      dragState.target.removeEventListener('pointermove', dragState.moveListener);
      dragState.target.removeEventListener('pointerup', dragState.upListener);
      dragState.target.removeEventListener('pointercancel', dragState.cancelListener);
      dragState.target.removeEventListener('lostpointercapture', dragState.lostCaptureListener);

      safeReleasePointerCapture(dragState.target, pointerId);

      restoreUserSelectRef.current?.();
      restoreUserSelectRef.current = null;

      dragStateRef.current = null;
      setIsDragging(false);
      onEnd?.({ pointerId });
    },
    [onEnd, safeReleasePointerCapture]
  );

  useEffect(() => {
    return () => {
      const activeDrag = dragStateRef.current;
      if (activeDrag) {
        finishDrag(activeDrag.pointerId);
      }
    };
  }, [finishDrag]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (!event.isPrimary) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      const target = event.currentTarget as HTMLElement;
      const pointerId = event.pointerId;

      if (dragStateRef.current) {
        finishDrag(dragStateRef.current.pointerId);
      }

      if (setPointerCapture) {
        try {
          target.setPointerCapture(pointerId);
        } catch {
          // WHY: Fallback path keeps drag active even if capture is unavailable.
        }
      }

      if (disableUserSelectDuringDrag) {
        restoreUserSelectRef.current = disableDocumentUserSelect();
      }

      onStart?.({
        startX: event.clientX,
        startY: event.clientY,
        pointerId,
      });

      const moveListener = (pointerMoveEvent: PointerEvent) => {
        const activeDrag = dragStateRef.current;
        if (!activeDrag || pointerMoveEvent.pointerId !== activeDrag.pointerId) return;

        // WHY: Preserve previous behavior by applying incremental deltas from last move.
        const rawDx = pointerMoveEvent.clientX - activeDrag.lastX;
        const rawDy = pointerMoveEvent.clientY - activeDrag.lastY;
        activeDrag.lastX = pointerMoveEvent.clientX;
        activeDrag.lastY = pointerMoveEvent.clientY;

        const dx = axis === 'y' ? 0 : rawDx;
        const dy = axis === 'x' ? 0 : rawDy;

        onMove({
          dx,
          dy,
          x: pointerMoveEvent.clientX,
          y: pointerMoveEvent.clientY,
          pointerId: activeDrag.pointerId,
        });
      };

      const upListener = (pointerUpEvent: PointerEvent) => {
        if (pointerUpEvent.pointerId !== pointerId) return;
        finishDrag(pointerId);
      };

      const cancelListener = (pointerCancelEvent: PointerEvent) => {
        if (pointerCancelEvent.pointerId !== pointerId) return;
        finishDrag(pointerId);
      };

      const lostCaptureListener = (lostCaptureEvent: PointerEvent) => {
        if (lostCaptureEvent.pointerId !== pointerId) return;
        finishDrag(pointerId);
      };

      dragStateRef.current = {
        pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        target,
        moveListener,
        upListener,
        cancelListener,
        lostCaptureListener,
      };
      setIsDragging(true);

      target.addEventListener('pointermove', moveListener);
      target.addEventListener('pointerup', upListener);
      target.addEventListener('pointercancel', cancelListener);
      target.addEventListener('lostpointercapture', lostCaptureListener);
    },
    [axis, disableUserSelectDuringDrag, finishDrag, onMove, onStart, setPointerCapture]
  );

  return { onPointerDown, isDragging };
}
