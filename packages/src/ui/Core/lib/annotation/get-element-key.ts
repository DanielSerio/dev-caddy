import type { Annotation } from '../../../../types/annotations';

/**
 * Create a unique key for an element based on its selectors
 *
 * Generates a stable string identifier for an element by checking selectors
 * in order of reliability: test ID, ID, unique classes, compressed tree.
 * Useful for grouping annotations by element.
 *
 * @param annotation - Annotation containing element selector information
 * @returns Unique string key identifying the element
 *
 * @example
 * const key1 = getElementKey(annotation1); // "testid:submit-button"
 * const key2 = getElementKey(annotation2); // "testid:submit-button"
 * // key1 === key2 means same element
 */
export function getElementKey(annotation: Annotation): string {
  if (annotation.element_test_id) return `testid:${annotation.element_test_id}`;
  if (annotation.element_id) return `id:${annotation.element_id}`;
  if (annotation.element_unique_classes) return `classes:${annotation.element_unique_classes}`;
  if (annotation.compressed_element_tree) return `tree:${annotation.compressed_element_tree}`;
  return `unknown:${annotation.id}`;
}
