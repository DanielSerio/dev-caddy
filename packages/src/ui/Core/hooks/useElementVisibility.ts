import { useState, useEffect } from 'react';
import { isElementVisible } from '../lib/element';

/**
 * Custom hook to track element visibility
 *
 * Returns whether the element is currently visible in the viewport.
 * Uses MutationObserver to detect dynamic visibility changes (display, visibility, opacity).
 * Also responds to scroll and resize events.
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

  useEffect(() => {
    if (!element) {
      setVisible(false);
      return;
    }

    // Check initial visibility
    const checkVisibility = () => {
      setVisible(isElementVisible(element));
    };

    checkVisibility();

    // Watch for DOM changes that might affect visibility
    const observer = new MutationObserver(() => {
      checkVisibility();
    });

    // Observe the element and its ancestors for attribute changes
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    // Also observe parent elements for visibility changes
    let parent = element.parentElement;
    while (parent) {
      observer.observe(parent, {
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden'],
      });
      parent = parent.parentElement;
    }

    // Listen for scroll and resize events
    const handleScrollOrResize = () => {
      checkVisibility();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [element]);

  return visible;
}
