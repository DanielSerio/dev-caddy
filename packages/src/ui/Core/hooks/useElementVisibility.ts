import { useState, useEffect, useRef } from 'react';
import { isElementVisible } from '../lib/element';

/**
 * Custom hook to track element visibility
 *
 * Returns whether the element is currently visible in the viewport.
 * Uses MutationObserver to detect dynamic visibility changes (display, visibility, opacity).
 * Also responds to scroll and resize events with throttling to prevent infinite loops.
 *
 * @param element - The element to track visibility for
 * @returns Boolean indicating if element is visible
 *
 * @example
 * ```tsx
 * const isVisible = useElementVisibility(targetElement);
 *
 * return (
 *   <div style={{ opacity: isVisible ? 1 : 0 }}>
 *     Element is {isVisible ? 'visible' : 'hidden'}
 *   </div>
 * );
 * ```
 */
export function useElementVisibility(element: Element | null): boolean {
  const [visible, setVisible] = useState<boolean>(false);
  const lastCheckRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!element) {
      setVisible(false);
      return;
    }

    // Check visibility and only update state if it changed
    const checkVisibility = () => {
      const newVisible = isElementVisible(element);
      setVisible(prev => prev === newVisible ? prev : newVisible);
    };

    // Throttled check with 150ms delay to prevent excessive updates
    const throttledCheck = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckRef.current;

      if (timeSinceLastCheck >= 150) {
        lastCheckRef.current = now;
        checkVisibility();
      } else {
        // Schedule a check for later
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          lastCheckRef.current = Date.now();
          checkVisibility();
          timeoutRef.current = null;
        }, 150 - timeSinceLastCheck);
      }
    };

    // Initial check
    checkVisibility();

    // Watch for DOM changes that might affect visibility
    // ONLY observe the element itself, not parents (prevents infinite loop)
    const observer = new MutationObserver(throttledCheck);

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    // Listen for scroll and resize events with throttling
    window.addEventListener('scroll', throttledCheck, true);
    window.addEventListener('resize', throttledCheck);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', throttledCheck, true);
      window.removeEventListener('resize', throttledCheck);

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [element]);

  return visible;
}
