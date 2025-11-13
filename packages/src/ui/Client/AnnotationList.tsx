import { useState } from "react";
import { useAnnotations } from "../Core/context";
import { getStatusName } from "../Core/lib/status";
import { Skeleton } from "../Core";
import { AnnotationDetail } from "./AnnotationDetail";
import { sanitizeContent } from "../Core/utility/sanitize";
import type { Annotation } from "../../types/annotations";

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
 * Displays only the current user's annotations with basic actions:
 * - View annotation details (click to open detail view)
 * - Edit annotation content
 * - Delete own annotations
 *
 * Note: Clients cannot change annotation status - only developers can do that.
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

  // Filter to show only user's own annotations
  const userAnnotations = annotations.filter(
    (a) => a.created_by === currentUserId
  );

  /**
   * Handle selecting an annotation to view details
   */
  const handleSelectAnnotation = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    onAnnotationSelect?.(annotation);
  };

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
  if (userAnnotations.length === 0) {
    return (
      <div className="dev-caddy-annotation-list">
        <p className="empty-state">
          No annotations yet. Click "Add Annotation" to create your first one.
        </p>
      </div>
    );
  }

  // Show list view
  return (
    <div className="dev-caddy-annotation-list">
      <h3>My Annotations ({userAnnotations.length})</h3>
      <div className="annotation-items">
        {userAnnotations.map((annotation) => (
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
              <span
                className={`annotation-status status-${getStatusName(
                  annotation.status_id
                )}`}
              >
                {getStatusName(annotation.status_id)}
              </span>
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
