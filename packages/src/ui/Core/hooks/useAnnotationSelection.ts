import { useState, useEffect, useCallback } from 'react';
import type { Annotation } from '../../../types/annotations';
import { useAnnotationNavigation } from './useAnnotationNavigation';

/**
 * Hook for managing annotation selection state
 *
 * Handles the complexity of annotation selection including:
 * - Cross-page navigation support
 * - Checking for pending annotations after navigation
 * - Auto-navigating back when selected annotation is deleted
 * - Getting latest version of selected annotation from real-time updates
 *
 * This hook eliminates duplication between AnnotationList and AnnotationManager
 * by centralizing the annotation selection logic.
 *
 * @param annotations - Array of all annotations
 * @param loading - Whether annotations are currently loading
 * @param onSelect - Optional callback when annotation selection changes
 * @returns Object with selection state and handlers
 *
 * @example
 * ```typescript
 * function AnnotationList() {
 *   const { annotations, loading } = useAnnotations();
 *   const { selected, handleSelect, handleBack } = useAnnotationSelection(
 *     annotations,
 *     loading,
 *     (annotation) => console.log('Selected:', annotation)
 *   );
 *
 *   if (selected) {
 *     return <AnnotationDetail annotation={selected} onBack={handleBack} />;
 *   }
 *
 *   return (
 *     <div>
 *       {annotations.map(ann => (
 *         <button key={ann.id} onClick={() => handleSelect(ann)}>
 *           {ann.content}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnnotationSelection(
  annotations: Annotation[],
  loading: boolean,
  onSelect?: (annotation: Annotation | null) => void
) {
  const [selected, setSelected] = useState<Annotation | null>(null);
  const { navigateToAnnotation, checkPendingAnnotation } =
    useAnnotationNavigation();

  /**
   * Handle annotation selection with cross-page navigation support
   */
  const handleSelect = useCallback(
    (annotation: Annotation) => {
      navigateToAnnotation(annotation, (ann) => {
        setSelected(ann);
        onSelect?.(ann);
      });
    },
    [navigateToAnnotation, onSelect]
  );

  /**
   * Check for pending annotation after cross-page navigation
   *
   * When a user clicks an annotation on a different page, we navigate
   * to that page and store the annotation ID. This effect checks for
   * that pending annotation and selects it once annotations are loaded.
   */
  useEffect(() => {
    if (!loading && annotations.length > 0) {
      checkPendingAnnotation(annotations, (annotation) => {
        setSelected(annotation);
        onSelect?.(annotation);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, annotations.length]); // checkPendingAnnotation and onSelect are stable

  /**
   * Auto-navigate back if selected annotation was deleted
   *
   * If the currently selected annotation is deleted (via real-time sync
   * or by another user), automatically navigate back to the list view.
   */
  useEffect(() => {
    if (selected && !annotations.find((a) => a.id === selected.id)) {
      setSelected(null);
      onSelect?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, annotations.length]); // Run when annotations change

  /**
   * Navigate back to list view
   */
  const handleBack = useCallback(() => {
    setSelected(null);
    onSelect?.(null);
  }, [onSelect]);

  /**
   * Get latest version of selected annotation
   *
   * The selected annotation may be updated via real-time sync,
   * so we always return the latest version from the annotations array.
   */
  const latestSelected = selected
    ? annotations.find((a) => a.id === selected.id) || null
    : null;

  return {
    /** The currently selected annotation (always the latest version) */
    selected: latestSelected,
    /** Function to select an annotation (supports cross-page navigation) */
    handleSelect,
    /** Function to navigate back to list view */
    handleBack,
  };
}
