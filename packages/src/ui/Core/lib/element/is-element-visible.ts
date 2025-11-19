/**
 * Check if an element is actually visible (not behind a modal/overlay)
 *
 * Uses elementFromPoint to determine if the element (or one of its descendants)
 * is the topmost element at its center point. This helps detect when elements
 * are hidden behind modals, overlays, or other positioned elements.
 *
 * @param element - The element to check visibility for
 * @returns true if element is visible, false if obscured or has zero dimensions
 *
 * @example
 * const element = document.getElementById('my-element');
 * if (element && isElementVisible(element)) {
 *   // Element is visible and not behind any overlay
 * }
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  // Check if element has zero dimensions
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // Check center point of element
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Get the topmost element at this position
  const topElement = document.elementFromPoint(centerX, centerY);

  // Element is visible if it (or one of its descendants) is at the top
  return topElement !== null && element.contains(topElement);
}
