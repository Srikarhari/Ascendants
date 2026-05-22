import { useEffect } from "react";

interface Options {
  /** Called when a horizontal back-gesture is detected. */
  onBack: () => void;
  /** When true, gesture is ignored (e.g. modal is open). */
  disabled?: boolean;
  /** Minimum horizontal travel in px to count as a back-swipe. Default 60. */
  threshold?: number;
}

/**
 * Listen for a horizontal swipe-back gesture on the document.
 * - Triggers on swipe-right OR swipe-left (either direction)
 *   once the horizontal travel passes threshold and is clearly horizontal
 *   (|dx| > 1.5 * |dy|).
 * - Ignores multi-touch, vertical scrolls, and short gestures.
 */
export function useSwipeBack({ onBack, disabled = false, threshold = 60 }: Options) {
  useEffect(() => {
    if (disabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < threshold) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.5) return; // vertical-ish — ignore
      onBack();
    };

    const onTouchCancel = () => {
      tracking = false;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onBack, disabled, threshold]);
}
