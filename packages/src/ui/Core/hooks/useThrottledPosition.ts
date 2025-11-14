import { useEffect, useRef } from 'react';

/**
 * Custom hook for throttled position updates
 *
 * Attaches throttled scroll and resize event listeners to update element position.
 * Automatically cleans up listeners on unmount.
 *
 * @param element - The element to track
 * @param calculatePosition - Callback to recalculate position
 * @param throttleMs - Throttle delay in milliseconds (default: 100)
 *
 * @example
 * ```tsx
 * useThrottledPosition(targetElement, () => {
 *   setPosition(calculateElementPosition(targetElement));
 * }, 100);
 * ```
 */
export function useThrottledPosition(
  element: Element | null,
  calculatePosition: () => void,
  throttleMs: number = 100
): void {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!element) return;

    const throttledUpdate = () => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= throttleMs) {
        // Execute immediately if enough time has passed
        lastCallRef.current = now;
        calculatePosition();
      } else {
        // Schedule execution for later
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          lastCallRef.current = Date.now();
          calculatePosition();
          timeoutRef.current = null;
        }, throttleMs - timeSinceLastCall);
      }
    };

    // Attach listeners
    window.addEventListener('scroll', throttledUpdate, true); // Use capture to catch all scroll events
    window.addEventListener('resize', throttledUpdate);

    // Initial position calculation
    calculatePosition();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledUpdate, true);
      window.removeEventListener('resize', throttledUpdate);

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [element, calculatePosition, throttleMs]);
}
