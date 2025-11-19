import { useAnnotations, useAnnotationSelection } from "../Core/hooks";
import { AnnotationDetail } from "./AnnotationDetail";
import type { Annotation } from "../../types/annotations";
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
  const { selected, handleSelect, handleBack } = useAnnotationSelection(
    annotations,
    loading,
    onAnnotationSelect
  );

  // Show detail view if annotation is selected
  if (selected) {
    return (
      <AnnotationDetail
        annotation={selected}
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
            onClick={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
