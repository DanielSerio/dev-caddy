import { AnnotationItem } from "../AnnotationItem";
import { EmptyState } from "../../Core/components/display";
import type { Annotation } from "../../../types/annotations";

/**
 * Props for AnnotationListView component
 */
export interface AnnotationListViewProps {
  /** Array of annotations to display */
  annotations: Annotation[];
  /** Total count of annotations (before filtering) */
  totalCount: number;
  /** Callback when an annotation is clicked */
  onAnnotationClick: (annotation: Annotation) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation list view component
 *
 * Displays a list of annotation items or an empty state message.
 * Used in the developer mode annotation manager.
 *
 * @example
 * ```tsx
 * <AnnotationListView
 *   annotations={filteredAnnotations}
 *   totalCount={allAnnotations.length}
 *   onAnnotationClick={handleSelect}
 * />
 * ```
 */
export function AnnotationListView({
  annotations,
  totalCount,
  onAnnotationClick,
  className = "",
}: AnnotationListViewProps) {
  if (annotations.length === 0) {
    return (
      <EmptyState
        message={
          totalCount === 0
            ? "No annotations yet."
            : "No annotations match the current filters."
        }
        className={className}
      />
    );
  }

  return (
    <div className={`annotation-items ${className}`.trim()}>
      {annotations.map((annotation) => (
        <AnnotationItem
          key={annotation.id}
          annotation={annotation}
          onClick={onAnnotationClick}
        />
      ))}
    </div>
  );
}
