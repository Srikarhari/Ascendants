import { useEffect } from "react";

interface Options {
  /** Called on a horizontal right-swipe (finger moves right, dx > 0). */
  onBack?: () => void;
  /** Called on a horizontal left-swipe (finger moves left, dx < 0). */
  onForward?: () => void;
  /** When true, gestures are ignored (e.g. modal is open). */
  disabled?: boolean;
  /** Minimum horizontal travel in px to count as a swipe. Default 60. */
  threshold?: number;
}

/**
 * Listen for a horizontal swipe gesture on the document.
 * - Right swipe (dx > 0) → onBack
 * - Left swipe (dx < 0) → onForward
 * - Requires |dx| ≥ threshold and clearly horizontal (|dx| > 1.5 * |dy|).
 * - Ignores multi-touch and vertical scrolls.
 */
export function useSwipeBack({
  onBack,
  onForward,
  disabled = false,
  threshold = 60,
}: Options) {
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
      if (dx < 0) {
        onForward?.();
      } else {
        onBack?.();
      }
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
  }, [onBack, onForward, disabled, threshold]);
}
