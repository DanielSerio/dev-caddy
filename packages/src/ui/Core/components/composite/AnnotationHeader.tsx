import type { Annotation } from "../../../../types/annotations";
import { BackButton } from "../layout/BackButton";
import { PageBadge } from "../badges/PageBadge";
import { StatusBadge } from "../badges/StatusBadge";

/**
 * Props for AnnotationHeader component
 */
export interface AnnotationHeaderProps {
  /** The annotation to display header for */
  annotation: Annotation;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Show full page path instead of "Current Page" */
  showFullPath?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Annotation header composite component
 *
 * Combines BackButton, PageBadge, and StatusBadge into a header for annotation detail views.
 * Provides consistent layout and spacing.
 *
 * @example
 * ```tsx
 * <AnnotationHeader
 *   annotation={annotation}
 *   onBack={() => setSelectedAnnotation(null)}
 * />
 * ```
 */
export function AnnotationHeader({
  annotation,
  onBack,
  showFullPath = false,
  className = "",
}: AnnotationHeaderProps) {
  return (
    <div className={`annotation-header ${className}`.trim()} data-testid="annotation-header">
      <BackButton onClick={onBack} />
      <div className="annotation-badges">
        <PageBadge annotation={annotation} showFullPath={showFullPath} />
        <StatusBadge statusId={annotation.status_id} />
      </div>
    </div>
  );
}
