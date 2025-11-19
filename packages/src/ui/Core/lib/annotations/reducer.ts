import type { Annotation } from '../../../../types/annotations';
import type { RealtimeEventType } from '../../../../client';

/**
 * Apply a real-time annotation event to an annotations array
 *
 * This pure function handles INSERT, UPDATE, and DELETE events from
 * Supabase Realtime, returning a new array with the appropriate changes.
 *
 * Event handling:
 * - INSERT: Adds new annotation to the beginning (unless it already exists)
 * - UPDATE: Replaces existing annotation with updated version
 * - DELETE: Removes annotation from array
 *
 * @param annotations - Current array of annotations
 * @param annotation - The annotation that was inserted/updated/deleted
 * @param eventType - The type of real-time event ('INSERT' | 'UPDATE' | 'DELETE')
 * @returns New array with the event applied
 *
 * @example
 * ```typescript
 * // In a Supabase Realtime subscription
 * const channel = supabase
 *   .channel('annotations')
 *   .on('postgres_changes', { ... }, (payload) => {
 *     const annotation = payload.new as Annotation;
 *     const eventType = payload.eventType as RealtimeEventType;
 *
 *     setAnnotations(prev =>
 *       applyAnnotationEvent(prev, annotation, eventType)
 *     );
 *   });
 * ```
 */
export function applyAnnotationEvent(
  annotations: Annotation[],
  annotation: Annotation,
  eventType: RealtimeEventType
): Annotation[] {
  switch (eventType) {
    case 'DELETE':
      // Remove the deleted annotation
      return annotations.filter((a) => a.id !== annotation.id);

    case 'UPDATE': {
      // Find and replace the updated annotation
      const index = annotations.findIndex((a) => a.id === annotation.id);

      // If annotation not found, return array unchanged
      if (index === -1) {
        return annotations;
      }

      // Create new array with updated annotation
      const updated = [...annotations];
      updated[index] = annotation;
      return updated;
    }

    case 'INSERT': {
      // Check if annotation already exists (prevents duplicates)
      const exists = annotations.some((a) => a.id === annotation.id);

      // If exists, return array unchanged
      if (exists) {
        return annotations;
      }

      // Add new annotation to beginning of array
      return [annotation, ...annotations];
    }

    default:
      // Unknown event type - return array unchanged
      return annotations;
  }
}
