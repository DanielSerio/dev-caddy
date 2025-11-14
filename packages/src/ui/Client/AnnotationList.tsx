import { useState, useEffect } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { AnnotationDetail } from "./AnnotationDetail";
import { sanitizeContent, formatElementSelector } from "../Core/utility";
import type { Annotation } from "../../types/annotations";
import {
  navigateToAnnotation,
  checkPendingAnnotation,
} from "../Core/utility/navigation";
import { LoadingState } from "../Core/components/composite";
import { EmptyState, ErrorDisplay } from "../Core/components/display";
import { AnnotationBadge, AnnotationMeta } from "../Core/components/composite";

/**
 * Props for AnnotationList component
 */
interface AnnotationListProps {
  /** Current user ID to filter annotations */
  currentUserId: string;
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
 *
 * @example
 * <AnnotationList currentUserId="user-123" />
 */
export function AnnotationList({
  currentUserId,
  onAnnotationSelect,
}: AnnotationListProps) {
  const { annotations, loading, error } = useAnnotations();
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
  }, [loading, annotations, onAnnotationSelect]);

  /**
   * Handle navigating back from detail view
   */
  const handleBack = () => {
    setSelectedAnnotation(null);
    onAnnotationSelect?.(null);
  };

  // Show detail view if annotation is selected
  if (selectedAnnotation) {
    // Find the latest version of the selected annotation from context
    // This ensures we always show the most up-to-date data after real-time updates
    const latestAnnotation = annotations.find(a => a.id === selectedAnnotation.id);

    // If annotation was deleted, go back to list
    if (!latestAnnotation) {
      handleBack();
      return null;
    }

    return (
      <AnnotationDetail
        annotation={latestAnnotation}
        onBack={handleBack}
        currentUserId={currentUserId}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="dev-caddy-annotation-list">
        <LoadingState message="Loading annotations..." />
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
          <div
            key={annotation.id}
            className={`annotation-item status-${getStatusName(
              annotation.status_id
            )}`}
            onClick={() => handleSelectAnnotation(annotation)}
            data-testid="annotation-list-item"
          >
            <div className="annotation-header">
              <span className="annotation-element">
                {formatElementSelector(annotation)}
              </span>
              <AnnotationBadge annotation={annotation} showPage showStatus />
            </div>

            <div className="annotation-content">
              <p>{sanitizeContent(annotation.content)}</p>
            </div>

            <AnnotationMeta annotation={annotation} showUpdated={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
