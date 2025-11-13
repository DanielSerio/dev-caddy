/**
 * Calculate position for an annotation badge (top-right corner of element)
 *
 * Calculates the absolute position for placing a badge at the top-right corner
 * of an element, accounting for page scroll offset.
 *
 * @param element - The element to calculate position for
 * @returns Position object with top and left coordinates, or null if element is null
 *
 * @example
 * const element = document.getElementById('my-element');
 * const position = getBadgePosition(element);
 * if (position) {
 *   badge.style.top = `${position.top}px`;
 *   badge.style.left = `${position.left}px`;
 * }
 */
export function getBadgePosition(element: Element | null): { top: number; left: number } | null {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollY, // Top edge of element
    left: rect.right + scrollX - 4, // Right edge of element, offset slightly left
  };
}
