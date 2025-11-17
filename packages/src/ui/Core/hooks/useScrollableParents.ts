import { useMemo } from 'react';
import { getScrollableAncestors } from '../lib/element';

/**
 * Custom hook to get all scrollable parent elements
 *
 * Returns an array of all scrollable ancestor elements for the given element.
 * Uses memoization to avoid unnecessary recalculations.
 *
 * @internal
 * Reserved for future scroll handling enhancements. Currently exported but
 * not used in UI. May be needed for nested scroll container support in
 * complex layouts with multiple scrollable regions.
 *
 * @param element - The element to find scrollable parents for
 * @returns Array of scrollable parent HTML elements
 *
 * @example
 * ```tsx
 * const scrollableParents = useScrollableParents(targetElement);
 *
 * useEffect(() => {
 *   scrollableParents.forEach(parent => {
 *     parent.addEventListener('scroll', handleScroll);
 *   });
 *
 *   return () => {
 *     scrollableParents.forEach(parent => {
 *       parent.removeEventListener('scroll', handleScroll);
 *     });
 *   };
 * }, [scrollableParents]);
 * ```
 */
export function useScrollableParents(element: Element | null): HTMLElement[] {
  return useMemo(() => {
    if (!element) return [];
    return getScrollableAncestors(element);
  }, [element]);
}
