import { useState, useEffect, useCallback } from "react";
import { useAnnotations } from "../Core/hooks";
import { AnnotationDetail } from "./AnnotationDetail";
import type { Annotation } from "../../types/annotations";
import { useAnnotationNavigation } from "../Core/hooks";
import { AnnotationItemSkeleton } from "../Core/AnnotationItemSkeleton";
import { EmptyState, ErrorDisplay } from "../Core/components/display";
import { AnnotationListItem } from "./components";

/**
 * Props for AnnotationList component
 */
interface AnnotationListProps {
  /** Callback when an annotation is selected for viewing */
  onAnnotationSelect?: (annotation: Annotation | null) => void;
}

/**
 * Annotation list component for client (reviewer) mode
 *
 * Displays ALL annotations across the entire project with basic actions:
 * - View all annotation details (click to open detail view)
 * - Navigate to annotations on different pages
 * - Edit own annotation content
 * - Delete own annotations
 *
 * Note: Clients can view ALL annotations but can only edit/delete their own.
 * Clients cannot change annotation status - only developers can do that.
 * User ID is obtained from auth context in AnnotationDetail for permission checks.
 *
 * @example
 * <AnnotationList />
 */
export function AnnotationList({
  onAnnotationSelect,
}: AnnotationListProps) {
  const { annotations, loading, error } = useAnnotations();
  const { navigateToAnnotation, checkPendingAnnotation } = useAnnotationNavigation();
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);

  /**
   * Handle selecting an annotation to view details
   * Supports cross-page navigation
   */
  const handleSelectAnnotation = (annotation: Annotation) => {
    navigateToAnnotation(annotation, (ann) => {
      setSelectedAnnotation(ann);
      onAnnotationSelect?.(ann);
    });
  };

  /**
   * Check for pending annotation after cross-page navigation
   */
  useEffect(() => {
    if (!loading && annotations.length > 0) {
      checkPendingAnnotation(annotations, (annotation) => {
        setSelectedAnnotation(annotation);
        onAnnotationSelect?.(annotation);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, annotations.length]); // checkPendingAnnotation and onAnnotationSelect are stable

  /**
   * Handle navigating back from detail view
   */
  const handleBack = useCallback(() => {
    setSelectedAnnotation(null);
    onAnnotationSelect?.(null);
  }, [onAnnotationSelect]);

  /**
   * Auto-navigate back if selected annotation was deleted
   */
  useEffect(() => {
    if (selectedAnnotation && !annotations.find(a => a.id === selectedAnnotation.id)) {
      setSelectedAnnotation(null);
      onAnnotationSelect?.(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnnotation, annotations.length]); // Run when annotations change

  // Show detail view if annotation is selected
  if (selectedAnnotation) {
    // Find the latest version of the selected annotation from context
    // This ensures we always show the most up-to-date data after real-time updates
    const latestAnnotation = annotations.find(a => a.id === selectedAnnotation.id);

    // If annotation was deleted, return null (useEffect will handle navigation)
    if (!latestAnnotation) {
      return null;
    }

    return (
      <AnnotationDetail
        annotation={latestAnnotation}
        onBack={handleBack}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="dev-caddy-annotation-list">
        <div className="annotation-items" data-testid="annotation-list-loading">
          <AnnotationItemSkeleton />
          <AnnotationItemSkeleton />
          <AnnotationItemSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dev-caddy-annotation-list">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  // Show empty state
  if (annotations.length === 0) {
    return (
      <div className="dev-caddy-annotation-list">
        <EmptyState message='No annotations in this project yet. Click "Add Annotation" to create the first one.' />
      </div>
    );
  }

  // Show list view
  return (
    <div className="dev-caddy-annotation-list">
      <h3>All Annotations ({annotations.length})</h3>
      <div className="annotation-items">
        {annotations.map((annotation) => (
          <AnnotationListItem
            key={annotation.id}
            annotation={annotation}
            onClick={handleSelectAnnotation}
          />
        ))}
      </div>
    </div>
  );
}
