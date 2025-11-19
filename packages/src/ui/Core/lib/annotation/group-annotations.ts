import type { Annotation } from '../../../../types/annotations';
import { getElementKey } from './get-element-key';

/**
 * Group annotations by element and then by status
 *
 * Creates a two-level grouping structure:
 * - First level: group by element (using element key)
 * - Second level: group by status ID
 *
 * This is useful for displaying badges that show multiple annotations
 * on the same element, organized by status.
 *
 * @param annotations - Array of annotations to group
 * @returns Nested map structure: element key -> status ID -> annotations array
 *
 * @example
 * const grouped = groupAnnotations(annotations);
 * for (const [elementKey, statusMap] of grouped) {
 *   console.log(`Element: ${elementKey}`);
 *   for (const [statusId, annots] of statusMap) {
 *     console.log(`  Status ${statusId}: ${annots.length} annotations`);
 *   }
 * }
 */
export function groupAnnotations(
  annotations: Annotation[]
): Map<string, Map<number, Annotation[]>> {
  const elementGroups = new Map<string, Map<number, Annotation[]>>();

  annotations.forEach((annotation) => {
    const elementKey = getElementKey(annotation);

    if (!elementGroups.has(elementKey)) {
      elementGroups.set(elementKey, new Map());
    }

    const statusGroups = elementGroups.get(elementKey)!;
    const statusId = annotation.status_id;

    if (!statusGroups.has(statusId)) {
      statusGroups.set(statusId, []);
    }

    statusGroups.get(statusId)!.push(annotation);
  });

  return elementGroups;
}
