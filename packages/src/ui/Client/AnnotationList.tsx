import { useState, useEffect } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { Skeleton } from "../Core";
import { AnnotationDetail } from "./AnnotationDetail";
import { sanitizeContent } from "../Core/utility/sanitize";
import type { Annotation } from "../../types/annotations";
import {
  navigateToAnnotation,
  checkPendingAnnotation,
  isCurrentPage,
} from "../Core/utility/navigation";

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

  /**
   * Format date for display
   */
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
        {/* Title skeleton matching "My Annotations (X)" */}
        <Skeleton variant="text" width="60%" height="24px" />

        <div className="annotation-items">
          {/* Skeleton for 3 annotation items */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="annotation-item">
              {/* Header with element tag and status badge */}
              <div className="annotation-header">
                <Skeleton variant="text" width="40%" height="16px" />
                <Skeleton variant="text" width="20%" height="20px" />
              </div>

              {/* Content text */}
              <div className="annotation-content">
                <Skeleton variant="text" width="90%" height="14px" />
                <Skeleton variant="text" width="75%" height="14px" />
              </div>

              {/* Meta information (date) */}
              <div className="annotation-meta">
                <Skeleton variant="text" width="35%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dev-caddy-annotation-list">
        <p className="error">Error: {error.message}</p>
      </div>
    );
  }

  // Show empty state
  if (annotations.length === 0) {
    return (
      <div className="dev-caddy-annotation-list">
        <p className="empty-state">
          No annotations in this project yet. Click "Add Annotation" to create the first one.
        </p>
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
                {annotation.element_tag}
                {annotation.element_id && `#${annotation.element_id}`}
              </span>
              <div className="annotation-badges">
                <span
                  className={`annotation-page-badge ${
                    isCurrentPage(annotation) ? "current-page" : "other-page"
                  }`}
                >
                  {isCurrentPage(annotation) ? "Current Page" : annotation.page}
                </span>
                <span
                  className={`annotation-status status-${getStatusName(
                    annotation.status_id
                  )}`}
                >
                  {getStatusName(annotation.status_id)}
                </span>
              </div>
            </div>

            <div className="annotation-content">
              <p>{sanitizeContent(annotation.content)}</p>
            </div>

            <div className="annotation-meta">
              <span className="annotation-date">
                {formatDate(annotation.created_at)}
              </span>
              {annotation.resolved_at && (
                <span className="annotation-resolved">
                  Resolved: {formatDate(annotation.resolved_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
