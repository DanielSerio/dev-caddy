/**
 * Find all scrollable ancestor elements
 *
 * Walks up the DOM tree from the given element and identifies all ancestors
 * that have scrollable overflow (auto or scroll). Useful for position calculations
 * and scroll event listeners.
 *
 * @param element - The element to start searching from
 * @returns Array of scrollable ancestor elements (empty if none found)
 *
 * @example
 * const element = document.getElementById('my-element');
 * const scrollableParents = getScrollableAncestors(element);
 * scrollableParents.forEach(parent => {
 *   parent.addEventListener('scroll', handleScroll);
 * });
 */
export function getScrollableAncestors(element: Element): HTMLElement[] {
  const scrollableAncestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    const computedStyle = window.getComputedStyle(parent);
    const overflow = computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX;

    if (overflow.includes('scroll') || overflow.includes('auto')) {
      scrollableAncestors.push(parent);
    }

    parent = parent.parentElement;
  }

  return scrollableAncestors;
}
