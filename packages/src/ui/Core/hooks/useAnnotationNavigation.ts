import { useCallback } from 'react';
import type { Annotation } from '../../../types/annotations';
import {
  navigateToAnnotation as navToAnnotation,
  checkPendingAnnotation as checkPending,
} from '../utility/navigation';

/**
 * Navigation handlers for annotation cross-page navigation
 */
export interface AnnotationNavigationHandlers {
  /**
   * Navigate to an annotation (may require page change)
   * @param annotation - The annotation to navigate to
   * @param onNavigate - Callback when navigation completes (same page) or is initiated (different page)
   */
  navigateToAnnotation: (
    annotation: Annotation,
    onNavigate: (annotation: Annotation) => void
  ) => void;

  /**
   * Check for pending annotation after page load
   * @param annotations - List of available annotations
   * @param onFound - Callback when pending annotation is found
   */
  checkPendingAnnotation: (
    annotations: Annotation[],
    onFound: (annotation: Annotation) => void
  ) => void;
}

/**
 * Custom hook for annotation navigation
 *
 * Provides utilities for cross-page annotation navigation using sessionStorage.
 * Handles both same-page and cross-page navigation scenarios.
 *
 * @returns Object with navigation helper functions
 *
 * @example
 * ```tsx
 * const { navigateToAnnotation, checkPendingAnnotation } = useAnnotationNavigation();
 *
 * // Navigate to annotation (may change page)
 * const handleClick = (annotation: Annotation) => {
 *   navigateToAnnotation(annotation, (ann) => {
 *     setSelectedAnnotation(ann);
 *   });
 * };
 *
 * // Check for pending annotation on mount
 * useEffect(() => {
 *   if (annotations.length > 0) {
 *     checkPendingAnnotation(annotations, (ann) => {
 *       setSelectedAnnotation(ann);
 *     });
 *   }
 * }, [annotations]);
 * ```
 */
export function useAnnotationNavigation(): AnnotationNavigationHandlers {
  const navigateToAnnotation = useCallback(
    (annotation: Annotation, onNavigate: (annotation: Annotation) => void) => {
      navToAnnotation(annotation, onNavigate);
    },
    []
  );

  const checkPendingAnnotation = useCallback(
    (annotations: Annotation[], onFound: (annotation: Annotation) => void) => {
      checkPending(annotations, onFound);
    },
    []
  );

  return {
    navigateToAnnotation,
    checkPendingAnnotation,
  };
}
