import type { Annotation } from '../../../../types/annotations';

/**
 * Finds a DOM element based on annotation's selector information
 *
 * Tries multiple strategies in order of reliability:
 * 1. data-testid attribute (most reliable)
 * 2. id attribute
 * 3. unique classes with tag name
 * 4. compressed element tree (fallback)
 *
 * @param annotation - Annotation containing element selector information
 * @returns The matched element or null if not found
 *
 * @example
 * const element = findElement(annotation);
 * if (element) {
 *   // Element found, can interact with it
 * }
 */
export function findElement(annotation: Annotation): Element | null {
  // Try test ID first (most reliable)
  if (annotation.element_test_id) {
    const el = document.querySelector(`[data-testid="${annotation.element_test_id}"]`);
    if (el) return el;
  }

  // Try ID
  if (annotation.element_id) {
    const el = document.getElementById(annotation.element_id);
    if (el) return el;
  }

  // Try unique classes with tag
  if (annotation.element_unique_classes) {
    const tag = annotation.element_tag.toLowerCase();
    const classes = annotation.element_unique_classes.split(' ').map(c => `.${c}`).join('');
    const el = document.querySelector(`${tag}${classes}`);
    if (el) return el;
  }

  // Try using compressed element tree as fallback
  if (annotation.compressed_element_tree) {
    try {
      // Convert compressed tree to querySelector syntax
      // e.g., "body>DIV[0]>P[1]" -> "body > div:nth-child(1) > p:nth-child(2)"
      const selector = annotation.compressed_element_tree
        .split('>')
        .map(segment => {
          const match = segment.match(/^([A-Za-z0-9]+)\[(\d+)\]$/);
          if (match) {
            const tag = match[1].toLowerCase();
            const index = parseInt(match[2], 10) + 1; // nth-child is 1-based
            return `${tag}:nth-child(${index})`;
          }
          return segment.toLowerCase();
        })
        .join(' > ');
      const el = document.querySelector(selector);
      if (el) return el;
    } catch (e) {
      console.warn('[findElement] Failed to parse compressed tree:', annotation.compressed_element_tree, e);
    }
  }

  return null;
}
