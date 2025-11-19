import type { Annotation } from "../../../types/annotations";

/**
 * Format element selector for display
 *
 * Constructs a human-readable string representation of the element selector
 * from the annotation's element properties.
 *
 * @param annotation - The annotation containing element information
 * @returns Formatted element selector string (e.g., "button#submit [data-testid="btn"]")
 *
 * @example
 * ```typescript
 * const selector = formatElementSelector(annotation);
 * // Returns: "button#submit [role="button"]"
 * ```
 */
export function formatElementSelector(annotation: Annotation): string {
  let selector = annotation.element_tag;

  if (annotation.element_id) {
    selector += `#${annotation.element_id}`;
  }

  if (annotation.element_test_id) {
    selector += ` [data-testid="${annotation.element_test_id}"]`;
  }

  if (annotation.element_role) {
    selector += ` [${annotation.element_role}]`;
  }

  return selector;
}
